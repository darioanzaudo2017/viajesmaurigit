import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import SoapForm from '../components/soap/SoapForm';
import type { SoapReport, MaestroProblema } from '../components/soap/SoapForm';
import { generateMedicalPDF } from '../utils/pdfGenerator';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { db } from '../api/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface UniversityPageProps {
    user?: any;
}

const UniversityPage: React.FC<UniversityPageProps> = ({ user }) => {
    const [showSoapForm, setShowSoapForm] = useState(false);
    const { isOnline, downloadAllSimulations, syncPendingSimulations } = useOfflineSync();
    
    // Dexie Live Query to auto-update UI from local DB
    const localSimulations = useLiveQuery(
        () => db.universitySimulations.toArray(),
        []
    ) || [];

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
        examen_fisico: '',
        signos_vitales: [{
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            pulso: '',
            respiracion: '',
            presion: '',
            spo2: '',
            temperatura: '',
            piel: '',
            avdi: 'A'
        }],
        sv_piel: '',
        observacione: '',
        evaluacion_guia: '',
        responsable_id: 'STUDENT-UNI',
        severity: 'mod',
        problemas_seleccionados: [],
        notas_adicionales: ''
    });
    const [patientName, setPatientName] = useState('');
    const [isEnteringName, setIsEnteringName] = useState(false);
    const [isUniversityUser, setIsUniversityUser] = useState<boolean | null>(null);
    const [maestros, setMaestros] = useState<MaestroProblema[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            if (user) {
                setCurrentUserId(user.id);
                const isUni = !!user.profile?.is_university || user.profile?.role === 'admin';
                setIsUniversityUser(isUni);
                
                if (isUni) {
                    await syncAndDownload(isOnline);
                }
            } else if (!isOnline) {
                // If offline and no user from props, check last known session directly as last resort
                const cachedProfile = localStorage.getItem('cached_user_profile');
                const profile = cachedProfile ? JSON.parse(cachedProfile) : null;
                if (profile) {
                    setIsUniversityUser(!!profile.is_university || profile.role === 'admin');
                    setCurrentUserId(profile.id);
                }
            }
            setLoading(false);
        };
        
        initAuth();
    }, [user, isOnline]);


    const syncAndDownload = async (online: boolean) => {
        if (online) {
            // 1. Sync pending first
            await syncPendingSimulations();
            // 2. Download fresh from server to local DB
            await downloadAllSimulations();

            // 3. Cache maestros
            const { data: mData } = await supabase
                .from('maestro_problemas_soap')
                .select('*')
                .order('problema');
            if (mData) {
                await db.maestroProblemasSoap.clear();
                await db.maestroProblemasSoap.bulkPut(mData);
                setMaestros(mData);
            }
        } else {
            // Load maestros from local cache if offline
            const localMaestros = await db.maestroProblemasSoap.orderBy('problema').toArray();
            setMaestros(localMaestros);
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
            examen_fisico: '',
            signos_vitales: [{
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                pulso: '',
                respiracion: '',
                presion: '',
                spo2: '',
                temperatura: '',
                piel: '',
                avdi: 'A (Alerta)'
            }],
            sv_piel: '',
            observacione: '',
            evaluacion_guia: '',
            responsable_id: 'STUDENT-UNI',
            severity: 'mod'
        });
        setPatientName('');
        setIsEditingOwn(true);
        setIsEnteringName(true);
        setShowSoapForm(true);
    };

    const handleEdit = (sim: any) => {
        // Combinamos el ID de la tabla con los datos internos del JSON
        setCurrentReport({
            ...sim.data,
            id: sim.id
        });
        setPatientName(sim.paciente_nombre);
        setIsEditingOwn(sim.user_id === currentUserId);
        setIsEnteringName(false);
        setShowSoapForm(true);
    };

    const [isEditingOwn, setIsEditingOwn] = useState(false);

    const handleDeleteSimulation = async (id: string) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este simulacro? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            if (isOnline) {
                const { error } = await supabase
                    .from('simulacros_soap')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            }
            
            // Always delete from local DB
            await db.universitySimulations.delete(id);
            
            if (showSoapForm) setShowSoapForm(false);
        } catch (error: any) {
            console.error("Error deleting simulation:", error);
            alert("Error al eliminar el simulacro: " + error.message);
        }
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

            const localId = currentReport.id || crypto.randomUUID();
            const createdAt = currentReport.id ? (currentReport as any).created_at : new Date().toISOString();
            const reportData = { ...currentReport, id: localId, estado: isFinal ? 'finalizado' : 'borrador' };
            
            const localPayload = {
                id: localId,
                user_id: user.id,
                paciente_nombre: patientName,
                status: isOnline ? 'synced' : 'pending',
                data: reportData,
                created_at: createdAt
            };

            if (isOnline) {
                const { error } = await supabase
                    .from('simulacros_soap')
                    .upsert({
                        id: localId,
                        user_id: user.id,
                        paciente_nombre: patientName,
                        data: reportData,
                        created_at: createdAt
                    });

                if (error) {
                    console.warn("Backend save failed, keeping as pending locally", error);
                    localPayload.status = 'pending';
                }
            }

            await db.universitySimulations.put(localPayload as any);

            alert(isFinal ? "Simulacro finalizado y guardado" : "Borrador de simulación guardado" + (!isOnline ? " localmente" : ""));
            setShowSoapForm(false);
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
                responsibleId: currentReport.responsable_id || 'N/A',
                problemas: (currentReport.problemas_seleccionados || []).map(p => ({
                    problema: p.problema || p.maestro?.problema || 'N/A',
                    anticipado: p.problema_anticipado || p.maestro?.problema_anticipado || 'N/A',
                    tratamiento: p.tratamiento || p.maestro?.tratamiento_sugerido || 'N/A',
                    observacion: p.observacion_especifica || 'Sin observaciones'
                })),
                notasAdicionales: currentReport.notas_adicionales
            };

            await generateMedicalPDF('', fileName, '#ffffff', { type: 'soap', content: soapData });
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadRowPDF = async (row: any) => {
        try {
            setIsGenerating(true);
            const fileName = `SIMULACRO_${row.paciente_nombre.replace(/\s+/g, '_')}_${new Date(row.created_at).toLocaleDateString().replace(/\//g, '-')}`;

            const soapData = {
                patientName: row.paciente_nombre,
                incidentTime: row.data.hora_incidente || 'N/A',
                location: row.data.referencia_viaje || 'N/A',
                severity: row.data.severity || 'mod',
                scene: row.data.escena || 'No especificada',
                symptoms: row.data.e_sintoma || 'N/A',
                allergies: row.data.e_alergias || 'Ninguna conocida',
                medications: row.data.e_medicacion || 'N/A',
                history: row.data.e_historia_pa || 'N/A',
                lastIntake: row.data.e_ultima_inge || 'N/A',
                events: row.data.e_eventos || 'N/A',
                vitals: (row.data.signos_vitales || []).map((sv: any) => ({
                    time: sv.hora,
                    pulse: sv.pulso || '-',
                    resp: sv.respiracion || '-',
                    bp: sv.presion || '-',
                    spo2: sv.spo2 || '-',
                    temp: sv.temperatura || '-',
                    avdi: sv.avdi || '-'
                })),
                skin: row.data.sv_piel || 'No especificado',
                assessment: row.data.evaluacion_guia || 'Sin evaluaciÃ³n',
                plan: row.data.observacione || 'Sin plan',
                responsibleId: row.responsable_id || 'N/A',
                problemas: (row.data.problemas_seleccionados || []).map((p: any) => ({
                    problema: p.problema || p.maestro?.problema || 'N/A',
                    anticipado: p.problema_anticipado || p.maestro?.problema_anticipado || 'N/A',
                    tratamiento: p.tratamiento || p.maestro?.tratamiento_sugerido || 'N/A',
                    observacion: p.observacion_especifica || 'Sin observaciones'
                })),
                notasAdicionales: row.data.notas_adicionales
            };

            await generateMedicalPDF('', fileName, '#ffffff', { type: 'soap', content: soapData });
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredSimulations = localSimulations
        .filter(sim => {
            const matchesName = sim.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const date = new Date(sim.created_at);
            const matchesStart = startDate ? date >= new Date(startDate) : true;
            
            // Final del día para endDate
            let matchesEnd = true;
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesEnd = date <= end;
            }
            
            return matchesName && matchesStart && matchesEnd;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (showSoapForm) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen">
                <SoapForm
                    report={currentReport}
                    setReport={setCurrentReport as any}
                    onSave={handleSaveSimulation}
                    onCancel={() => setShowSoapForm(false)}
                    patientName={patientName}
                    setPatientName={setPatientName}
                    patientId="SIM-PRÁCTICA"
                    saving={saving}
                    isSimulation={true}
                    title="Simulacro"
                    onDownloadPDF={handleDownloadPDF}
                    isGenerating={isGenerating}
                    maestros={maestros}
                    readOnly={!isEditingOwn}
                    onDelete={currentReport.id ? () => handleDeleteSimulation(currentReport.id!) : undefined}
                />
                {/* Overlay for providing names in simulation mode */}
                {isEnteringName && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-primary/20 p-8 rounded-[32px] max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Nueva Ficha SOAP</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Para comenzar la simulación, asigne un nombre ficticio a su paciente.</p>
                            <input
                                autoFocus
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-6"
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
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <style>
                {`
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
                {/* CTA Hero Action */}
                {isUniversityUser && (
                    <section className="bg-primary/5 border border-primary/20 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10 animate-pulse"></div>
                        <div className="flex-1 space-y-4">
                             <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Gestión de Incidentes <span className="text-primary block sm:inline">en Campo</span></h2>
                             <p className="text-slate-500 dark:text-slate-400 max-w-xl text-sm font-medium leading-relaxed">Inicia un nuevo registro SOAP (Subjetivo, Objetivo, Evaluación, Plan) para documentar la atención de pacientes en el campo como parte de tu entrenamiento.</p>
                        </div>
                        <button onClick={handleCreateNew} className="flex min-w-[280px] md:min-w-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-20 px-10 bg-primary text-background-dark gap-4 text-xl font-black uppercase tracking-widest transition-all hover:scale-[1.05] active:scale-95 shadow-[0_20px_40px_-10px_rgba(19,236,109,0.4)]">
                            <span className="material-symbols-outlined text-4xl">emergency</span>
                            <span className="truncate">NUEVA FICHA SOAP</span>
                        </button>
                    </section>
                )}

                {/* Data Table Section */}
                {isUniversityUser && (
                    <section className="flex flex-col gap-6 animate-in fade-in duration-700 delay-150">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4 flex-1">
                                <h3 className="text-slate-900 dark:text-white text-3xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                                    <span className="material-symbols-outlined text-primary text-4xl">history</span>
                                    LISTA DE FICHA SOAP
                                </h3>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar por nombre del paciente..." 
                                        className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-2xl h-14 pl-12 pr-6 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest ml-1">Desde</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl h-14 px-6 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest ml-1">Hasta</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl h-14 px-6 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                                {(searchTerm || startDate || endDate) && (
                                    <button 
                                        onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                                        className="mt-6 size-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all active:scale-95"
                                        title="Limpiar filtros"
                                    >
                                        <span className="material-symbols-outlined">restart_alt</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-white/10">
                                            <th className="px-8 py-5 text-slate-500 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-white/5">Creado</th>
                                            <th className="px-8 py-5 text-slate-500 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-white/5">Actualización</th>
                                            <th className="px-8 py-5 text-slate-500 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-white/5">Identificación Paciente</th>
                                            <th className="px-8 py-5 text-slate-500 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-white/5">Responsable</th>
                                            
                                            <th className="px-8 py-5 text-right text-slate-500 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-white/5">Gestión</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredSimulations.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-24 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="size-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                                                            <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h3 className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-tight">
                                                                {(searchTerm || startDate || endDate) ? 'No se encontraron resultados' : 'No hay registros aún'}
                                                            </h3>
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest italic">
                                                                {(searchTerm || startDate || endDate) ? 'Prueba ajustando los filtros de búsqueda' : 'Comience creando una nueva ficha SOAP'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSimulations.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-900 dark:text-white text-sm font-black tracking-tight">{new Date(row.created_at).toLocaleDateString()}</span>
                                                            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-700 dark:text-slate-300 text-[11px] font-black tracking-tight">{new Date(row.created_at).toLocaleDateString()}</span>
                                                            <span className="text-slate-500 dark:text-slate-500 text-[9px] font-bold uppercase">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black">
                                                                {row.paciente_nombre.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="text-slate-900 dark:text-white text-sm font-black tracking-tight">{row.paciente_nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-black text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 uppercase">
                                                                {row.status === 'pending' ? '!' : (row.user_id === currentUserId ? 'Yo' : '?')}
                                                            </div>
                                                            <span className={`text-[11px] font-black uppercase tracking-wider ${row.status === 'pending' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                {row.status === 'pending' ? 'PENDIENTE' : (row.user_id === currentUserId ? 'Mío' : 'Estudiante')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleDownloadRowPDF(row)}
                                                                className="size-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all border border-primary/10"
                                                                title="Descargar PDF"
                                                                disabled={isGenerating}
                                                            >
                                                                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleEdit(row)} 
                                                                className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${row.user_id === currentUserId ? 'bg-primary/10 hover:bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                                            >
                                                                <span className="material-symbols-outlined text-lg">{row.user_id === currentUserId ? 'edit_note' : 'visibility'}</span> 
                                                                {row.user_id === currentUserId ? 'Ver/Editar' : 'Ver'}
                                                            </button>
                                                            {row.user_id === currentUserId && (
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteSimulation(row.id);
                                                                    }} 
                                                                    className="size-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all border border-red-500/10"
                                                                    title="Eliminar Simulacro"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/10 px-8 py-6 flex items-center justify-between border-t border-slate-200 dark:border-white/5">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Mostrando {filteredSimulations.length} de {localSimulations.length} registros</span>
                            </div>
                        </div>
                    </section>
                )}

                {isUniversityUser === false && !loading && (
                    <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[40px] p-12 text-center flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500 shadow-2xl">
                        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 border border-primary/20">
                            <span className="material-symbols-outlined text-5xl">school</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Acceso Restringido</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
                                Las herramientas de simulación clínica están disponibles exclusivamente para estudiantes registrados en TrekManager ISAUI.
                            </p>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <div className="px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
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
