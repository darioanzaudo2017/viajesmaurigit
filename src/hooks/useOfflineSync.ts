import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../api/supabase';
import { db } from '../api/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const isSyncingRef = useRef(false);

    // Queries de Dexie
    const pendingReports = useLiveQuery(() => db.soapReports.where('status').anyOf('pending', 'error').toArray(), []);
    const pendingSimulations = useLiveQuery(() => db.universitySimulations.where('status').anyOf('pending', 'error').toArray(), []);
    const pendingEnrollments = useLiveQuery(() => db.enrollments.where('sync_status').anyOf('pending', 'error').toArray(), []);
    const readyRegistrations = useLiveQuery(() => db.registrations.where('status').anyOf('ready', 'error').toArray(), []);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // 1. FUNCIONES INTERNAS (TRABAJO SUCIO)
    // ─────────────────────────────────────────────────────────────────────────

    const _internalSyncReports = async () => {
        const reportsToSync = await db.soapReports.where('status').anyOf('pending', 'error').toArray();
        if (reportsToSync.length === 0) return;

        for (const report of reportsToSync) {
            try {
                await db.soapReports.update(report.id, { status: 'syncing' as any });
                
                const { problemas_seleccionados, problemas, ...cleanData } = report.data as any;
                
                // DEDUPLICACIÓN DE SEGURIDAD: Evitar enviar duplicados si el estado local está corrupto
                const uniqueProblemas = (problemas_seleccionados || []).reduce((acc: any[], curr: any) => {
                    const isDup = acc.find(p => 
                        p.problema === curr.problema && 
                        p.problema_anticipado === curr.problema_anticipado &&
                        p.tratamiento === curr.tratamiento
                    );
                    if (!isDup) acc.push(curr);
                    return acc;
                }, []);

                const payload = { 
                    ...cleanData, 
                    es_simulacro: false, 
                    updated_at: new Date(report.updated_at).toISOString() 
                };
                
                const { data: savedReport, error } = await supabase
                    .from('reportes_soap')
                    .upsert(payload)
                    .select('id') 
                    .single();

                if (error) throw error;

                // Limpieza absoluta
                await supabase.from('reportes_soap_problemas').delete().eq('reporte_soap_id', savedReport.id);

                if (uniqueProblemas.length > 0) {
                    const toInsert = uniqueProblemas.map((p: any) => ({
                        reporte_soap_id: savedReport.id,
                        observacion_especifica: p.observacion_especifica,
                        problema: p.problema,
                        problema_anticipado: p.problema_anticipado,
                        tratamiento: p.tratamiento
                    }));
                    await supabase.from('reportes_soap_problemas').insert(toInsert);
                }

                // ... (re-fetch y update Dexie igual que antes)
                const { data: confirmed } = await supabase.from('reportes_soap_problemas').select('*').eq('reporte_soap_id', savedReport.id);
                const { data: fullReport } = await supabase.from('reportes_soap').select('*').eq('id', savedReport.id).single();

                await db.soapReports.put({
                    id: savedReport.id,
                    inscripcion_id: report.inscripcion_id,
                    status: 'synced',
                    data: { ...fullReport, problemas_seleccionados: confirmed || [] },
                    updated_at: Date.now()
                });

                if (savedReport.id !== report.id) await db.soapReports.delete(report.id);
                console.log(`[OfflineSync] Reporte ${savedReport.id} sincronizado, deduplicado y limpio.`);
            } catch (err) {
                console.error('[OfflineSync] Error Reporte:', report.id, err);
                await db.soapReports.update(report.id, { status: 'error' });
            }
        }
    };

    const _internalSyncSimulations = async () => {
        const toSync = await db.universitySimulations.where('status').anyOf('pending', 'error').toArray();
        for (const sim of toSync) {
            try {
                await db.universitySimulations.update(sim.id, { status: 'syncing' as any });
                const { problemas_seleccionados, problemas, ...cleanData } = sim.data as any;
                const payload = { ...cleanData, user_id: sim.user_id, es_simulacro: true, updated_at: new Date().toISOString() };
                const { data: saved, error } = await supabase.from('reportes_soap').upsert(payload).select('id').single();
                if (error) throw error;
                await supabase.from('reportes_soap_problemas').delete().eq('reporte_soap_id', saved.id);
                if (problemas_seleccionados?.length > 0) {
                    await supabase.from('reportes_soap_problemas').insert(problemas_seleccionados.map((p: any) => ({
                        reporte_soap_id: saved.id,
                        problema: p.problema,
                        tratamiento: p.tratamiento
                    })));
                }
                await db.universitySimulations.update(sim.id, { status: 'synced' });
            } catch (err) {
                await db.universitySimulations.update(sim.id, { status: 'error' });
            }
        }
    };

    const _internalSyncEnrollments = async () => {
        const enrolls = await db.enrollments.where('sync_status').anyOf('pending', 'error').toArray();
        for (const enroll of enrolls) {
            try {
                await db.enrollments.update(enroll.id, { sync_status: 'syncing' as any });
                const { error } = await supabase.from('inscripciones').update({ estado: enroll.estado }).eq('id', enroll.id);
                if (error) throw error;
                await db.enrollments.update(enroll.id, { sync_status: 'synced' });
            } catch (err) {
                await db.enrollments.update(enroll.id, { sync_status: 'error' });
            }
        }
    };

    const _internalSyncRegistrations = async () => {
        const toSync = await db.registrations.where('status').anyOf('ready', 'error').toArray();
        for (const reg of toSync) {
            try {
                await db.registrations.update(reg.id!, { status: 'syncing' as any });
                const { error: medError } = await supabase.from('fichas_medicas').upsert({
                    user_id: reg.user_id,
                    obra_social: reg.data.obra_social,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                if (medError) throw medError;
                await db.registrations.update(reg.id!, { status: 'synced' });
            } catch (err) {
                await db.registrations.update(reg.id!, { status: 'error' });
            }
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 2. FUNCIONES PÚBLICAS
    // ─────────────────────────────────────────────────────────────────────────

    const downloadAllTrips = useCallback(async () => {
        try {
            const { data: trips, error } = await supabase.from('viajes').select('*').order('fecha_inicio');
            if (error) throw error;
            await db.trips.clear();
            if (trips) await db.trips.bulkPut(trips);
            return { success: true };
        } catch (err) { return { success: false, error: err }; }
    }, []);

    const downloadAllEnrollments = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('inscripciones').select('*,profiles(full_name,phone),viajes(titulo)');
            if (error) throw error;
            await db.enrollments.clear();
            if (data) await db.enrollments.bulkPut(data);
            return { success: true };
        } catch (err) { return { success: false, error: err }; }
    }, []);

    const downloadAllSoapReports = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('reportes_soap').select('*, problemas:reportes_soap_problemas(*)').eq('es_simulacro', false);
            if (error) throw error;
            await db.soapReports.where('status').equals('synced').delete();
            if (data) {
                await db.soapReports.bulkPut(data.map(r => ({
                    id: r.id, inscripcion_id: r.inscripcion_id, status: 'synced' as const,
                    data: { ...r, problemas_seleccionados: r.problemas || [] }, updated_at: Date.now()
                })));
            }
            return { success: true };
        } catch (err) { return { success: false, error: err }; }
    }, []);

    const downloadAllSimulations = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('reportes_soap').select('*, problemas:reportes_soap_problemas(*)').eq('es_simulacro', true);
            if (error) throw error;
            await db.universitySimulations.where('status').equals('synced').delete();
            if (data) {
                await db.universitySimulations.bulkPut(data.map(s => ({
                    id: s.id, 
                    user_id: s.user_id, 
                    paciente_nombre: s.paciente_nombre || 'N/A', // Extraer campo obligatorio
                    alumno_nombre: s.alumno_nombre,
                    viaje_id: s.viaje_id,
                    status: 'synced' as const,
                    data: { ...s, problemas_seleccionados: s.problemas || [] }, 
                    created_at: s.created_at, 
                    updated_at: s.updated_at
                })));
            }
            return { success: true };
        } catch (err) { return { success: false, error: err }; }
    }, []);

    const syncPendingReports = useCallback(async () => {
        if (isSyncingRef.current || !isOnline) return;
        isSyncingRef.current = true; setSyncing(true);
        try { await _internalSyncReports(); } finally { isSyncingRef.current = false; setSyncing(false); }
    }, [isOnline]);

    const syncAllAdminData = useCallback(async () => {
        if (isSyncingRef.current || !isOnline) return;
        isSyncingRef.current = true; setSyncing(true);
        try {
            await _internalSyncReports();
            await _internalSyncSimulations();
            await _internalSyncEnrollments();
            await _internalSyncRegistrations();
            await downloadAllTrips();
            await downloadAllEnrollments();
            await downloadAllSoapReports();
            await downloadAllSimulations();
        } finally { isSyncingRef.current = false; setSyncing(false); }
    }, [isOnline, downloadAllTrips, downloadAllEnrollments, downloadAllSoapReports, downloadAllSimulations]);

    // Auto-sync
    useEffect(() => {
        if (!isOnline || isSyncingRef.current) return;
        const hasWork = (pendingReports?.length || 0) > 0 || (pendingSimulations?.length || 0) > 0 || 
                        (pendingEnrollments?.length || 0) > 0 || (readyRegistrations?.length || 0) > 0;
        if (!hasWork) return;
        const timer = setTimeout(() => syncAllAdminData(), 3000);
        return () => clearTimeout(timer);
    }, [isOnline, pendingReports, pendingSimulations, pendingEnrollments, readyRegistrations, syncAllAdminData]);

    return {
        isOnline, syncing, syncPendingReports, syncAllAdminData, 
        downloadAllTrips, downloadAllEnrollments, downloadAllSoapReports, downloadAllSimulations,
        pendingReportsCount: pendingReports?.length || 0
    };
};
