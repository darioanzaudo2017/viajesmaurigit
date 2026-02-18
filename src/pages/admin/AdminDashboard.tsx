import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { db } from '../../api/db';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface AdminStats {
    totalTrips: number;
    totalParticipants: number;
    pendingMedical: number;
    totalRevenue: number;
}

interface AdminDashboardProps {
    onNavigate: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const [stats, setStats] = useState<AdminStats>({
        totalTrips: 0,
        totalParticipants: 0,
        pendingMedical: 0,
        totalRevenue: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOnline } = useOfflineSync();
    const [isDataFromCache, setIsDataFromCache] = useState(false);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            setIsDataFromCache(false);

            if (isOnline) {
                // 1. Get stats
                const { count: tripsCount } = await supabase.from('viajes').select('*', { count: 'exact', head: true });
                const { count: participantsCount } = await supabase.from('inscripciones').select('*', { count: 'exact', head: true });

                setStats({
                    totalTrips: tripsCount || 0,
                    totalParticipants: participantsCount || 0,
                    pendingMedical: 12,
                    totalRevenue: 42.8
                });

                // 2. Get recent activity
                const { data: latestInscriptions } = await supabase
                    .from('inscripciones')
                    .select(`
                        id,
                        created_at,
                        estado,
                        profiles:user_id (full_name),
                        viajes:viaje_id (titulo)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (latestInscriptions) {
                    setRecentActivity(latestInscriptions);
                }
            } else {
                // OFFLINE: compute from local DB
                const localTrips = await db.trips.count();
                const localEnrollments = await db.enrollments.count();
                const localRecent = await db.enrollments.orderBy('created_at').reverse().limit(5).toArray();

                setStats({
                    totalTrips: localTrips,
                    totalParticipants: localEnrollments,
                    pendingMedical: 0,
                    totalRevenue: 0
                });
                setRecentActivity(localRecent);
                setIsDataFromCache(true);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
            // Fallback to local data
            try {
                const localTrips = await db.trips.count();
                const localEnrollments = await db.enrollments.count();
                const localRecent = await db.enrollments.orderBy('created_at').reverse().limit(5).toArray();

                setStats({
                    totalTrips: localTrips,
                    totalParticipants: localEnrollments,
                    pendingMedical: 0,
                    totalRevenue: 0
                });
                setRecentActivity(localRecent);
                setIsDataFromCache(true);
            } catch { /* ignore */ }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Panel de Control Admin</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Monitoreo en tiempo real de operaciones de trekking</p>
                    {isDataFromCache && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-500 rounded-full mt-2 border border-amber-500/10">
                            <span className="material-symbols-outlined text-sm">cloud_off</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Modo Montaña — Datos Locales</span>
                        </div>
                    )}
                </div>
                <button className="bg-primary hover:bg-primary/90 text-background-dark font-black py-3 px-8 rounded-xl transition-all flex items-center gap-3 text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined font-black">add_circle</span>
                    Crear Nueva Expedición
                </button>
            </header>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Viajes Activos"
                    value={stats.totalTrips}
                    icon="explore"
                    color="primary"
                    change="+2 esta semana"
                />
                <StatCard
                    title="Total Participantes"
                    value={stats.totalParticipants}
                    icon="groups"
                    color="primary"
                    change="Temporada Actual"
                />
                <StatCard
                    title="Fichas Médicas Pendientes"
                    value={stats.pendingMedical}
                    icon="medical_services"
                    color="amber-500"
                    isWarning
                />
                <StatCard
                    title="Objetivo de Ingresos"
                    value={`$${stats.totalRevenue}k`}
                    icon="payments"
                    color="primary"
                    change="94% Pagado"
                />
            </div>

            {/* Main Management Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ManagementCard
                    title="Gestionar Viajes"
                    description="Ver rutas activas, editar horarios y asignar guías."
                    imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDZfN_X1DtD40kPdHo0azTJqH-elPK81g3AjCJtDhnAvZY4dkYCxOfCWntFBo_XcwT--UEifbc2ipYRkwd6eKSFhgv_i_m2GFVDnYraDGEy-sbjh_u8glO6ra9PebCAcIUOLIl5I2caSCfFVHohLxyoAe-XY8MRmH22tZ7V_OzcNGIe1QBI_eq9eNoGwz1zE-UpDWOp9U6gwprqYgUFTHY5FsMkjhexciN781_Ftcfjqefd4-s_S2cSCy7oMqzJKZ9SC7PmE1qo-Xtq"
                    onClick={() => onNavigate('admin_trips')}
                />
                <ManagementCard
                    title="Gestionar Inscripciones"
                    description="Revisar reservas, seguir pagos y verificar deslindes."
                    imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDicP7fCrMTpianw8Dag7-3eRGzeUyctESfcJUmNDdl-AUGNcOizpwT8J9vQW-o-7zEiD5v-iCPAqZVqbHw-phvQpKoTuoQCXoRZ03KrYDm-pz12244Iwho-w4oJ4d6ItgjXUfOFD8ClW5di1HbeFSwpesvvuZUwwj1v2oVHzywnto3bdvj0Bp0-k60waecwaG6-C2IZSvKQFtRuJGz-gFUU7NJLeVMmXG_w8pLX6ssfbx0yW0V2taUeJXnKxWiujKIhyPY4VhS3NjS"
                    onClick={() => onNavigate('admin_enrollments')}
                />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 h-fit">
                    <h4 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                        Acciones Rápidas
                    </h4>
                    <div className="space-y-3">
                        <QuickActionButton icon="upload_file" label="Exportar Reporte Logístico" />
                        <QuickActionButton icon="mail" label="Notificar a Participantes" />
                        <QuickActionButton icon="inventory_2" label="Checklist de Equipo" />
                        <QuickActionButton icon="warning" label="Modo Reporte Incidente" isAlert />
                    </div>
                </div>

                <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
                            <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                            Actividad Reciente
                        </h4>
                        <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Ver Historial</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                                    <th className="pb-4 font-black text-slate-400">Tipo</th>
                                    <th className="pb-4 font-black text-slate-400">Detalles</th>
                                    <th className="pb-4 font-black text-slate-400 text-right">Tiempo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentActivity.map((act) => (
                                    <tr key={act.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-2.5 sm:py-4">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${act.estado === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {act.estado === 'confirmed' ? 'Inscripción' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 sm:py-4">
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{(act.profiles as any)?.full_name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{(act.viajes as any)?.titulo}</p>
                                        </td>
                                        <td className="py-2.5 sm:py-4 text-right">
                                            <span className="text-[10px] text-slate-500 font-mono italic">
                                                {new Date(act.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, change, isWarning }: any) => (
    <div className={`bg-neutral-900 border border-white/5 p-4 sm:p-6 rounded-2xl transition-all group ${isWarning ? 'ring-1 ring-amber-500/20 hover:border-amber-500/30' : 'hover:border-primary/30'}`}>
        <div className="flex items-center justify-between mb-4">
            <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${isWarning ? 'text-amber-500' : 'text-primary'}`} style={color && !isWarning ? { color } : {}}>{icon}</span>
            {change && (
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                    {change}
                </span>
            )}
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
        <h3 className={`text-2xl sm:text-3xl font-black mt-1 tabular-nums ${isWarning ? 'text-amber-500' : 'text-white'}`}>{value}</h3>
    </div>
);

const ManagementCard = ({ title, description, imageUrl, onClick }: any) => (
    <div
        onClick={onClick}
        className="relative group cursor-pointer overflow-hidden rounded-3xl border border-white/5 bg-neutral-900 aspect-[16/9] lg:aspect-auto h-[200px] sm:h-[300px]"
    >
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/40 to-transparent z-10"></div>
        <div
            className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-all duration-700 bg-cover bg-center group-hover:scale-110"
            style={{ backgroundImage: `url('${imageUrl}')` }}
        ></div>
        <div className="absolute bottom-0 left-0 p-4 sm:p-8 z-20 w-full flex items-end justify-between">
            <div>
                <h4 className="text-xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tighter" dangerouslySetInnerHTML={{ __html: title.replace(' ', '<br/>') }}></h4>
                <p className="text-slate-400 mt-2 max-w-[280px] text-xs font-medium leading-relaxed uppercase tracking-widest">{description}</p>
            </div>
            <div className="bg-primary p-4 rounded-2xl text-background-dark group-hover:translate-x-2 transition-all shadow-xl shadow-primary/20">
                <span className="material-symbols-outlined font-black">arrow_forward</span>
            </div>
        </div>
    </div>
);

const QuickActionButton = ({ icon, label, isAlert }: any) => (
    <button className={`w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left ${isAlert ? 'border-red-500/10 hover:border-red-500/30' : 'hover:border-primary/20'}`}>
        <div className="flex items-center gap-4">
            <span className={`material-symbols-outlined ${isAlert ? 'text-red-500' : 'text-slate-400'}`}>{icon}</span>
            <span className={`text-[11px] font-black uppercase tracking-widest ${isAlert ? 'text-red-400' : 'text-white'}`}>{label}</span>
        </div>
        <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
    </button>
);

export default AdminDashboard;
