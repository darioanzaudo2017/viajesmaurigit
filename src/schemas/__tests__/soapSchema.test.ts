import { describe, it, expect } from 'vitest';
import { soapSchema } from '../soapSchema';

describe('SOAP Report Validation (soapSchema)', () => {

    const validVitalSign = {
        hora: '10:00',
        pulso: '80',
        respiracion: '16',
        presion: '120/80',
        spo2: '98%',
        temperatura: '36.5',
        avdi: 'A (Alerta)'
    };

    const validSoapData = {
        inscripcion_id: '550e8400-e29b-41d4-a716-446655440000',
        referencia_viaje: 'Trekking Volcán Lanín',
        hora_incidente: '09:30',
        escena: 'Terreno rocoso, despejado',
        e_sintoma: 'Dolor de cabeza leve',
        e_alergias: 'Ninguna',
        e_medicacion: 'Ninguna',
        e_historia_pa: 'Sin antecedentes',
        e_ultima_inge: 'Desayuno 08:00',
        e_eventos: 'Ascenso a 3000m',
        signos_vitales: [validVitalSign],
        sv_piel: 'Normal, rosada',
        observacione: 'Paciente estable',
        evaluacion_guia: 'Se recomienda descenso',
        severity: 'mod',
        estado: 'borrador',
        responsable_id: 'ADMIN-1'
    };

    describe('Casos Exitosos', () => {
        it('debe validar correctamente un reporte SOAP con todos los campos válidos', () => {
            // Arrange & Act
            const result = soapSchema.safeParse(validSoapData);

            // Assert
            expect(result.success).toBe(true);
        });

        it('debe permitir múltiples tomas de signos vitales', () => {
            // Arrange
            const data = {
                ...validSoapData,
                signos_vitales: [validVitalSign, { ...validVitalSign, hora: '10:15' }]
            };

            // Act
            const result = soapSchema.safeParse(data);

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.signos_vitales).toHaveLength(2);
            }
        });
    });

    describe('Validación de Campos Obligatorios (Casos de Error)', () => {
        it('debe fallar si los campos del Paso 1 están vacíos', () => {
            // Arrange
            const invalidData = { ...validSoapData, escena: '', referencia_viaje: '' };

            // Act
            const result = soapSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                const errors = result.error.flatten().fieldErrors;
                expect(errors.escena).toContain("La descripción de la escena es obligatoria");
                expect(errors.referencia_viaje).toContain("La referencia del viaje es obligatoria");
            }
        });

        it('debe fallar si los campos del Paso 2 están vacíos', () => {
            // Arrange
            const invalidData = { ...validSoapData, e_sintoma: '', e_historia_pa: '' };

            // Act
            const result = soapSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                const errors = result.error.flatten().fieldErrors;
                expect(errors.e_sintoma).toContain("Los síntomas son obligatorios");
                expect(errors.e_historia_pa).toContain("La historia pasada es obligatoria");
            }
        });

        it('debe fallar si el ID de inscripción no es un UUID válido', () => {
            // Arrange
            const invalidData = { ...validSoapData, inscripcion_id: 'invalid-id' };

            // Act
            const result = soapSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.flatten().fieldErrors.inscripcion_id).toContain("ID de inscripción inválido");
            }
        });
    });

    describe('Casos Borde y Valores Inesperados', () => {
        it('debe fallar si el array de signos_vitales está vacío', () => {
            // Arrange
            const invalidData = { ...validSoapData, signos_vitales: [] };

            // Act
            const result = soapSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.flatten().fieldErrors.signos_vitales).toContain("Debe registrar al menos una toma de signos vitales");
            }
        });

        it('debe fallar si un signo vital individual tiene campos vacíos', () => {
            // Arrange
            const invalidVital = { ...validVitalSign, pulso: '' };
            const invalidData = { ...validSoapData, signos_vitales: [invalidVital] };

            // Act
            const result = soapSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);
        });

        it('debe fallar si severity tiene un valor inválido', () => {
            // Arrange
            const invalidData = { ...validSoapData, severity: 'ultra-high' as any };

            // Act
            const result = soapSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.flatten().fieldErrors.severity).toContain("La severidad debe ser: low, mod, high o critical");
            }
        });

        it('debe fallar si el estado tiene un valor inválido', () => {
            // Arrange
            const invalidData = { ...validSoapData, estado: 'not-set' as any };

            // Act
            const result = soapSchema.safeParse(invalidData);

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.flatten().fieldErrors.estado).toContain("El estado debe ser válido (borrador, enviado, revisado o archivado)");
            }
        });

        it('debe fallar si AVDI tiene un valor fuera del enum', () => {
            // Arrange
            const invalidVital = { ...validVitalSign, avdi: 'Z (Zombie)' as any };
            const data = { ...validSoapData, signos_vitales: [invalidVital] };

            // Act
            const result = soapSchema.safeParse(data);

            // Assert
            expect(result.success).toBe(false);
        });
    });
});
