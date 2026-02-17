import React from 'react';
import { db } from '../api/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { syncPendingRegistrations } from '../api/sync';

const DashboardPage: React.FC = () => {
    const pendingRegistrations = useLiveQuery(
        () => db.registrations.where('status').notEqual('synced').toArray()
    );

    return (
        <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="material-symbols-outlined text-[14px]">dashboard_customize</span>
                    <span>Panel de Control de Expedición</span>
                </div>
                <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight uppercase">Dashboard Operativo</h1>
                <p className="text-slate-500 dark:text-trek-text-muted text-base font-normal">Estado actual de tus rutas, participantes y sincronización offline.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Viajes Activos"
                    value="12"
                    change="+2% desde el mes pasado"
                    icon="hiking"
                    trend="up"
                />
                <StatCard
                    title="Total Participantes"
                    value="148"
                    change="Tráfico estable"
                    icon="group"
                    trend="neutral"
                />
                <StatCard
                    title="Fichas Médicas Pendientes"
                    value="5"
                    change="Requiere atención"
                    icon="medical_services"
                    trend="warning"
                />
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recent Activity & Upcoming Treks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">event_upcoming</span>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Actividad Reciente y Próximos Treks</h3>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg transition-all">Ver Todo</button>
                    </div>
                    <div className="bg-white dark:bg-trek-surface border border-slate-200 dark:border-trek-border rounded-[24px] overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-trek-elevated border-b border-slate-200 dark:border-trek-border">
                                    <tr>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-trek-text-muted/60">Viaje</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-trek-text-muted/60">Fechas</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-trek-text-muted/60">Guía Líder</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-trek-text-muted/60 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#234833]">
                                    <TableRow
                                        name="Champaquí Clásico"
                                        location="Sierras Grandes, Córdoba"
                                        dates="12-15 Nov"
                                        guide="Luis Mauri"
                                        status="Confirmado"
                                    />
                                    <TableRow
                                        name="Los Gigantes Trek"
                                        location="Sierras Grandes, Córdoba"
                                        dates="18-20 Nov"
                                        guide="Carlos Pérez"
                                        status="Pendiente"
                                    />
                                    <TableRow
                                        name="Quebrada del Condorito"
                                        location="Parque Nacional, Córdoba"
                                        dates="22 Nov"
                                        guide="Ana Martínez"
                                        status="En Curso"
                                    />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sync & Offline Status */}
                <div className="space-y-8">
                    <div className="px-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">cloud_sync</span>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Estado de Datos</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-trek-surface border border-slate-200 dark:border-trek-border rounded-[24px] p-8 shadow-2xl shadow-primary/5 flex flex-col gap-8 relative overflow-hidden">
                        {/* Status Pattern Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                                </span>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Modo Online</span>
                            </div>
                            <button
                                onClick={() => syncPendingRegistrations()}
                                className="text-[10px] font-black uppercase tracking-widest bg-slate-900 dark:bg-primary text-white dark:text-[#102218] px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm font-black">sync</span>
                                Forzar Sinc.
                            </button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="p-5 bg-slate-50 dark:bg-trek-elevated rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                        <span className="material-symbols-outlined text-xl">database</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Salud del Cache Local</p>
                                        <p className="text-[10px] text-slate-400 dark:text-trek-text-muted/60 font-bold uppercase tracking-widest">Almacenamiento activo en dispositivo</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-trek-text-muted">Integridad de Datos</p>
                                        <p className="text-[10px] font-black text-primary uppercase">95%</p>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-trek-surface h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[95%] rounded-full shadow-[0_0_8px_rgba(19,236,109,0.5)]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 dark:text-trek-text-muted/60 uppercase tracking-[0.3em] pl-2">Sincronizaciones Pendientes ({pendingRegistrations?.length || 0})</p>
                                <div className="space-y-3">
                                    {pendingRegistrations && pendingRegistrations.length > 0 ? (
                                        pendingRegistrations.map(reg => (
                                            <PendingItem
                                                key={reg.id}
                                                name={`Inscripción: ${reg.trip_id}`}
                                                time={new Date(reg.created_at).toLocaleTimeString()}
                                                type="assignment"
                                                status={reg.status}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                                            <p className="text-[10px] text-slate-400 dark:text-trek-text-muted/40 font-black uppercase tracking-widest">No hay datos esperando sincronización</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Alerts */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 flex gap-4 animate-pulse">
                        <div className="size-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                            <span className="material-symbols-outlined text-2xl font-black">emergency</span>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-1">Alerta de Seguridad</p>
                            <p className="text-[11px] text-orange-500/80 font-bold leading-relaxed tracking-tight">5 participantes para 'Los Gigantes Trek' no han completado el formulario de aptitud médica.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon, trend }: any) => (
    <div className="bg-white dark:bg-trek-surface border border-slate-200 dark:border-trek-border p-8 rounded-[24px] flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all group">
        <div className="flex justify-between items-start">
            <div className="p-3 bg-slate-50 dark:bg-trek-elevated rounded-2xl border border-slate-100 dark:border-white/5 text-slate-400 dark:text-trek-text-muted group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-2xl font-black">{icon}</span>
            </div>
            <div className={`${trend === 'warning' ? 'bg-orange-500/10 text-orange-500' : trend === 'up' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-400'} px-3 py-1.5 rounded-xl border border-white/5`}>
                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm font-black">{trend === 'up' ? 'trending_up' : trend === 'neutral' ? 'remove' : 'warning'}</span>
                    {trend === 'up' ? '+2.4%' : trend === 'warning' ? 'Alerta' : 'Estable'}
                </span>
            </div>
        </div>
        <div>
            <p className="text-slate-400 dark:text-trek-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
            <p className="text-slate-900 dark:text-white text-4xl font-black tabular-nums">{value}</p>
        </div>
        <p className={`${trend === 'warning' ? 'text-orange-500' : trend === 'up' ? 'text-primary' : 'text-slate-400'} text-[9px] font-black uppercase tracking-widest mt-2`}>
            {change}
        </p>
    </div>
);

