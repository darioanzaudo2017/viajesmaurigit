import { z } from 'zod';

export const vitalSignSchema = z.object({
    hora: z.string().min(1, "La hora es obligatoria"),
    pulso: z.string().min(1, "El pulso es obligatorio"),
    respiracion: z.string().min(1, "La respiración es obligatoria"),
    presion: z.string().min(1, "La presión es obligatoria"),
    spo2: z.string().min(1, "El SpO2 es obligatorio"),
    temperatura: z.string().min(1, "La temperatura es obligatoria"),
    avdi: z.enum(['A (Alerta)', 'V (Verbal)', 'D (Dolor)', 'I (Inconsciente)'] as const, {
        message: "AVDI debe ser un valor válido"
    }),
});

export const soapSchema = z.object({
    // Paso 1: Paciente y Escena
    inscripcion_id: z.string().uuid("ID de inscripción inválido"),
    referencia_viaje: z.string().min(1, "La referencia del viaje es obligatoria"),
    hora_incidente: z.string().min(1, "La hora del incidente es obligatoria"),
    escena: z.string().min(1, "La descripción de la escena es obligatoria"),

    // Paso 2: Subjetivo (S)
    e_sintoma: z.string().min(1, "Los síntomas son obligatorios"),
    e_alergias: z.string().min(1, "Las alergias son obligatorias (poner 'Ninguna' si aplica)"),
    e_medicacion: z.string().min(1, "La medicación es obligatoria (poner 'Ninguna' si aplica)"),
    e_historia_pa: z.string().min(1, "La historia pasada es obligatoria"),
    e_ultima_inge: z.string().min(1, "La última ingesta es obligatoria"),
    e_eventos: z.string().min(1, "Los eventos previos son obligatorios"),

    // Paso 3: Objetivo (O)
    signos_vitales: z.array(vitalSignSchema).min(1, "Debe registrar al menos una toma de signos vitales"),
    sv_piel: z.string().min(1, "El estado de la piel es obligatorio"),

    // Paso 4: Evaluación y Plan
    observacione: z.string().min(1, "Las observaciones son obligatorias"),
    evaluacion_guia: z.string().min(1, "La evaluación del guía es obligatoria"),
    severity: z.enum(['low', 'mod', 'high', 'critical'] as const, {
        message: "La severidad debe ser: low, mod, high o critical"
    }),
    estado: z.enum(['borrador', 'enviado', 'revisado', 'archivado'] as const, {
        message: "El estado debe ser válido (borrador, enviado, revisado o archivado)"
    }).default('borrador'),

    responsable_id: z.string().min(1, "El responsable es obligatorio"),
});

export type SoapReportData = z.infer<typeof soapSchema>;
export type VitalSignData = z.infer<typeof vitalSignSchema>;
