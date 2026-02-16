import { useState, useEffect } from 'react';
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

    return {
        isOnline,
        syncing,
        pendingReportsCount: pendingReports?.length || 0,
        downloadTripData,
        syncPendingReports
    };
};
