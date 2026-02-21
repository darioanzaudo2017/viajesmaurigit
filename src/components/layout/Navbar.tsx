import React from 'react';
import Logo from '../common/Logo';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onMenuClick: () => void;
    onBack?: () => void;
    breadcrumb?: string;
    user: any;
}

const Navbar: React.FC<NavbarProps> = ({
    activeTab,
    setActiveTab,
    onMenuClick,
    onBack,
    breadcrumb,
    user
}) => {
    // Determinar si mostrar botón atrás
    const showBack = onBack || (activeTab !== 'home' && activeTab !== 'admin_dashboard');

    // Obtener etiqueta legible de la pestaña
    const getTabLabel = () => {
        if (breadcrumb) return breadcrumb;
        switch (activeTab) {
            case 'admin_dashboard': return 'Admin';
            case 'admin_trips': return 'Admin > Viajes';
            case 'admin_enrollments': return 'Admin > Inscripciones';
            case 'admin_soap': return 'Admin > SOAP';
            case 'university': return 'University';
            case 'trips': return 'Explorar';
            case 'medical': return 'Ficha Médica';
            case 'register': return 'Inscripción';
            default: return '';
        }
    };

    return (
        <nav className="h-16 border-b border-white/5 bg-background-dark/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[60] transition-all duration-300">
            <div className="flex items-center gap-4">
                {/* Botón Menú Mobile */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </button>

                {/* Botón Atrás Contextual */}
                {showBack && (
                    <button
                        onClick={onBack || (() => setActiveTab('home'))}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-all border border-white/5 group"
                    >
                        <span className="material-symbols-outlined text-sm font-bold group-hover:-translate-x-1 transition-transform">arrow_back_ios</span>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Volver</span>
                    </button>
                )}

                {/* Logo & Identificador (Solo Desktop o si no hay 'Atras') */}
                <div className="flex items-center gap-4">
                    <Logo
                        className="h-8 hidden sm:block"
                        showText={false}
                        onClick={() => setActiveTab('home')}
                    />

                    {getTabLabel() && (
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
                            <span className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.2em] italic">
                                {getTabLabel()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
                {/* Status Online (Subtle) */}
                <div className="items-center gap-2 hidden md:flex">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/70">System Active</p>
                </div>

                {/* User Info / Profile */}
                {user ? (
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                        <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-black text-white uppercase tracking-tight leading-none">
                                {user.profile?.full_name?.split(' ')[0] || 'Senderista'}
                            </p>
                            <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-0.5">
                                {user.profile?.role === 'admin' ? 'STAFF' : 'MEMBER'}
                            </p>
                        </div>
                        <div
                            className="h-9 w-9 rounded-xl bg-cover bg-center border border-primary/30 cursor-pointer hover:border-primary transition-all shadow-lg shadow-primary/10"
                            onClick={() => setActiveTab('medical')}
                            style={{ backgroundImage: user.user_metadata?.avatar_url ? `url(${user.user_metadata.avatar_url})` : "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100')" }}
                        ></div>
                    </div>
                ) : (
                    <button
                        onClick={() => setActiveTab('medical')}
                        className="bg-primary text-background-dark px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
