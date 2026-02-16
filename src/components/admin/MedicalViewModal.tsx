import React, { useState } from 'react';
import MedicalProfilePage from '../../pages/MedicalProfilePage';
import { generateMedicalPDF } from '../../utils/pdfGenerator';

interface MedicalViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

const MedicalViewModal: React.FC<MedicalViewModalProps> = ({ isOpen, onClose, userId, userName }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        try {
            setIsGenerating(true);
            // We target the hidden full-view version
            const elementId = `medical-profile-full-${userId}`;
            const fileName = `Ficha_Medica_${userName.replace(/\s+/g, '_')}`;
            await generateMedicalPDF(elementId, fileName);
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

            <div className="relative bg-[#102218] border border-white/10 w-full max-w-6xl h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
                {/* Header with Title and Actions */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-2xl font-black">medical_services</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
                                Ficha Médica de Control
                            </h2>
                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1">Participante: {userName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 px-6 py-3 bg-primary text-background-dark rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {isGenerating ? 'sync' : 'picture_as_pdf'}
                            </span>
                            {isGenerating ? 'Generando...' : 'Descargar PDF'}
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
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#f6f8f7] dark:bg-[#102218]">
                    <div className="opacity-100">
                        <MedicalProfilePage userId={userId} />
                    </div>
                </div>

                {/* Hidden Full-View for PDF generation */}
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
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Cerrar Vista
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicalViewModal;
