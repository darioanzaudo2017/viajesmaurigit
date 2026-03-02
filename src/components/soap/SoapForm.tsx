import React, { useState } from 'react';

export interface VitalSign {
    hora: string;
    pulso: string;
    respiracion: string;
    presion: string;
    spo2: string;
    temperatura: string;
    avdi: string;
    piel: string;
}

export interface MaestroProblema {
    id: string;
    problema: string;
    problema_anticipado: string;
    tratamiento_sugerido: string;
}

export interface SoapProblemaSeleccionado {
    id?: string;
    problema_id: string;
    observacion_especifica: string;
    maestro?: MaestroProblema;
}

export interface SoapReport {
    id?: string;
    inscripcion_id?: string;
    referencia_viaje: string;
    hora_incidente: string;
    escena: string;
    e_sintoma: string;
    e_alergias: string;
    e_medicacion: string;
    e_historia_pa: string;
    e_ultima_inge: string;
    e_eventos: string;
    signos_vitales: VitalSign[];
    sv_piel: string;
    observacione: string; // Tratamiento general
    evaluacion_guia: string;
    responsable_id: string;
    severity: 'low' | 'mod' | 'high' | 'critical';
    estado?: string;
    problemas_seleccionados?: SoapProblemaSeleccionado[];
    notas_adicionales?: string;
}

interface SoapFormProps {
    report: SoapReport;
    setReport: React.Dispatch<React.SetStateAction<SoapReport>>;
    onSave: (isFinal: boolean) => Promise<void>;
    onCancel: () => void;
    onDownloadPDF?: () => void;
    patientName: string;
    patientId?: string;
    saving: boolean;
    isGenerating?: boolean;
    title?: string;
    isSimulation?: boolean;
    onDelete?: () => Promise<void>;
    maestros?: MaestroProblema[];
}

