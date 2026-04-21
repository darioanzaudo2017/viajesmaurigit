import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { db } from '../api/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);

    // Escuchar 'pending' Y 'error' para poder reintentar reportes fallidos
    const pendingReports = useLiveQuery(
        () => db.soapReports.where('status').anyOf('pending', 'error').toArray(),
        []
    );

    const pendingSimulations = useLiveQuery(
        () => db.universitySimulations.where('status').equals('pending').toArray(),
        []
    );

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

    const syncPendingReports = useCallback(async () => {
        // Leer directamente de Dexie para evitar bug de closure con el state de React
        const reportsToSync = await db.soapReports.where('status').anyOf('pending', 'error').toArray();
        if (reportsToSync.length === 0) return;

        setSyncing(true);
        console.log(`[OfflineSync] Sincronizando ${reportsToSync.length} reportes SOAP...`);

        for (const report of reportsToSync) {
            try {
                // Marcar como 'pending' mientras se intenta (evita doble proceso)
                await db.soapReports.update(report.id, { status: 'pending' });

                // Limpiar campos que no pertenecen a la tabla física de Supabase
                const { problemas_seleccionados, problemas, ...cleanData } = report.data as any;

                const finalPayload = {
                    ...cleanData,
                    updated_at: new Date(report.updated_at).toISOString()
                };

                const { data: savedReport, error } = await supabase
                    .from('reportes_soap')
                    .upsert(finalPayload)
                    .select()
                    .single();

                if (error) throw error;

                // Sincronizar problemas relacionales si existen
                if (problemas_seleccionados && problemas_seleccionados.length > 0) {
                    await supabase
                        .from('reportes_soap_problemas')
                        .delete()
                        .eq('reporte_soap_id', savedReport.id);

                    const problemasToInsert = problemas_seleccionados.map((p: any) => ({
                        reporte_soap_id: savedReport.id,
                        problema_id: p.problema_id,
                        observacion_especifica: p.observacion_especifica,
                        problema: p.problema,
                        problema_anticipado: p.problema_anticipado,
                        tratamiento: p.tratamiento
                    }));
                    await supabase.from('reportes_soap_problemas').insert(problemasToInsert);
                }

                // Actualizar la copia local con el ID real devuelto por Supabase
                // (puede diferir si el reporte fue creado offline con UUID local)
                await db.soapReports.put({
                    id: savedReport.id,
                    inscripcion_id: report.inscripcion_id,
                    status: 'synced',
                    data: { ...savedReport, problemas_seleccionados },
                    updated_at: Date.now()
                });
                // Si el ID cambió (era UUID local), borrar el registro viejo
                if (savedReport.id !== report.id) {
                    await db.soapReports.delete(report.id);
                }

                console.log(`[OfflineSync] Reporte ${savedReport.id} sincronizado con éxito.`);
            } catch (err) {
                console.error('[OfflineSync] Error syncing report:', report.id, err);
                // Marcar como 'error' — el próximo evento 'online' lo reintentará
                await db.soapReports.update(report.id, { status: 'error' });
            }
        }
        setSyncing(false);
    }, []);

    // Auto-sync al recuperar conexión o cuando aparecen reportes pendientes
    useEffect(() => {
        if (isOnline && !syncing) {
            if (pendingReports && pendingReports.length > 0) {
                syncPendingReports();
            }
            if (pendingSimulations && pendingSimulations.length > 0) {
                syncPendingSimulations();
            }
        }
    }, [isOnline, pendingReports, pendingSimulations, syncing, syncPendingReports]);

    const syncPendingSimulations = async () => {
        if (!pendingSimulations || pendingSimulations.length === 0) return;

        setSyncing(true);
        console.log(`Sincronizando ${pendingSimulations.length} simulacros SOAP...`);

        for (const sim of pendingSimulations) {
            try {
                const payload = {
                    id: sim.id,
                    user_id: sim.user_id,
                    paciente_nombre: sim.paciente_nombre,
                    data: sim.data,
                    created_at: sim.created_at
                };

                const { error } = await supabase
                    .from('simulacros_soap')
                    .upsert(payload);

                if (error) throw error;

                await db.universitySimulations.update(sim.id, { status: 'synced' });
                console.log(`Simulacro ${sim.id} sincronizado con éxito.`);
            } catch (err) {
                console.error("Error syncing simulation:", sim.id, err);
                await db.universitySimulations.update(sim.id, { status: 'error' });
            }
        }
        setSyncing(false);
    };

    const downloadTripData = async (tripId: string) => {
        try {
            setSyncing(true);

            // 1. Fetch Enrollments
            const { data: enrollments, error: enrollError } = await supabase
                .from('inscripciones')
                .select('*,profiles(full_name,phone)')
                .eq('viaje_id', tripId);

            if (enrollError) throw enrollError;

            // 2. Clear old and save new enrollments
            await db.enrollments.where('viaje_id').equals(tripId).delete();
            if (enrollments) {
                await db.enrollments.bulkPut(enrollments.map(e => ({
                    id: e.id,
                    viaje_id: e.viaje_id,
                    user_id: e.user_id,
                    estado: e.estado,
                    profiles: e.profiles,
                    soap_creada: e.soap_creada
                })));

                // 3. Fetch Medical Records for these users
                const userIds = enrollments.map(e => e.user_id);
                const { data: medicalRecords, error: medError } = await supabase
                    .from('fichas_medicas')
                    .select('*')
                    .in('user_id', userIds);

                if (medError) throw medError;

                if (medicalRecords) {
                    await db.medicalRecords.bulkPut(medicalRecords.map(m => ({
                        user_id: m.user_id,
                        data: m
                    })));
                }
            }

            return { success: true };
        } catch (err) {
            console.error("Error downloading trip data:", err);
            return { success: false, error: err };
        } finally {
            setSyncing(false);
        }
    };

    // ─── NEW: Download ALL trips to local DB ───────────────────────
    const downloadAllTrips = useCallback(async () => {
        try {
            const { data: trips, error } = await supabase
                .from('viajes')
                .select('*')
                .order('fecha_inicio', { ascending: true });

            if (error) throw error;
            if (!trips || trips.length === 0) return { success: true, count: 0 };

            // Replace all local trips with fresh data
            await db.trips.clear();
            await db.trips.bulkPut(trips.map(t => ({
                id: t.id,
                titulo: t.titulo,
                descripcion: t.descripcion,
                fecha_inicio: t.fecha_inicio,
                fecha_fin: t.fecha_fin,
                cupos_totales: t.cupos_totales,
                cupos_disponibles: t.cupos_disponibles,
                min_participantes: t.min_participantes || 0,
                estado: t.estado,
                dificultad: t.dificultad || '',
                ubicacion: t.ubicacion || '',
                imagen_url: t.imagen_url || '',
                updated_at: t.updated_at || new Date().toISOString()
            })));

            console.log(`[OfflineSync] ${trips.length} viajes cacheados localmente.`);
            return { success: true, count: trips.length };
        } catch (err) {
            console.error('[OfflineSync] Error descargando viajes:', err);
            return { success: false, error: err };
        }
    }, []);

    // ─── NEW: Download ALL enrollments with profile & trip title ───
    const downloadAllEnrollments = useCallback(async () => {
        try {
            const { data: enrollments, error } = await supabase
                .from('inscripciones')
                .select('*,profiles(full_name,phone),viajes(titulo)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!enrollments || enrollments.length === 0) return { success: true, count: 0 };

            await db.enrollments.clear();
            await db.enrollments.bulkPut(enrollments.map(e => ({
                id: e.id,
                viaje_id: e.viaje_id,
                user_id: e.user_id,
                estado: e.estado,
                created_at: e.created_at,
                menu: e.menu,
                profiles: e.profiles,
                viajes: e.viajes,
                soap_creada: e.soap_creada
            })));

            // Also cache medical records for all enrolled users
            const userIds = [...new Set(enrollments.map(e => e.user_id))];
            if (userIds.length > 0) {
                // Supabase IN filter has a limit, batch in chunks of 50
                for (let i = 0; i < userIds.length; i += 50) {
                    const chunk = userIds.slice(i, i + 50);
                    const { data: medRecords } = await supabase
                        .from('fichas_medicas')
                        .select('*')
                        .in('user_id', chunk);

                    if (medRecords && medRecords.length > 0) {
                        await db.medicalRecords.bulkPut(medRecords.map(m => ({
                            user_id: m.user_id,
                            data: m
                        })));
                    }
                }
            }

            console.log(`[OfflineSync] ${enrollments.length} inscripciones cacheadas localmente.`);
            return { success: true, count: enrollments.length };
        } catch (err) {
            console.error('[OfflineSync] Error descargando inscripciones:', err);
            return { success: false, error: err };
        }
    }, []);

    // ─── NEW: Download ALL SOAP reports ──────────────────────────
    const downloadAllSoapReports = useCallback(async () => {
        try {
            const { data: reports, error } = await supabase
                .from('reportes_soap')
                .select('*, problemas:reportes_soap_problemas(*, maestro:maestro_problemas_soap(*))');

            if (error) throw error;
            if (!reports || reports.length === 0) return { success: true, count: 0 };

            await db.soapReports.clear();
            await db.soapReports.bulkPut(reports.map(r => ({
                id: r.id,
                inscripcion_id: r.inscripcion_id,
                status: 'synced',
                data: {
                    ...r,
                    problemas_seleccionados: r.problemas || []
                },
                updated_at: new Date(r.updated_at || Date.now()).getTime()
            })));

            console.log(`[OfflineSync] ${reports.length} reportes SOAP cacheados.`);
            return { success: true, count: reports.length };
        } catch (err) {
            console.error('[OfflineSync] Error descargando reportes SOAP:', err);
            return { success: false, error: err };
        }
    }, []);

    const downloadAllSimulations = useCallback(async () => {
        try {
            const { data: sims, error } = await supabase
                .from('simulacros_soap')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!sims || sims.length === 0) return { success: true, count: 0 };

            // We don't clear all because it might delete pending ones from other users (unlikely but safe)
            // Instead, we only update/insert what we got from server
            await db.universitySimulations.bulkPut(sims.map(s => ({
                id: s.id,
                user_id: s.user_id,
                paciente_nombre: s.paciente_nombre,
                status: 'synced',
                data: s.data,
                created_at: s.created_at
            })));

            console.log(`[OfflineSync] ${sims.length} simulacros cacheados.`);
            return { success: true, count: sims.length };
        } catch (err) {
            console.error('[OfflineSync] Error descargando simulacros:', err);
            return { success: false, error: err };
        }
    }, []);

    // ─── NEW: Sync everything for admin offline use ───────────────
    const syncAllAdminData = useCallback(async () => {
        if (syncing) return;
        setSyncing(true);
        console.log('[OfflineSync] Iniciando sincronización completa para admin...');

        try {
            await downloadAllTrips();
            await downloadAllEnrollments();
            await downloadAllSoapReports();
            console.log('[OfflineSync] Sincronización completa exitosa.');
        } catch (err) {
            console.error('[OfflineSync] Error en sincronización completa:', err);
        } finally {
            setSyncing(false);
        }
    }, [syncing, downloadAllTrips, downloadAllEnrollments, downloadAllSoapReports]);

    return {
        isOnline,
        syncing,
        pendingReportsCount: pendingReports?.length || 0,
        pendingSimulationsCount: pendingSimulations?.length || 0,
        downloadTripData,
        downloadAllTrips,
        downloadAllEnrollments,
        downloadAllSimulations,
        syncAllAdminData,
        syncPendingReports,
        syncPendingSimulations
    };
};
