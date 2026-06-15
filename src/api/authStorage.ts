import { db } from './db';

// Supabase espera un storage sincrónico (como localStorage).
// Estrategia: localStorage actúa como caché en memoria (lectura sincrónica inmediata),
// IndexedDB persiste en segundo plano (más durable en móviles — iOS no lo limpia automáticamente).
// Al arrancar, hidratamos localStorage desde IndexedDB para que la próxima apertura tenga los datos.

const IDB_KEYS = ['sb-auth-token', 'cached_session_user', 'cached_user_profile'];

// Hidrata localStorage desde IndexedDB al arrancar la app.
// Esto asegura que cuando Supabase lea sincrónicamente, los datos ya estén en localStorage.
export const hydrateAuthFromIDB = async (): Promise<void> => {
    try {
        const entries = await db.authSession.toArray();
        for (const entry of entries) {
            if (localStorage.getItem(entry.key) === null) {
                localStorage.setItem(entry.key, entry.value);
            }
        }
    } catch {
        // Si IDB falla, localStorage ya tiene lo que tiene — seguimos sin problema
    }
};

export const idbAuthStorage = {
    getItem: (key: string): string | null => {
        return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
        localStorage.setItem(key, value);
        // Persiste en IndexedDB en segundo plano sin bloquear
        db.authSession.put({ key, value }).catch(() => {});
    },
    removeItem: (key: string): void => {
        localStorage.removeItem(key);
        db.authSession.delete(key).catch(() => {});
    },
};

// Mantiene IndexedDB sincronizado con cualquier clave de auth que cambie en localStorage.
// Se llama una vez al arrancar para asegurar que IDB refleje el estado actual.
export const syncAuthToIDB = async (): Promise<void> => {
    try {
        for (const key of IDB_KEYS) {
            const value = localStorage.getItem(key);
            if (value !== null) {
                await db.authSession.put({ key, value });
            }
        }
    } catch {
        // IDB no disponible — localStorage sigue siendo el fallback
    }
};
