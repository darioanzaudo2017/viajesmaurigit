import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { db } from '../api/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);

    const pendingReports = useLiveQuery(
        () => db.soapReports.where('status').equals('pending').toArray(),
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

    // Effect to auto-sync when online
    useEffect(() => {
        if (isOnline && pendingReports && pendingReports.length > 0 && !syncing) {
            syncPendingReports();
        }
    }, [isOnline, pendingReports, syncing]);

    const syncPendingReports = async () => {
        if (!pendingReports || pendingReports.length === 0) return;

        setSyncing(true);
        console.log(`Sincronizando ${pendingReports.length} reportes SOAP...`);

        for (const report of pendingReports) {
            try {
                const { error } = await supabase
                    .from('reportes_soap')
                    .upsert({
                        ...report.data,
                        updated_at: new Date(report.updated_at).toISOString()
                    });

                if (!error) {
                    await db.soapReports.update(report.id, { status: 'synced' });
                }
            } catch (err) {
                console.error("Error syncing report:", report.id, err);
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

    // ─── NEW: Sync everything for admin offline use ───────────────
    const syncAllAdminData = useCallback(async () => {
        if (syncing) return;
        setSyncing(true);
        console.log('[OfflineSync] Iniciando sincronización completa para admin...');

        try {
            await downloadAllTrips();
            await downloadAllEnrollments();
            console.log('[OfflineSync] Sincronización completa exitosa.');
        } catch (err) {
            console.error('[OfflineSync] Error en sincronización completa:', err);
        } finally {
            setSyncing(false);
        }
    }, [syncing, downloadAllTrips, downloadAllEnrollments]);

    return {
        isOnline,
        syncing,
        pendingReportsCount: pendingReports?.length || 0,
        downloadTripData,
        downloadAllTrips,
        downloadAllEnrollments,
        syncAllAdminData,
        syncPendingReports
    };
};
