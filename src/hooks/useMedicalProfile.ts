import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { db } from '../api/db';

export const useMedicalProfile = (userId: string) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            // Intentar siempre desde Supabase; si falla por red, caer a Dexie
            try {
                const { data: medData, error: sbError } = await supabase
                    .from('fichas_medicas')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (sbError && sbError.code !== 'PGRST116') throw sbError;

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', userId)
                    .single();

                if (medData) {
                    const fullProfile = { ...medData, user: profileData };
                    setProfile(fullProfile);
                    await db.medicalRecords.put({ user_id: userId, data: fullProfile });
                } else {
                    // Sin ficha en servidor — igual revisar caché local por si se guardó offline
                    const cached = await db.medicalRecords.get(userId);
                    setProfile(cached?.data ?? null);
                }
            } catch {
                // Red no disponible o Supabase pausado — usar caché de IndexedDB
                const cached = await db.medicalRecords.get(userId);
                if (cached) {
                    setProfile(cached.data);
                    console.log('[MedicalProfile] Usando caché offline para:', userId);
                } else {
                    setProfile(null);
                }
            }
        } catch (err: any) {
            console.error('Error fetching medical profile:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    return { profile, loading, error, refetch: fetchProfile };
};