const TableRow = ({ name, location, dates, guide, status }: any) => (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-trek-elevated/50 transition-colors group">
        <td className="px-6 py-6 border-b border-transparent">
            <div className="flex flex-col">
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-base group-hover:text-primary transition-colors">{name}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-trek-text-muted/60 uppercase tracking-widest mt-0.5">{location}</span>
            </div>
        </td>
        <td className="px-6 py-6 border-b border-transparent">
            <span className="text-sm font-bold text-slate-700 dark:text-white font-mono">{dates}</span>
        </td>
        <td className="px-6 py-6 border-b border-transparent">
            <span className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">{guide}</span>
        </td>
        <td className="px-6 py-6 border-b border-transparent text-center">
            <span className={`${status === 'Confirmado' ? 'bg-primary/20 text-primary border-primary/30' : status === 'En Curso' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-300 border-white/10'} text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border`}>
                {status}
            </span>
        </td>
    </tr>
);

const PendingItem = ({ name, time, type, status }: any) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${status === 'error' ? 'border-red-500/50 bg-red-500/5' : 'border-slate-200 dark:border-trek-border bg-white dark:bg-trek-surface hover:shadow-lg shadow-primary/5 hover:scale-[1.02]'}`}>
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                <span className="material-symbols-outlined text-lg font-black">{type}</span>
            </div>
            <div>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{name}</p>
                <p className="text-[9px] text-slate-400 dark:text-trek-text-muted/60 font-bold uppercase tracking-widest mt-0.5">Capturado: {time}</p>
            </div>
        </div>
        <span className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border ${status === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
            {status === 'error' ? 'Error' : 'Listo'}
        </span>
    </div>
);

export default DashboardPage;
