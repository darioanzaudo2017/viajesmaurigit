import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { generateMedicalPDF } from '../../utils/pdfGenerator';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { db } from '../../api/db';
import SoapForm from '../../components/soap/SoapForm';
import type { SoapReport, MaestroProblema } from '../../components/soap/SoapForm';
// Removed unused useLiveQuery

interface AdminSoapPageProps {
    enrollmentId: string;
    onBack: () => void;
}

const AdminSoapPage: React.FC<AdminSoapPageProps> = ({ enrollmentId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { isOnline } = useOfflineSync();
    const [enrollmentData, setEnrollmentData] = useState<any>(null);
    const [maestros, setMaestros] = useState<MaestroProblema[]>([]);
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
        examen_fisico: '',
        signos_vitales: [{
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            pulso: '',
            respiracion: '',
            presion: '',
            spo2: '',
            temperatura: '',
            avdi: 'A (Alerta)',
            piel: ''
        }],
        sv_piel: '',
        observacione: '',
        evaluacion_guia: '',
        responsable_id: 'ADMIN-99-TREK',
        severity: 'mod',
        problemas_seleccionados: [],
        notas_adicionales: ''
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let enrollment;
                let existingSoap;

                if (isOnline) {
                    // Cargar maestros de problemas y guardar en cache local
                    const { data: mData } = await supabase.from('maestro_problemas_soap').select('*').order('problema');
                    if (mData) {
                        setMaestros(mData);
                        // Cachear para uso offline
                        await db.maestroProblemasSoap.clear();
                        await db.maestroProblemasSoap.bulkPut(mData);
                    }

                    // Try remote first
                    const { data: remoteEnrollment } = await supabase
                        .from('inscripciones')
                        .select('*, profiles(full_name), viajes(titulo)')
                        .eq('id', enrollmentId)
                        .single();
                    enrollment = remoteEnrollment;

                    const { data: remoteSoap } = await supabase
                        .from('reportes_soap')
                        .select('*, problemas:reportes_soap_problemas(*, maestro:maestro_problemas_soap(*))')
                        .eq('inscripcion_id', enrollmentId)
                        .maybeSingle();

                    if (remoteSoap) {
                        // Mapear los problemas relacionales al formato del estado
                        existingSoap = {
                            ...remoteSoap,
                            problemas_seleccionados: remoteSoap.problemas || []
                        };
                    }
                } else {
                    // Load from local cache
                    enrollment = await db.enrollments.get(enrollmentId);
                    existingSoap = await db.soapReports.where('inscripcion_id').equals(enrollmentId).first();
                    if (existingSoap) {
                        existingSoap = {
                            ...existingSoap.data,
                            id: existingSoap.id // Ensure ID is present
                        };
                    }

                    // Load maestros from local cache
                    const localMaestros = await db.maestroProblemasSoap.orderBy('problema').toArray();
                    setMaestros(localMaestros);
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
                        setReport({
                            ...localSoapArr[0].data,
                            id: localSoapArr[0].id
                        });
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
                responsibleId: report.responsable_id || 'N/A',
                problemas: (report.problemas_seleccionados || []).map(p => ({
                    problema: p.problema || p.maestro?.problema || 'N/A',
                    anticipado: p.problema_anticipado || p.maestro?.problema_anticipado || 'N/A',
                    tratamiento: p.tratamiento || p.maestro?.tratamiento_sugerido || 'N/A',
                    observacion: p.observacion_especifica || 'Sin observaciones'
                })),
                notasAdicionales: report.notas_adicionales
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
                // Eliminar campos que NO existen en la tabla física de Supabase
                const { problemas_seleccionados, ...cleanReportData } = reportData;

                // Mapear observaciones a la columna física correcta (observacione)
                const finalPayload = {
                    ...cleanReportData,
                    observacione: (cleanReportData as any).observaciones || (cleanReportData as any).observacione || ''
                };
                // @ts-ignore
                if ('observaciones' in finalPayload) delete (finalPayload as any).observaciones;

                const { data, error } = await supabase
                    .from('reportes_soap')
                    .upsert(finalPayload)
                    .select()
                    .single();

                if (error) throw error;

                // Guardar problemas asociados
                if (reportData.problemas_seleccionados) {
                    // Primero borramos los anteriores para simplificar el upsert de la relación muchos-a-muchos
                    await supabase
                        .from('reportes_soap_problemas')
                        .delete()
                        .eq('reporte_soap_id', data.id);

                    if (reportData.problemas_seleccionados.length > 0) {
                        const problemasToInsert = reportData.problemas_seleccionados.map(p => ({
                            reporte_soap_id: data.id,
                            problema_id: p.problema_id,
                            observacion_especifica: p.observacion_especifica,
                            problema: p.problema,
                            problema_anticipado: p.problema_anticipado,
                            tratamiento: p.tratamiento
                        }));
                        await supabase.from('reportes_soap_problemas').insert(problemasToInsert);
                    }
                }

                if (!report.id && enrollmentId) {
                    await supabase.from('inscripciones').update({ soap_creada: true }).eq('id', enrollmentId);
                }
                if (data) setReport({ ...data, problemas_seleccionados: reportData.problemas_seleccionados });
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

    const handleDelete = async () => {
        if (!report.id) return;
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta ficha SOAP? La inscripción se mantendrá.");
        if (!confirmDelete) return;

        try {
            setSaving(true);
            if (isOnline) {
                // Delete from Supabase
                const { error } = await supabase
                    .from('reportes_soap')
                    .delete()
                    .eq('id', report.id);

                if (error) throw error;

                // Mark enrollment as not having a SOAP
                await supabase
                    .from('inscripciones')
                    .update({ soap_creada: false })
                    .eq('id', enrollmentId);
            }

            // Delete from Dexie
            await db.soapReports.delete(report.id);
            const localEnrollment = await db.enrollments.get(enrollmentId);
            if (localEnrollment) {
                await db.enrollments.update(enrollmentId, { soap_creada: false });
            }

            alert("Ficha SOAP eliminada correctamente.");
            onBack();
        } catch (error) {
            console.error("Error deleting SOAP report:", error);
            alert("Error al eliminar el reporte.");
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
            <SoapForm
                report={report}
                setReport={setReport}
                onSave={handleSave}
                onCancel={onBack}
                onDownloadPDF={handleDownloadPDF}
                patientName={enrollmentData?.profiles?.full_name || 'Paciente'}
                patientId={enrollmentData?.id}
                saving={saving}
                isGenerating={isGenerating}
                onDelete={handleDelete}
                maestros={maestros}
            />

            {/* Hidden Printable PDF Version (used by pdfGenerator if needed via DOM) */}
            <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px' }}>
                <div id="soap-report-printable" className="p-12 bg-white text-slate-900">
                    {/* ... (keep hidden printable div as is for PDF generation) ... */}
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
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-md font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-4 py-2 mb-4">Información de la Escena</h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap border border-slate-200 p-4 rounded-xl italic">{report.escena || 'No especificada'}</p>
                        </div>
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
