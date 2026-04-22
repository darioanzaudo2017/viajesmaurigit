
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { CONDITIONS_CATALOG } from '../api/constants';

// --- INTERFACES FOR STRUCTURED DATA ---
export interface MedicalProfileData {
    fullName: string;
    dni?: string;
    birthDate?: string;
    bloodType?: string;
    bloodPressure?: string;
    height?: string;
    weight?: string;
    insurance?: string;
    allergies?: string;
    observations?: string;
    emergencyContacts: {
        name: string;
        phone: string;
        relation: string;
    }[];
    conditions: number[]; // IDs de las condiciones marcadas
    medications: {
        name: string;
        dosage: string;
    }[];
    lastUpdate?: string;
}

export interface SoapReportData {
    patientName: string;
    incidentTime: string;
    location: string;
    severity: string;
    scene: string;
    symptoms: string;
    allergies: string;
    medications: string;
    history: string;
    lastIntake: string;
    events: string;
    vitals: {
        time: string;
        pulse: string;
        resp: string;
        bp: string;
        spo2: string;
        temp: string;
        avdi: string;
        skin?: string;
    }[];
    skin: string;
    examenFisico: string;
    assessment: string;
    plan: string;
    responsibleId: string;
    alumnoNombre?: string;
    viajeNombre?: string;
    isSimulation?: boolean;
    problemas: {
        problema: string;
        anticipado: string;
        tratamiento: string;
        observacion: string;
    }[];
    notasAdicionales: string;
}

