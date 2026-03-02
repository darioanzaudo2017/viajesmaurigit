import React from 'react';

interface BottomNavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: any;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab, setActiveTab, user }) => {
    const isAdmin = user?.profile?.role === 'admin';

    const navItems = [
        { id: 'home', label: 'Inicio', icon: 'home' },
        { id: 'trips', label: 'Viajes', icon: 'explore' },
        { id: 'medical', label: 'Ficha', icon: 'medical_information' },
        ...(isAdmin ? [{ id: 'admin_dashboard', label: 'Admin', icon: 'admin_panel_settings' }] : []),
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 px-4 pb-safe-area-inset-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id ||
                        (item.id === 'admin_dashboard' && activeTab.startsWith('admin_'));

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="flex flex-col items-center gap-1 relative group w-16"
                        >
                            <div className={`transition-all duration-300 ${isActive ? 'text-primary transform -translate-y-1' : 'text-slate-500'}`}>
                                <span className={`material-symbols-outlined text-2xl ${isActive ? 'font-black' : ''}`}>
                                    {item.icon}
                                </span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'text-primary opacity-100' : 'text-slate-600 opacity-60'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute -top-1 size-1 bg-primary rounded-full shadow-[0_0_10px_rgba(19,236,109,0.8)] animate-pulse"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavbar;
