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

            if (navigator.onLine) {
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
                    // Update cache
                    await db.medicalRecords.put({ user_id: userId, data: fullProfile });
                } else {
                    setProfile(null);
                }
            } else {
                // FALLBACK TO DEXIE
                const cached = await db.medicalRecords.get(userId);
                if (cached) {
                    setProfile(cached.data);
                } else {
                    setProfile(null);
                }
            }
        } catch (err: any) {
            console.error('Error fetching medical profile:', err);
            // Fallback to Dexie cache on any error (e.g. network fail while "online")
            try {
                const cached = await db.medicalRecords.get(userId);
                if (cached) {
                    setProfile(cached.data);
                    console.log('[MedicalProfile] Using cached data after error');
                }
            } catch { /* ignore cache errors */ }
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
