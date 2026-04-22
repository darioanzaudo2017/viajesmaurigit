import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

interface UserProfile {
    id: string;
    full_name: string;
    role: 'admin' | 'user';
    is_university: boolean;
    phone: string | null;
    created_at: string;
}

interface AdminUsersPageProps {
    onBack: () => void;
}

const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onBack }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRole = async (user: UserProfile) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`¿Cambiar el rol de ${user.full_name} a ${newRole.toUpperCase()}?`)) return;

        try {
            setUpdatingId(user.id);
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', user.id);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Error al actualizar el rol.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleToggleUniversity = async (user: UserProfile) => {
        const newValue = !user.is_university;

        try {
            setUpdatingId(user.id);
            const { error } = await supabase
                .from('profiles')
                .update({ is_university: newValue })
                .eq('id', user.id);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_university: newValue } : u));
        } catch (error) {
            console.error("Error updating university status:", error);
            alert("Error al actualizar el estado universitario.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8">
                <div className="space-y-1">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-300 text-[10px] uppercase tracking-[0.2em] mb-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Dashboard
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Gestión de Usuarios</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Administración de niveles de acceso y perfiles académicos</p>
                </div>
                <div className="relative w-full md:w-80">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                    />
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm">
                <div className="overflow-x-auto overflow-y-auto max-h-[70vh] scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Usuario</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center">Rol</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center">Trek University</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em] text-right">Registrado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando usuarios...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-2">person_search</span>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">No se encontraron resultados</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary font-black group-hover:scale-110 transition-transform">
                                                    {u.full_name?.substring(0, 2).toUpperCase() || '??'}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 dark:text-white font-bold uppercase tracking-tight text-sm leading-none mb-1">{u.full_name || 'Sin Nombre'}</p>
                                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">#{u.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <button
                                                    disabled={updatingId === u.id}
                                                    onClick={() => handleToggleRole(u)}
                                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${u.role === 'admin'
                                                            ? 'bg-primary text-background-dark shadow-lg shadow-primary/20'
                                                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:border-primary/50'
                                                        } disabled:opacity-50`}
                                                >
                                                    {u.role}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <button
                                                    disabled={updatingId === u.id}
                                                    onClick={() => handleToggleUniversity(u)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${u.is_university
                                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20'
                                                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5 hover:border-blue-500/30'
                                                        } disabled:opacity-50 min-w-[100px] justify-center`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {u.is_university ? 'verified_user' : 'person'}
                                                    </span>
                                                    {u.is_university ? 'Activo' : 'No'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="text-[10px] text-slate-900 dark:text-slate-300 font-bold tracking-tight">{new Date(u.created_at).toLocaleDateString()}</p>
                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono italic">{new Date(u.created_at).toLocaleTimeString()}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5 px-8 py-5 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                        {filteredUsers.length} Usuarios Registrados
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                        <p className="text-[8px] font-black text-primary uppercase tracking-widest">Base de Datos Actualizada</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
