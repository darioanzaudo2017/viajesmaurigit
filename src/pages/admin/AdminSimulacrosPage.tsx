import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { generateMedicalPDF } from '../../utils/pdfGenerator';

interface Simulacro {
    id: string;
    paciente_nombre: string;
    alumno_nombre?: string;
    viaje_id: string;
    created_at: string;
    user_id: string;
    // Campos clínicos ahora planos
    hora_incidente?: string;
    referencia_viaje?: string;
    severity?: string;
    escena?: string;
    e_sintoma?: string;
    e_alergias?: string;
    e_medicacion?: string;
    e_historia_pasada?: string;
    e_ultima_ingesta?: string;
    e_eventos?: string;
    signos_vitales?: any[];
    sv_piel?: string;
    examen_fisico?: string;
    evaluacion_guia?: string;
    observaciones?: string;
    notas_adicionales?: string;
    problemas?: any[];
    profiles?: {
        full_name: string;
    };
    viajes?: {
        titulo: string;
    };
}

interface AdminSimulacrosPageProps {
    onBack: () => void;
}

const AdminSimulacrosPage: React.FC<AdminSimulacrosPageProps> = ({ onBack }) => {
    const [simulacros, setSimulacros] = useState<Simulacro[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSimulacro, setSelectedSimulacro] = useState<Simulacro | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchSimulacros();
    }, []);

    const fetchSimulacros = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reportes_soap')
                .select('*, profiles:user_id(full_name), viajes:viaje_id(titulo)')
                .eq('es_simulacro', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSimulacros(data || []);
        } catch (error) {
            console.error("Error fetching simulacros:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (sim: Simulacro) => {
        try {
            setIsGenerating(true);
            const fileName = `SIM_ADMIN_${sim.paciente_nombre.replace(/\s+/g, '_')}_${new Date(sim.created_at).toLocaleDateString().replace(/\//g, '-')}`;

            const soapData = {
                patientName: sim.paciente_nombre,
                incidentTime: sim.hora_incidente || 'N/A',
                location: sim.referencia_viaje || 'N/A',
                severity: sim.severity || 'mod',
                scene: sim.escena || 'No especificada',
                symptoms: sim.e_sintoma || 'N/A',
                allergies: sim.e_alergias || 'Ninguna conocida',
                medications: sim.e_medicacion || 'N/A',
                history: sim.e_historia_pasada || 'N/A',
                lastIntake: sim.e_ultima_ingesta || 'N/A',
                events: sim.e_eventos || 'N/A',
                vitals: (sim.signos_vitales || []).map((sv: any) => ({
                    time: sv.hora,
                    pulse: sv.pulso || '-',
                    resp: sv.respiracion || '-',
                    bp: sv.presion || '-',
                    spo2: sv.spo2 || '-',
                    temp: sv.temperatura || '-',
                    avdi: sv.avdi || '-',
                    skin: sv.piel || '-'
                })),
                skin: sim.sv_piel || 'No especificado',
                examenFisico: sim.examen_fisico || '',
                assessment: sim.evaluacion_guia || 'Sin evaluación',
                plan: sim.observaciones || 'Sin plan',
                responsibleId: sim.user_id || 'N/A',
                alumnoNombre: sim.alumno_nombre || sim.profiles?.full_name || 'Estudiante',
                viajeNombre: sim.viajes?.titulo || 'Simulacro ISAUI',
                isSimulation: true,
                problemas: (sim.problemas || []).map((p: any) => ({
                    problema: p.problema || p.maestro?.problema || 'N/A',
                    anticipado: p.problema_anticipado || p.maestro?.problema_anticipado || 'N/A',
                    tratamiento: p.tratamiento || p.maestro?.tratamiento_sugerido || 'N/A',
                    observacion: p.observacion_especifica || 'Sin observaciones'
                })),
                notasAdicionales: sim.notas_adicionales || ''
            };

            await generateMedicalPDF('', fileName, '#ffffff', { type: 'soap', content: soapData });
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteSimulacro = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        
        if (!window.confirm('¿Estás seguro de que deseas eliminar este simulacro permanentemente? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('reportes_soap')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSimulacros(prev => prev.filter(s => s.id !== id));
            if (selectedSimulacro?.id === id) {
                setSelectedSimulacro(null);
            }
        } catch (error) {
            console.error("Error deleting simulacro:", error);
            alert("No se pudo eliminar el simulacro.");
        }
    };

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
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Simulacros Académicos</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Supervisión de prácticas clínicas SOAP realizadas por estudiantes</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl">
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-1">Total Registros</p>
                        <p className="text-2xl font-black text-white leading-none">{simulacros.length}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List Column */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Historial de Prácticas</h3>
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 italic">Cargando simulacros...</div>
                    ) : simulacros.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 italic bg-white/5 rounded-3xl border border-white/10">No se han realizado simulacros aún.</div>
                    ) : (
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                            {simulacros.map((sim) => (
                                <div
                                    key={sim.id}
                                    onClick={() => setSelectedSimulacro(sim)}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer group ${selectedSimulacro?.id === sim.id
                                            ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5'
                                            : 'bg-white/5 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-white/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-xl">clinical_notes</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-tight">{sim.profiles?.full_name || sim.alumno_nombre || 'Estudiante'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(sim.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black px-2 py-1 bg-white/10 text-slate-400 rounded uppercase tracking-widest">SOAP</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadPDF(sim);
                                                }}
                                                className="size-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-background-dark transition-all flex items-center justify-center border border-primary/20"
                                                title="Descargar PDF"
                                                disabled={isGenerating}
                                            >
                                                <span className="material-symbols-outlined text-sm">{isGenerating ? 'hourglass_top' : 'picture_as_pdf'}</span>
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteSimulacro(e, sim.id)}
                                                className="size-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
                                                title="Eliminar Simulacro"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                        <div className="flex flex-col">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Paciente</p>
                                            <p className="text-xs text-white font-bold uppercase italic">{sim.paciente_nombre}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Salida</p>
                                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-tight">{sim.viajes?.titulo || 'Simulacro General'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Column */}
                <div className="bg-slate-900/50 border border-white/10 rounded-[32px] overflow-hidden flex flex-col h-[75vh] shadow-2xl">
                    {selectedSimulacro ? (
                        <>
                            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight">Reporte Clínico</h4>
                                        <span className="px-3 py-1 bg-primary text-background-dark text-[9px] font-black uppercase rounded-lg">
                                            Finalizado
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">Analizando desempeño de <span className="text-primary font-bold">{selectedSimulacro.profiles?.full_name || selectedSimulacro.alumno_nombre}</span></p>
                                </div>
                                <button 
                                    onClick={() => handleDownloadPDF(selectedSimulacro)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-background-dark font-black text-[10px] uppercase tracking-widest hover:scale-[1.05] transition-all active:scale-95 shadow-lg shadow-primary/20"
                                    disabled={isGenerating}
                                >
                                    <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                    {isGenerating ? 'Generando...' : 'Exportar PDF'}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                                {/* Paciente & Escena */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">Identificación del Paciente</p>
                                        <p className="text-lg font-bold text-white uppercase tracking-tight italic">{selectedSimulacro.paciente_nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">Escena / Incidente Detallado</p>
                                        <p className="text-sm font-medium text-slate-300 leading-relaxed">{selectedSimulacro.escena || 'No especificada'}</p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5"></div>

                                {/* Secciones SOAP */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <DetailSection
                                        label="Subjetivo (SAMPLE)"
                                        content={[
                                            { k: 'Síntomas', v: selectedSimulacro.e_sintoma },
                                            { k: 'Alergias', v: selectedSimulacro.e_alergias },
                                            { k: 'Medicación', v: selectedSimulacro.e_medicacion }
                                        ]}
                                    />
                                    <DetailSection
                                        label="Historia Pasada y Eventos"
                                        content={[
                                            { k: 'Antecedentes', v: selectedSimulacro.e_historia_pasada },
                                            { k: 'Última Ingesta', v: selectedSimulacro.e_ultima_ingesta },
                                            { k: 'Eventos Previos', v: selectedSimulacro.e_eventos }
                                        ]}
                                    />
                                </div>

                                <div className="h-px bg-white/5"></div>

                                {/* Objetivo (Signos Vitales) */}
                                <div>
                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">monitor_heart</span>
                                        Examen Objetivo (Signos Vitales)
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <VitalDisplay label="Pulso" value={selectedSimulacro.signos_vitales?.[0]?.pulso} unit="LPM" />
                                        <VitalDisplay label="Resp" value={selectedSimulacro.signos_vitales?.[0]?.respiracion} unit="RPM" />
                                        <VitalDisplay label="T.A." value={selectedSimulacro.signos_vitales?.[0]?.presion} />
                                        <VitalDisplay label="SpO2" value={selectedSimulacro.signos_vitales?.[0]?.spo2} unit="%" />
                                    </div>
                                </div>

                                <div className="h-px bg-white/5"></div>

                                {/* Plan & Observaciones */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">Evaluación A/P</p>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed italic">
                                            {selectedSimulacro.evaluacion_guia || 'Sin evaluación registrada.'}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">Plan de Tratamiento</p>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed italic">
                                            {selectedSimulacro.observaciones || 'Sin plan detallado.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-30">
                            <div className="size-24 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 mb-2">
                                <span className="material-symbols-outlined text-6xl">visibility</span>
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.3em] max-w-[200px]">Selecciona una práctica para auditar el reporte</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailSection = ({ label, content }: { label: string, content: { k: string, v: string | undefined }[] }) => (
    <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <div className="space-y-3">
            {content.map((c, i) => (
                <div key={i}>
                    <p className="text-[9px] font-bold text-primary italic uppercase mb-1">{c.k}</p>
                    <p className="text-xs text-white/80 leading-relaxed">{c.v || 'N/A'}</p>
                </div>
            ))}
        </div>
    </div>
);

const VitalDisplay = ({ label, value, unit }: { label: string, value: string, unit?: string }) => (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-white">
            {value || '--'}
            {value && unit && <span className="text-[8px] text-slate-400 ml-1">{unit}</span>}
        </p>
    </div>
);

export default AdminSimulacrosPage;
