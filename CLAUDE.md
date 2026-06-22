# TREKKING TRACE — Gestión de Expediciones

## Identidad

- **Nombre:** Trekking Trace / Trek PWA
- **Cliente:** Mauri (guía de montaña / empresa de trekking)
- **Tipo:** PWA offline-first para gestión de expediciones en montaña
- **Supabase project-ref:** bwjwyfxiafkle1gmvzcn
- **Repo:** https://github.com/darioanzaudo2017/viajesmaurigit
- **Deploy:** Vercel (conectado al repo, auto-deploy en push a main)
- **Estado:** Producción

## Contexto de uso crítico

La app se usa **en la montaña sin señal**. Los guías deben poder:
- Ver fichas médicas de participantes offline
- Completar formularios SOAP offline
- Completar simulacros SOAP (universitarios) offline

El flujo es: loguearse con señal → descargar datos del viaje → subir a la montaña → trabajar offline → bajar → sincronizar automáticamente.

## Stack técnico

- **React** 19.2.0
- **TypeScript** 5.9.3
- **Vite** 7.2.4 + vite-plugin-pwa 1.2.0
- **Tailwind CSS** 4.1.18
- **Supabase JS** 2.93.3
- **Dexie** 4.3.0 (IndexedDB) + dexie-react-hooks
- **jsPDF** 4.1.0 + jspdf-autotable (generación de PDFs)
- **Zod** 4.3.6 (validación de schemas)
- **Vitest** + Testing Library (tests)

## Estructura de carpetas

```
src/
  api/
    supabase.ts          — cliente Supabase (storage: localStorage + IDB dual)
    db.ts                — Dexie DB (TrekPWA_DB, versión 10)
    authStorage.ts       — adaptador dual localStorage/IndexedDB para sesión
    constants.ts         — catálogo de condiciones médicas
    sync.ts              — lógica de sincronización
  hooks/
    useOfflineSync.ts    — hook central de offline/sync (auto-refresh token al reconectar)
    useMedicalProfile.ts
    useRegistration.ts
  pages/
    admin/               — AdminDashboard, AdminTrips, AdminEnrollments, AdminSoapPage,
                           AdminNewsPage, AdminSimulacrosPage, AdminUsersPage
    AuthPage.tsx
    DashboardPage.tsx
    HomePage.tsx
    MedicalProfilePage.tsx
    RegistrationPage.tsx
    TripDetailPage.tsx
    TripsPage.tsx
    UniversityPage.tsx
    UniversityNewsPage.tsx
  components/
    layout/              — Navbar, Sidebar, BottomNavbar, PageLayout, Header, Footer
    admin/               — MedicalViewModal, TripModal
    common/              — Logo
    soap/                — SoapForm
  utils/
    pdfGenerator.ts
```

## Base de datos (Supabase)

### Tablas principales
- `viajes` — expediciones (estado: published/confirmed/cancelled/finished)
- `inscripciones` — inscripciones a viajes, con `estado` y `soap_creada`
- `profiles` — perfil de usuario (rol: admin / user / university)
- `fichas_medicas` — ficha médica por usuario
- `reportes_soap` — reportes SOAP (campo `es_simulacro: boolean` diferencia viaje de simulacro)
- `reportes_soap_problemas` — problemas asociados a cada SOAP
- `noticias` — novedades para la app

### Roles de usuario
- `admin` — guía/staff: accede a panel admin, fichas, SOAPs, gestión de viajes
- `user` — participante: se inscribe, completa ficha médica
- `university` — alumno universitario: hace simulacros SOAP (módulo ISAUI)

### IndexedDB local (Dexie v10 — TrekPWA_DB)
- `trips` — viajes cacheados
- `enrollments` — inscripciones cacheadas (con `sync_status`)
- `medicalRecords` — fichas médicas cacheadas
- `soapReports` — SOAPs (status: pending/syncing/synced/error)
- `universitySimulations` — simulacros (status: pending/syncing/synced/error)
- `registrations` — registros pendientes de sync
- `conditions` — catálogo de condiciones médicas
- `maestroProblemasSoap` — catálogo de problemas SOAP offline
- `authSession` — tokens de sesión Supabase (más durable que localStorage en iOS)

## Convenciones de código

- Toda llamada a Supabase va por `src/api/` — nunca directo desde componentes o páginas
- El hook `useOfflineSync` es el punto central de sincronización — no duplicar lógica de sync
- Al arrancar la app, `recoverStuckSyncingRecords()` resetea registros que quedaron en 'syncing'
- `checkRealConnectivity()` verifica señal real (HEAD a Supabase), no confiar en `navigator.onLine`
- Al recuperar señal → `supabase.auth.refreshSession()` se llama automáticamente
- La versión visible en el sidebar se genera desde `__COMMIT_DATE__` (último commit git) en build time

## Variables de entorno

```
VITE_SUPABASE_URL=https://bwjwyfxiafkle1gmvzcn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Nunca poner secrets en variables `VITE_*` — van al bundle del cliente.

## Lo que NO hacer

- Nunca deshabilitar RLS en tablas con datos de usuarios o fichas médicas
- Nunca usar `service_role` key en el cliente
- Nunca llamar a Supabase directo desde componentes — siempre por `src/api/`
- Nunca borrar datos de IndexedDB sin pasar por el flujo de sync
- Nunca modificar versiones de Dexie sin agregar `.version(N).stores({...})` incremental
- Nunca hacer push a main sin que el build pase (`npm run build`)

## Pendientes conocidos

- Varias tablas tienen RLS deshabilitado (`audit_logs`, `catalogo_condiciones`, `condiciones_medicas`, `fichas_medicas`) — revisar y habilitar con políticas apropiadas
- El botón de login con Google y GitHub en AuthPage no está implementado
- El botón "¿La olvidaste?" (recuperar contraseña) no está implementado
