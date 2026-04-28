import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../api/supabase';
import { db } from '../api/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const isSyncingRef = useRef(false);

    // Escuchar 'pending' Y 'error' para poder reintentar reportes fallidos
    const pendingReports = useLiveQuery(
        () => db.soapReports.where('status').anyOf('pending', 'error').toArray(),
        []
    );

    const pendingSimulations = useLiveQuery(
        () => db.universitySimulations.where('status').equals('pending').toArray(),
        []
    );

    const pendingEnrollments = useLiveQuery(
        () => db.enrollments.where('sync_status').anyOf('pending', 'error').toArray(),
        []
    );

    const readyRegistrations = useLiveQuery(
        () => db.registrations.where('status').anyOf('ready', 'error').toArray(),
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
                // Marcar como 'syncing' mientras se intenta (evita doble proceso por useLiveQuery)
                await db.soapReports.update(report.id, { status: 'syncing' as any });

                // Limpiar campos que no pertenecen a la tabla física de Supabase
                const { problemas_seleccionados, problemas, ...cleanData } = report.data as any;

                const finalPayload = {
                    ...cleanData,
                    es_simulacro: false,
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
                        observacion_especifica: p.observacion_especifica,
                        problema: p.problema,
                        problema_anticipado: p.problema_anticipado,
                        tratamiento: p.tratamiento
                    }));
                    await supabase.from('reportes_soap_problemas').insert(problemasToInsert);
                }

                // Actualizar la copia local con el ID real devuelto por Supabase
                // (puede diferir si el reporte fue creado offline con UUID local)
                // Re-fetch los problemas confirmados desde Supabase para evitar duplicados
                const { data: confirmedProblemas } = await supabase
                    .from('reportes_soap_problemas')
                    .select('*')
                    .eq('reporte_soap_id', savedReport.id);

                await db.soapReports.put({
                    id: savedReport.id,
                    inscripcion_id: report.inscripcion_id,
                    status: 'synced',
                    data: { 
                        ...savedReport, 
                        problemas_seleccionados: confirmedProblemas || []
                    },
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

    const syncPendingEnrollments = useCallback(async () => {
        const enrollsToSync = await db.enrollments.where('sync_status').anyOf('pending', 'error').toArray();
        if (enrollsToSync.length === 0) return;

        console.log(`[OfflineSync] Sincronizando ${enrollsToSync.length} cambios de inscripciones...`);

        for (const enroll of enrollsToSync) {
            try {
                await db.enrollments.update(enroll.id, { sync_status: 'syncing' as any });

                const { error } = await supabase
                    .from('inscripciones')
                    .update({ estado: enroll.estado })
                    .eq('id', enroll.id);

                if (error) throw error;

                await db.enrollments.update(enroll.id, { sync_status: 'synced' });
                console.log(`[OfflineSync] Inscripción ${enroll.id} sincronizada.`);
            } catch (err) {
                console.error('[OfflineSync] Error syncing enrollment:', enroll.id, err);
                await db.enrollments.update(enroll.id, { sync_status: 'error' });
            }
        }
    }, [isOnline]);

    const syncPendingSimulations = useCallback(async () => {
        const toSync = await db.universitySimulations.where('status').anyOf('pending', 'error').toArray();
        if (!toSync || toSync.length === 0) return;

        setSyncing(true);
        console.log(`[OfflineSync] Sincronizando ${toSync.length} simulacros SOAP...`);

        for (const sim of toSync) {
            try {
                await db.universitySimulations.update(sim.id, { status: 'syncing' as any });

                const { problemas_seleccionados, problemas, ...cleanData } = sim.data as any;

                const payload = {
                    ...cleanData,
                    id: sim.id,
                    user_id: sim.user_id,
                    paciente_nombre: sim.paciente_nombre,
                    alumno_nombre: sim.alumno_nombre,
                    viaje_id: sim.viaje_id,
                    es_simulacro: true,
                    created_at: sim.created_at,
                    updated_at: new Date().toISOString()
                };

                const { data: savedReport, error } = await supabase
                    .from('reportes_soap')
                    .upsert(payload)
                    .select()
                    .single();

                if (error) throw error;

                // Sincronizar problemas relacionales
                if (problemas_seleccionados && problemas_seleccionados.length > 0) {
                    await supabase
                        .from('reportes_soap_problemas')
                        .delete()
                        .eq('reporte_soap_id', savedReport.id);

                    const problemasToInsert = problemas_seleccionados.map((p: any) => ({
                        reporte_soap_id: savedReport.id,
                        observacion_especifica: p.observacion_especifica,
                        problema: p.problema,
                        problema_anticipado: p.problema_anticipado,
                        tratamiento: p.tratamiento
                    }));
                    await supabase.from('reportes_soap_problemas').insert(problemasToInsert);
                }

                await db.universitySimulations.update(sim.id, { status: 'synced' });
                console.log(`[OfflineSync] Simulacro ${sim.id} sincronizado en tabla unificada.`);
            } catch (err) {
                console.error("[OfflineSync] Error syncing simulation:", sim.id, err);
                await db.universitySimulations.update(sim.id, { status: 'error' });
            }
        }
        setSyncing(false);
    }, [isOnline]);

    const syncPendingRegistrations = useCallback(async () => {
        const toSync = await db.registrations.where('status').anyOf('ready', 'error').toArray();
        if (!toSync || toSync.length === 0) return;

        setSyncing(true);
        console.log(`[OfflineSync] Sincronizando ${toSync.length} inscripciones nuevas/actualizaciones...`);

        for (const reg of toSync) {
            try {
                await db.registrations.update(reg.id!, { status: 'syncing' as any });
                // 1. Upsert Medical Profile
                const { error: medError } = await supabase
                    .from('fichas_medicas')
                    .upsert({
                        user_id: reg.user_id,
                        obra_social: reg.data.obra_social,
                        contacto_emergencia_1: reg.data.emergency_contact_1,
                        telefono_emergencia_1: reg.data.phone_emergency_1,
                        contacto_emergencia_2: reg.data.emergency_contact_2,
                        telefono_emergencia_2: reg.data.phone_emergency_2,
                        tension_arterial: reg.data.tension_arterial,
                        estatura: reg.data.estatura?.toString(),
                        peso: reg.data.peso,
                        observaciones: reg.data.observaciones,
                        condiciones: reg.data.condiciones,
                        grupo_sanguineo: reg.data.grupo_sanguineo,
                        alergias: reg.data.alergias,
                        medicamentos: reg.data.medications,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (medError) throw medError;

                // 2. Upsert Trip Enrollment if applicable
                if (reg.trip_id && reg.trip_id !== 'GENERAL') {
                    const { error: enrollError } = await supabase
                        .from('inscripciones')
                        .upsert({
                            viaje_id: reg.trip_id,
                            user_id: reg.user_id,
                            estado: 'pending',
                            domicilio: (reg.data as any).domicilio,
                            localidad: (reg.data as any).localidad,
                            provincia: (reg.data as any).provincia,
                            pais: (reg.data as any).pais,
                            menu: (reg.data as any).menu,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'viaje_id,user_id' });

                    if (enrollError) throw enrollError;
                }

                // 3. Mark as synced
                await db.registrations.update(reg.id!, { status: 'synced' });
                console.log(`[OfflineSync] Registro de usuario ${reg.user_id} sincronizado.`);
            } catch (err) {
                console.error("[OfflineSync] Error syncing registration:", reg.id, err);
                await db.registrations.update(reg.id!, { status: 'error' });
            }
        }
        setSyncing(false);
    }, []);
    useEffect(() => {
        if (!isOnline) return;

        const hasPendingReports = pendingReports && pendingReports.length > 0;
        const hasPendingSimulations = pendingSimulations && pendingSimulations.length > 0;
        const hasPendingEnrollments = pendingEnrollments && pendingEnrollments.length > 0;
        const hasReadyRegistrations = readyRegistrations && readyRegistrations.length > 0;

        if (!hasPendingReports && !hasPendingSimulations && !hasPendingEnrollments && !hasReadyRegistrations) return;

        if (isSyncingRef.current) {
            console.log('[OfflineSync] Sync ya en progreso, ignorando disparo.');
            return;
        }

        let cancelled = false;
        const run = async () => {
            isSyncingRef.current = true;
            setSyncing(true);
            try {
                if (hasPendingReports) await syncPendingReports();
                if (hasPendingSimulations) await syncPendingSimulations();
                if (hasPendingEnrollments) await syncPendingEnrollments();
                if (hasReadyRegistrations) await syncPendingRegistrations();
            } finally {
                if (!cancelled) {
                    isSyncingRef.current = false;
                    setSyncing(false);
                }
            }
        };
        run();

        return () => { cancelled = true; };
    }, [
        isOnline,
        pendingReports,
        pendingSimulations,
        pendingEnrollments,
        readyRegistrations,
        syncPendingReports,
        syncPendingEnrollments,
        syncPendingSimulations,
        syncPendingRegistrations
    ]);

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
                .select('*, problemas:reportes_soap_problemas(*)')
                .eq('es_simulacro', false);

            if (error) throw error;
            
            // Solo borrar synced, preservar pending/error locales
            await db.soapReports
                .where('status').equals('synced')
                .delete();
            
            if (reports && reports.length > 0) {
                await db.soapReports.bulkPut(reports.map(r => ({
                    id: r.id,
                    inscripcion_id: r.inscripcion_id,
                    status: 'synced' as const,
                    data: {
                        ...r,
                        problemas_seleccionados: r.problemas || [],
                        problemas: undefined
                    },
                    updated_at: new Date(r.updated_at || Date.now()).getTime()
                })));
            }

            console.log(`[OfflineSync] ${reports?.length ?? 0} reportes SOAP cacheados.`);
            return { success: true, count: reports?.length ?? 0 };
        } catch (err) {
            console.error('[OfflineSync] Error descargando reportes SOAP:', err);
            return { success: false, error: err };
        }
    }, []);

    const downloadAllSimulations = useCallback(async () => {
        try {
            const { data: sims, error } = await supabase
                .from('reportes_soap')
                .select('*, problemas:reportes_soap_problemas(*)')
                .eq('es_simulacro', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Solo borrar synced, preservar pending/error locales
            await db.universitySimulations
                .where('status').equals('synced')
                .delete();

            if (sims && sims.length > 0) {
                await db.universitySimulations.bulkPut(sims.map(s => ({
                    id: s.id,
                    user_id: s.user_id,
                    paciente_nombre: s.paciente_nombre,
                    alumno_nombre: s.alumno_nombre,
                    viaje_id: s.viaje_id,
                    status: 'synced' as const,
                    data: {
                        ...s,
                        problemas_seleccionados: s.problemas || []
                    },
                    created_at: s.created_at,
                    updated_at: s.updated_at || s.created_at
                })));
            }

            console.log(`[OfflineSync] ${sims?.length ?? 0} simulacros cacheados.`);
            return { success: true, count: sims?.length ?? 0 };
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
            // Primero subir los pendientes, LUEGO descargar el estado limpio
            await syncPendingReports();
            await syncPendingSimulations();
            await syncPendingEnrollments();
            await syncPendingRegistrations();

            // Recién después de confirmar que todo subió, bajar el estado definitivo
            await downloadAllTrips();
            await downloadAllEnrollments();
            await downloadAllSoapReports();
            await downloadAllSimulations();

            console.log('[OfflineSync] Sincronización completa exitosa.');
        } catch (err) {
            console.error('[OfflineSync] Error en sincronización completa:', err);
        } finally {
            setSyncing(false);
        }
    }, [
        syncing,
        syncPendingReports,
        syncPendingSimulations,
        syncPendingEnrollments,
        syncPendingRegistrations,
        downloadAllTrips,
        downloadAllEnrollments,
        downloadAllSoapReports,
        downloadAllSimulations
    ]);

    return {
        isOnline,
        syncing,
        pendingReportsCount: pendingReports?.length || 0,
        pendingSimulationsCount: pendingSimulations?.length || 0,
        pendingEnrollmentsCount: pendingEnrollments?.length || 0,
        downloadTripData,
        downloadAllTrips,
        downloadAllEnrollments,
        downloadAllSimulations,
        syncAllAdminData,
        syncPendingReports,
        syncPendingSimulations,
        syncPendingEnrollments,
        syncPendingRegistrations
    };
};
