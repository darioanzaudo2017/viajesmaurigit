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

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface HomePageProps {
    onDiscoverClick?: () => void;
    onTrekClick?: (trekId: string) => void;
    onCreateTrekClick?: () => void;
    user?: any;
}

const HomePage: React.FC<HomePageProps> = ({ onDiscoverClick, onTrekClick, onCreateTrekClick, user }) => {
    const [discoveryRoutes, setDiscoveryRoutes] = useState<Viaje[]>([]);
    const [userTreks, setUserTreks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    const isAdmin = user?.profile?.role === 'admin';

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                // Fetch all published trips for discovery
                const { data: discoveryData } = await supabase
                    .from('viajes')
                    .select('*')
                    .eq('estado', 'published')
                    .limit(6);

                if (discoveryData) setDiscoveryRoutes(discoveryData);

                // If user is logged in, fetch their registrations
                if (user?.id) {
                    const { data: registrationData } = await supabase
                        .from('inscripciones')
                        .select(`
                            id,
                            estado,
                            viaje:viajes (
                                id,
                                titulo,
                                fecha_inicio,
                                imagen_url,
                                ubicacion
                            )
                        `)
                        .eq('user_id', user.id);

                    if (registrationData) {
                        setUserTreks(registrationData.map((reg: any) => ({
                            id: reg.viaje.id,
                            title: reg.viaje.titulo,
                            details: `${new Date(reg.viaje.fecha_inicio).toLocaleDateString()} • ${reg.viaje.ubicacion}`,
                            image: reg.viaje.imagen_url,
                            status: reg.estado
                        })));
                    }
                }
            } catch (err) {
                console.error("Error fetching home data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [user]);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setInstallPrompt(null);
            }
        });
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Preparando tu Próxima Ruta...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Left Sidebar: My Upcoming Treks */}
            <aside className="w-[320px] border-r border-slate-200 dark:border-[#234833] flex flex-col bg-background-light dark:bg-background-dark hidden lg:flex">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Mis Expediciones</h2>
                        {userTreks.length > 0 && (
                            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded font-bold">{userTreks.length} Activas</span>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-[#92c9a9] text-sm">Tus rutas y equipo confirmado.</p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
                    {!user ? (
                        <div className="py-12 text-center px-6 space-y-4">
                            <div className="size-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-[#234833]">lock_open</span>
                            </div>
                            <p className="text-slate-500 dark:text-[#92c9a9] text-xs font-black uppercase tracking-widest leading-relaxed">Ingresa para gestionar tus expediciones</p>
                            <button
                                onClick={onDiscoverClick}
                                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    ) : userTreks.length > 0 ? (
                        userTreks.map((trek) => (
                            <div
                                key={trek.id}
                                onClick={() => onTrekClick?.(trek.id)}
                                className="group bg-white dark:bg-[#1a2e22] rounded-xl border border-slate-200 dark:border-[#234833] p-4 hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <div className="flex gap-4">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 flex-shrink-0"
                                        style={{ backgroundImage: `url("${trek.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'}")` }}
                                    ></div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <p className="text-slate-900 dark:text-white text-base font-bold truncate uppercase tracking-tight">{trek.title}</p>
                                        <p className="text-slate-500 dark:text-[#92c9a9] text-[10px] font-bold uppercase tracking-widest">{trek.details}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${trek.status === 'confirmed' ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-500'}`}>
                                                {trek.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center px-6">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-[#234833] mb-4">hiking</span>
                            <p className="text-slate-500 dark:text-[#92c9a9] text-xs font-bold uppercase tracking-widest leading-relaxed">No tienes inscripciones activas aún. ¡Empieza a explorar!</p>
                        </div>
                    )}

                    {isAdmin && (
                        <div
                            onClick={onCreateTrekClick}
                            className="border-2 border-dashed border-slate-200 dark:border-[#234833] rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 hover:border-primary/50 cursor-pointer transition-all mt-4"
                        >
                            <span className="material-symbols-outlined text-4xl mb-2 text-primary">add_circle</span>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Crear Nueva Expedición</p>
                        </div>
                    )}
                </div>
                {isAdmin && (
                    <div className="p-4 bg-slate-50 dark:bg-[#162a1e] border-t border-slate-200 dark:border-[#234833]">
                        <button
                            onClick={onCreateTrekClick}
                            className="w-full bg-primary hover:bg-primary/90 text-background-dark h-12 rounded-xl font-bold transition-transform active:scale-[0.98] flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                        >
                            <span className="material-symbols-outlined">add</span> Gestionar Viajes
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content: Discover New Adventures */}
            <section className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* User's Active Treks (Visible everywhere) */}
                    {userTreks.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-primary">verified</span>
                                <h2 className="text-slate-900 dark:text-white text-xl font-black uppercase tracking-tight">Mis Próximas Expediciones</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {userTreks.map((trek) => (
                                    <div
                                        key={trek.id}
                                        onClick={() => onTrekClick?.(trek.id)}
                                        className="group bg-white dark:bg-[#1a2e22] rounded-3xl border border-slate-200 dark:border-primary/20 p-5 hover:border-primary/50 transition-all cursor-pointer shadow-xl flex items-center gap-5"
                                    >
                                        <div
                                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-2xl size-20 flex-shrink-0"
                                            style={{ backgroundImage: `url("${trek.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'}")` }}
                                        ></div>
                                        <div className="flex flex-col justify-center overflow-hidden">
                                            <p className="text-slate-900 dark:text-white text-lg font-black truncate uppercase tracking-tight leading-none mb-1">{trek.title}</p>
                                            <p className="text-[#92c9a9] text-[10px] font-bold uppercase tracking-widest">{trek.details}</p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${trek.status === 'confirmed' ? 'bg-primary text-background-dark' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                                                    {trek.status === 'confirmed' ? 'Confirmado' : 'Inscrito'}
                                                </span>
                                                <span className="material-symbols-outlined text-sm text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {installPrompt && (
                        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#0c1a14] to-[#112218] border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>

                            <div className="relative z-10 flex items-center gap-4">
                                <div className="size-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-2xl">download</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold uppercase tracking-wide">Instala la App Nativa</h3>
                                    <p className="text-[#92c9a9] text-xs">Acceso offline, notificaciones y mayor rendimiento.</p>
                                </div>
                            </div>

                            <button
                                onClick={handleInstallClick}
                                className="relative z-10 bg-primary hover:bg-primary/90 text-background-dark px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">install_mobile</span>
                                Instalar Ahora
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div className="space-y-1">
                            {user ? (
                                <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Bienvenido, {user.profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || 'Explorador'}</p>
                            ) : (
                                <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Explora el Mundo</p>
                            )}
                            <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tighter uppercase italic leading-none">Rutas Destacadas</h1>
                        </div>
                        <button
                            onClick={onDiscoverClick}
                            className="bg-white dark:bg-[#234833] border border-slate-200 dark:border-transparent px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all text-slate-700 dark:text-white flex items-center gap-2 hover:text-primary"
                        >
                            Ver Todas
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>

                    {/* Discovery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {discoveryRoutes.map((route) => (
                            <div
                                key={route.id}
                                onClick={() => onTrekClick?.(route.id)}
                                className="group relative flex flex-col rounded-[32px] bg-white dark:bg-[#1a2e22] border border-slate-200 dark:border-[#234833] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-700"
                                        style={{ backgroundImage: `url("${route.imagen_url || 'https://images.unsplash.com/photo-1464817739973-0128fe72a500?auto=format&fit=crop&q=80&w=800'}")` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-primary/90 backdrop-blur-md text-background-dark text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{route.dificultad || 'Moderada'}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-slate-900 dark:text-white font-black text-xl leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">{route.titulo}</h3>
                                    <div className="flex gap-4 text-slate-500 dark:text-[#92c9a9]/60 text-[10px] font-black uppercase tracking-widest mt-4">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm text-primary">location_on</span> {route.ubicacion?.split(',')[0]}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm text-primary">calendar_today</span> {new Date(route.fecha_inicio).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Featured Exp */}
                    <div className="mt-16 relative w-full h-[450px] rounded-[40px] overflow-hidden border border-slate-200 dark:border-[#234833] group shadow-2xl">
                        <div
                            className="absolute inset-0 bg-center bg-no-repeat bg-cover group-hover:scale-[1.02] transition-transform duration-1000"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200")' }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 p-12 flex flex-col justify-center max-w-xl space-y-6">
                            <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">Expedición Premium</span>
                            <h3 className="text-white text-5xl font-black uppercase italic leading-none tracking-tighter">Ascenso al Fitz Roy</h3>
                            <p className="text-[#92c9a9] text-sm md:text-base leading-relaxed font-medium italic">Vive el desafío definitivo en el corazón de la Patagonia. Una ruta técnica diseñada para exploradores que buscan superar sus límites.</p>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={onDiscoverClick}
                                    className="bg-primary hover:bg-primary/90 text-background-dark px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-primary/20"
                                >
                                    Ver Expedición
                                </button>
                                <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all">Más Info</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
