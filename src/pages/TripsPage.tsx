import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

interface Viaje {
    id: string;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    cupos_totales: number;
    cupos_disponibles: number;
    estado: string;
    dificultad?: string;
    ubicacion?: string;
    imagen_url?: string;
}

const TripsPage: React.FC<{ onRegister: () => void, onViewDetails: (id: string) => void }> = ({ onRegister, onViewDetails }) => {
    const [viajes, setViajes] = useState<Viaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchViajes = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('viajes')
                .select('*')
                .order('fecha_inicio', { ascending: true });

            if (data) setViajes(data);
            setLoading(false);
        };

        fetchViajes();
    }, []);

    const filteredViajes = viajes.filter(v =>
        v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-white/5">
                <div className="space-y-2">
                    <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Expediciones Disponibles</p>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Descubrí tu Próximo Desafío</h2>
                </div>

                <div className="relative group min-w-[300px]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por destino o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-trek-surface border border-slate-200 dark:border-trek-border rounded-2xl pl-12 pr-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Explorando Rutas...</p>
                </div>
            ) : filteredViajes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredViajes.map((viaje) => {
                        const filledSpots = viaje.cupos_totales - viaje.cupos_disponibles;
                        const percentage = Math.round((filledSpots / viaje.cupos_totales) * 100);

                        return (
                            <div
                                key={viaje.id}
                                onClick={() => onViewDetails(viaje.id)}
                                className="group bg-white dark:bg-trek-surface border border-slate-200 dark:border-trek-border rounded-[32px] overflow-hidden hover:border-primary/40 transition-all duration-500 flex flex-col shadow-2xl shadow-primary/5 hover:translate-y-[-8px] cursor-pointer"
                            >
                                <div className="relative h-64 w-full overflow-hidden">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url("${viaje.imagen_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800'}")` }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#102218]/90 via-transparent to-transparent"></div>

                                    <div className="absolute top-6 left-6 flex gap-3">
                                        <span className="px-4 py-1.5 rounded-full bg-primary text-background-dark shadow-xl shadow-primary/20 text-[9px] font-black uppercase tracking-[0.2em]">
                                            {viaje.estado === 'published' ? 'Abierto' : viaje.estado}
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] border border-white/10">
                                            {viaje.dificultad || 'Moderado'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-slate-900 dark:text-white text-2xl font-black leading-tight group-hover:text-primary transition-colors uppercase tracking-tight mb-3">{viaje.titulo}</h3>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-trek-text-muted text-sm font-bold">
                                            <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
                                            <p className="uppercase tracking-widest text-[10px]">{viaje.ubicacion || 'Córdoba, AR'}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-trek-text-muted text-sm font-bold">
                                            <span className="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
                                            <p className="uppercase tracking-widest text-[10px]">{new Date(viaje.fecha_inicio).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                                <span className="text-slate-400 dark:text-trek-text-muted/60">Disponibilidad</span>
                                                <span className="text-slate-900 dark:text-white">{viaje.cupos_disponibles} Libres</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 dark:bg-trek-surface border border-slate-200 dark:border-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_12px_rgba(19,236,109,0.4)]" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(viaje.id);
                                                }}
                                                className="h-14 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px]"
                                            >
                                                Ver Info
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRegister();
                                                }}
                                                className="h-14 bg-primary text-background-dark font-black rounded-2xl hover:scale-[1.05] active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20"
                                            >
                                                Anotarse
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-24 text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-[#234833]">explore_off</span>
                    <p className="text-slate-500 dark:text-trek-text-muted font-black uppercase tracking-[0.2em]">No encontramos expediciones para esa búsqueda.</p>
                </div>
            )}
        </div>
    );
};

export default TripsPage;
