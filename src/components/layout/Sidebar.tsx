import React from 'react';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import Logo from '../common/Logo';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: any;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, isOpen, onClose, isDarkMode, toggleTheme }) => {
    const { isOnline, pendingReportsCount, syncing } = useOfflineSync();
    const isAdmin = user?.profile?.role === 'admin';

    const menuItems = [
        { id: 'home', icon: 'home', label: 'Inicio' },
        { id: 'trips', icon: 'explore', label: 'Descubrir' },
        { id: 'medical', icon: 'medical_information', label: 'Ficha Médica' },
        { id: 'register', icon: 'app_registration', label: 'Inscripción', hidden: isAdmin },
        // Admin Profile Items
        { id: 'admin_dashboard', icon: 'dashboard', label: 'Dashboard', adminOnly: true },
        { id: 'admin_users', icon: 'group', label: 'Usuarios', adminOnly: true },
        { id: 'admin_trips', icon: 'map', label: 'Viajes', adminOnly: true },
        { id: 'admin_enrollments', icon: 'assignment_ind', label: 'Inscripciones', adminOnly: true },
        { id: 'university', icon: 'school', label: 'ISAUI' },
        { id: 'safety', icon: 'health_and_safety', label: 'Protocolos' },
    ].filter(item => {
        if (item.adminOnly && !isAdmin) return false;
        if (item.hidden) return false;
        return true;
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed lg:relative inset-y-0 left-0 w-64 border-r border-slate-200 dark:border-white/5 flex flex-col bg-white dark:bg-background-dark h-full transition-all duration-300 z-[100] transform overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 flex items-center justify-between lg:hidden">
                    <Logo className="h-8" variant={isDarkMode ? "neon" : "light"} showText={true} />
                    <button onClick={onClose} className="p-2 text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="h-6 hidden lg:block"></div> {/* Espaciador Desktop */}
                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                onClose();
                            }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeTab === item.id
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-trek-elevated text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <p className="text-sm font-medium">{item.label}</p>
                        </div>
                    ))}
                </nav>
                <div className="p-4 space-y-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('trips')}
                        className="w-full bg-primary hover:bg-primary/90 text-[#112218] py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">travel_explore</span>
                        <span>Descubrir Viajes</span>
                    </button>

                    {user && (
                        <div className="mb-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {user.profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {user.profile?.full_name || user.email?.split('@')[0]}
                                    </p>
                                    <p className="text-[10px] text-trek-text-muted font-black uppercase tracking-widest">
                                        {user.profile?.role === 'admin' ? 'Administrador' : 'Senderista'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {user && (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={toggleTheme}
                                className="w-full bg-slate-100 dark:bg-white/5 hover:bg-primary/10 text-slate-600 dark:text-slate-400 hover:text-primary py-2.5 rounded-lg text-xs font-bold flex items-center justify-between px-4 transition-all active:scale-95 border border-transparent hover:border-primary/20"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">
                                        {isDarkMode ? 'light_mode' : 'dark_mode'}
                                    </span>
                                    <span>Modo {isDarkMode ? 'Claro' : 'Oscuro'}</span>
                                </div>
                                <div className={`w-8 h-4 rounded-full bg-slate-300 dark:bg-slate-700 relative transition-colors`}>
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${isDarkMode ? 'left-4.5' : 'left-0.5'}`}></div>
                                </div>
                            </button>

                            <button
                                onClick={onLogout}
                                className="w-full bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-500 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-transparent hover:border-red-500/20"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}

                    {/* Offline Status & Version */}
                    <div className="pt-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <div className={`size-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        {isOnline ? 'Conectado' : 'Modo Montaña'}
                                    </span>
                                </div>
                                {pendingReportsCount > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                                        <span className={`material-symbols-outlined text-[10px] text-primary ${syncing ? 'animate-spin' : ''}`}>sync</span>
                                        <span className="text-[8px] font-black uppercase text-primary tracking-tighter">{pendingReportsCount} pendientes</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="px-2 flex items-center justify-between">
                                <p className="text-[8px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">history</span>
                                    <span>v1.0.{new Date(__COMMIT_DATE__ as string).getTime().toString().slice(-4)}</span>
                                </p>
                                <p className="text-[8px] font-medium text-slate-400 dark:text-slate-500">
                                    Actualizado: {new Date(__COMMIT_DATE__ as string).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