const generateNativeSoapPDF = (data: SoapReportData, fileName: string) => {
    const doc = new jsPDF();
    // Configuración estética
    const primaryColor: [number, number, number] = [19, 236, 109]; // #13ec6d (TREKKING TRACE Green)
    const textColor: [number, number, number] = [30, 41, 59];    // Slate 800
    const mutedColor: [number, number, number] = [100, 116, 139]; // Slate 500

    // 1. DIBUJAR LOGO (TREKKING TRACE Style)
    const drawLogo = (x: number, y: number, size: number) => {
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(1.5);
        
        // El pulso/montaña central
        doc.line(x, y + size/1.5, x + size/4, y + size/1.5); // Inicio
        doc.line(x + size/4, y + size/1.5, x + size/3, y + size/3); // Pico
        doc.line(x + size/3, y + size/3, x + size/2, y + size); // Valle
        doc.line(x + size/2, y + size, x + size/1.5, y); // Cima
        doc.line(x + size/1.5, y, x + size/1.2, y + size/1.5); // Bajada
        doc.line(x + size/1.2, y + size/1.5, x + size, y + size/1.5); // Fin
        
        // Texto del Logo
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(18); // Ajustado para evitar solapamientos
        doc.setFont('helvetica', 'bold');
        doc.text('TREKKING', x + size + 5, y + size/1.3);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('TRACE', x + size + 38, y + size/1.3);
        
        doc.setFontSize(7);
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.text('PRECISIÓN EN NAVEGACIÓN AGRESTRE', x + size + 5, y + size/1.3 + 4);
    };

    drawLogo(16, 15, 15);

    // 2. ENCABEZADO INSTITUCIONAL (Sólo para simulacros)
    if (data.isSimulation) {
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('INSTITUTO SUPERIOR DE ACTIVIDADES DE MONTAÑA (ISAUI)', 200, 20, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        if (data.alumnoNombre) doc.text(`Alumno: ${data.alumnoNombre}`, 200, 25, { align: 'right' });
    } else {
        // Encabezado para guías (salidas reales)
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('TREKKING TRACE - REGISTRO AGRESTRE', 200, 20, { align: 'right' });
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (data.viajeNombre) doc.text(`Salida: ${data.viajeNombre}`, 200, 30, { align: 'right' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 200, 35, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(16, 45, 200, 45);

    let yPos = 55;

    // Título del Reporte
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('REPORTE CLÍNICO SOAP', 16, yPos);
    yPos += 8;

    // Información del Paciente
    doc.setFontSize(10);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(`PACIENTE: ${data.patientName.toUpperCase()}`, 16, yPos);
    doc.text(`HORA INCIDENTE: ${data.incidentTime}`, 100, yPos);
    doc.text(`GRAVEDAD: ${data.severity.toUpperCase()}`, 160, yPos);
    yPos += 12;

    // PASO 1: ESCENA
    doc.setFillColor(248, 250, 252);
    doc.rect(16, yPos - 5, 184, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PASO 1: ESCENA Y SEGURIDAD', 18, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const sceneLines = doc.splitTextToSize(data.scene || 'No especificada', 180);
    doc.text(sceneLines, 16, yPos);
    yPos += (sceneLines.length * 5) + 5;

    // PASO 2: EXAMEN SUBJETIVO (S.A.M.P.L.E.)
    doc.setFillColor(248, 250, 252);
    doc.rect(16, yPos - 5, 184, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PASO 2: EXAMEN SUBJETIVO (S.A.M.P.L.E.)', 18, yPos);
    yPos += 6;

    autoTable(doc, {
        startY: yPos,
        theme: 'plain',
        head: [['Etapa', 'Información Recabada']],
        body: [
            ['[S] Síntomas', data.symptoms],
            ['[A] Alergias', data.allergies],
            ['[M] Medicación', data.medications],
            ['[P] Historia Pasada', data.history],
            ['[L] Última Ingesta', data.lastIntake],
            ['[E] Eventos', data.events],
        ],
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fontStyle: 'bold', textColor: mutedColor },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
        margin: { left: 16 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
    if (yPos > 240) { doc.addPage(); yPos = 20; }

    // PASO 3: EXAMEN OBJETIVO (SIGNOS VITALES)
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFillColor(248, 250, 252);
    doc.rect(16, yPos - 5, 184, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PASO 3: EXAMEN OBJETIVO', 18, yPos);
    yPos += 8;

    // EXAMEN FÍSICO DETALLADO (Ahora dentro del Paso 3)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('HALLAZGOS DEL EXAMEN FÍSICO:', 16, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const examLines = doc.splitTextToSize(data.examenFisico || 'No realizado', 180);
    doc.text(examLines, 16, yPos);
    yPos += (examLines.length * 5) + 8;

    // Tabla de Signos Vitales
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('MONITOREO DE SIGNOS VITALES:', 16, yPos);
    yPos += 3;

    autoTable(doc, {
        startY: yPos,
        theme: 'grid',
        head: [['Hora', 'Pulso', 'Resp', 'P.A.', 'SpO2', 'Temp', 'AVDI', 'Piel']],
        body: data.vitals.map(v => [v.time, v.pulse, v.resp, v.bp, v.spo2, v.temp, v.avdi, v.skin || '-']),
        styles: { fontSize: 8, halign: 'center' },
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
        margin: { left: 16 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // PASO 4: EVALUACIÓN Y PLAN
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    
    doc.setFillColor(248, 250, 252);
    doc.rect(16, yPos - 5, 184, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PASO 4: EVALUACIÓN Y PLAN', 18, yPos);
    yPos += 8;

    // LISTADO DE PROBLEMAS IDENTIFICADOS
    if (data.problemas && data.problemas.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.text('LISTADO DE PROBLEMAS E INTERVENCIONES:', 16, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            theme: 'striped',
            head: [['Problema', 'Anticipación', 'Tratamiento Realizado']],
            body: data.problemas.map(p => [p.problema, p.anticipado, p.tratamiento]),
            styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 50 },
                2: { cellWidth: 'auto' }
            },
            headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
            margin: { left: 16 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 12;
    }

    // NOTAS ADICIONALES (Bloque final)
    if (data.notasAdicionales) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.text('NOTAS ADICIONALES:', 16, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        const aditionalLines = doc.splitTextToSize(data.notasAdicionales, 180);
        doc.text(aditionalLines, 16, yPos);
        yPos += (aditionalLines.length * 5) + 15;
    }

    // PIE DE PÁGINA / FIRMA
    if (yPos > 250) { doc.addPage(); yPos = 40; }
    doc.setDrawColor(203, 213, 225);
    doc.line(70, yPos + 20, 140, yPos + 20);
    doc.setFontSize(8);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('FIRMA RESPONSABLE / ALUMNO', 105, yPos + 25, { align: 'center' });
    doc.text(`ID: ${data.responsibleId}`, 105, yPos + 29, { align: 'center' });

    // 6. GUARDAR DOCUMENTO
    doc.save(`${fileName}.pdf`);
};

// --- MAIN GENERATOR FUNCTION ---
export const generateMedicalPDF = async (
    elementId: string,
    fileName: string,
    bgColor: string = '#ffffff',
    data?: { type: 'medical' | 'soap', content: any }
) => {
    console.log("PDF Utility called for:", fileName);

    try {
        if (data) {
            // USAR GENERACIÓN NATIVA SI HAY DATOS (MEJOR CALIDAD)
            if (data.type === 'medical') {
                generateNativeMedicalPDF(data.content, fileName);
            } else if (data.type === 'soap') {
                generateNativeSoapPDF(data.content, fileName);
            }
        } else {
            // FALLBACK A CAPTURA DE PANTALLA (LEGACY)
            // Mantenemos la lógica de gris mejorada por si acaso
            await generateScreenCapturePDF(elementId, fileName, bgColor);
        }
    } catch (error: any) {
        console.error("Critical error in generateMedicalPDF:", error);
        alert("Error generando PDF. Por favor intente nuevamente.");
    }
};

// --- NATIVE GENERATORS (Clean & Fast) ---

const generateNativeMedicalPDF = (data: MedicalProfileData, fileName: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // ============================================
    // HEADER (TREKKING TRACE Professional Style)
    // ============================================
    const drawLogo = (x: number, y: number, size: number) => {
        const pColor = [19, 236, 109];
        doc.setDrawColor(pColor[0], pColor[1], pColor[2]);
        doc.setLineWidth(1.2);
        doc.line(x, y + size/1.5, x + size/4, y + size/1.5);
        doc.line(x + size/4, y + size/1.5, x + size/3, y + size/3);
        doc.line(x + size/3, y + size/3, x + size/2, y + size);
        doc.line(x + size/2, y + size, x + size/1.5, y);
        doc.line(x + size/1.5, y, x + size/1.2, y + size/1.5);
        doc.line(x + size/1.2, y + size/1.5, x + size, y + size/1.5);
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('TREKKING', x + size + 4, y + size/1.3);
        doc.setTextColor(pColor[0], pColor[1], pColor[2]);
        doc.text('TRACE', x + size + 36, y + size/1.3);
        
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('PRECISIÓN EN NAVEGACIÓN AGRESTRE', x + size + 4, y + size/1.3 + 4);
    };

    drawLogo(margin, 12, 12);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA MÉDICA DIGITAL', pageWidth - margin, 18, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('REGISTRO DE SEGURIDAD OPERATIVA', pageWidth - margin, 23, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 35, pageWidth - margin, 35);

    let yPos = 52;

    // Helper: Section Header
    const sectionHeader = (title: string, y: number): number => {
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(title, margin + 5, y + 7);
        return y + 14;
    };

    // ============================================
    // TAB 1: INFORMACION GENERAL
    // ============================================
    yPos = sectionHeader('1. INFORMACION GENERAL', yPos);

    autoTable(doc, {
        startY: yPos,
        body: [
            ['Peso', `${data.weight || 'No registrado'} kg`],
            ['Estatura', `${data.height || 'No registrado'} cm`],
            ['Presion Arterial', data.bloodPressure || '120/80'],
            ['Obra Social', data.insurance || 'No registrada'],
            ['Grupo Sanguineo', data.bloodType || 'No registrado'],
            ['Alergias', data.allergies || 'Ninguna registrada'],
        ],
        theme: 'grid',
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', fillColor: [248, 248, 248] },
            1: { cellWidth: contentWidth - 45 }
        },
        styles: { fontSize: 10, cellPadding: 4, textColor: [30, 30, 30] },
        margin: { left: margin, right: margin }
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 5;

    // Observations (special block)
    doc.setFillColor(250, 250, 245);
    doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('OBSERVACIONES CLINICAS', margin + 5, yPos + 6);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(50, 50, 50);
    const obsText = data.observations || 'Sin observaciones registradas.';
    doc.text(`"${obsText}"`, margin + 5, yPos + 15, { maxWidth: contentWidth - 10 });

    yPos += 28;

    // ============================================
    // TAB 2: CONDICIONES MEDICAS (CHECKLIST COMPLETO)
    // ============================================
    yPos = sectionHeader('2. EVALUACIÓN DE CONDICIONES MÉDICAS (Catálogo de Seguridad)', yPos);

    // Preparar filas para dos columnas (más compacto)
    const midPoint = Math.ceil(CONDITIONS_CATALOG.length / 2);
    const checklistRows = [];

    for (let i = 0; i < midPoint; i++) {
        const c1 = CONDITIONS_CATALOG[i];
        const c2 = i + midPoint < CONDITIONS_CATALOG.length ? CONDITIONS_CATALOG[i + midPoint] : null;

        const isMarked1 = data.conditions.includes(c1.id);
        const isMarked2 = c2 ? data.conditions.includes(c2.id) : false;

        checklistRows.push([
            isMarked1 ? '[ X ]' : '[   ]',
            c1.condicion,
            c2 ? (isMarked2 ? '[ X ]' : '[   ]') : '',
            c2 ? c2.condicion : ''
        ]);
    }

    autoTable(doc, {
        startY: yPos,
        head: [['Estado', 'Condición', 'Estado', 'Condición']],
        body: checklistRows,
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: (contentWidth / 2) - 15, fontSize: 8 },
            2: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: (contentWidth / 2) - 15, fontSize: 8 }
        },
        styles: { cellPadding: 2 },
        margin: { left: margin, right: margin }
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 8;

    // Medications sub-section
    if (data.medications.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text('Medicacion Activa:', margin + 2, yPos);
        yPos += 4;

        const medsBody = data.medications.map(m => [m.name, m.dosage]);
        autoTable(doc, {
            startY: yPos,
            head: [['Medicamento', 'Dosis']],
            body: medsBody,
            theme: 'grid',
            headStyles: { fillColor: [80, 80, 80] },
            styles: { fontSize: 9 },
            margin: { left: margin, right: margin }
        });
        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 10;
    } else {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Sin medicacion activa registrada.', margin + 5, yPos + 3);
        yPos += 12;
    }

    // ============================================
    // TAB 3: CONTACTOS DE EMERGENCIA
    // ============================================
    yPos = sectionHeader('3. CONTACTOS DE EMERGENCIA', yPos);

    const validContacts = data.emergencyContacts.filter(c => c.name && c.name !== 'No registrado');

    if (validContacts.length > 0) {
        const contactsBody = validContacts.map(c => [c.relation.toUpperCase(), c.name, c.phone]);
        autoTable(doc, {
            startY: yPos,
            head: [['Relacion', 'Nombre', 'Telefono']],
            body: contactsBody,
            theme: 'grid',
            headStyles: { fillColor: [200, 50, 50], textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: { 0: { cellWidth: 35, fontStyle: 'bold' } },
            margin: { left: margin, right: margin }
        });
    } else {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('No se registraron contactos de emergencia.', margin + 5, yPos + 5);
    }

    // Footer
    addFooter(doc);

    doc.save(`${fileName}.pdf`);
};

const addFooter = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Generado el ${new Date().toLocaleDateString()} - Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }
};

// --- LEGACY SCREEN CAPTURE METHOD (Fallback) ---
const generateScreenCapturePDF = async (elementId: string, fileName: string, bgColor: string) => {
    console.log("Using legacy screen capture for PDF...");
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const originalScrollTop = element.scrollTop;
        element.scrollTop = 0;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: bgColor,
            logging: false,
            windowWidth: 1200,
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.filter = 'grayscale(100%) contrast(150%) brightness(130%)';
                    // Force text white logic...
                    const allElements = clonedElement.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i] as HTMLElement;
                        const style = window.getComputedStyle(el);
                        if (style.color && style.color !== 'transparent') {
                            el.style.color = '#ffffff';
                            el.style.textShadow = 'none';
                        }
                    }
                }
            }
        });

        element.scrollTop = originalScrollTop;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error("Legacy PDF Gen Error", error);
        throw error;
    }
};
