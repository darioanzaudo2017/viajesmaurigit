import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import SoapForm from '../components/soap/SoapForm';
import type { SoapReport } from '../components/soap/SoapForm';
import { generateMedicalPDF } from '../utils/pdfGenerator';

interface UniversityPageProps {
    onNavigateNews: () => void;
}

const UniversityPage: React.FC<UniversityPageProps> = ({ onNavigateNews }) => {
    const [showSoapForm, setShowSoapForm] = useState(false);
    const [simulations, setSimulations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentReport, setCurrentReport] = useState<SoapReport>({
        referencia_viaje: '',
        hora_incidente: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        escena: '',
        e_sintoma: '',
        e_alergias: '',
        e_medicacion: '',
        e_historia_pa: '',
        e_ultima_inge: '',
        e_eventos: '',
        signos_vitales: [{
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            pulso: '',
            respiracion: '',
            presion: '',
            spo2: '',
            temperatura: '',
            avdi: 'A (Alerta)'
        }],
        sv_piel: '',
        observacione: '',
        evaluacion_guia: '',
        responsable_id: 'STUDENT-UNI',
        severity: 'mod'
    });
    const [patientName, setPatientName] = useState('');
    const [isEnteringName, setIsEnteringName] = useState(false);
    const [isUniversityUser, setIsUniversityUser] = useState<boolean | null>(null);

    useEffect(() => {
        fetchSimulations();
    }, []);

    const fetchSimulations = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch profile to check is_university flag
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_university')
                .eq('id', user.id)
                .single();

            const isUni = !!profile?.is_university;
            setIsUniversityUser(isUni);

            if (isUni) {
                const { data, error } = await supabase
                    .from('simulacros_soap')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setSimulations(data || []);
            }
        } catch (error) {
            console.error("Error fetching simulations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setCurrentReport({
            referencia_viaje: '',
            hora_incidente: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            escena: '',
            e_sintoma: '',
            e_alergias: '',
            e_medicacion: '',
            e_historia_pa: '',
            e_ultima_inge: '',
            e_eventos: '',
            signos_vitales: [{
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                pulso: '',
                respiracion: '',
                presion: '',
                spo2: '',
                temperatura: '',
                avdi: 'A (Alerta)'
            }],
            sv_piel: '',
            observacione: '',
            evaluacion_guia: '',
            responsable_id: 'STUDENT-UNI',
            severity: 'mod'
        });
        setPatientName('');
        setIsEnteringName(true);
        setShowSoapForm(true);
    };

    const handleEdit = (sim: any) => {
        setCurrentReport(sim.data);
        setPatientName(sim.paciente_nombre);
        setIsEnteringName(false);
        setShowSoapForm(true);
    };

    const handleSaveSimulation = async (isFinal: boolean) => {
        if (!patientName) {
            alert("Por favor ingrese el nombre del paciente para la simulación.");
            return;
        }

        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const payload = {
                user_id: user.id,
                paciente_nombre: patientName,
                data: { ...currentReport, estado: isFinal ? 'finalizado' : 'borrador' },
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('simulacros_soap')
                .upsert(payload);

            if (error) throw error;

            alert(isFinal ? "Simulacro finalizado y guardado con éxito" : "Borrador de simulación guardado");
            setShowSoapForm(false);
            fetchSimulations();
        } catch (error) {
            console.error("Error saving simulation:", error);
            alert("Error al guardar el simulacro.");
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setIsGenerating(true);
            const fileName = `SIMULACRO_${patientName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

            const soapData = {
                patientName: patientName,
                incidentTime: currentReport.hora_incidente || 'N/A',
                location: currentReport.referencia_viaje || 'N/A',
                severity: currentReport.severity || 'mod',
                scene: currentReport.escena || 'No especificada',
                symptoms: currentReport.e_sintoma || 'N/A',
                allergies: currentReport.e_alergias || 'Ninguna conocida',
                medications: currentReport.e_medicacion || 'N/A',
                history: currentReport.e_historia_pa || 'N/A',
                lastIntake: currentReport.e_ultima_inge || 'N/A',
                events: currentReport.e_eventos || 'N/A',
                vitals: currentReport.signos_vitales.map(sv => ({
                    time: sv.hora,
                    pulse: sv.pulso || '-',
                    resp: sv.respiracion || '-',
                    bp: sv.presion || '-',
                    spo2: sv.spo2 || '-',
                    temp: sv.temperatura || '-',
                    avdi: sv.avdi || '-'
                })),
                skin: currentReport.sv_piel || 'No especificado',
                assessment: currentReport.evaluacion_guia || 'Sin evaluación',
                plan: currentReport.observacione || 'Sin plan',
                responsibleId: currentReport.responsable_id || 'N/A'
            };

            await generateMedicalPDF('', fileName, '#ffffff', { type: 'soap', content: soapData });
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (showSoapForm) {
        return (
            <div className="bg-background-dark min-h-screen">
                <SoapForm
                    report={currentReport}
                    setReport={setCurrentReport as any}
                    onSave={handleSaveSimulation}
                    onCancel={() => setShowSoapForm(false)}
                    patientName={patientName}
                    patientId="SIM-PRÁCTICA"
                    saving={saving}
                    isSimulation={true}
                    title="Simulacro"
                    onDownloadPDF={handleDownloadPDF}
                    isGenerating={isGenerating}
                />
                {/* Overlay for providing names in simulation mode */}
                {isEnteringName && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-primary/20 p-8 rounded-[32px] max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Iniciar Práctica</h2>
                            <p className="text-slate-400 text-sm mb-6">Para comenzar la simulación, asigne un nombre ficticio a su paciente.</p>
                            <input
                                autoFocus
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-6"
                                placeholder="Nombre Completo del Paciente..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && patientName) setIsEnteringName(false);
                                }}
                            />
                            <div className="flex gap-4">
                                <button onClick={() => {
                                    setShowSoapForm(false);
                                    setIsEnteringName(false);
                                }} className="flex-1 px-6 py-4 rounded-2xl bg-slate-800 text-slate-300 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all">Cancelar</button>
                                <button
                                    disabled={!patientName}
                                    onClick={() => setIsEnteringName(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-primary text-background-dark font-black uppercase tracking-widest text-[10px] hover:shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    Comenzar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col rugged-grid overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <style>
                {`
                .rugged-grid {
                    background-image: radial-gradient(circle, #1a2e22 1px, transparent 1px);
                    background-size: 30px 30px;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                `}
            </style>

            <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 md:px-10 py-8 gap-10">
                {/* News Slider Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-100 text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">campaign</span>
                            Actualizaciones del Campus
                        </h3>
                        <a className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline" href="#">
                            Ver todas <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </a>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x no-scrollbar">
                        {/* News Card 1 */}
                        <div onClick={onNavigateNews} className="flex-none w-80 md:w-96 snap-start group cursor-pointer transition-all active:scale-[0.98]">
                            <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-800 mb-4 bg-slate-800">
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent z-10"></div>
                                <img alt="Medical Facility" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" />
                                <div className="absolute bottom-4 left-4 z-20">
                                    <span className="px-2 py-1 bg-primary text-background-dark text-[10px] font-bold uppercase rounded tracking-wider shadow-lg shadow-primary/20">Infraestructura</span>
                                </div>
                            </div>
                            <h4 className="text-slate-100 font-bold text-lg leading-tight group-hover:text-primary transition-colors">Apertura del Nuevo Centro de Simulación Médica</h4>
                            <p className="text-slate-400 text-sm mt-2 line-clamp-2">Equipado con tecnología de punta para prácticas de respuesta inmediata y reportes SOAP avanzados.</p>
                        </div>
                        {/* News Card 2 */}
                        <div onClick={onNavigateNews} className="flex-none w-80 md:w-96 snap-start group cursor-pointer transition-all active:scale-[0.98]">
                            <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-800 mb-4 bg-slate-800">
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent z-10"></div>
                                <img alt="Training Session" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" />
                                <div className="absolute bottom-4 left-4 z-20">
                                    <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase rounded tracking-wider">Capacitación</span>
                                </div>
                            </div>
                            <h4 className="text-slate-100 font-bold text-lg leading-tight group-hover:text-primary transition-colors">Taller de Reportes SOAP en Terreno</h4>
                            <p className="text-slate-400 text-sm mt-2 line-clamp-2">Aprende a documentar hallazgos clínicos de manera eficiente bajo condiciones de alta presión.</p>
                        </div>
                        {/* News Card 3 */}
                        <div onClick={onNavigateNews} className="flex-none w-80 md:w-96 snap-start group cursor-pointer transition-all active:scale-[0.98]">
                            <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-800 mb-4 bg-slate-800">
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent z-10"></div>
                                <img alt="Health Guidelines" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&q=80&w=800" />
                                <div className="absolute bottom-4 left-4 z-20">
                                    <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded tracking-wider">Protocolo</span>
                                </div>
                            </div>
                            <h4 className="text-slate-100 font-bold text-lg leading-tight group-hover:text-primary transition-colors">Actualización de Guías de Salud 2024</h4>
                            <p className="text-slate-400 text-sm mt-2 line-clamp-2">Nuevos estándares para la respuesta ante emergencias en expediciones universitarias.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Hero Action */}
                {isUniversityUser && (
                    <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10"></div>
                        <div className="flex-1 space-y-4">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">Gestión de Incidentes Médicos</h2>
                            <p className="text-slate-400 max-w-xl">Inicia un nuevo registro SOAP (Subjetivo, Objetivo, Evaluación, Plan) para documentar la atención de pacientes en el campo o clínica universitaria.</p>
                        </div>
                        <button onClick={handleCreateNew} className="flex min-w-[280px] md:min-w-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 px-8 bg-primary text-background-dark gap-3 text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_25px_-5px_rgba(19,236,109,0.4)]">
                            <span className="material-symbols-outlined text-3xl">emergency</span>
                            <span className="truncate">Simular Nuevo Reporte SOAP</span>
                        </button>
                    </section>
                )}

                {/* Data Table Section */}
                {isUniversityUser && (
                    <section className="flex flex-col gap-6 animate-in fade-in duration-700 delay-150">
                        <div className="flex items-center justify-between">
                            <h3 className="text-slate-100 text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">history</span>
                                Reportes SOAP Recientes
                            </h3>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-2 hover:bg-slate-700/50 transition-colors">
                                    <span className="material-symbols-outlined text-sm">filter_list</span> Filtrar
                                </button>
                                <button className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-2 hover:bg-slate-700/50 transition-colors">
                                    <span className="material-symbols-outlined text-sm">download</span> Exportar
                                </button>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800/40">
                                            <th className="px-6 py-4 text-slate-300 text-xs font-bold uppercase tracking-wider">Fecha de Reporte</th>
                                            <th className="px-6 py-4 text-slate-300 text-xs font-bold uppercase tracking-wider">Nombre del Paciente</th>
                                            <th className="px-6 py-4 text-slate-300 text-xs font-bold uppercase tracking-wider">Severidad</th>
                                            <th className="px-6 py-4 text-slate-300 text-xs font-bold uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-4 text-right text-slate-300 text-xs font-bold uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">Cargando simulacros...</td>
                                            </tr>
                                        ) : simulations.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">No tienes simulacros registrados aún.</td>
                                            </tr>
                                        ) : (
                                            simulations.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-800/20 transition-colors group">
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-100 text-sm font-semibold">{new Date(row.created_at).toLocaleDateString()}</span>
                                                            <span className="text-slate-500 text-[10px]">{new Date(row.created_at).toLocaleTimeString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-primary text-xs font-bold">
                                                                {row.paciente_nombre.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="text-slate-100 text-sm font-medium">{row.paciente_nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.data.severity === 'high' || row.data.severity === 'critical' ? 'bg-red-900/30 text-red-400 border-red-800/50' :
                                                            row.data.severity === 'mod' ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' :
                                                                'bg-primary/10 text-primary border-primary/30'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${row.data.severity === 'high' || row.data.severity === 'critical' ? 'bg-red-500 animate-pulse' : row.data.severity === 'mod' ? 'bg-orange-500' : 'bg-primary'}`}></span>
                                                            {row.data.severity.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-slate-400 text-sm">
                                                        <span className={`capitalize ${row.data.estado === 'finalizado' ? 'text-green-500' : 'text-amber-500 font-bold italic'}`}>
                                                            {row.data.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-right">
                                                        <button onClick={() => handleEdit(row)} className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-bold text-sm transition-colors">
                                                            <span className="material-symbols-outlined text-lg">edit_note</span> Ver/Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-slate-800/40 px-6 py-4 flex items-center justify-between border-t border-slate-800">
                                <span className="text-xs text-slate-500 font-medium">Mostrando {simulations.length} reportes registrados</span>
                            </div>
                        </div>
                    </section>
                )}

                {isUniversityUser === false && !loading && (
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                        <div className="size-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
                            <span className="material-symbols-outlined text-5xl">school</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Acceso Restringido</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                Las herramientas de simulación clínica están disponibles exclusivamente para estudiantes registrados en TrekManager University.
                            </p>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Contactar soporte académico
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default UniversityPage;