const SoapForm: React.FC<SoapFormProps> = ({
    report,
    setReport,
    onSave,
    onCancel,
    onDownloadPDF,
    patientName,
    patientId,
    saving,
    isGenerating,
    title = "Ficha SOAP",
    isSimulation = false,
    onDelete,
    maestros = []
}) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { label: 'Paso 1: Escena', icon: 'person_pin_circle' },
        { label: 'Paso 2: Subjetivo: SAMPUE', icon: 'forum' },
        { label: 'Paso 3: Objetivo', icon: 'monitor_heart' },
        { label: 'Paso 4: Eval. y Trat.', icon: 'assignment' }
    ];

    const handleAddVitalSign = () => {
        setReport(prev => ({
            ...prev,
            signos_vitales: [...prev.signos_vitales, {
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                pulso: '',
                respiracion: '',
                presion: '',
                spo2: '',
                temperatura: '',
                avdi: 'A (Alerta)',
                piel: ''
            }]
        }));
    };

    const handleDeleteVitalSign = (index: number) => {
        const newVitals = report.signos_vitales.filter((_, idx) => idx !== index);
        setReport(prev => ({ ...prev, signos_vitales: newVitals }));
    };

    const handleVitalChange = (index: number, field: keyof VitalSign, value: string) => {
        const newVitals = [...report.signos_vitales];
        newVitals[index] = { ...newVitals[index], [field]: value };
        setReport(prev => ({ ...prev, signos_vitales: newVitals }));
    };

    const handleAddProblema = (maestroId: string) => {
        if (!maestroId) return;
        const maestro = maestros.find(m => m.id === maestroId);
        if (!maestro) return;

        // Evitar duplicados
        if (report.problemas_seleccionados?.some(p => p.problema_id === maestroId)) return;

        const newProblema: SoapProblemaSeleccionado = {
            problema_id: maestroId,
            observacion_especifica: '',
            maestro: maestro
        };

        setReport(prev => ({
            ...prev,
            problemas_seleccionados: [...(prev.problemas_seleccionados || []), newProblema]
        }));
    };

    const handleRemoveProblema = (index: number) => {
        setReport(prev => ({
            ...prev,
            problemas_seleccionados: prev.problemas_seleccionados?.filter((_, idx) => idx !== index)
        }));
    };

    const handleProblemaObsChange = (index: number, obs: string) => {
        const newProblemas = [...(report.problemas_seleccionados || [])];
        newProblemas[index] = { ...newProblemas[index], observacion_especifica: obs };
        setReport(prev => ({ ...prev, problemas_seleccionados: newProblemas }));
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-200 dark:border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <button onClick={onCancel} className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded-xl text-primary transition-all border border-white/5 mr-2">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] ${report.estado === 'finalizado' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                            {isSimulation ? 'Simulacro de Práctica' : (report.id ? (report.estado === 'finalizado' ? 'Reporte Finalizado' : 'Borrador Guardado') : 'Nuevo Reporte')}
                        </span>
                        {patientId && <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest hidden sm:inline">ID: {patientId.substring(0, 8)}</span>}
                    </div>
                    <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight sm:leading-none mb-2">
                        {title} <span className="text-primary block sm:inline italic">{isSimulation ? 'Simulacro' : 'Incidente'}</span>
                    </h1>
                    <p className="text-primary/70 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person</span> {patientName}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {onDownloadPDF && report.id && (
                        <button
                            onClick={onDownloadPDF}
                            disabled={isGenerating}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl border border-white/5 transition-all flex items-center gap-2 shadow-lg shadow-black/20"
                        >
                            <span className="material-symbols-outlined text-lg">{isGenerating ? 'sync' : 'picture_as_pdf'}</span>
                            {isGenerating ? 'G...' : 'PDF'}
                        </button>
                    )}
                    {onDelete && report.id && (
                        <button
                            onClick={onDelete}
                            disabled={saving}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl border border-red-500/10 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Borrar
                        </button>
                    )}
                    <button onClick={onCancel} className="flex-1 md:flex-none bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl border border-white/5 transition-all shadow-lg shadow-black/20">
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Steps Progress */}
            <div className="flex justify-between items-center mb-12 px-4 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-white/5 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(currentStep / 3) * 100}%` }}></div>

                {steps.map((s, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentStep(idx)}
                        className="relative z-10 group"
                    >
                        <div className={`size-10 sm:size-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${currentStep >= idx ? 'bg-primary border-primary text-slate-900 shadow-xl shadow-primary/20 scale-110' : 'bg-neutral-900 border-white/10 text-slate-500 group-hover:border-primary/50'}`}>
                            <span className="material-symbols-outlined text-xl sm:text-2xl font-black">{s.icon}</span>
                        </div>
                        <span className={`absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-500 ${currentStep >= idx ? 'text-primary' : 'text-slate-500'}`}>
                            <span className="hidden sm:inline">{s.label}</span>
                            <span className="sm:hidden">{s.label.split(' ')[0]}</span>
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-16">
                {currentStep === 0 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-8 space-y-10 shadow-2xl">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">emergency_home</span>
                                Paso 1: Escena
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referencia del Viaje / Ubicación</label>
                                    <input type="text" value={report.referencia_viaje} onChange={(e) => setReport({ ...report, referencia_viaje: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl h-16 px-6 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Ej: Campamento Base Aconcagua" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora del Incidente</label>
                                        <input type="time" value={report.hora_incidente} onChange={(e) => setReport({ ...report, hora_incidente: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl h-16 px-6 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severidad</label>
                                        <select value={report.severity} onChange={(e) => setReport({ ...report, severity: e.target.value as any })} className="w-full bg-white/5 border border-white/5 rounded-2xl h-16 px-6 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                                            <option value="low">Leve (Verde)</option>
                                            <option value="mod">Moderado (Amarillo)</option>
                                            <option value="high">Grave (Rojo)</option>
                                            <option value="critical">Crítico (Negro)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observaciones de la Escena</label>
                                    <textarea value={report.escena} onChange={(e) => setReport({ ...report, escena: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-[24px] p-6 text-sm text-white min-h-[140px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Condiciones ambientales, mecanismos de lesión, seguridad de la escena..." />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-8 space-y-10 shadow-2xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">forum</span>
                                    Paso 2: Subjetivo: SAMPUE
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">S (Síntomas / Queja Principal)</label>
                                        <textarea value={report.e_sintoma} onChange={(e) => setReport({ ...report, e_sintoma: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white min-h-[100px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="¿Qué siente el paciente?" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">A (Alergias)</label>
                                        <input type="text" value={report.e_alergias} onChange={(e) => setReport({ ...report, e_alergias: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Medicamentos, alimentos..." />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">M (Medicamentos)</label>
                                        <input type="text" value={report.e_medicacion} onChange={(e) => setReport({ ...report, e_medicacion: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="¿Qué está tomando?" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">P (Historia Pasada)</label>
                                        <textarea value={report.e_historia_pa} onChange={(e) => setReport({ ...report, e_historia_pa: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white min-h-[100px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Diabetes, epilepsia, cirugías..." />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">U (Última Ingesta)</label>
                                        <input type="text" value={report.e_ultima_inge} onChange={(e) => setReport({ ...report, e_ultima_inge: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Comida o agua (hora)" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E (Evento)</label>
                                        <input type="text" value={report.e_eventos} onChange={(e) => setReport({ ...report, e_eventos: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Recuerda el evento" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-8 space-y-10 shadow-2xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">monitor_heart</span>
                                    Paso 3: Objetivo: Examen Físico y Signos Vitales
                                </h3>
                                <button
                                    onClick={handleAddVitalSign}
                                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-primary text-slate-900 font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <span className="material-symbols-outlined font-black">add_circle</span>
                                    Agregar Toma
                                </button>
                            </div>

                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 sm:px-0">
                                {report.signos_vitales.length} {report.signos_vitales.length === 1 ? 'registro' : 'registros'} de signos vitales
                            </p>

                            {report.signos_vitales.map((sv, idx) => (
                                <div key={idx} className="bg-neutral-900 border border-white/5 rounded-[40px] overflow-hidden group shadow-2xl">
                                    <div className="bg-white/5 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-slate-900 transition-all duration-500">
                                                <span className="material-symbols-outlined text-2xl font-black italic">schedule</span>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Toma #{idx + 1}</p>
                                                <input
                                                    type="time"
                                                    value={sv.hora}
                                                    onChange={(e) => handleVitalChange(idx, 'hora', e.target.value)}
                                                    className="bg-transparent text-white text-xl font-black outline-none cursor-pointer hover:text-primary transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <select
                                                value={sv.avdi}
                                                onChange={(e) => handleVitalChange(idx, 'avdi', e.target.value)}
                                                className={`flex-1 md:flex-none text-[9px] font-black uppercase tracking-wider px-3 md:px-6 py-3 rounded-xl cursor-pointer outline-none transition-all z-10 ${sv.avdi.startsWith('A') ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                                    sv.avdi.startsWith('V') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                                                        sv.avdi.startsWith('D') ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                            'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                                                    }`}
                                            >
                                                <option>A (Alerta)</option>
                                                <option>V (Verbal)</option>
                                                <option>D (Dolor)</option>
                                                <option>I (Inconsciente)</option>
                                            </select>
                                            <button
                                                onClick={() => handleDeleteVitalSign(idx)}
                                                className="size-12 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all border border-red-500/10"
                                                title="Eliminar toma"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-4 md:p-8">
                                        {[
                                            { key: 'pulso', icon: 'favorite', label: 'Pulso', unit: 'bpm', color: 'text-red-400' },
                                            { key: 'respiracion', icon: 'air', label: 'Resp.', unit: 'rpm', color: 'text-blue-400' },
                                            { key: 'presion', icon: 'e_emergency', label: 'T.A.', unit: 'mmHg', color: 'text-amber-400' },
                                            { key: 'spo2', icon: 'water_drop', label: 'SpO2', unit: '%', color: 'text-sky-400' },
                                            { key: 'temperatura', icon: 'thermostat', label: 'Temp.', unit: '°C', color: 'text-orange-400' },
                                            { key: 'piel', icon: 'dermatology', label: 'Piel', unit: '', color: 'text-emerald-400' }
                                        ].map(({ key, icon, label, unit, color }) => (
                                            <div key={key} className="bg-white/5 rounded-2xl p-4 space-y-2 border border-white/5 group-hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <input
                                                        type="text"
                                                        value={(sv as any)[key]}
                                                        onChange={(e) => handleVitalChange(idx, key as any, e.target.value)}
                                                        className="bg-transparent text-white text-xl font-black outline-none w-full placeholder:text-slate-700"
                                                        placeholder="—"
                                                    />
                                                    <span className="text-[8px] text-slate-600 font-bold flex-shrink-0 uppercase">{unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {report.signos_vitales.length === 0 && (
                                <div className="bg-neutral-900 rounded-[40px] border border-dashed border-white/10 p-12 text-center">
                                    <span className="material-symbols-outlined text-5xl text-slate-700 mb-4 animate-pulse">vital_signs</span>
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Sin registros aún</p>
                                    <p className="text-slate-600 text-[10px] mt-2 font-bold">Presioná "Agregar Toma" para comenzar el monitoreo</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        {/* Evaluación y Problemas */}
                        <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-8 space-y-10 shadow-2xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">assignment</span>
                                    Paso 4: Evaluación y Tratamiento. Notas adicionales.
                                </h3>
                            </div>

                            <div className="space-y-8">
                                {/* Evaluación Macroscópica */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evaluación Global del Guía</label>
                                    <textarea
                                        value={report.evaluacion_guia}
                                        onChange={(e) => setReport({ ...report, evaluacion_guia: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-[32px] p-8 text-sm text-white min-h-[160px] outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-700"
                                        placeholder="Describa su evaluación técnica global del estado del paciente..."
                                    />
                                </div>

                                {/* Selección de Problemas Maestro */}
                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Problemas Identificados</h4>
                                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Seleccione uno o varios del catálogo maestro</p>
                                        </div>
                                        <div className="w-full sm:w-auto min-w-[280px]">
                                            <select
                                                onChange={(e) => {
                                                    handleAddProblema(e.target.value);
                                                    e.target.value = ""; // Reset select
                                                }}
                                                className="w-full bg-primary/10 border border-primary/20 text-primary rounded-2xl px-6 h-14 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer active:scale-95 transition-all"
                                            >
                                                <option value="" disabled selected>+ AGREGAR PROBLEMA</option>
                                                {maestros.map(m => (
                                                    <option key={m.id} value={m.id} className="bg-neutral-900 text-white py-4 font-sans text-sm">{m.problema}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {(report.problemas_seleccionados || []).map((p, pIdx) => (
                                            <div key={p.problema_id} className="bg-white/5 rounded-[32px] overflow-hidden border border-white/5 animate-in slide-in-from-left-4 duration-500">
                                                <div className="bg-white/5 px-8 py-5 flex justify-between items-center border-b border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-slate-900 font-black text-xs">
                                                            {pIdx + 1}
                                                        </div>
                                                        <span className="text-xs font-black text-white uppercase tracking-widest">{p.maestro?.problema || 'Cargando...'}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveProblema(pIdx)}
                                                        className="size-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-base">close</span>
                                                    </button>
                                                </div>
                                                <div className="p-8 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">warning</span> Problema Anticipado
                                                            </span>
                                                            <div className="bg-white/5 rounded-2xl p-4 border border-red-500/10 text-xs font-bold text-red-400 italic">
                                                                {p.maestro?.problema_anticipado}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">medical_services</span> Tratamiento Sugerido
                                                            </span>
                                                            <div className="bg-white/5 rounded-2xl p-4 border border-green-500/10 text-xs font-bold text-green-400/80">
                                                                {p.maestro?.tratamiento_sugerido}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Observación Específica del Guía</label>
                                                        <textarea
                                                            value={p.observacion_especifica}
                                                            onChange={(e) => handleProblemaObsChange(pIdx, e.target.value)}
                                                            className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-6 text-xs text-white min-h-[100px] outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                                            placeholder="Personalice el tratamiento o detalles del problema..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {(report.problemas_seleccionados || []).length === 0 && (
                                            <div className="bg-neutral-800/50 rounded-[32px] border border-dashed border-white/10 p-12 text-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-700 mb-4 italic">clinical_notes</span>
                                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No se han seleccionado problemas aún</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notas Adicionales */}
                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 ml-1">
                                            <span className="material-symbols-outlined text-sm text-primary">note_add</span>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas Adicionales del Reporte</label>
                                        </div>
                                        <textarea
                                            value={report.notas_adicionales}
                                            onChange={(e) => setReport({ ...report, notas_adicionales: e.target.value })}
                                            className="w-full bg-white/5 border border-white/5 rounded-[32px] p-8 text-sm text-white min-h-[120px] outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-700 shadow-inner"
                                            placeholder="Información adicional relevante, logística, evacuación, etc..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Responsable y Firma */}
                            <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">ID Responsable</label>
                                    <input type="text" value={report.responsable_id} onChange={(e) => setReport({ ...report, responsable_id: e.target.value })} className="bg-neutral-800 border border-white/5 rounded-2xl h-14 px-6 text-xs text-white font-black tracking-widest uppercase outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Firma Digital</label>
                                    <div className="h-14 w-full bg-neutral-800 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
                                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Firma Requerida</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'bg-neutral-800 text-slate-300 hover:bg-neutral-700 border border-white/5'}`}
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Anterior
                </button>
                <div className="flex gap-4 w-full sm:w-auto">
                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-slate-900 px-6 py-3 sm:px-10 sm:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg shadow-primary/20 transition-all font-black"
                        >
                            Siguiente
                            <span className="material-symbols-outlined text-base sm:text-lg font-black">arrow_forward</span>
                        </button>
                    ) : (
                        <>
                            <button
                                disabled={saving}
                                onClick={() => onSave(false)}
                                className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[140px] px-3 py-3 sm:px-6 sm:py-4 rounded-2xl bg-neutral-800 text-slate-300 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 sm:gap-3 border border-white/5"
                            >
                                <span className="material-symbols-outlined text-lg sm:text-xl">{saving ? 'sync' : 'save'}</span> {saving ? 'G...' : 'Borrador'}
                            </button>
                            <button
                                disabled={saving}
                                onClick={() => onSave(true)}
                                className="flex-1 sm:flex-none min-w-[140px] sm:min-w-[180px] px-4 py-3 sm:px-10 sm:py-4 rounded-2xl bg-primary text-slate-900 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:shadow-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-lg sm:text-xl font-black">{saving ? 'sync' : 'verified'}</span> {saving ? 'G...' : 'Finalizar'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default SoapForm;
