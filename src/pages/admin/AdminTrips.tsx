import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import TripModal from '../../components/admin/TripModal';

interface Trip {
    id: string;
    titulo: string;
    descripcion: string;
    cupos_totales: number;
    cupos_disponibles: number;
    min_participantes: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    dificultad: string;
    ubicacion: string;
    imagen_url: string;
}

interface AdminTripsProps {
    onViewInscriptos: (tripId: string) => void;
}

const AdminTrips: React.FC<AdminTripsProps> = ({ onViewInscriptos }) => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        region: 'All Regions',
        status: 'Any Status',
        difficulty: 'Any Difficulty'
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('viajes')
                .select('*')
                .order('fecha_inicio', { ascending: true });

            if (error) throw error;
            setTrips(data || []);
        } catch (error) {
            console.error("Error fetching trips:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTrip(null);
        setIsModalOpen(true);
    };

    const handleEdit = (trip: Trip) => {
        setEditingTrip(trip);
        setIsModalOpen(true);
    };

    const filteredTrips = trips.filter(t => {
        const matchesSearch = t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filters.status === 'Any Status' || t.estado.toLowerCase() === filters.status.toLowerCase();
        const matchesDifficulty = filters.difficulty === 'Any Difficulty' || t.dificultad.toLowerCase() === filters.difficulty.toLowerCase();
        const matchesRegion = filters.region === 'All Regions' || t.ubicacion.toLowerCase().includes(filters.region.toLowerCase());

        return matchesSearch && matchesStatus && matchesDifficulty && matchesRegion;
    });

    const totalRevenue = trips.length * 5950;
    const activeTrekkers = trips.reduce((acc, t) => acc + (t.cupos_totales - t.cupos_disponibles), 0);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-dark/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Cargando Expediciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white p-4 lg:p-10 space-y-8 max-w-[1440px] mx-auto w-full animate-in fade-in duration-500 pb-32">
            <TripModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchTrips}
                trip={editingTrip}
            />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
                        <span className="material-symbols-outlined text-sm font-bold">dashboard</span>
                        <span>Management Console</span>
                    </div>
                    <h1 className="text-white text-4xl lg:text-5xl font-black tracking-tight uppercase italic">Expedition Hub</h1>
                    <p className="text-text-muted text-lg max-w-xl leading-relaxed font-medium italic">Gestión logística de travesías, monitoreo de inscripciones y coordinación de salidas.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex flex-1 md:flex-none items-center justify-center gap-2 rounded-xl h-12 px-6 bg-surface-dark text-white font-bold hover:bg-surface-dark/70 transition-all border border-border-dark hover:border-primary/30">
                        <span className="material-symbols-outlined">file_download</span>
                        <span>Exportar CSV</span>
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex flex-1 md:flex-none items-center justify-center gap-2 rounded-xl h-12 px-8 bg-primary text-background-dark font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <span className="material-symbols-outlined font-black">add</span>
                        <span>Nuevo Viaje</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-dark/40 border border-border-dark rounded-2xl p-6 lg:p-8 space-y-6">
                <div className="flex flex-wrap items-center gap-6 border-b border-border-dark pb-4">
                    <button className="px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 border-primary text-white">Todos los Viajes ({trips.length})</button>
                    <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">Activos</button>
                    <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">Pendientes</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Búsqueda</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full bg-background-dark border border-border-dark rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium placeholder:text-text-muted/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Región</label>
                        <select
                            className="bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none text-sm font-medium cursor-pointer"
                            value={filters.region}
                            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                        >
                            <option>All Regions</option>
                            <option>Andes</option>
                            <option>Sierras</option>
                            <option>Patagonia</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Estado</label>
                        <select
                            className="bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none text-sm font-medium cursor-pointer"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option>Any Status</option>
                            <option value="published">Published</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Dificultad</label>
                        <select
                            className="bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none text-sm font-medium cursor-pointer"
                            value={filters.difficulty}
                            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                        >
                            <option>Any Difficulty</option>
                            <option>Easy</option>
                            <option>Moderate</option>
                            <option>Hard</option>
                            <option>Expert</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Trip Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
                {filteredTrips.map(trip => (
                    <TripCard
                        key={trip.id}
                        trip={trip}
                        onEdit={() => handleEdit(trip)}
                        onViewInscriptos={onViewInscriptos}
                    />
                ))}

                <div
                    onClick={handleCreate}
                    className="border-2 border-dashed border-border-dark rounded-[32px] flex flex-col items-center justify-center p-12 group hover:border-primary/50 cursor-pointer transition-all min-h-[450px] bg-surface-dark/20"
                >
                    <div className="size-20 rounded-full bg-surface-dark flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-background-dark transition-all mb-6">
                        <span className="material-symbols-outlined text-5xl font-black">add</span>
                    </div>
                    <h3 className="text-white text-2xl font-black uppercase tracking-tight italic">Nueva Expedición</h3>
                    <p className="text-text-muted text-center text-sm mt-3 max-w-[240px] font-medium leading-relaxed italic">Comienza a planificar una nueva aventura para la próxima temporada.</p>
                </div>
            </div>

            {/* Float Stats Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-10 lg:right-10 lg:bottom-8 z-40 px-4 pointer-events-none">
                <div className="max-w-[1440px] mx-auto pointer-events-auto">
                    <div className="bg-primary/95 text-background-dark backdrop-blur-md rounded-[24px] px-8 py-5 flex flex-wrap items-center justify-between gap-6 shadow-[0_-8px_40px_rgba(19,236,109,0.3)]">
                        <div className="flex items-center gap-12">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70 italic">Ingresos Proyectados</span>
                                <span className="text-2xl font-black leading-none">${totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="hidden sm:flex flex-col text-center">
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70 italic">Trekkers Activos</span>
                                <span className="text-2xl font-black leading-none">{activeTrekkers}</span>
                            </div>
                        </div>
                        <button className="px-8 py-3 bg-background-dark text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                            Analíticas Avanzadas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TripCard = ({ trip, onEdit, onViewInscriptos }: { trip: Trip, onEdit: () => void, onViewInscriptos: (id: string) => void }) => {
    const inscriptions = trip.cupos_totales - trip.cupos_disponibles;
    const progress = Math.round((inscriptions / trip.cupos_totales) * 100);
    const isConfirmable = inscriptions >= trip.min_participantes;

    return (
        <div className="group bg-surface-dark border border-border-dark rounded-[32px] overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col shadow-2xl">
            <div className="relative h-56 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${trip.imagen_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent"></div>

                <div className="absolute top-6 left-6 flex gap-2">
                    <span className={`px-4 py-1.5 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-full ${trip.estado === 'published' ? 'bg-primary/90 text-background-dark shadow-[0_0_15px_rgba(19,236,109,0.3)]' :
                        trip.estado === 'confirmed' ? 'bg-cyan-500/90 text-white' : 'bg-slate-600/90 text-white'
                        }`}>
                        {trip.estado}
                    </span>
                    {isConfirmable && trip.estado === 'published' && (
                        <span className="px-4 py-1.5 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                            Listo para confirmar
                        </span>
                    )}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1 italic">{trip.ubicacion}</p>
                    <h3 className="text-white text-2xl font-black leading-tight uppercase tracking-tight italic">{trip.titulo}</h3>
                </div>
            </div>

            <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-text-muted">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        <span className="font-bold italic uppercase">{new Date(trip.fecha_inicio).toLocaleDateString()}</span>
                    </div>
                    <span className="text-text-muted font-black uppercase tracking-widest">MIN: {trip.min_participantes}</span>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Progreso de Inscripción</span>
                        <span className="text-sm font-black text-white italic">{inscriptions} <span className="text-text-muted text-xs">/ {trip.cupos_totales}</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-background-dark/50 rounded-full overflow-hidden border border-border-dark p-[1px]">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${trip.cupos_disponibles === 0 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_12px_rgba(19,236,109,0.5)]'
                                }`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="pt-6 mt-auto border-t border-border-dark flex gap-3">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-surface-dark border border-border-dark text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-border-dark/60 transition-all font-display"
                    >
                        Editar Viaje
                    </button>
                    <button
                        onClick={() => onViewInscriptos(trip.id)}
                        className="flex-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-primary/20 transition-all font-display"
                    >
                        Inscriptos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTrips;
