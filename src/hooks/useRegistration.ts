import { useState, useEffect } from 'react';
import { db } from '../api/db';
import { supabase } from '../api/supabase';
import { useOfflineSync } from './useOfflineSync';

export const useRegistration = (tripId: string, userId: string) => {
    const { isOnline } = useOfflineSync();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    const [formData, setFormData] = useState({
        emergency_contact_1: '',
        phone_emergency_1: '',
        emergency_contact_2: '',
        phone_emergency_2: '',
        obra_social: '',
        peso: undefined as number | undefined,
        estatura: undefined as number | undefined,
        tension_arterial: '',
        observaciones: '',
        grupo_sanguineo: '',
        alergias: '',
        medications: [] as Array<{ name: string; dosage: string }>,
        condiciones: [] as number[],
        domicilio: '',
        localidad: '',
        provincia: '',
        pais: 'Argentina',
        menu: 'General'
    });

    // Helper to validate UUID
    const isValidUUID = (uuid: string) => {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    };

    // Check if user is already registered for this trip
    useEffect(() => {
        const checkRegistration = async () => {
            if (!tripId || !userId || !isValidUUID(tripId)) {
                setCheckingStatus(false);
                return;
            }

            setCheckingStatus(true);
            try {
                if (!isOnline) {
                    // Offline: verificar en IndexedDB
                    const local = await db.enrollments
                        .where({ viaje_id: tripId, user_id: userId })
                        .first();
                    if (local) setAlreadyRegistered(true);
                    return;
                }

                const { data } = await supabase
                    .from('inscripciones')
                    .select('id')
                    .eq('viaje_id', tripId)
                    .eq('user_id', userId)
                    .maybeSingle();

                if (data) {
                    setAlreadyRegistered(true);
                }
            } catch (err) {
                console.error("Error checking registration status:", err);
                // En caso de fallo de red, intentar IndexedDB como fallback
                const local = await db.enrollments
                    .where({ viaje_id: tripId, user_id: userId })
                    .first();
                if (local) setAlreadyRegistered(true);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkRegistration();
    }, [tripId, userId, isOnline]);

    // Load existing data from Supabase (Medical Profile + Last Inscription), con fallback a IndexedDB offline
    useEffect(() => {
        const fetchExistingData = async () => {
            if (!userId) return;

            try {
                setCheckingStatus(true);
                let medicalProfile: any = null;
                let lastInscription: any = null;

                if (!isOnline) {
                    // Offline: leer ficha médica desde IndexedDB
                    const localRecord = await db.medicalRecords.get(userId);
                    if (localRecord) medicalProfile = localRecord.data;
                } else {
                    // Online: fetch desde Supabase
                    const { data: mp, error: medError } = await supabase
                        .from('fichas_medicas')
                        .select('*')
                        .eq('user_id', userId)
                        .maybeSingle();
                    if (medError) console.error("Error fetching medicalProfile:", medError);
                    else medicalProfile = mp;

                    const { data: li, error: insError } = await supabase
                        .from('inscripciones')
                        .select('domicilio, localidad, provincia, pais, menu')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    if (insError) console.error("Error fetching lastInscription:", insError);
                    else lastInscription = li;
                }

                if (medicalProfile || lastInscription) {
                    setFormData(prev => ({
                        ...prev,
                        emergency_contact_1: medicalProfile?.contacto_emergencia_1 || prev.emergency_contact_1 || '',
                        phone_emergency_1: medicalProfile?.telefono_emergencia_1?.toString() || prev.phone_emergency_1 || '',
                        emergency_contact_2: medicalProfile?.contacto_emergencia_2 || prev.emergency_contact_2 || '',
                        phone_emergency_2: medicalProfile?.telefono_emergencia_2?.toString() || prev.phone_emergency_2 || '',
                        obra_social: medicalProfile?.obra_social || prev.obra_social || '',
                        peso: medicalProfile?.peso || prev.peso,
                        estatura: medicalProfile?.estatura ? parseFloat(medicalProfile.estatura) : prev.estatura,
                        tension_arterial: medicalProfile?.tension_arterial || prev.tension_arterial || '',
                        observaciones: medicalProfile?.observaciones || prev.observaciones || '',
                        grupo_sanguineo: medicalProfile?.grupo_sanguineo || prev.grupo_sanguineo || '',
                        alergias: medicalProfile?.alergias || prev.alergias || '',
                        medications: medicalProfile?.medicamentos || prev.medications || [],
                        condiciones: medicalProfile?.condiciones || prev.condiciones || [],
                        domicilio: lastInscription?.domicilio || prev.domicilio || '',
                        localidad: lastInscription?.localidad || prev.localidad || '',
                        provincia: lastInscription?.provincia || prev.provincia || '',
                        pais: lastInscription?.pais || prev.pais || 'Argentina',
                        menu: lastInscription?.menu || prev.menu || 'General',
                    }));
                }
            } catch (err) {
                console.error("Error fetching existing data:", err);
                // Último recurso: intentar IndexedDB si el fetch online falló
                const localRecord = await db.medicalRecords.get(userId);
                if (localRecord?.data) {
                    const mp = localRecord.data;
                    setFormData(prev => ({
                        ...prev,
                        emergency_contact_1: mp.contacto_emergencia_1 || prev.emergency_contact_1 || '',
                        phone_emergency_1: mp.telefono_emergencia_1?.toString() || prev.phone_emergency_1 || '',
                        emergency_contact_2: mp.contacto_emergencia_2 || prev.emergency_contact_2 || '',
                        phone_emergency_2: mp.telefono_emergencia_2?.toString() || prev.phone_emergency_2 || '',
                        obra_social: mp.obra_social || prev.obra_social || '',
                        peso: mp.peso || prev.peso,
                        estatura: mp.estatura ? parseFloat(mp.estatura) : prev.estatura,
                        tension_arterial: mp.tension_arterial || prev.tension_arterial || '',
                        observaciones: mp.observaciones || prev.observaciones || '',
                        grupo_sanguineo: mp.grupo_sanguineo || prev.grupo_sanguineo || '',
                        alergias: mp.alergias || prev.alergias || '',
                        medications: mp.medicamentos || prev.medications || [],
                        condiciones: mp.condiciones || prev.condiciones || [],
                    }));
                }
            } finally {
                setCheckingStatus(false);
            }
        };

        fetchExistingData();
    }, [userId, isOnline]);

    // Load draft from Dexie (local override)
    useEffect(() => {
        const loadDraft = async () => {
            if (!tripId || !userId || alreadyRegistered || checkingStatus) return;
            const draft = await db.registrations
                .where({ trip_id: tripId, user_id: userId, status: 'pending' })
                .first();

            if (draft) {
                console.log("Found local draft:", draft);
                setFormData(prev => ({ ...prev, ...(draft.data as any) }));
            }
        };
        loadDraft();
    }, [tripId, userId, alreadyRegistered, checkingStatus]);

    // Save draft locally
    useEffect(() => {
        const saveDraft = async () => {
            if (!tripId || !userId || alreadyRegistered || checkingStatus) return;

            // Avoid saving empty drafts if we just started or are still loading
            const hasContent = Object.values(formData).some(v => v !== '' && v !== undefined && (Array.isArray(v) ? v.length > 0 : true));
            if (!hasContent) return;

            const existing = await db.registrations
                .where({ trip_id: tripId, user_id: userId, status: 'pending' })
                .first();

            if (existing) {
                await db.registrations.update(existing.id!, {
                    data: formData,
                    created_at: Date.now()
                });
            } else {
                await db.registrations.add({
                    trip_id: tripId,
                    user_id: userId,
                    status: 'pending',
                    data: formData,
                    created_at: Date.now()
                });
            }
        };

        const timeout = setTimeout(saveDraft, 2000); // 2 seconds between saves
        return () => clearTimeout(timeout);
    }, [formData, tripId, userId, alreadyRegistered, checkingStatus]);

    const updateField = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleCondition = (id: number) => {
        setFormData(prev => ({
            ...prev,
            condiciones: prev.condiciones.includes(id)
                ? prev.condiciones.filter(c => c !== id)
                : [...prev.condiciones, id]
        }));
    };

    const submitRegistration = async (overrideTripId?: string) => {
        const finalTripId = overrideTripId || tripId;
        // Permitir el envío siempre para actualizar ficha médica, incluso si ya está inscrito

        setSubmitting(true);
        try {
            // 0. Ensure Profile exists
            // 0. Ensure Profile exists
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user) {
                // Fetch existing profile to preserve role
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userData.user.id)
                    .single();

                await supabase.from('profiles').upsert({
                    id: userData.user.id,
                    full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0],
                    role: existingProfile?.role || 'user'
                }, { onConflict: 'id' });
            }

            const cleanPhone = (p: any) => {
                if (!p) return null;
                const cleaned = p.toString().replace(/\D/g, '');
                return cleaned ? parseInt(cleaned, 10) : null;
            };

            // 1. Update/Create Medical Profile (fichas_medicas)
            const { error: medicalError } = await supabase
                .from('fichas_medicas')
                .upsert({
                    user_id: userId,
                    obra_social: formData.obra_social,
                    contacto_emergencia_1: formData.emergency_contact_1,
                    telefono_emergencia_1: cleanPhone(formData.phone_emergency_1),
                    contacto_emergencia_2: formData.emergency_contact_2,
                    telefono_emergencia_2: cleanPhone(formData.phone_emergency_2),
                    tension_arterial: formData.tension_arterial,
                    estatura: formData.estatura?.toString(),
                    peso: formData.peso,
                    observaciones: formData.observaciones,
                    condiciones: formData.condiciones,
                    grupo_sanguineo: formData.grupo_sanguineo,
                    alergias: formData.alergias,
                    medicamentos: formData.medications,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (medicalError) throw medicalError;

            // 2. Create Trip Registration (inscripciones)
            if (isValidUUID(finalTripId)) {
                const { error: registrationError } = await supabase
                    .from('inscripciones')
                    .insert({
                        viaje_id: finalTripId,
                        user_id: userId,
                        estado: 'pending',
                        domicilio: formData.domicilio,
                        localidad: formData.localidad,
                        provincia: formData.provincia,
                        pais: formData.pais,
                        menu: formData.menu,
                        created_at: new Date().toISOString()
                    });

                if (registrationError) throw registrationError;
                if (finalTripId === tripId) setAlreadyRegistered(true);
            }

            // 3. Mark local draft as synced/removed
            await db.registrations
                .where({ trip_id: finalTripId, user_id: userId, status: 'pending' })
                .delete();

            return { success: true };
        } catch (err: any) {
            console.error("Error submitting registration:", err);
            
            // OFFLINE BACKUP: If it's a network error or Supabase is down, save as 'ready' for sync
            const isNetworkError = !navigator.onLine || err.message === 'Failed to fetch' || err.code === 'PGRST301';
            
            if (isNetworkError) {
                console.log("Network error detected, saving to offline queue...");
                await db.registrations.put({
                    trip_id: finalTripId || 'GENERAL',
                    user_id: userId,
                    status: 'ready',
                    data: formData,
                    created_at: Date.now()
                });
                
                // Clear the pending draft since it's now 'ready' to sync
                await db.registrations
                    .where({ trip_id: finalTripId, user_id: userId, status: 'pending' })
                    .delete();

                return { success: true, offline: true };
            }

            return { success: false, error: err };
        } finally {
            setSubmitting(false);
        }
    };

    return {
        step,
        setStep,
        formData,
        updateField,
        toggleCondition,
        submitRegistration,
        submitting,
        alreadyRegistered,
        checkingStatus
    };
};
