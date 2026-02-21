import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

interface NewsItem {
    id: string;
    titulo: string;
    subtitulo: string;
    contenido: string;
    categoria: string;
    imagen_url: string;
    autor: string;
    created_at: string;
    fecha_publicacion: string;
}

interface AdminNewsPageProps {
    onBack: () => void;
}

const AdminNewsPage: React.FC<AdminNewsPageProps> = ({ onBack }) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('novedades_universitarias')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNews(data || []);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { id, ...dataToSave } = currentNews;

            if (id) {
                const { error } = await supabase
                    .from('novedades_universitarias')
                    .update(dataToSave)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('novedades_universitarias')
                    .insert([dataToSave]);
                if (error) throw error;
            }

            setShowModal(false);
            setCurrentNews({});
            fetchNews();
        } catch (error) {
            console.error("Error saving news:", error);
            alert("Error al guardar la novedad");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta novedad?")) return;
        try {
            const { error } = await supabase
                .from('novedades_universitarias')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchNews();
        } catch (error) {
            console.error("Error deleting news:", error);
        }
    };

    const openModal = (item?: NewsItem) => {
        setCurrentNews(item || {
            categoria: 'Infraestructura',
            autor: 'TrekManager Admin',
            fecha_publicacion: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-300 text-xs uppercase tracking-widest mb-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Dashboard
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Gestionar Novedades Universitarias</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Crea y edita el contenido informativo para la comunidad académica</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary hover:bg-primary/90 text-background-dark font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <span className="material-symbols-outlined font-black">add_circle</span>
                    Nueva Novedad
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">Cargando novedades...</div>
                ) : news.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">No hay novedades registradas aún.</div>
                ) : (
                    news.map((item) => (
                        <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-primary/30 transition-all flex flex-col">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={item.imagen_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800"}
                                    alt={item.titulo}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-primary text-background-dark text-[10px] font-black uppercase rounded-lg shadow-lg">
                                        {item.categoria}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col space-y-4">
                                <div>
                                    <h4 className="text-white font-bold text-lg leading-tight line-clamp-2">{item.titulo}</h4>
                                    <p className="text-slate-500 text-xs mt-2 italic">Por {item.autor} • {new Date(item.fecha_publicacion).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2 pt-4 border-t border-slate-800 mt-auto">
                                    <button
                                        onClick={() => openModal(item)}
                                        className="flex-1 py-2.5 bg-white/5 hover:bg-primary hover:text-background-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="w-11 h-11 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Editor Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-background-dark/80 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                {currentNews.id ? 'Editar Novedad' : 'Nueva Novedad'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                        placeholder="Título de la noticia"
                                        value={currentNews.titulo || ''}
                                        onChange={e => setCurrentNews({ ...currentNews, titulo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoría</label>
                                    <select
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white focus:border-primary/50 outline-none transition-all appearance-none"
                                        value={currentNews.categoria || 'Infraestructura'}
                                        onChange={e => setCurrentNews({ ...currentNews, categoria: e.target.value })}
                                    >
                                        <option value="Infraestructura">Infraestructura</option>
                                        <option value="Academia">Academia</option>
                                        <option value="Estudiantes">Estudiantes</option>
                                        <option value="Eventos">Eventos</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subtítulo / Lead</label>
                                <input
                                    type="text"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white focus:border-primary/50 outline-none transition-all"
                                    placeholder="Breve resumen o bajada"
                                    value={currentNews.subtitulo || ''}
                                    onChange={e => setCurrentNews({ ...currentNews, subtitulo: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Imagen URL</label>
                                <input
                                    type="url"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white focus:border-primary/50 outline-none transition-all font-mono text-xs"
                                    placeholder="https://images.unsplash.com/..."
                                    value={currentNews.imagen_url || ''}
                                    onChange={e => setCurrentNews({ ...currentNews, imagen_url: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Autor</label>
                                    <input
                                        type="text"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white focus:border-primary/50 outline-none transition-all"
                                        value={currentNews.autor || 'TrekManager Admin'}
                                        onChange={e => setCurrentNews({ ...currentNews, autor: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha de Publicación</label>
                                    <input
                                        type="date"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white focus:border-primary/50 outline-none transition-all font-mono"
                                        value={currentNews.fecha_publicacion || ''}
                                        onChange={e => setCurrentNews({ ...currentNews, fecha_publicacion: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contenido (Prose)</label>
                                <textarea
                                    required
                                    rows={8}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-primary/50 outline-none transition-all resize-none"
                                    placeholder="Escribe el cuerpo de la noticia aquí..."
                                    value={currentNews.contenido || ''}
                                    onChange={e => setCurrentNews({ ...currentNews, contenido: e.target.value })}
                                />
                            </div>

                            <button
                                disabled={saving}
                                className="w-full h-16 bg-primary text-background-dark font-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <div className="size-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">save</span>
                                        Guardar Novedad
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNewsPage;
