


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."registration_status" AS ENUM (
    'pending',
    'confirmed',
    'rejected'
);


ALTER TYPE "public"."registration_status" OWNER TO "postgres";


CREATE TYPE "public"."trip_status" AS ENUM (
    'published',
    'confirmed',
    'cancelled',
    'finished'
);


ALTER TYPE "public"."trip_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, is_university)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'user',
    COALESCE((new.raw_user_meta_data->>'is_university')::boolean, false)
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "text" NOT NULL,
    "payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."catalogo_condiciones" (
    "id" integer NOT NULL,
    "condicion" "text" NOT NULL,
    "descripcion" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."catalogo_condiciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."condiciones_medicas" (
    "id" integer NOT NULL,
    "condicion" "text" NOT NULL,
    "descripcion" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."condiciones_medicas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."condiciones_medicas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."condiciones_medicas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."condiciones_medicas_id_seq" OWNED BY "public"."condiciones_medicas"."id";



CREATE TABLE IF NOT EXISTS "public"."fichas_medicas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "obra_social" "text",
    "contacto_emergencia_1" "text",
    "telefono_emergencia_1" numeric,
    "contacto_emergencia_2" "text",
    "telefono_emergencia_2" numeric,
    "tension_arterial" "text",
    "estatura" "text",
    "peso" numeric,
    "estado_salud" "text",
    "ejercicio" "text",
    "observaciones" "text",
    "condiciones" "jsonb" DEFAULT '[]'::"jsonb",
    "version" integer DEFAULT 1,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "grupo_sanguineo" "text",
    "alergias" "text",
    "medicamentos" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."fichas_medicas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fichas_medicas_historial" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ficha_id" "uuid",
    "obra_social" "text",
    "contacto_emergencia_1" "text",
    "telefono_emergencia_1" numeric,
    "contacto_emergencia_2" "text",
    "telefono_emergencia_2" numeric,
    "tension_arterial" "text",
    "estatura" "text",
    "peso" numeric,
    "estado_salud" "text",
    "ejercicio" "text",
    "observaciones" "text",
    "condiciones" "jsonb",
    "version" integer NOT NULL,
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "grupo_sanguineo" "text",
    "alergias" "text",
    "medicamentos" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."fichas_medicas_historial" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fichas_soap" (
    "id" bigint NOT NULL,
    "inscripcion_id" "uuid",
    "fecha" timestamp with time zone,
    "coordenada" "text",
    "hora_incidente" "text",
    "escena" "text",
    "e_sintoma" "text",
    "e_alergias" "text",
    "e_medicacion" "text",
    "e_historia_pasada" "text",
    "e_ultima_ingesta" "text",
    "e_eventos" "text",
    "objetivos" "text",
    "sv_hora" "text",
    "sv_pulso" "text",
    "sv_respiracion" "text",
    "sv_ta" "text",
    "sv_piel" "text",
    "sv_temperatura" "text",
    "sv_avdi" "text",
    "observaciones" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fichas_soap" OWNER TO "postgres";


ALTER TABLE "public"."fichas_soap" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."fichas_soap_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."inscripciones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "viaje_id" "uuid",
    "user_id" "uuid",
    "estado" "public"."registration_status" DEFAULT 'pending'::"public"."registration_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "domicilio" "text",
    "localidad" "text",
    "provincia" "text",
    "pais" "text",
    "menu" "text",
    "pdf" "text",
    "soap_creada" boolean DEFAULT false
);


ALTER TABLE "public"."inscripciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maestro_problemas_soap" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "problema" "text" NOT NULL,
    "problema_anticipado" "text",
    "tratamiento_sugerido" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."maestro_problemas_soap" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."novedades_universitarias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "titulo" "text" NOT NULL,
    "subtitulo" "text",
    "contenido" "text" NOT NULL,
    "categoria" "text" NOT NULL,
    "imagen_url" "text",
    "autor" "text",
    "fecha_publicacion" "date" DEFAULT CURRENT_DATE
);


ALTER TABLE "public"."novedades_universitarias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "phone" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_university" boolean DEFAULT false
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reportes_soap" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "inscripcion_id" "uuid",
    "referencia_viaje" "text",
    "hora_incidente" "text",
    "escena" "text",
    "e_sintoma" "text",
    "e_alergias" "text",
    "e_medicacion" "text",
    "e_historia_pa" "text",
    "e_ultima_inge" "text",
    "e_eventos" "text",
    "signos_vitales" "jsonb" DEFAULT '[]'::"jsonb",
    "sv_piel" "text",
    "observacione" "text",
    "evaluacion_guia" "text",
    "responsable_id" "text",
    "severity" "text",
    "estado" "text" DEFAULT 'borrador'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "notas_adicionales" "text"
);


