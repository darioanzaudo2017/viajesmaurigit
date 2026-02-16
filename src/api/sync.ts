import { db } from './db';
import { supabase } from './supabase';

export const syncPendingRegistrations = async () => {
    const pending = await db.registrations.where('status').equals('pending').toArray();

    if (pending.length === 0) return { count: 0, errors: 0 };

    let errorCount = 0;
    let successCount = 0;

    for (const reg of pending) {
        try {
            // 1. Sync Profile/Medical Info
            const { error: profileError } = await supabase
                .from('fichas_medicas')
                .upsert({
                    user_id: reg.user_id,
                    obra_social: reg.data.obra_social,
                    contacto_emergencia_1: reg.data.emergency_contact_1,
                    telefono_emergencia_1: reg.data.phone_emergency_1,
                    contacto_emergencia_2: reg.data.emergency_contact_2,
                    telefono_emergencia_2: reg.data.phone_emergency_2,
                    peso: reg.data.peso,
                    estatura: reg.data.estatura,
                    tension_arterial: reg.data.tension_arterial,
                    observaciones: reg.data.observaciones,
                    grupo_sanguineo: reg.data.grupo_sanguineo,
                    alergias: reg.data.alergias,
                    medicamentos: reg.data.medications,
                    condiciones: reg.data.condiciones,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (profileError) throw profileError;

            // 2. Mark as synced locally
            await db.registrations.update(reg.id!, {
                status: 'synced',
                last_attempt: Date.now()
            });
            successCount++;
        } catch (err) {
            console.error('Failed to sync registration:', err);
            errorCount++;
            await db.registrations.update(reg.id!, {
                status: 'error',
                last_attempt: Date.now()
            });
        }
    }

    return { count: successCount, errors: errorCount };
};
