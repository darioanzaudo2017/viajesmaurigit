import Dexie, { type Table } from 'dexie';


export interface LocalTrip {
    id: string;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    cupos_totales: number;
    cupos_disponibles: number;
    min_participantes: number;
    estado: 'published' | 'confirmed' | 'cancelled' | 'finished';
    dificultad: string;
    ubicacion: string;
    imagen_url: string;
    updated_at: string;
    is_university?: boolean;
}

export interface LocalRegistration {
    id?: string; // local uuid
    trip_id: string;
    user_id: string;
    status: 'pending' | 'ready' | 'syncing' | 'synced' | 'error';
    data: {
        emergency_contact_1: string;
        phone_emergency_1: string;
        emergency_contact_2: string;
        phone_emergency_2: string;
        obra_social: string;
        peso?: number;
        estatura?: number;
        tension_arterial?: string;
        observaciones?: string;
        grupo_sanguineo?: string;
        alergias?: string;
        medications?: Array<{ name: string; dosage: string }>;
        condiciones: number[]; // IDs from catalog
    };
    created_at: number;
    last_attempt?: number;
}

export interface LocalCondition {
    id: number;
    condicion: string;
    descripcion: string;
}

export interface LocalEnrollment {
    id: string;
    viaje_id: string;
    user_id: string;
    estado: string;
    created_at?: string;
    menu?: string;
    profiles: {
        full_name: string;
        phone?: string;
    };
    viajes?: {
        titulo: string;
    };
    soap_creada?: boolean;
    sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
    updated_at?: number;
}

export interface LocalMedicalRecord {
    user_id: string;
    data: any; // Full medical record JSON
}

export interface LocalSoapReport {
    id: string; // uuid
    inscripcion_id: string;
    status: 'pending' | 'syncing' | 'synced' | 'error';
    data: any; // Full SOAP report JSON
    updated_at: number;
}

export interface LocalUniversitySimulation {
    id: string; // uuid
    user_id: string;
    paciente_nombre: string;
    alumno_nombre?: string;
    viaje_id?: string;
    status: 'pending' | 'syncing' | 'synced' | 'error';
    data: any; // Full Simulation JSON
    created_at: string;
}

export class TrekDatabase extends Dexie {
    trips!: Table<LocalTrip>;
    registrations!: Table<LocalRegistration>;
    conditions!: Table<LocalCondition>;
    enrollments!: Table<LocalEnrollment>;
    medicalRecords!: Table<LocalMedicalRecord>;
    soapReports!: Table<LocalSoapReport>;
    universitySimulations!: Table<LocalUniversitySimulation>;

    constructor() {
        super('TrekPWA_DB');
        this.version(2).stores({
            trips: 'id, fecha_inicio, estado',
            registrations: '++id, trip_id, user_id, status',
            conditions: 'id, condicion',
            enrollments: 'id, viaje_id, user_id',
            medicalRecords: 'user_id',
            soapReports: 'id, inscripcion_id, status'
        });
        // v3: Added dificultad, ubicacion, imagen_url, min_participantes to trips
        //     Added created_at, menu, viajes to enrollments
        this.version(3).stores({
            trips: 'id, fecha_inicio, estado',
            registrations: '++id, trip_id, user_id, status',
            conditions: 'id, condicion',
            enrollments: 'id, viaje_id, user_id',
            medicalRecords: 'user_id',
            soapReports: 'id, inscripcion_id, status'
        });
        // v4: Added maestroProblemasSoap for offline SOAP form selection
        this.version(4).stores({
            trips: 'id, fecha_inicio, estado',
            registrations: '++id, trip_id, user_id, status',
            conditions: 'id, condicion',
            enrollments: 'id, viaje_id, user_id',
            medicalRecords: 'user_id',
            soapReports: 'id, inscripcion_id, status',
            maestroProblemasSoap: 'id, problema'
        });
        // v5: Added universitySimulations for offline University SOAP simulations
        this.version(5).stores({
            trips: 'id, fecha_inicio, estado',
            registrations: '++id, trip_id, user_id, status',
            conditions: 'id, condicion',
            enrollments: 'id, viaje_id, user_id',
            medicalRecords: 'user_id',
            soapReports: 'id, inscripcion_id, status',
            maestroProblemasSoap: 'id, problema',
            universitySimulations: 'id, user_id, status'
        });
        // v6: Added sync_status to enrollments for offline status updates
        this.version(6).stores({
            trips: 'id, fecha_inicio, estado',
            registrations: '++id, trip_id, user_id, status',
            conditions: 'id, condicion',
            enrollments: 'id, viaje_id, user_id, sync_status',
            medicalRecords: 'user_id',
            soapReports: 'id, inscripcion_id, status',
            maestroProblemasSoap: 'id, problema',
            universitySimulations: 'id, user_id, status'
        });
        // v7: Added viaje_id and alumno_nombre to universitySimulations for ISAUI grouping
        this.version(7).stores({
            trips: 'id, fecha_inicio, estado',
            registrations: '++id, trip_id, user_id, status',
            conditions: 'id, condicion',
            enrollments: 'id, viaje_id, user_id, sync_status',
            medicalRecords: 'user_id',
            soapReports: 'id, inscripcion_id, status',
            maestroProblemasSoap: 'id, problema',
            universitySimulations: 'id, user_id, status, viaje_id, alumno_nombre'
        });
        // v8: Added created_at index for sorting simulations
        this.version(8).stores({
            trips: 'id, fecha_inicio, estado',
            registrations: '++id, trip_id, user_id, status',
            conditions: 'id, condicion',
            enrollments: 'id, viaje_id, user_id, sync_status',
            medicalRecords: 'user_id',
            soapReports: 'id, inscripcion_id, status',
            maestroProblemasSoap: 'id, problema',
            universitySimulations: 'id, user_id, status, viaje_id, alumno_nombre, created_at'
        });
        // v9: Added support for robust offline registration sync
        this.version(9).stores({
            trips: 'id, fecha_inicio, estado',
            registrations: '++id, trip_id, user_id, status',
            conditions: 'id, condicion',
            enrollments: 'id, viaje_id, user_id, sync_status',
            medicalRecords: 'user_id',
            soapReports: 'id, inscripcion_id, status',
            maestroProblemasSoap: 'id, problema',
            universitySimulations: 'id, user_id, status, viaje_id, alumno_nombre, created_at'
        });
    }
}

export const db = new TrekDatabase();
