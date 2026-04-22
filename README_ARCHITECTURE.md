# Guía Maestria de Arquitectura: Trekking Trace

Esta guía explica la arquitectura técnica y el flujo de datos de la aplicación **Trekking Trace**, diseñada para gestionar expediciones de trekking con un enfoque prioritario en la seguridad médica y el funcionamiento en zonas sin señal (Offline-First).

---

## 1. Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite.
- **Estilizado**: Tailwind CSS (Diseño moderno y responsivo).
- **Base de Datos en la Nube**: Supabase (PostgreSQL + Auth).
- **Base de Datos Local**: Dexie.js (IndexedDB). Este es el "corazón" del modo offline.
- **Gestión de Archivos**: Almacenamiento local y generación dinámica de PDFs con `jsPDF`.

---

## 2. El Cerebro Offline: Sincronización Inteligente

Trekking Trace utiliza una arquitectura **Offline-First**. Esto significa que la App siempre intenta guardar los datos localmente primero o como respaldo cuando la red falla.

- **`src/api/db.ts`**: Define el esquema local. Mantiene copias de viajes, perfiles de usuario, inscripciones y reportes médicos (SOAP).
- **`src/hooks/useOfflineSync.ts`**: Es el motor que monitorea la conexión.
    - Cuando detecta internet, busca registros con status `ready` o `pending` en Dexie y los sube a Supabase.
    - Asegura que los guías en la montaña puedan crear fichas médicas (SOAP) sin señal, sabiendo que se subirán solas al bajar.

---

## 3. Flujo de Inscripción y Ficha Médica

El flujo de registro está diseñado para ser sencillo pero robusto:

1. **Página de Inscripción (`RegistrationPage.tsx`)**:
    - Permite al usuario completar su ficha médica y elegir una expedición.
    - **Validación Inteligente**: Si el usuario ya está registrado, el sistema le permite actualizar sus datos médicos sin bloquearlo.
2. **Respaldo Automático**:
    - Si el envío a la nube falla, `useRegistration.ts` guarda el registro en Dexie con el estado `ready`.
    - El usuario ve una pantalla de confirmación especial informando que sus datos están "A salvo en el dispositivo".

---

## 4. Gestión Médica (Módulo SOAP)

Para la seguridad en montaña, la App utiliza el formato **SOAP** (Subjetivo, Objetivo, Valoración, Plan):

- **Captura en Campo**: Los guías pueden registrar incidentes médicos sin internet.
- **Sincronización de Multimedia**: Aunque actualmente se enfoca en texto, la estructura permite expansiones para fotos.
- **Reportes PDF**: Se generan resúmenes médicos automáticos para entregar a servicios de emergencia si es necesario.

---

## 5. Base de Datos (Esquema Clave)

### Tablas en Supabase
- **`profiles`**: Información básica de usuarios y roles (admin/guía/usuario).
- **`viajes`**: Catálogo de expediciones (fechas, descripción, estado).
- **`inscripciones`**: Vincula usuarios con viajes.
- **`fichas_medicas`**: Datos de salud constantes de cada usuario (alergias, medicación, contactos de emergencia).
- **`reportes_soap`**: Historial de incidentes médicos en cada expedición.

### Tablas en Dexie (Local)
- Reflejan las de Supabase pero incluyen campos de control como `sync_status` y `last_attempt`.

---

## 6. Scripts y Herramientas de Desarrollo

Para facilitar el mantenimiento, el proyecto incluye herramientas de utilidad:

- **`check_remote_data.ts`**: Un script Node.js para verificar rápidamente el estado de la base de datos online sin entrar al dashboard de Supabase (ejecutar con `npx tsx check_remote_data.ts`).
- **`pdfGenerator.ts`**: El motor encargado de transformar los datos de las inscripciones en documentos listos para impresión.

---

## 7. Consejos de Mantenimiento

1. **Variables de Entorno**: Asegúrate de que el archivo `.env` contenga las claves `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` correctas.
2. **Versiones de DB**: Si realizas cambios estructurales en Dexie, recuerda aumentar el número de versión en `src/api/db.ts` para que los navegadores de los usuarios apliquen el cambio.

---
*Documentación generada por Antigravity AI - Abril 2026*
