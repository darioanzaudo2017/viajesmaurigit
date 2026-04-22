# Flujos de Usuario y Gestión: Trekking Trace

Este documento describe el paso a paso de los procesos principales dentro de la aplicación, tanto para los usuarios finales (senderistas) como para el equipo de administración y guías.

---

## 1. El Camino del Usuario (Inscripción y Salud)

Este flujo está diseñado para que el usuario pueda completar su registro de forma rápida y segura, incluso en condiciones de baja conectividad.

### Paso 1: Autenticación e Inicio
- El usuario accede a la App y se identifica (Auth).
- En la pantalla de inicio, puede ver el catálogo de **Expediciones Disponibles**.

### Paso 2: Inscripción y Ficha Médica (`RegistrationPage`)
Este es un proceso de 4 pasos integrados:
1.  **Selección de Expedición**: El usuario elige a qué viaje desea anotarse.
2.  **Ficha Médica (Salud)**: Completa datos críticos como obra social, contactos de emergencia, grupo sanguíneo, alergias y medicación.
3.  **Datos de Inscripción**: Información logística adicional (domicilio, tipo de menú/dieta).
4.  **Finalización**:
    - **Con Internet**: Los datos se guardan en Supabase y el estado cambia a "Confirmado".
    - **Sin Internet**: El sistema informa que el registro es "Local" y se sincronizará solo al recuperar señal.

### Paso 3: Seguimiento
- En **"Mis Expediciones"**, el usuario puede ver los viajes a los que se anotó y si su ficha médica está actualizada.

---

## 2. El Camino del Administrador (Gestión y Seguridad)

El administrador o guía tiene herramientas para garantizar que cada expedición esté bajo control.

### Gestión de Catálogo (`AdminTrips`)
- El administrador crea nuevas expediciones (título, descripción, dificultad, imagen).
- Puede cambiar el estado de un viaje de `draft` (borrador) a `published` (visible para usuarios) o `archived`.

### Control de Participantes (`AdminEnrollments`)
- Por cada viaje, el administrador puede ver la lista completa de personas anotadas.
- **Auditoría Médica**: Puede descargar un PDF generado dinámicamente con todas las fichas médicas de los participantes para tenerlo a mano durante el trekking.

### Seguridad en Montaña (`SOAP Reports`)
Cuando ocurre un incidente durante la expedición, el guía utiliza el protocolo SOAP:
- **Subjetivo**: Qué siente el paciente.
- **Objetivo**: Signos vitales y examen físico.
- **Valoración**: Diagnóstico presuntivo del guía.
- **Plan**: Pasos a seguir (evacuación, curación, etc.).
- Estos informes se guardan localmente (Dexie) y se suben a la nube apenas el guía llega a una zona con señal.

---

## 3. Estados de Sincronización (UX Offline)

Es importante entender qué significan los indicadores que aparecen en la App:

- ✅ **Sincronizado**: Los datos ya están seguros en la nube de Supabase.
- ⏳ **Pendiente/Ready**: Los datos están guardados en el teléfono y esperan a que haya internet para subir.
- 🔴 **Error**: Hubo un problema técnico (generalmente de permisos) y requiere intervención del admin.

---
*Guía de Procesos - Trekking Trace 2026*