ALTER TABLE "public"."reportes_soap" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reportes_soap_problemas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporte_soap_id" "uuid",
    "problema_id" "uuid",
    "observacion_especifica" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "problema" "text",
    "problema_anticipado" "text",
    "tratamiento" "text"
);


ALTER TABLE "public"."reportes_soap_problemas" OWNER TO "postgres";


COMMENT ON COLUMN "public"."reportes_soap_problemas"."problema" IS 'Contenido del problema (manual o instantánea del maestro)';



COMMENT ON COLUMN "public"."reportes_soap_problemas"."problema_anticipado" IS 'Posibles complicaciones (manual o instantánea del maestro)';



COMMENT ON COLUMN "public"."reportes_soap_problemas"."tratamiento" IS 'Tratamiento a seguir (manual o instantánea del maestro)';



CREATE TABLE IF NOT EXISTS "public"."simulacros_soap" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "paciente_nombre" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."simulacros_soap" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."viajes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "titulo" "text" NOT NULL,
    "descripcion" "text",
    "cupos_totales" integer NOT NULL,
    "cupos_disponibles" integer NOT NULL,
    "fecha_inicio" timestamp with time zone NOT NULL,
    "fecha_fin" timestamp with time zone NOT NULL,
    "estado" "public"."trip_status" DEFAULT 'published'::"public"."trip_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "dificultad" "text" DEFAULT 'Moderate'::"text",
    "ubicacion" "text" DEFAULT 'Andes Region'::"text",
    "imagen_url" "text",
    "min_participantes" integer DEFAULT 1,
    CONSTRAINT "dates_check" CHECK (("fecha_fin" >= "fecha_inicio")),
    CONSTRAINT "viajes_cupos_totales_check" CHECK (("cupos_totales" > 0))
);


ALTER TABLE "public"."viajes" OWNER TO "postgres";


COMMENT ON COLUMN "public"."viajes"."min_participantes" IS 'Minimum number of participants required to confirm the trip.';



ALTER TABLE ONLY "public"."condiciones_medicas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."condiciones_medicas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."catalogo_condiciones"
    ADD CONSTRAINT "catalogo_condiciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."condiciones_medicas"
    ADD CONSTRAINT "condiciones_medicas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fichas_medicas_historial"
    ADD CONSTRAINT "fichas_medicas_historial_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fichas_medicas"
    ADD CONSTRAINT "fichas_medicas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fichas_medicas"
    ADD CONSTRAINT "fichas_medicas_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."fichas_soap"
    ADD CONSTRAINT "fichas_soap_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_viaje_id_user_id_key" UNIQUE ("viaje_id", "user_id");



ALTER TABLE ONLY "public"."maestro_problemas_soap"
    ADD CONSTRAINT "maestro_problemas_soap_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maestro_problemas_soap"
    ADD CONSTRAINT "maestro_problemas_soap_problema_key" UNIQUE ("problema");



ALTER TABLE ONLY "public"."novedades_universitarias"
    ADD CONSTRAINT "novedades_universitarias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reportes_soap"
    ADD CONSTRAINT "reportes_soap_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reportes_soap_problemas"
    ADD CONSTRAINT "reportes_soap_problemas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."simulacros_soap"
    ADD CONSTRAINT "simulacros_soap_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."viajes"
    ADD CONSTRAINT "viajes_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_fichas_medicas_condiciones" ON "public"."fichas_medicas" USING "gin" ("condiciones");



CREATE INDEX "idx_fichas_medicas_user" ON "public"."fichas_medicas" USING "btree" ("user_id");



CREATE INDEX "idx_fichas_soap_inscripcion" ON "public"."fichas_soap" USING "btree" ("inscripcion_id");



CREATE INDEX "idx_inscripciones_user_viaje" ON "public"."inscripciones" USING "btree" ("user_id", "viaje_id");



CREATE INDEX "idx_novedades_created_at" ON "public"."novedades_universitarias" USING "btree" ("created_at" DESC);



CREATE OR REPLACE TRIGGER "tr_update_updated_at_simulacros" BEFORE UPDATE ON "public"."simulacros_soap" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."fichas_medicas_historial"
    ADD CONSTRAINT "fichas_medicas_historial_ficha_id_fkey" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas_medicas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fichas_medicas_historial"
    ADD CONSTRAINT "fichas_medicas_historial_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."fichas_medicas"
    ADD CONSTRAINT "fichas_medicas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fichas_soap"
    ADD CONSTRAINT "fichas_soap_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "public"."inscripciones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_viaje_id_fkey" FOREIGN KEY ("viaje_id") REFERENCES "public"."viajes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reportes_soap"
    ADD CONSTRAINT "reportes_soap_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "public"."inscripciones"("id");



