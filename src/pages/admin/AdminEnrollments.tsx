import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import MedicalViewModal from '../../components/admin/MedicalViewModal';
import { generateMedicalPDF } from '../../utils/pdfGenerator';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { db } from '../../api/db';
// Removed unused useLiveQuery

interface Enrollment {
    id: string;
    viaje_id: string;
    user_id: string;
    estado: string;
    created_at: string;
    menu: string;
    soap_creada?: boolean;
    profiles: {
        full_name: string;
        phone?: string;
    };
    viajes: {
        titulo: string;
    };
}

interface AdminEnrollmentsProps {
    tripId?: string;
    onClearFilter?: () => void;
    onNewSoapReport?: (id: string) => void;
}

const AdminEnrollments: React.FC<AdminEnrollmentsProps> = ({ tripId, onClearFilter, onNewSoapReport }) => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { isOnline, downloadTripData } = useOfflineSync();
    const [isOfflineSyncing, setIsOfflineSyncing] = useState(false);

    // Medical Modal State
    const [medicalModal, setMedicalModal] = useState<{ isOpen: boolean, userId: string, userName: string }>({
        isOpen: false,
        userId: '',
        userName: ''
    });

    const [downloadingUser, setDownloadingUser] = useState<{ userId: string, userName: string } | null>(null);

    useEffect(() => {
        fetchEnrollments();
    }, [tripId]);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);

            if (isOnline) {
                let query = supabase
                    .from('inscripciones')
                    .select('*,profiles(full_name,phone),viajes(titulo)')
                    .order('created_at', { ascending: false });

                if (tripId) {
                    query = query.eq('viaje_id', tripId);
                }

                const { data, error } = await query;
                if (error) throw error;
                setEnrollments(data || []);

                // Auto-cache to Dexie for offline use
                if (data && data.length > 0) {
                    if (tripId) {
                        await db.enrollments.where('viaje_id').equals(tripId).delete();
                    }
                    await db.enrollments.bulkPut(data.map(e => ({
                        id: e.id,
                        viaje_id: e.viaje_id,
                        user_id: e.user_id,
                        estado: e.estado,
                        created_at: e.created_at,
                        menu: e.menu,
                        profiles: e.profiles,
                        viajes: e.viajes,
                        soap_creada: e.soap_creada
                    })));
                }
            } else {
                // FALLBACK TO DEXIE
                let localData;
                if (tripId) {
                    localData = await db.enrollments.where('viaje_id').equals(tripId).toArray();
                } else {
                    localData = await db.enrollments.toArray();
                }
                setEnrollments(localData as any[] || []);
            }
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            // Fallback to local if fetch fails even if "online"
            let localData;
            if (tripId) {
                localData = await db.enrollments.where('viaje_id').equals(tripId).toArray();
            } else {
                localData = await db.enrollments.toArray();
            }
            setEnrollments(localData as any[] || []);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncTrip = async () => {
        if (!tripId) return;
        setIsOfflineSyncing(true);
        const result = await downloadTripData(tripId);
        if (result.success) {
            alert("Sincronización completa. Los datos están disponibles offline.");
        } else {
            alert("Error al sincronizar. Revisa tu conexión.");
        }
        setIsOfflineSyncing(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('inscripciones')
                .update({ estado: newStatus })
                .eq('id', id);

            if (error) throw error;
            fetchEnrollments();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar estado");
        }
    };

    const handleDirectPDFDownload = async (userId: string, userName: string) => {
        try {
            console.log("Iniciando descarga nativa de PDF para:", userName, userId);
            setDownloadingUser({ userId, userName });

            // Fetch medical profile data
            let profileData: any = null;

            if (isOnline) {
                const { data, error } = await supabase
                    .from('fichas_medicas')
                    .select('*, user:user_id(full_name)')
                    .eq('user_id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                profileData = data;
            } else {
                const cached = await db.medicalRecords.get(userId);
                if (cached) profileData = cached.data;
            }

            if (!profileData) {
                alert("No se encontró ficha médica para este participante.");
                setDownloadingUser(null);
                return;
            }

            // Conditions catalog for resolving IDs to names
            const conditions_catalog = [
                { id: 1, condicion: 'COVID-19' }, { id: 2, condicion: 'Síntomas de COVID-19' },
                { id: 3, condicion: 'Dificultad visual' }, { id: 4, condicion: 'Problemas auditivos' },
                { id: 5, condicion: 'Alergias' }, { id: 6, condicion: 'Afecciones del corazón' },
                { id: 7, condicion: 'Epilepsia' }, { id: 8, condicion: 'Asma' },
                { id: 9, condicion: 'Diabetes' }, { id: 10, condicion: 'Hipertensión' },
                { id: 11, condicion: 'Problemas respiratorios' }, { id: 12, condicion: 'Convulsiones' },
                { id: 13, condicion: 'Enfermedades de la sangre' },
                { id: 14, condicion: 'Hepatitis u otras enfermedades del hígado' },
                { id: 15, condicion: 'Limitaciones en actividad diaria' }, { id: 16, condicion: 'Celiaquía' },
                { id: 17, condicion: 'Luxaciones' }, { id: 18, condicion: 'Problemas de la columna' },
                { id: 19, condicion: 'Lesiones de cintura, rodillas o tobillos' },
                { id: 20, condicion: 'Lesiones de hombros o brazos' },
                { id: 21, condicion: 'Bajo cuidado médico' }, { id: 22, condicion: 'Toma medicación actualmente' },
                { id: 23, condicion: 'Embarazo' }, { id: 24, condicion: 'Otra condición' },
            ];

            const getConditionName = (id: number) =>
                conditions_catalog.find(c => c.id === id)?.condicion || `Condición ${id}`;

            // Build structured data
            const pdfData = {
                fullName: profileData.user?.full_name || userName,
                bloodType: profileData.grupo_sanguineo || 'N/A',
                bloodPressure: profileData.tension_arterial || '120/80',
                height: String(profileData.estatura || ''),
                weight: String(profileData.peso || ''),
                insurance: profileData.obra_social || 'N/A',
                allergies: profileData.alergias || 'Ninguna',
                observations: profileData.observaciones || 'Sin observaciones',
                lastUpdate: profileData.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : undefined,
                conditions: (profileData.condiciones || []).map((id: number) => getConditionName(id)),
                medications: (profileData.medicamentos || []).map((m: any) => ({
                    name: m.name || 'Sin nombre',
                    dosage: m.dosage || 'Sin dosis'
                })),
                emergencyContacts: [
                    {
                        name: profileData.contacto_emergencia_1 || 'No registrado',
                        phone: profileData.telefono_emergencia_1 || 'N/A',
                        relation: 'Primario'
                    },
                    {
                        name: profileData.contacto_emergencia_2 || 'No registrado',
                        phone: profileData.telefono_emergencia_2 || 'N/A',
                        relation: 'Secundario'
                    }
                ]
            };

            const fileName = `Ficha_Medica_${userName.replace(/\s+/g, '_')}`;
            await generateMedicalPDF('', fileName, '#ffffff', { type: 'medical', content: pdfData });
            console.log("PDF nativo generado con éxito");

        } catch (error: any) {
            console.error("Error generando PDF:", error);
            alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
        } finally {
            setDownloadingUser(null);
        }
    };

    const filteredEnrollments = enrollments.filter((e: Enrollment) => {
        const matchesStatus = filter === 'all' ? true : e.estado === filter;
        const matchesSearch = e.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.viajes?.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Cargando Participantes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 text-slate-900 dark:text-white max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <MedicalViewModal
                isOpen={medicalModal.isOpen}
                userId={medicalModal.userId}
                userName={medicalModal.userName}
                onClose={() => setMedicalModal({ ...medicalModal, isOpen: false })}
            />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 relative">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary dark:text-primary font-bold text-sm tracking-widest uppercase">
                        <span className="material-symbols-outlined text-sm font-bold">person_search</span>
                        <span>Roster Management</span>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{tripId ? 'Lista de Inscriptos' : 'Inscripciones Globales'}</h2>
                    {tripId && (
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-primary text-xs font-black uppercase tracking-widest">{enrollments[0]?.viajes?.titulo || 'Filtrado por Expedición'}</p>
                            <button
                                onClick={onClearFilter}
                                className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase underline tracking-tighter"
                            >
                                Quitar Filtro
                            </button>
                        </div>
                    )}
                    {!isOnline && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full mt-2 border border-amber-500/10">
                            <span className="material-symbols-outlined text-sm">cloud_off</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Modo Montaña (Offline)</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    {tripId && isOnline && (
                        <button
                            onClick={handleSyncTrip}
                            disabled={isOfflineSyncing}
                            className={`flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-black uppercase tracking-widest text-[10px] ${isOfflineSyncing ? 'animate-pulse opacity-50' : ''}`}
                            title="Descargar lista y fichas médicas para uso sin señal"
                        >
                            <span className="material-symbols-outlined text-lg">{isOfflineSyncing ? 'sync' : 'cloud_download'}</span>
                            <span>{isOfflineSyncing ? 'Sincronizando...' : 'Sincronizar Montaña'}</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="w-full bg-neutral-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full sm:w-auto overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div className="flex gap-1.5 bg-neutral-900/80 p-1.5 rounded-xl border border-white/10 backdrop-blur-md w-max mx-auto sm:mx-0">
                            {['all', 'pending', 'confirmed'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 sm:px-6 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Confirmados'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className="bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-neutral-800/50 text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                            <th className="px-8 py-6 font-black">Participante</th>
                            <th className="px-8 py-6 font-black text-primary hidden sm:table-cell">Expedición</th>
                            <th className="px-8 py-6 font-black hidden md:table-cell">Fecha Reg.</th>
                            <th className="px-8 py-6 font-black hidden lg:table-cell">Menú</th>
                            <th className="px-8 py-6 font-black text-center">Estado</th>
                            <th className="px-8 py-6 font-black text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredEnrollments.length > 0 ? filteredEnrollments.map((enrollment) => (
                            <tr key={enrollment.id} className="group hover:bg-white/5 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 bg-primary/10 rounded-[18px] flex items-center justify-center text-primary font-black border border-primary/20 uppercase text-lg shadow-inner">
                                            {enrollment.profiles?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">{enrollment.profiles?.full_name || 'Desconocido'}</p>
                                            <p className="text-[10px] text-primary/70 font-bold tracking-widest mt-0.5">{enrollment.profiles?.phone || 'Sin télefono'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 hidden sm:table-cell">
                                    <p className="text-xs font-bold text-white/60 uppercase tracking-tight">{enrollment.viajes?.titulo}</p>
                                </td>
                                <td className="px-8 py-6 hidden md:table-cell">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-white font-mono opacity-80">{new Date(enrollment.created_at).toLocaleDateString()}</span>
                                        <span className="text-[9px] text-slate-500 uppercase font-black">Registrado</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 hidden lg:table-cell">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/10 px-3 py-1.5 rounded-lg">
                                        {enrollment.menu}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${enrollment.estado === 'confirmed' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                        }`}>
                                        {enrollment.estado === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        {enrollment.estado === 'pending' && (
                                            <button
                                                onClick={() => updateStatus(enrollment.id, 'confirmed')}
                                                className="size-10 flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/20"
                                                title="Confirmar Inscripción"
                                            >
                                                <span className="material-symbols-outlined font-black">done_all</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setMedicalModal({
                                                isOpen: true,
                                                userId: enrollment.user_id,
                                                userName: enrollment.profiles?.full_name || 'Senderista'
                                            })}
                                            className="size-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/5"
                                            title="Ver Ficha Médica"
                                        >
                                            <span className="material-symbols-outlined text-lg">medical_information</span>
                                        </button>
                                        <button
                                            onClick={() => onNewSoapReport?.(enrollment.id)}
                                            className={`size-10 flex items-center justify-center rounded-xl transition-all border ${enrollment.soap_creada ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/10' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10'}`}
                                            title={enrollment.soap_creada ? "Editar Ficha SOAP" : "Nueva Ficha SOAP"}
                                        >
                                            <span className="material-symbols-outlined text-lg">{enrollment.soap_creada ? 'edit_note' : 'medical_services'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleDirectPDFDownload(enrollment.user_id, enrollment.profiles?.full_name || 'Senderista')}
                                            disabled={downloadingUser?.userId === enrollment.user_id}
                                            className={`size-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/5 ${downloadingUser?.userId === enrollment.user_id ? 'opacity-50' : ''}`}
                                            title="Generar PDF"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                {downloadingUser?.userId === enrollment.user_id ? 'sync' : 'file_download'}
                                            </span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                        <span className="material-symbols-outlined text-6xl">person_off</span>
                                        <p className="text-xs font-black uppercase tracking-[0.3em]">No hay inscriptos que coincidan con la búsqueda</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminEnrollments;
