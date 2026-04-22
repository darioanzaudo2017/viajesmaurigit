-- MIGRACIÓN: UNIFICACIÓN SOAP Y SOPORTE DE SIMULACROS
-- Creado: 2026-04-21T21:30

-- 1. Renombrar columnas a formato profesional en reportes_soap (si no están ya renombradas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reportes_soap' AND column_name = 'e_historia_pa') THEN
        ALTER TABLE "public"."reportes_soap" RENAME COLUMN "e_historia_pa" TO "e_historia_pasada";
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reportes_soap' AND column_name = 'e_ultima_inge') THEN
        ALTER TABLE "public"."reportes_soap" RENAME COLUMN "e_ultima_inge" TO "e_ultima_ingesta";
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reportes_soap' AND column_name = 'observacione') THEN
        ALTER TABLE "public"."reportes_soap" RENAME COLUMN "observacione" TO "observaciones";
    END IF;
END $$;

-- 2. Agregar nuevas columnas para soporte de Simulacros e Identificación
ALTER TABLE "public"."reportes_soap" ADD COLUMN IF NOT EXISTS "es_simulacro" boolean DEFAULT false;
ALTER TABLE "public"."reportes_soap" ADD COLUMN IF NOT EXISTS "paciente_nombre" text;
ALTER TABLE "public"."reportes_soap" ADD COLUMN IF NOT EXISTS "alumno_nombre" text;
ALTER TABLE "public"."reportes_soap" ADD COLUMN IF NOT EXISTS "viaje_id" uuid;
ALTER TABLE "public"."reportes_soap" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "public"."reportes_soap" ADD COLUMN IF NOT EXISTS "examen_fisico" text;

-- 3. Migración de Datos Existentes (Del JSON 'data' a Columnas Reales si existe la tabla vieja)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'simulacros_soap') THEN
        INSERT INTO "public"."reportes_soap" (
            id,
            user_id,
            paciente_nombre,
            es_simulacro,
            created_at,
            updated_at,
            hora_incidente,
            escena,
            e_sintoma,
            e_alergias,
            e_medicacion,
            e_historia_pasada,
            e_ultima_ingesta,
            e_eventos,
            signos_vitales,
            sv_piel,
            examen_fisico,
            evaluacion_guia,
            observaciones,
            severity,
            notas_adicionales,
            estado
        )
        SELECT
            id,
            user_id,
            paciente_nombre,
            true as es_simulacro,
            created_at,
            updated_at,
            (data->>'hora_incidente') as hora_incidente,
            (data->>'escena') as escena,
            (data->>'e_sintoma') as e_sintoma,
            (data->>'e_alergias') as e_alergias,
            (data->>'e_medicacion') as e_medicacion,
            (data->>'e_historia_pasada') as e_historia_pasada,
            (data->>'e_ultima_ingesta') as e_ultima_ingesta,
            (data->>'e_eventos') as e_eventos,
            (data->'signos_vitales') as signos_vitales,
            (data->>'sv_piel') as sv_piel,
            (data->>'examen_fisico') as examen_fisico,
            (data->>'evaluacion_guia') as evaluacion_guia,
            (data->>'observaciones') as observaciones,
            (data->>'severity') as severity,
            (data->>'notas_adicionales') as notas_adicionales,
            (data->>'estado') as estado
        FROM "public"."simulacros_soap"
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