ALTER TABLE ONLY "public"."reportes_soap_problemas"
    ADD CONSTRAINT "reportes_soap_problemas_problema_id_fkey" FOREIGN KEY ("problema_id") REFERENCES "public"."maestro_problemas_soap"("id");



ALTER TABLE ONLY "public"."reportes_soap_problemas"
    ADD CONSTRAINT "reportes_soap_problemas_reporte_soap_id_fkey" FOREIGN KEY ("reporte_soap_id") REFERENCES "public"."reportes_soap"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."simulacros_soap"
    ADD CONSTRAINT "simulacros_soap_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can do everything on reportes_soap" ON "public"."reportes_soap" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can manage novedades universitarias" ON "public"."novedades_universitarias" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view all SOAP simulations" ON "public"."simulacros_soap" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Gestión completa para autenticados" ON "public"."reportes_soap_problemas" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Los usuarios pueden borrar sus propios simulacros" ON "public"."simulacros_soap" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Los usuarios pueden crear sus propios simulacros" ON "public"."simulacros_soap" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Los usuarios pueden editar sus propios simulacros" ON "public"."simulacros_soap" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Los usuarios pueden ver sus propios simulacros" ON "public"."simulacros_soap" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Novedades universitarias are viewable by everyone" ON "public"."novedades_universitarias" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Permitir lectura para todos los autenticados" ON "public"."maestro_problemas_soap" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."maestro_problemas_soap" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."novedades_universitarias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reportes_soap" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reportes_soap_problemas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."simulacros_soap" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."catalogo_condiciones" TO "anon";
GRANT ALL ON TABLE "public"."catalogo_condiciones" TO "authenticated";
GRANT ALL ON TABLE "public"."catalogo_condiciones" TO "service_role";



GRANT ALL ON TABLE "public"."condiciones_medicas" TO "anon";
GRANT ALL ON TABLE "public"."condiciones_medicas" TO "authenticated";
GRANT ALL ON TABLE "public"."condiciones_medicas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."condiciones_medicas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."condiciones_medicas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."condiciones_medicas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fichas_medicas" TO "anon";
GRANT ALL ON TABLE "public"."fichas_medicas" TO "authenticated";
GRANT ALL ON TABLE "public"."fichas_medicas" TO "service_role";



GRANT ALL ON TABLE "public"."fichas_medicas_historial" TO "anon";
GRANT ALL ON TABLE "public"."fichas_medicas_historial" TO "authenticated";
GRANT ALL ON TABLE "public"."fichas_medicas_historial" TO "service_role";



GRANT ALL ON TABLE "public"."fichas_soap" TO "anon";
GRANT ALL ON TABLE "public"."fichas_soap" TO "authenticated";
GRANT ALL ON TABLE "public"."fichas_soap" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fichas_soap_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fichas_soap_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fichas_soap_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."inscripciones" TO "anon";
GRANT ALL ON TABLE "public"."inscripciones" TO "authenticated";
GRANT ALL ON TABLE "public"."inscripciones" TO "service_role";



GRANT ALL ON TABLE "public"."maestro_problemas_soap" TO "anon";
GRANT ALL ON TABLE "public"."maestro_problemas_soap" TO "authenticated";
GRANT ALL ON TABLE "public"."maestro_problemas_soap" TO "service_role";



GRANT ALL ON TABLE "public"."novedades_universitarias" TO "anon";
GRANT ALL ON TABLE "public"."novedades_universitarias" TO "authenticated";
GRANT ALL ON TABLE "public"."novedades_universitarias" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reportes_soap" TO "anon";
GRANT ALL ON TABLE "public"."reportes_soap" TO "authenticated";
GRANT ALL ON TABLE "public"."reportes_soap" TO "service_role";



GRANT ALL ON TABLE "public"."reportes_soap_problemas" TO "anon";
GRANT ALL ON TABLE "public"."reportes_soap_problemas" TO "authenticated";
GRANT ALL ON TABLE "public"."reportes_soap_problemas" TO "service_role";



GRANT ALL ON TABLE "public"."simulacros_soap" TO "anon";
GRANT ALL ON TABLE "public"."simulacros_soap" TO "authenticated";
GRANT ALL ON TABLE "public"."simulacros_soap" TO "service_role";



GRANT ALL ON TABLE "public"."viajes" TO "anon";
GRANT ALL ON TABLE "public"."viajes" TO "authenticated";
GRANT ALL ON TABLE "public"."viajes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































