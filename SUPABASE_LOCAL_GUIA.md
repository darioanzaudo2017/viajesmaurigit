# Guía de Supabase Local - Viajes Mauri Trekking

Este archivo contiene las credenciales y comandos esenciales para trabajar con el entorno local de Supabase.

## 🚀 Credenciales Locales (Docker)

| Servicio | URL / Credencial |
| :--- | :--- |
| **Studio (Panel de Control)** | [http://127.0.0.1:54323](http://127.0.0.1:54323) |
| **Project URL (API)** | `http://127.0.0.1:54321` |
| **Anon Key** | `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH` |
| **Database URL** | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| **DB Password** | `postgres` |
| **Mailpit (Correos)** | [http://127.0.0.1:54324](http://127.0.0.1:54324) |

---

## 🌍 Credenciales Remotas (Producción)

| Dato | Valor |
| :--- | :--- |
| **ID del Proyecto** | `bwjwyfxiafklelgmvzcn` |
| **Vite URL** | `https://bwjwyfxiafklelgmvzcn.supabase.co` |
| **Vite Anon Key** | `sb_publishable_R87ta96R07glys3nE0Wl8Q_Ix3AdZnT` |

---

## 🛠️ Comandos Frecuentes (CLI)

### Gestión del Entorno
- **Iniciar Supabase**: `supabase start`
- **Detener Supabase**: `supabase stop`
- **Ver estado/claves**: `supabase status`

### Base de Datos
- **Vincular con remoto**: `supabase link --project-ref bwjwyfxiafklelgmvzcn`
- **Descargar esquema remoto**: `supabase db pull`
- **Descargar datos remotos**: `supabase db dump --linked --data-only -f datos_remotos.sql`
- **Cargar datos en local**: `psql -h localhost -p 54322 -U postgres -d postgres -f datos_remotos.sql`

### Otros
- **Generar tipos TS**: `supabase gen types typescript --local > src/types/supabase.ts`

---

## 🔄 Cómo switchear entre Local y Remoto

Para usar el **Supabase Local** en la aplicación, edita el archivo `.env` en la raíz del proyecto:

**Para Local:**
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

**Para Remoto (Producción):**
```env
VITE_SUPABASE_URL=https://bwjwyfxiafklelgmvzcn.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_R87ta96R07glys3nE0Wl8Q_Ix3AdZnT
```

> [!NOTE]
> Recuerda que los cambios en `.env` requieren reiniciar el servidor de desarrollo (`npm run dev`) para que surtan efecto.
