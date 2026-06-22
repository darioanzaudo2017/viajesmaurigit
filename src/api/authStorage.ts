import { db } from './db';

// Estrategia dual localStorage + IndexedDB:
// - localStorage: lectura sincrónica para Supabase auth (que no soporta async storage)
// - IndexedDB: copia durable que sobrevive cuando el navegador limpia localStorage (iOS, móviles)
// - Al arrancar, hydrateAuthFromIDB restaura IndexedDB → localStorage antes de montar la app

// Hidrata localStorage desde IndexedDB al arrancar.
// DEBE llamarse en main.tsx ANTES de renderizar, para que Supabase lea la sesión correcta.
export const hydrateAuthFromIDB = async (): Promise<void> => {
    try {
        const entries = await db.authSession.toArray();
        for (const entry of entries) {
            // Solo restaurar si localStorage está vacío para esa key
            if (localStorage.getItem(entry.key) === null) {
                localStorage.setItem(entry.key, entry.value);
            }
        }
    } catch {
        // Si IDB falla, localStorage ya tiene lo que tiene — la app sigue
    }
};

// Storage sincrónico para Supabase auth (el SDK requiere interfaz sincrónica).
// Escribe en ambos lugares: localStorage (inmediato) e IndexedDB (durable, en background).
export const idbAuthStorage = {
    getItem: (key: string): string | null => {
        return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
        localStorage.setItem(key, value);
        db.authSession.put({ key, value }).catch(() => {});
    },
    removeItem: (key: string): void => {
        localStorage.removeItem(key);
        db.authSession.delete(key).catch(() => {});
    },
};

// Lee desde IndexedDB directamente — para el caché de perfil en App.tsx (que sí puede ser async).
export const idbGet = async (key: string): Promise<string | null> => {
    try {
        // Primero localStorage (rápido)
        const local = localStorage.getItem(key);
        if (local !== null) return local;
        // Fallback a IndexedDB (si localStorage fue limpiado)
        const entry = await db.authSession.get(key);
        if (entry?.value) {
            // Restaurar en localStorage para próximas lecturas
            localStorage.setItem(key, entry.value);
            return entry.value;
        }
        return null;
    } catch {
        return localStorage.getItem(key);
    }
};

export const idbSet = async (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
    try {
        await db.authSession.put({ key, value });
    } catch {
        // IDB no disponible, localStorage es suficiente
    }
};

export const idbRemove = async (key: string): Promise<void> => {
    localStorage.removeItem(key);
    try {
        await db.authSession.delete(key);
    } catch {}
};
