import React, { useState } from 'react';
import MedicalProfilePage from '../../pages/MedicalProfilePage';
import { generateMedicalPDF } from '../../utils/pdfGenerator';
import type { MedicalProfileData } from '../../utils/pdfGenerator';
import { useMedicalProfile } from '../../hooks/useMedicalProfile';

interface MedicalViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

// Local catalog to resolve condition IDs to names for the PDF
const conditions_catalog = [
    { id: 1, condicion: 'COVID-19' },
    { id: 2, condicion: 'Síntomas de COVID-19' },
    { id: 3, condicion: 'Dificultad visual' },
    { id: 4, condicion: 'Problemas auditivos' },
    { id: 5, condicion: 'Alergias' },
    { id: 6, condicion: 'Afecciones del corazón' },
    { id: 7, condicion: 'Epilepsia' },
    { id: 8, condicion: 'Asma' },
    { id: 9, condicion: 'Diabetes' },
    { id: 10, condicion: 'Hipertensión' },
    { id: 11, condicion: 'Problemas respiratorios' },
    { id: 12, condicion: 'Convulsiones' },
    { id: 13, condicion: 'Enfermedades de la sangre' },
    { id: 14, condicion: 'Hepatitis u otras enfermedades del hígado' },
    { id: 15, condicion: 'Limitaciones en actividad diaria' },
    { id: 16, condicion: 'Celiaquía' },
    { id: 17, condicion: 'Luxaciones' },
    { id: 18, condicion: 'Problemas de la columna' },
    { id: 19, condicion: 'Lesiones de cintura, rodillas o tobillos' },
    { id: 20, condicion: 'Lesiones de hombros o brazos' },
    { id: 21, condicion: 'Bajo cuidado médico' },
    { id: 22, condicion: 'Toma medicación actualmente' },
    { id: 23, condicion: 'Embarazo' },
    { id: 24, condicion: 'Otra condición que pueda perjudicar la salud' },
];

const getConditionName = (id: number) => {
    return conditions_catalog.find(c => c.id === id)?.condicion || `Condición ${id}`;
};

const MedicalViewModal: React.FC<MedicalViewModalProps> = ({ isOpen, onClose, userId, userName }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { profile } = useMedicalProfile(userId);

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        try {
            setIsGenerating(true);
            const fileName = `Ficha_Medica_${userName.replace(/\s+/g, '_')}`;

            if (profile) {
                // BUILD STRUCTURED DATA FOR NATIVE PDF
                const pdfData: MedicalProfileData = {
                    fullName: profile.user?.full_name || userName,
                    bloodType: profile.grupo_sanguineo || 'N/A',
                    bloodPressure: profile.tension_arterial || '120/80',
                    height: String(profile.estatura || ''),
                    weight: String(profile.peso || ''),
                    insurance: profile.obra_social || 'N/A',
                    allergies: profile.alergias || 'Ninguna',
                    observations: profile.observaciones || 'Sin observaciones',
                    lastUpdate: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : undefined,
                    conditions: (profile.condiciones || []).map((id: number) => getConditionName(id)),
                    medications: (profile.medicamentos || []).map((m: any) => ({
                        name: m.name || 'Sin nombre',
                        dosage: m.dosage || 'Sin dosis'
                    })),
                    emergencyContacts: [
                        {
                            name: profile.contacto_emergencia_1 || 'No registrado',
                            phone: profile.telefono_emergencia_1 || 'N/A',
                            relation: 'Primario'
                        },
                        {
                            name: profile.contacto_emergencia_2 || 'No registrado',
                            phone: profile.telefono_emergencia_2 || 'N/A',
                            relation: 'Secundario'
                        }
                    ]
                };

                await generateMedicalPDF('', fileName, '#ffffff', { type: 'medical', content: pdfData });
            } else {
                // Fallback to legacy screen capture if no data loaded
                const elementId = `medical-profile-full-${userId}`;
                await generateMedicalPDF(elementId, fileName);
            }
        } catch (error: any) {
            console.error("Error generating PDF:", error);
            alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background-dark/95 backdrop-blur-xl" onClick={onClose}></div>

            <div className="relative bg-background-dark border border-white/10 w-full max-w-6xl h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
                {/* Header with Title and Actions */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-2xl font-black">medical_services</span>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tight leading-tight">
                                Ficha Médica
                            </h2>
                            <p className="text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 sm:mt-1 truncate max-w-[150px] sm:max-w-none">{userName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-primary text-background-dark rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="material-symbols-outlined text-lg sm:text-lg">
                                {isGenerating ? 'sync' : 'picture_as_pdf'}
                            </span>
                            <span className="hidden sm:inline">{isGenerating ? 'Generando...' : 'Descargar PDF'}</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="size-12 rounded-2xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all bg-white/5"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Visible UI (Tabbed) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-background-dark">
                    <div className="opacity-100">
                        <MedicalProfilePage userId={userId} />
                    </div>
                </div>

                {/* Hidden Full-View for PDF generation (Legacy fallback) */}
                <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '1200px' }}>
                    <div id={`medical-profile-full-${userId}`}>
                        <MedicalProfilePage userId={userId} fullView={true} />
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center px-8">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        Documento validado por el sistema de seguridad
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 sm:px-8 sm:py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Cerrar Vista
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicalViewModal;
