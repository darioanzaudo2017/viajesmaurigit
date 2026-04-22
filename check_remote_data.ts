import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan credenciales en el .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRemoteData() {
  console.log('--- Verificando Datos en Supabase Online ---');
  
  // 1. Verificar Viajes
  const { data: viajes, error: errorViajes } = await supabase
    .from('viajes')
    .select('id, titulo, estado');
  
  if (errorViajes) console.error('Error al leer viajes:', errorViajes);
  else {
    console.log('Viajes encontrados:', viajes?.length || 0);
    viajes?.forEach(v => console.log(` - [${v.estado}] ${v.titulo} (ID: ${v.id})`));
  }

  // 2. Verificar Perfil del Usuario (DARIO STAFF)
  const userId = '08c75dfe-9643-4861-b48b-31da73ad46ec';
  const { data: profile, error: errorProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (errorProfile) console.error('Error al leer perfil:', errorProfile);
  else console.log('Perfil encontrado:', profile ? `${profile.full_name} (Rol: ${profile.role})` : 'No encontrado');

  // 3. Verificar Inscripciones del Usuario
  const { data: inscripciones, error: errorIns } = await supabase
    .from('inscripciones')
    .select('id, viaje_id, created_at')
    .eq('user_id', userId);

  if (errorIns) console.error('Error al leer inscripciones:', errorIns);
  else {
    console.log('Inscripciones encontradas:', inscripciones?.length || 0);
    inscripciones?.forEach(i => console.log(` - Inscripción ID: ${i.id} para Viaje ID: ${i.viaje_id}`));
  }
}

checkRemoteData();
