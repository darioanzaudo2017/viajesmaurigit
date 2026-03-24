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
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-300 text-xs uppercase tracking-widest mb-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Dashboard
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Gestión de Usuarios</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Administración de niveles de acceso y perfiles académicos</p>
                </div>
                <div className="relative w-full md:w-80">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
                    />
                </div>
            </header>

            <div className="bg-slate-900/30 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto overflow-y-auto max-h-[70vh] no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Usuario</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center">Rol</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center">Trek University</th>
                                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-[0.2em] text-right">Registrado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 italic">Cargando base de datos de usuarios...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 italic">No se encontraron usuarios que coincidan con la búsqueda.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-primary font-black group-hover:scale-110 transition-transform">
                                                    {u.full_name?.substring(0, 2).toUpperCase() || '??'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold uppercase tracking-tight text-sm">{u.full_name || 'Sin Nombre'}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">ID: {u.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <button
                                                    disabled={updatingId === u.id}
                                                    onClick={() => handleToggleRole(u)}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${u.role === 'admin'
                                                            ? 'bg-primary text-background-dark shadow-lg shadow-primary/20'
                                                            : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/20'
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
                                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${u.is_university
                                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                                                            : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/20'
                                                        } disabled:opacity-50`}
                                                >
                                                    <span className="material-symbols-outlined text-xs">
                                                        {u.is_university ? 'school' : 'person'}
                                                    </span>
                                                    {u.is_university ? 'Activo' : 'No'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(u.created_at).toLocaleDateString()}</p>
                                            <p className="text-[9px] text-slate-600 font-mono italic">{new Date(u.created_at).toLocaleTimeString()}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white/[0.02] border-t border-white/5 px-8 py-4 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {filteredUsers.length} Usuarios Encontrados
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
