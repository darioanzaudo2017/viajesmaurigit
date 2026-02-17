import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

interface Trip {
    id?: string;
    titulo: string;
    descripcion: string;
    cupos_totales: number;
    cupos_disponibles: number;
    min_participantes: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    dificultad: string;
    ubicacion: string;
    imagen_url: string;
}

interface TripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    trip?: Trip | null;
}

const TripModal: React.FC<TripModalProps> = ({ isOpen, onClose, onSave, trip }) => {
    const initialState: Trip = {
        titulo: '',
        descripcion: '',
        cupos_totales: 15,
        cupos_disponibles: 15,
        min_participantes: 8,
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'published',
        dificultad: 'Moderate',
        ubicacion: '',
        imagen_url: ''
    };

    const [formData, setFormData] = useState<Trip>(initialState);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (trip) {
            // Format dates for input[type="datetime-local"]
            const formatForInput = (dateStr: string) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                return d.toISOString().slice(0, 16);
            };

            setFormData({
                ...trip,
                cupos_disponibles: trip.cupos_disponibles || 0,
                fecha_inicio: formatForInput(trip.fecha_inicio),
                fecha_fin: formatForInput(trip.fecha_fin)
            });
        } else {
            setFormData(initialState);
        }
    }, [trip, isOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `trips/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('trip-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('trip-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, imagen_url: publicUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Destructure to remove id and other frontend-only fields
            const { id, ...saveData } = formData;

            const dataToSave = {
                ...saveData,
                cupos_disponibles: trip ? trip.cupos_disponibles : formData.cupos_totales
            };

            if (trip?.id) {
                const { error } = await supabase
                    .from('viajes')
                    .update(dataToSave)
                    .eq('id', trip.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('viajes')
                    .insert([dataToSave]);
                if (error) throw error;
            }

            onSave();
            onClose();
        } catch (error) {
            console.error("Error saving trip:", error);
            alert("Error al guardar el viaje");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-8 border-b border-white/10 flex items-center justify-between bg-neutral-800/50">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                            {trip ? 'Editar Expedición' : 'Crear Nueva Expedición'}
                        </h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Configuración logística y técnica</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-neutral-900">
                    {/* Image Upload Header */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Imagen de Portada</label>
                        <div className={`relative group h-48 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden flex flex-col items-center justify-center bg-neutral-800/50 ${formData.imagen_url ? 'border-primary/30' : 'border-white/10 hover:border-primary/50'
                            }`}>
                            {formData.imagen_url ? (
                                <>
                                    <img src={formData.imagen_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imagen_url: '' }))}
                                            className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/30 transition-all"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Imagen Seleccionada</span>
                                    </div>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-3 p-6 w-full h-full group">
                                    <div className="size-12 rounded-full bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-background-dark transition-all">
                                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white uppercase italic">Subir Imagen</p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase mt-1">SVG, PNG, JPG (MAX. 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm flex items-center justify-center z-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Subiendo...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Título del Viaje</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                placeholder="Ej: Champaquí Clásico"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ubicación</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                value={formData.ubicacion}
                                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                                placeholder="Ej: Sierras Grandes, Córdoba"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descripción</label>
                        <textarea
                            rows={3}
                            className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium resize-none"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Detalles de la expedición..."
                        />
                    </div>

                    {/* Logistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Fecha Inicio</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                value={formData.fecha_inicio}
                                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Fecha Fin</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                value={formData.fecha_fin}
                                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Capacity & Technical */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cupos Totales</label>
                            <input
                                required
                                type="number"
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                value={formData.cupos_totales}
                                onChange={(e) => setFormData({ ...formData, cupos_totales: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Min. Confirmación</label>
                            <input
                                required
                                type="number"
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                value={formData.min_participantes}
                                onChange={(e) => setFormData({ ...formData, min_participantes: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Dificultad</label>
                            <select
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium cursor-pointer"
                                value={formData.dificultad}
                                onChange={(e) => setFormData({ ...formData, dificultad: e.target.value })}
                            >
                                <option>Easy</option>
                                <option>Moderate</option>
                                <option>Hard</option>
                                <option>Expert</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Estado del Viaje</label>
                            <select
                                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium cursor-pointer"
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            >
                                <option value="published">Published (Abierto)</option>
                                <option value="confirmed">Confirmed (Confirmado)</option>
                                <option value="cancelled">Cancelled (Cancelado)</option>
                                <option value="finished">Finished (Finalizado)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-neutral-800 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-700 transition-all font-display"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-primary text-background-dark text-[10px] font-black uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 font-display disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : trip ? 'Actualizar Expedición' : 'Crear Expedición'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TripModal;
