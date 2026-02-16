import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

interface Participant {
    id: string;
    user_id: string;
    full_name: string;
    status: string;
    created_at: string;
    avatar_url?: string;
    role?: string;
}

interface TripDetail {
    id: string;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    cupos_totales: number;
    cupos_disponibles: number;
    min_participantes: number;
    estado: string;
    dificultad?: string;
    ubicacion?: string;
    imagen_url?: string;
}

interface TripDetailPageProps {
    tripId: string;
    onBack: () => void;
    onRegister: () => void;
    user: any;
    isAdmin?: boolean;
}

const TripDetailPage: React.FC<TripDetailPageProps> = ({ tripId, onBack, onRegister, user, isAdmin = true }) => {
    const [trip, setTrip] = useState<TripDetail | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Fetch trip info
                const { data: tripData } = await supabase
                    .from('viajes')
                    .select('*')
                    .eq('id', tripId)
                    .single();

                if (tripData) setTrip(tripData);

                // Fetch participants (joining inscripciones and profiles)
                const { data: participantsData } = await supabase
                    .from('inscripciones')
                    .select(`
                        id,
                        created_at,
                        estado,
                        user_id,
                        user:user_id (
                            full_name
                        )
                    `)
                    .eq('viaje_id', tripId);

                if (participantsData) {
                    const formatted = participantsData.map((p: any) => ({
                        id: p.id,
                        user_id: p.user_id,
                        full_name: p.user?.full_name || 'Senderista Anónimo',
                        status: p.estado === 'confirmed' ? 'Confirmado' : 'Pendiente',
                        created_at: p.created_at,
                        role: 'Participante'
                    }));
                    setParticipants(formatted);
                }
            } catch (err) {
                console.error("Error fetching trip details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [tripId]);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Cargando Detalles de Expedición...</p>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="p-8 text-center">
                <p className="text-white">No se encontró la expedición.</p>
                <button onClick={onBack} className="text-primary underline mt-4">Volver</button>
            </div>
        );
    }

    const enrolledCount = trip.cupos_totales - trip.cupos_disponibles;
    const progress = Math.round((enrolledCount / trip.cupos_totales) * 100);
    const isUserEnrolled = participants.some(p => p.user_id === user?.id);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
            {/* Navigation Back */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#92c9a9] hover:text-primary transition-colors mb-6 group uppercase tracking-widest text-[10px] font-black"
            >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Volver a Expediciones
            </button>

            {/* Hero Section */}
            <div className="relative rounded-[32px] overflow-hidden mb-12 group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent z-10"></div>
                <img
                    alt={trip.titulo}
                    className="w-full h-[450px] object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                    src={trip.imagen_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"}
                />
                <div className="absolute bottom-0 left-0 w-full p-10 z-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                    <div className="space-y-4 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <span className="bg-primary text-background-dark px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-primary/20">
                                <span className="material-symbols-outlined text-sm leading-none font-black text-xs">verified</span>
                                {trip.estado === 'published' ? 'Abierto' :
                                    trip.estado === 'confirmed' ? 'Confirmado' :
                                        trip.estado === 'cancelled' ? 'Cancelado' : trip.estado}
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm leading-none text-xs">landscape</span>
                                {trip.dificultad || 'Moderado'}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">{trip.titulo}</h2>
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-lg">location_on</span>
                            <p className="text-white text-xl font-bold tracking-tight">{trip.ubicacion || 'Ubicación Pendiente'}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {isUserEnrolled ? (
                            <div className="bg-primary/20 backdrop-blur-md border border-primary/30 text-primary px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 shadow-xl">
                                <span className="material-symbols-outlined font-black">check_circle</span>
                                Ya estás Inscrito
                            </div>
                        ) : (
                            <button
                                onClick={onRegister}
                                className="bg-primary hover:bg-primary/90 text-background-dark px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-primary/20"
                            >
                                <span className="material-symbols-outlined font-black">hiking</span>
                                Inscribirse Ahora
                            </button>
                        )}
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-5 py-5 rounded-2xl transition-all">
                            <span className="material-symbols-outlined font-black">share</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Content */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Description Card */}
                    <section className="bg-white dark:bg-[#1a3124] border border-slate-200 dark:border-[#234833] rounded-[32px] p-10 shadow-2xl shadow-primary/5">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <span className="material-symbols-outlined text-2xl font-black">info</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Descripción de la Expedición</h3>
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-500 dark:text-[#92c9a9] font-medium leading-relaxed space-y-6 text-lg italic mt-4">
                            {trip.descripcion || 'No hay descripción detallada disponible para esta expedición.'}
                        </div>
                    </section>

                    {/* Participant List */}
                    <section className="bg-white dark:bg-[#1a3124] border border-slate-200 dark:border-[#234833] rounded-[32px] overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="p-8 border-b border-slate-200 dark:border-[#234833] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <span className="material-symbols-outlined text-2xl font-black">group</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Compañeros de Aventura</h3>
                            </div>
                            {isAdmin && <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#92c9a9] bg-white/5 px-4 py-2 rounded-full border border-white/5">Vista de Admin</span>}
                        </div>
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left order-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-[#1f3d2b] text-slate-400 dark:text-[#92c9a9]/60 text-[10px] uppercase font-black tracking-[0.2em]">
                                        <th className="px-8 py-5">Participante</th>
                                        <th className="px-8 py-5">Fecha Reg.</th>
                                        {isAdmin && <th className="px-8 py-5">Estado Pago</th>}
                                        {isAdmin && <th className="px-8 py-5 text-right"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#234833]">
                                    {participants.length > 0 ? participants.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1f3d2b]/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1f3d2b] overflow-hidden border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-slate-400">person</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{p.full_name}</div>
                                                        <div className="text-[10px] text-[#92c9a9] font-bold uppercase tracking-widest">{p.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-[11px] font-bold text-slate-500 dark:text-[#92c9a9] uppercase tracking-widest italic">{new Date(p.created_at).toLocaleDateString()}</td>
                                            {isAdmin && (
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${p.status === 'Confirmado' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-orange-500/20 text-orange-500 border-orange-500/30'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            )}
                                            {isAdmin && (
                                                <td className="px-8 py-6 text-right">
                                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined font-black">more_horiz</span>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 4 : 2} className="px-8 py-10 text-center text-slate-400 dark:text-[#92c9a9]/40 font-black uppercase tracking-[0.2em] italic">No hay participantes registrados aún.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {isAdmin && (
                            <div className="p-6 bg-slate-50 dark:bg-white/5 text-center">
                                <button className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:underline group">
                                    Ver Todos los Participantes
                                    <span className="material-symbols-outlined text-sm align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Logistics Sidebar */}
                <aside className="space-y-8">
                    {/* Logistics Card */}
                    <div className="bg-white dark:bg-[#1a3124] border border-slate-200 dark:border-[#234833] rounded-[32px] p-8 sticky top-24 shadow-2xl shadow-primary/5 space-y-8">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary font-black">inventory_2</span>
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Detalles de Expedición</h4>
                        </div>

                        <div className="space-y-8">
                            {/* Dates */}
                            <div className="flex items-start gap-5">
                                <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 text-primary">
                                    <span className="material-symbols-outlined font-black">calendar_today</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 dark:text-[#92c9a9]/60 uppercase font-black tracking-[0.2em]">Rango de Fechas</p>
                                    <p className="text-slate-900 dark:text-white font-black text-lg tracking-tight uppercase">{new Date(trip.fecha_inicio).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} – {new Date(trip.fecha_fin).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</p>
                                    <p className="text-[10px] text-[#92c9a9] font-black uppercase tracking-widest italic leading-none">Vario días de travesía</p>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="flex items-start gap-5">
                                <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-red-500">
                                    <span className="material-symbols-outlined font-black">trending_up</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 dark:text-[#92c9a9]/60 uppercase font-black tracking-[0.2em]">Dificultad Técnica</p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight">{trip.dificultad || 'Moderada'}</p>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`w-1.5 h-3 rounded-full ${i <= 3 ? 'bg-primary shadow-[0_0_8px_rgba(19,236,109,0.5)]' : 'bg-slate-200 dark:bg-white/10'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-[#92c9a9] font-black uppercase tracking-widest italic leading-none">Requiere aptitud física media</p>
                                </div>
                            </div>

                            {/* Capacity */}
                            <div className="pt-8 border-t border-slate-200 dark:border-white/5 space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] text-slate-400 dark:text-[#92c9a9]/60 uppercase font-black tracking-[0.2em]">Cupos Confirmados</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{enrolledCount}/{trip.cupos_totales} <span className="text-[#92c9a9]/40 font-bold ml-1">Inscriptos</span></p>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                                    <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(19,236,109,0.3)]" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                                    <span className="text-slate-400">Mínimo para confirmar: {trip.min_participantes}</span>
                                    {enrolledCount >= trip.min_participantes ? (
                                        <span className="text-primary flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px] font-black">check_circle</span>
                                            Objetivo Logrado
                                        </span>
                                    ) : (
                                        <span className="text-orange-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px] font-black">pending</span>
                                            Pendiente
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="pt-8 space-y-4">
                                <div className="bg-slate-50 dark:bg-[#1f3d2b] rounded-2xl p-5 border border-slate-100 dark:border-white/5 space-y-2">
                                    <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-primary text-lg font-black">map</span>
                                        Ubicación
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-[#92c9a9] font-bold uppercase tracking-tight leading-relaxed">{trip.ubicacion || 'Región de Córdoba, Argentina'}</p>
                                </div>
                                <button className="w-full bg-slate-900 dark:bg-primary text-white dark:text-background-dark py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined font-black">download</span>
                                    Descargar Lista de Equipo
                                </button>
                                <p className="text-center text-[9px] text-[#92c9a9]/40 uppercase tracking-[0.4em] font-black pt-4">
                                    ID EXPEDICIÓN: #{trip.id.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Weather Card */}
                    <div className="bg-gradient-to-br from-primary/10 to-background-dark border border-white/5 rounded-[32px] p-8 space-y-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Clima en la Base</p>
                            <span className="material-symbols-outlined text-primary animate-pulse">cloud</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <p className="text-5xl font-black text-white">-2°C</p>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#92c9a9]">Máx: 8°C</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mín: -5°C</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div >
    );
};

export default TripDetailPage;
