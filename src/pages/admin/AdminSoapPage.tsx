import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { generateMedicalPDF } from '../../utils/pdfGenerator';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { db } from '../../api/db';
// Removed unused useLiveQuery

interface VitalSign {
    hora: string;
    pulso: string;
    respiracion: string;
    presion: string;
    spo2: string;
    temperatura: string;
    avdi: string;
}

interface SoapReport {
    id?: string;
    inscripcion_id: string;
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
    observacione: string;
    evaluacion_guia: string;
    responsable_id: string;
    severity: 'low' | 'mod' | 'high' | 'critical';
    estado?: string;
}

interface AdminSoapPageProps {
    enrollmentId: string;
    onBack: () => void;
}

const AdminSoapPage: React.FC<AdminSoapPageProps> = ({ enrollmentId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const { isOnline } = useOfflineSync();
    const [enrollmentData, setEnrollmentData] = useState<any>(null);
    const [report, setReport] = useState<SoapReport>({
        inscripcion_id: enrollmentId,
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
        responsable_id: 'ADMIN-99-TREK',
        severity: 'mod'
    });

    const steps = [
        { label: 'Paciente y Escena', icon: 'person_pin_circle' },
        { label: 'Subjetivo (S)', icon: 'forum' },
        { label: 'Objetivo (O)', icon: 'monitor_heart' },
        { label: 'Evaluación y Plan', icon: 'assignment' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let enrollment;
                let existingSoap;

                if (isOnline) {
                    // Try remote first
                    const { data: remoteEnrollment } = await supabase
                        .from('inscripciones')
                        .select('*, profiles(full_name), viajes(titulo)')
                        .eq('id', enrollmentId)
                        .single();
                    enrollment = remoteEnrollment;

                    const { data: remoteSoap } = await supabase
                        .from('reportes_soap')
                        .select('*')
                        .eq('inscripcion_id', enrollmentId)
                        .maybeSingle();
                    existingSoap = remoteSoap;
                } else {
                    // Load from local cache
                    enrollment = await db.enrollments.get(enrollmentId);
                    existingSoap = await db.soapReports.get({ inscripcion_id: enrollmentId });
                    if (existingSoap) existingSoap = existingSoap.data;
                }

                if (enrollment) {
                    setEnrollmentData(enrollment);
                    if (existingSoap) {
                        setReport(existingSoap);
                    } else {
                        setReport(prev => ({
                            ...prev,
                            referencia_viaje: enrollment.viajes?.titulo || enrollment.referencia_viaje || '',
                            e_alergias: enrollment.alergias || '',
                            e_medicacion: enrollment.medications ?
                                (Array.isArray(enrollment.medications) ?
                                    enrollment.medications.map((m: any) => `${m.name} (${m.dosage})`).join(', ') :
                                    enrollment.medications) : '',
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching data for SOAP:", error);
                // Fallback to local DB on fetch error (e.g. network fail while "online")
                try {
                    const localEnrollment = await db.enrollments.get(enrollmentId);
                    if (localEnrollment) {
                        setEnrollmentData(localEnrollment);
                        console.log('[SOAP] Using cached enrollment after error');
                    }
                    const localSoapArr = await db.soapReports.where('inscripcion_id').equals(enrollmentId).toArray();
                    if (localSoapArr.length > 0) {
                        setReport(localSoapArr[0].data);
                        console.log('[SOAP] Using cached SOAP report after error');
                    }
                } catch { /* ignore cache errors */ }
            } finally {
                setLoading(false);
            }
        };

        if (enrollmentId) {
            fetchData();
        }
    }, [enrollmentId]);

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
                avdi: 'A (Alerta)'
            }]
        }));
    };

    const handleVitalChange = (index: number, field: keyof VitalSign, value: string) => {
        const newVitals = [...report.signos_vitales];
        newVitals[index] = { ...newVitals[index], [field]: value };
        setReport(prev => ({ ...prev, signos_vitales: newVitals }));
    };

    const handleDownloadPDF = async () => {
        try {
            setIsGenerating(true);
            const patientName = enrollmentData?.profiles?.full_name || 'Paciente';
            const fileName = `SOAP_${patientName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

            // Build structured data for native PDF generation
            const soapData = {
                patientName: patientName,
                incidentTime: report.hora_incidente || 'N/A',
                location: report.referencia_viaje || 'N/A',
                severity: report.severity || 'mod',
                scene: report.escena || 'No especificada',
                symptoms: report.e_sintoma || 'N/A',
                allergies: report.e_alergias || 'Ninguna conocida',
                medications: report.e_medicacion || 'N/A',
                history: report.e_historia_pa || 'N/A',
                lastIntake: report.e_ultima_inge || 'N/A',
                events: report.e_eventos || 'N/A',
                vitals: report.signos_vitales.map(sv => ({
                    time: sv.hora,
                    pulse: sv.pulso || '-',
                    resp: sv.respiracion || '-',
                    bp: sv.presion || '-',
                    spo2: sv.spo2 || '-',
                    temp: sv.temperatura || '-',
                    avdi: sv.avdi || '-'
                })),
                skin: report.sv_piel || 'No especificado',
                assessment: report.evaluacion_guia || 'Sin evaluación',
                plan: report.observacione || 'Sin plan',
                responsibleId: report.responsable_id || 'N/A'
            };

            await generateMedicalPDF('', fileName, '#ffffff', { type: 'soap', content: soapData });
        } catch (error: any) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (isFinal: boolean) => {
        const reportData = {
            ...report,
            estado: isFinal ? 'finalizado' : 'borrador',
            updated_at: new Date().toISOString()
        };

        try {
            setSaving(true);

            if (isOnline) {
                const { data, error } = await supabase
                    .from('reportes_soap')
                    .upsert(reportData)
                    .select()
                    .single();

                if (error) throw error;

                if (!report.id && enrollmentId) {
                    await supabase.from('inscripciones').update({ soap_creada: true }).eq('id', enrollmentId);
                }
                if (data) setReport(data);
                alert(isFinal ? "Reporte finalizado con éxito" : "Borrador guardado");
            } else {
                // Offline Save to Dexie
                const localId = report.id || crypto.randomUUID();
                await db.soapReports.put({
                    id: localId,
                    inscripcion_id: enrollmentId,
                    status: 'pending',
                    data: { ...reportData, id: localId },
                    updated_at: Date.now()
                });
                setReport({ ...reportData, id: localId });
                alert("Guardado localmente. Se sincronizará cuando recuperes señal.");
            }

            if (isFinal) onBack();
        } catch (error: any) {
            console.error("Error saving SOAP report:", error);
            // Fallback to local save if Supabase fails but we are "online"
            const localId = report.id || crypto.randomUUID();
            await db.soapReports.put({
                id: localId,
                inscripcion_id: enrollmentId,
                status: 'pending',
                data: { ...reportData, id: localId },
                updated_at: Date.now()
            });
            alert("Error de conexión. Se guardó una copia localmente.");
            if (isFinal) onBack();
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Cargando Ficha SOAP...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark transition-colors duration-500 pb-20">
            <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-200 dark:border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <button onClick={onBack} className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded-xl text-primary transition-all border border-white/5 mr-2">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] ${report.estado === 'finalizado' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                                {report.id ? (report.estado === 'finalizado' ? 'Reporte Finalizado' : 'Borrador Guardado') : 'Nuevo Reporte'}
                            </span>
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest hidden sm:inline">ID: {enrollmentData?.id?.substring(0, 8)}</span>
                        </div>
                        <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight sm:leading-none mb-2">
                            Ficha SOAP <span className="text-primary block sm:inline italic">Incidente</span>
                        </h1>
                        <p className="text-primary/70 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm font-black">person</span>
                            Paciente: {enrollmentData?.profiles?.full_name}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            disabled={isGenerating}
                            onClick={handleDownloadPDF}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-3 py-2 sm:px-6 sm:py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 transition-all border border-white/5"
                        >
                            <span className="material-symbols-outlined text-base sm:text-lg">{isGenerating ? 'sync' : 'download'}</span> {isGenerating ? 'Generando...' : 'PDF'}
                        </button>
                        <button onClick={onBack} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 sm:px-6 sm:py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/10">
                            <span className="material-symbols-outlined text-base sm:text-lg">close</span> Descartar
                        </button>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="mb-12">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        ></div>
                        {steps.map((step, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`relative z-10 flex flex-col items-center gap-2 transition-all duration-300 ${idx <= currentStep ? 'text-primary' : 'text-slate-600'}`}
                            >
                                <div className={`size-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${idx <= currentStep ? 'bg-primary text-slate-900 shadow-[0_0_20px_rgba(19,236,109,0.4)]' : 'bg-neutral-800 text-slate-600 border border-white/5'}`}>
                                    <span className="material-symbols-outlined font-black">{step.icon}</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest absolute -bottom-6 whitespace-nowrap hidden sm:block">
                                    {step.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="mt-16 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {currentStep === 0 && (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-neutral-900 border border-white/5 rounded-[24px] p-5 flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Referencia Lugar</p>
                                        <p className="text-white font-black text-sm uppercase tracking-tight">{enrollmentData?.viajes?.titulo}</p>
                                    </div>
                                </div>
                                <div className="bg-neutral-900 border border-white/5 rounded-[24px] p-5">
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-4 text-center">Gravedad</p>
                                    <div className="flex bg-neutral-800 p-1 rounded-xl">
                                        {(['low', 'mod', 'high', 'critical'] as const).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setReport({ ...report, severity: s })}
                                                className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${report.severity === s
                                                    ? s === 'low' ? 'bg-green-500 text-white' :
                                                        s === 'mod' ? 'bg-amber-500 text-white' :
                                                            s === 'high' ? 'bg-red-500 text-white' : 'bg-purple-600 text-white'
                                                    : 'text-slate-500'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Detailed Info */}
                            <div className="bg-neutral-900 border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">person_pin_circle</span>
                                    Datos Paciente y Escena
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referencia Viaje</label>
                                        <input value={report.referencia_viaje} onChange={(e) => setReport({ ...report, referencia_viaje: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Lugar del evento" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Incidente</label>
                                        <input type="time" value={report.hora_incidente} onChange={(e) => setReport({ ...report, hora_incidente: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Escena (Descripción del lugar)</label>
                                        <textarea value={report.escena} onChange={(e) => setReport({ ...report, escena: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white min-h-[120px] font-medium outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Condiciones del terreno, riesgos, clima..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-neutral-900 border border-white/5 rounded-[32px] p-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">forum</span>
                                    Subjetivo (S) - Historia SAMPLE
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Síntomas / Queja Principal</label>
                                        <textarea value={report.e_sintoma} onChange={(e) => setReport({ ...report, e_sintoma: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white min-h-[100px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Descripción de síntomas..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alergias</label>
                                        <textarea value={report.e_alergias} onChange={(e) => setReport({ ...report, e_alergias: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white min-h-[100px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Alergias conocidas..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicamentos Habituales</label>
                                        <textarea value={report.e_medicacion} onChange={(e) => setReport({ ...report, e_medicacion: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white min-h-[100px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Medicación actual..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Historia Médica Pasada</label>
                                        <textarea value={report.e_historia_pa} onChange={(e) => setReport({ ...report, e_historia_pa: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white min-h-[100px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Cirugías, enfermedades crónicas..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Última Ingesta</label>
                                        <input value={report.e_ultima_inge} onChange={(e) => setReport({ ...report, e_ultima_inge: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Hora y contenido de ingesta" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Eventos Previos</label>
                                        <input value={report.e_eventos} onChange={(e) => setReport({ ...report, e_eventos: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Actividad antes del evento" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">monitor_heart</span>
                                        Objetivo (O) - Signos Vitales
                                    </h3>
                                    <p className="text-slate-400 text-[10px] mt-1 font-medium">{report.signos_vitales.length} registro{report.signos_vitales.length !== 1 ? 's' : ''} de signos vitales</p>
                                </div>
                                <button onClick={handleAddVitalSign} className="bg-primary hover:scale-[1.02] active:scale-95 text-slate-900 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base font-black">add_circle</span> Agregar Toma
                                </button>
                            </div>

                            {/* Vital Sign Cards */}
                            <div className="space-y-4">
                                {report.signos_vitales.map((sv, idx) => (
                                    <div key={idx} className="bg-neutral-900 rounded-2xl border border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
                                        {/* Card Header */}
                                        <div className="flex items-center justify-between px-5 py-3 bg-neutral-800/50 border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Toma #{idx + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={sv.hora}
                                                        onChange={(e) => handleVitalChange(idx, 'hora', e.target.value)}
                                                        className="block bg-transparent text-white text-sm font-bold outline-none w-32 placeholder:text-slate-600"
                                                        placeholder="HH:MM"
                                                    />
                                                </div>
                                            </div>
                                            <select
                                                value={sv.avdi}
                                                onChange={(e) => handleVitalChange(idx, 'avdi', e.target.value)}
                                                className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer outline-none transition-all ${sv.avdi.startsWith('A') ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
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
                                        </div>
                                        {/* Card Body - Vital Fields */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4">
                                            {[
                                                { key: 'pulso' as keyof VitalSign, label: 'Pulso', icon: 'favorite', unit: 'bpm', color: 'text-red-400' },
                                                { key: 'respiracion' as keyof VitalSign, label: 'Resp.', icon: 'pulmonology', unit: 'rpm', color: 'text-blue-400' },
                                                { key: 'presion' as keyof VitalSign, label: 'T.A.', icon: 'bloodtype', unit: 'mmHg', color: 'text-orange-400' },
                                                { key: 'spo2' as keyof VitalSign, label: 'SpO2', icon: 'spo2', unit: '%', color: 'text-cyan-400' },
                                                { key: 'temperatura' as keyof VitalSign, label: 'Temp.', icon: 'thermostat', unit: '°C', color: 'text-amber-400' },
                                            ].map(({ key, label, icon, unit, color }) => (
                                                <div key={key} className="bg-white/5 rounded-xl p-3 space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`material-symbols-outlined text-xs ${color}`}>{icon}</span>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <input
                                                            type="text"
                                                            value={sv[key]}
                                                            onChange={(e) => handleVitalChange(idx, key, e.target.value)}
                                                            className="bg-transparent text-white text-lg font-black outline-none w-full placeholder:text-slate-700"
                                                            placeholder="—"
                                                        />
                                                        <span className="text-[8px] text-slate-600 font-bold flex-shrink-0">{unit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {report.signos_vitales.length === 0 && (
                                    <div className="bg-neutral-900 rounded-2xl border border-dashed border-white/10 p-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">vital_signs</span>
                                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Sin registros aún</p>
                                        <p className="text-slate-600 text-[10px] mt-1">Presioná "Agregar Toma" para registrar signos vitales</p>
                                    </div>
                                )}
                            </div>

                            {/* Estado de la Piel */}
                            <div className="bg-neutral-900 rounded-2xl border border-white/5 p-6 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-amber-400">dermatology</span>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de la Piel</label>
                                </div>
                                <input
                                    type="text"
                                    value={report.sv_piel}
                                    onChange={(e) => setReport({ ...report, sv_piel: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white font-medium outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                                    placeholder="Color, temperatura, humedad, turgencia..."
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-neutral-900 border border-white/5 rounded-[32px] p-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">assignment</span>
                                    Evaluación y Plan (A/P)
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evaluación del Guía</label>
                                        <textarea value={report.evaluacion_guia} onChange={(e) => setReport({ ...report, evaluacion_guia: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-[24px] p-6 text-sm text-white min-h-[140px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Describa su evaluación técnica..." />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observaciones / Tratamiento</label>
                                        <textarea value={report.observacione} onChange={(e) => setReport({ ...report, observacione: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-[24px] p-6 text-sm text-white min-h-[120px] outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Tratamiento realizado..." />
                                    </div>
                                </div>

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
                                    onClick={() => handleSave(false)}
                                    className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[140px] px-3 py-3 sm:px-6 sm:py-4 rounded-2xl bg-neutral-800 text-slate-300 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 sm:gap-3 border border-white/5"
                                >
                                    <span className="material-symbols-outlined text-lg sm:text-xl">save</span> Borrador
                                </button>
                                <button
                                    disabled={saving}
                                    onClick={() => handleSave(true)}
                                    className="flex-1 sm:flex-none min-w-[140px] sm:min-w-[180px] px-4 py-3 sm:px-10 sm:py-4 rounded-2xl bg-primary text-slate-900 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:shadow-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-lg sm:text-xl font-black">verified</span> Finalizar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Printable PDF Version */}
            <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px' }}>
                <div id="soap-report-printable" className="p-12 bg-white text-slate-900">
                    {/* PDF Header */}
                    <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">Ficha SOAP</h1>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Reporte de Incidentes en Expedición</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha del Reporte</p>
                            <p className="text-lg font-black">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* PDF Info Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-1">Paciente</h4>
                            <p className="text-xl font-black">{enrollmentData?.profiles?.full_name}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase">ID: {enrollmentData?.id}</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-1">Ubicación / Viaje</h4>
                            <p className="text-lg font-black uppercase tracking-tight">{report.referencia_viaje}</p>
                            <p className="text-xs font-bold text-slate-500">Hora Incidente: {report.hora_incidente}</p>
                        </div>
                    </div>

                    {/* PDF Sections */}
                    <div className="space-y-10">
                        {/* 0. Scene */}
                        <div>
                            <h3 className="text-md font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-4 py-2 mb-4">Información de la Escena</h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap border border-slate-200 p-4 rounded-xl italic">{report.escena || 'No especificada'}</p>
                        </div>

                        {/* 1. Subjective */}
                        <div>
                            <h3 className="text-md font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-4 py-2 mb-4">Subjetivo (S) - SAMPLE</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Síntomas / Queja</p>
                                    <p className="text-sm border-b border-slate-100 pb-2 mb-4">{report.e_sintoma || 'N/A'}</p>

                                    <p className="text-[10px] font-black uppercase text-slate-400">Alergias</p>
                                    <p className="text-sm border-b border-slate-100 pb-2 mb-4">{report.e_alergias || 'Ninguna conocida'}</p>

                                    <p className="text-[10px] font-black uppercase text-slate-400">Medicamentos</p>
                                    <p className="text-sm border-b border-slate-100 pb-2 mb-4">{report.e_medicacion || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Historia Pasada</p>
                                    <p className="text-sm border-b border-slate-100 pb-2 mb-4">{report.e_historia_pa || 'N/A'}</p>

                                    <p className="text-[10px] font-black uppercase text-slate-400">Última Ingesta</p>
                                    <p className="text-sm border-b border-slate-100 pb-2 mb-4">{report.e_ultima_inge || 'N/A'}</p>

                                    <p className="text-[10px] font-black uppercase text-slate-400">Eventos Previos</p>
                                    <p className="text-sm border-b border-slate-100 pb-2 mb-4">{report.e_eventos || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Objective */}
                        <div>
                            <h3 className="text-md font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-4 py-2 mb-4">Objetivo (O) - Signos Vitales</h3>
                            <table className="w-full text-left border-collapse mb-4">
                                <thead>
                                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest leading-tight">Hora</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest leading-tight">Pulso</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest leading-tight">Resp</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest leading-tight">T.A.</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest leading-tight">SpO2</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest leading-tight">Temp</th>
                                        <th className="p-3 text-[10px] font-black uppercase tracking-widest leading-tight">AVDI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.signos_vitales.map((sv, idx) => (
                                        <tr key={idx} className="border-b border-slate-100">
                                            <td className="p-3 text-xs font-bold">{sv.hora}</td>
                                            <td className="p-3 text-xs">{sv.pulso}</td>
                                            <td className="p-3 text-xs">{sv.respiracion}</td>
                                            <td className="p-3 text-xs">{sv.presion}</td>
                                            <td className="p-3 text-xs">{sv.spo2}</td>
                                            <td className="p-3 text-xs">{sv.temperatura}</td>
                                            <td className="p-3 text-xs font-black">{sv.avdi}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-[10px] font-black uppercase text-slate-400 mt-4">Estado de la Piel</p>
                            <p className="text-sm border border-slate-100 p-3 rounded-xl">{report.sv_piel || 'No especificado'}</p>
                        </div>

                        {/* 3. Assessment & Plan */}
                        <div>
                            <h3 className="text-md font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-4 py-2 mb-4">Evaluación y Plan (A/P)</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Evaluación del Guía</p>
                                    <p className="text-sm p-4 bg-slate-50 rounded-2xl leading-relaxed">{report.evaluacion_guia || 'Sin descripción'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Observaciones / Tratamiento</p>
                                    <p className="text-sm p-4 bg-slate-50 rounded-2xl leading-relaxed">{report.observacione || 'Sin descripción'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer PDF */}
                        <div className="pt-12 mt-12 border-t-2 border-slate-900 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Responsable ID</p>
                                <p className="text-lg font-black tracking-widest uppercase">{report.responsable_id}</p>
                            </div>
                            <div className="text-right">
                                <div className="h-16 w-64 border-b-2 border-slate-200 mb-2 flex items-center justify-center italic text-slate-300">
                                    Digital Signature Area
                                </div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Firma Autorizada</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSoapPage;
