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
                const { data, error: sbError } = await supabase
                    .from('fichas_medicas')
                    .select(`
                        *,
                        user:user_id (
                            full_name
                        )
                    `)
                    .eq('user_id', userId)
                    .single();

                if (sbError) {
                    if (sbError.code === 'PGRST116') {
                        setProfile(null);
                    } else {
                        throw sbError;
                    }
                } else {
                    setProfile(data);
                    // Update cache
                    await db.medicalRecords.put({ user_id: userId, data });
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
