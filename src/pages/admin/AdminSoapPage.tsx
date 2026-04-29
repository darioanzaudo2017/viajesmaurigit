import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';
import { generateMedicalPDF } from '../../utils/pdfGenerator';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { db } from '../../api/db';
import SoapForm from '../../components/soap/SoapForm';
import type { SoapReport } from '../../components/soap/SoapForm';

interface AdminSoapPageProps {
    enrollmentId: string;
    onBack: () => void;
}

const AdminSoapPage: React.FC<AdminSoapPageProps> = ({ enrollmentId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { isOnline, syncPendingReports } = useOfflineSync();
    const [enrollmentData, setEnrollmentData] = useState<any>(null);
    const [report, setReport] = useState<SoapReport>({
        inscripcion_id: enrollmentId,
        referencia_viaje: '',
        hora_incidente: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        escena: '',
        e_sintoma: '',
        e_alergias: '',
        e_medicacion: '',
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
        severity: 'mod',
        problemas_seleccionados: [],
        notas_adicionales: '',
        e_historia_pasada: '',
        e_ultima_ingesta: '',
        observaciones: '',
        evaluacion_guia: '',
        responsable_id: 'ADMIN-99-TREK'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let enrollment;
                let existingSoap;

                if (isOnline) {
                    const { data: remoteEnrollment } = await supabase
                        .from('inscripciones')
                        .select('*, profiles(full_name), viajes(titulo)')
                        .eq('id', enrollmentId)
                        .single();
                    enrollment = remoteEnrollment;

                    const { data: remoteSoap } = await supabase
                        .from('reportes_soap')
                        .select('*, problemas:reportes_soap_problemas(*)')
                        .eq('inscripcion_id', enrollmentId)
                        .eq('es_simulacro', false)
                        .maybeSingle();

                    if (remoteSoap) {
                        // Deduplicar nada más recibir de Supabase
                        const rawProblemas = remoteSoap.problemas || [];
                        const uniqueRemote = rawProblemas.reduce((acc: any[], curr: any) => {
                            const isDup = acc.find(p => p.problema === curr.problema && p.tratamiento === curr.tratamiento);
                            if (!isDup) acc.push(curr);
                            return acc;
                        }, []);

                        existingSoap = {
                            ...remoteSoap,
                            problemas_seleccionados: uniqueRemote
                        };

                        await db.soapReports.put({
                            id: remoteSoap.id,
                            inscripcion_id: enrollmentId,
                            status: 'synced',
                            data: existingSoap,
                            updated_at: Date.now()
                        });
                    } else {
                        const localSoap = await db.soapReports.where('inscripcion_id').equals(enrollmentId).first();
                        if (localSoap) {
                            // También deduplicar local
                            const rawLocal = localSoap.data.problemas_seleccionados || [];
                            const uniqueLocal = rawLocal.reduce((acc: any[], curr: any) => {
                                const isDup = acc.find(p => p.problema === curr.problema && p.tratamiento === curr.tratamiento);
                                if (!isDup) acc.push(curr);
                                return acc;
                            }, []);

                            existingSoap = { 
                                ...localSoap.data, 
                                id: localSoap.id,
                                problemas_seleccionados: uniqueLocal
                            };
                        }
                    }
                } else {
                    enrollment = await db.enrollments.get(enrollmentId);
                    const localSoap = await db.soapReports.where('inscripcion_id').equals(enrollmentId).first();
                    if (localSoap) {
                        const rawLocal = localSoap.data.problemas_seleccionados || [];
                        const uniqueLocal = rawLocal.reduce((acc: any[], curr: any) => {
                            const isDup = acc.find(p => p.problema === curr.problema && p.tratamiento === curr.tratamiento);
                            if (!isDup) acc.push(curr);
                            return acc;
                        }, []);
                        existingSoap = { 
                            ...localSoap.data, 
                            id: localSoap.id,
                            problemas_seleccionados: uniqueLocal
                        };
                    }
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
            } finally {
                setLoading(false);
            }
        };

        if (enrollmentId) fetchData();
    }, [enrollmentId, isOnline]);

    const handleSave = async (isFinal: boolean) => {
        const reportData = {
            ...report,
            estado: isFinal ? 'finalizado' : 'borrador',
            updated_at: new Date().toISOString()
        };

        try {
            setSaving(true);
            const localId = report.id || crypto.randomUUID();
            
            // 1. Guardar SIEMPRE en Dexie como 'pending'
            await db.soapReports.put({
                id: localId,
                inscripcion_id: enrollmentId,
                status: 'pending',
                data: { ...reportData, id: localId },
                updated_at: Date.now()
            });

            setReport({ ...reportData, id: localId });

            // 2. Si hay conexión, disparar el sistema de sincronización global
            if (isOnline) {
                console.log('[SOAP] Disparando sincronización global unificada...');
                await syncPendingReports();
                
                // Opcional: Refrescar el estado con lo que devolvió el sync
                const synced = await db.soapReports.get(localId);
                if (synced && synced.status === 'synced') {
                    setReport(synced.data);
                }
            }

            alert(isOnline ? 
                (isFinal ? "Reporte finalizado y sincronizado." : "Borrador sincronizado.") : 
                "Guardado localmente. Se sincronizará cuando recuperes señal."
            );

            if (isFinal) onBack();
        } catch (error: any) {
            console.error("Error saving SOAP report:", error);
            alert("Error al guardar. Se intentará sincronizar más tarde.");
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setIsGenerating(true);
            const patientName = enrollmentData?.profiles?.full_name || 'Paciente';
            const fileName = `SOAP_${patientName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

            const soapData = {
                patientName,
                incidentTime: report.hora_incidente || 'N/A',
                location: report.referencia_viaje || 'N/A',
                severity: report.severity || 'mod',
                scene: report.escena || 'No especificada',
                symptoms: report.e_sintoma || 'N/A',
                allergies: report.e_alergias || 'Ninguna conocida',
                medications: report.e_medicacion || 'N/A',
                history: report.e_historia_pasada || 'N/A',
                lastIntake: report.e_ultima_ingesta || 'N/A',
                events: report.e_eventos || 'N/A',
                vitals: report.signos_vitales.map(sv => ({
                    time: sv.hora,
                    pulse: sv.pulso || '-',
                    resp: sv.respiracion || '-',
                    bp: sv.presion || '-',
                    spo2: sv.spo2 || '-',
                    temp: sv.temperatura || '-',
                    avdi: sv.avdi || '-',
                    skin: sv.piel || '-'
                })),
                skin: report.sv_piel || 'No especificado',
                examenFisico: report.examen_fisico || '',
                assessment: report.evaluacion_guia || 'Sin evaluación',
                plan: report.observaciones || 'Sin plan',
                responsibleId: report.responsable_id || 'N/A',
                viajeNombre: enrollmentData?.viajes?.titulo || report.referencia_viaje || 'Salida de Campo',
                isSimulation: false,
                problemas: (report.problemas_seleccionados || []).map(p => ({
                    problema: p.problema || 'N/A',
                    anticipado: p.problema_anticipado || 'N/A',
                    tratamiento: p.tratamiento || 'N/A',
                    observacion: p.observacion_especifica || 'Sin observaciones'
                })),
                notasAdicionales: report.notas_adicionales || ''
            };

            await generateMedicalPDF('', fileName, '#ffffff', { type: 'soap', content: soapData });
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async () => {
        if (!report.id) return;
        if (!window.confirm("¿Estás seguro de eliminar esta ficha SOAP?")) return;

        try {
            setSaving(true);
            if (isOnline) {
                await supabase.from('reportes_soap').delete().eq('id', report.id);
                await supabase.from('inscripciones').update({ soap_creada: false }).eq('id', enrollmentId);
            }
            await db.soapReports.delete(report.id);
            alert("Ficha eliminada.");
            onBack();
        } catch (error) {
            console.error("Error deleting SOAP report:", error);
            alert("Error al eliminar.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[60vh]">
                <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark pb-20">
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
            />
        </div>
    );
};

export default AdminSoapPage;
