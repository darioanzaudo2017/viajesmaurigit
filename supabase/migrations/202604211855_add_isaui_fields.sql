-- Add is_university flag to viajes
ALTER TABLE IF EXISTS public.viajes 
ADD COLUMN IF NOT EXISTS is_university boolean DEFAULT false;

-- Add tracking fields to simulacros_soap
ALTER TABLE IF EXISTS public.simulacros_soap 
ADD COLUMN IF NOT EXISTS viaje_id uuid REFERENCES public.viajes(id),
ADD COLUMN IF NOT EXISTS alumno_nombre text;

-- Update RLS policies if necessary (optional for local, but good practice)
-- Assuming the existing policies are open for authenticated users
