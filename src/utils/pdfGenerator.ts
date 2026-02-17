
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
    conditions: string[];
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
    }[];
    skin: string;
    assessment: string;
    plan: string;
    responsibleId: string;
}

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
    // HEADER
    // ============================================
    doc.setFillColor(20, 50, 35); // Dark green header
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setFontSize(20);
    doc.setTextColor(80, 220, 140); // Primary green
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA MEDICA DIGITAL', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`Participante: ${data.fullName}`, pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(150, 200, 170);
    doc.text(`Documento de Seguridad - Uso Interno | Actualizado: ${data.lastUpdate || new Date().toLocaleDateString()}`, pageWidth / 2, 36, { align: 'center' });

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
    // TAB 2: CONDICIONES MEDICAS
    // ============================================
    yPos = sectionHeader(`2. CONDICIONES MEDICAS (${data.conditions.length} hallazgos)`, yPos);

    if (data.conditions.length > 0) {
        const condRows = data.conditions.map((c, i) => [String(i + 1), c]);
        autoTable(doc, {
            startY: yPos,
            head: [['#', 'Condicion Detectada']],
            body: condRows,
            theme: 'grid',
            headStyles: { fillColor: [200, 60, 60], textColor: [255, 255, 255] },
            columnStyles: { 0: { cellWidth: 12, halign: 'center' } },
            styles: { fontSize: 9, cellPadding: 3 },
            margin: { left: margin, right: margin }
        });
        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 8;
    } else {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('No se registran condiciones preexistentes.', margin + 5, yPos + 5);
        yPos += 12;
    }

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

const generateNativeSoapPDF = (data: SoapReportData, fileName: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // 1. Header
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Ficha SOAP', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte de Incidente - Gravedad: ${data.severity.toUpperCase()}`, pageWidth / 2, 30, { align: 'center' });

    let yPos = 50;

    // 2. Info Grid (Patient & Location)
    autoTable(doc, {
        startY: yPos,
        head: [['Paciente', 'Ubicación', 'Hora']],
        body: [[data.patientName, data.location, data.incidentTime]],
        theme: 'plain',
        styles: { fontSize: 11, fontStyle: 'bold', halign: 'center' },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 10;

    // 3. Subjective Section (S)
    doc.setFillColor(230, 230, 230);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUBJETIVO (S) - SAMPLE', 16, yPos + 6);
    yPos += 10;

    const subjectiveData = [
        ['Síntomas', data.symptoms],
        ['Alergias', data.allergies],
        ['Medicamentos', data.medications],
        ['Historia Pasada', data.history],
        ['Última Ingesta', data.lastIntake],
        ['Eventos Previos', data.events],
        ['Escena', data.scene]
    ];

    autoTable(doc, {
        startY: yPos,
        body: subjectiveData,
        theme: 'grid',
        showHead: 'firstPage',
        columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold', fillColor: [250, 250, 250] } },
        styles: { fontSize: 9, cellPadding: 3 }
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 10;

    // 4. Objective Section (O) - Vitals
    doc.setFillColor(230, 230, 230);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    doc.text('OBJETIVO (O) - Signos Vitales', 16, yPos + 6);
    yPos += 10;

    const vitalsBody = data.vitals.map(v => [v.time, v.pulse, v.resp, v.bp, v.spo2, v.temp, v.avdi]);

    autoTable(doc, {
        startY: yPos,
        head: [['Hora', 'Pulso', 'Resp', 'T/A', 'SpO2', 'Temp', 'AVDI']],
        body: vitalsBody,
        theme: 'striped',
        headStyles: { fillColor: [50, 50, 50], halign: 'center' },
        bodyStyles: { halign: 'center' },
        styles: { fontSize: 9 }
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 5;

    // Skin condition
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estado de Piel: ${data.skin || 'No especificado'}`, 15, yPos + 5);

    yPos += 15;

    // 5. Assessment & Plan (A/P)
    doc.setFillColor(230, 230, 230);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    doc.setFontSize(11);
    doc.text('EVALUACIÓN Y PLAN (A/P)', 16, yPos + 6);
    yPos += 10;

    autoTable(doc, {
        startY: yPos,
        body: [
            ['Evaluación', data.assessment],
            ['Plan / Tratamiento', data.plan]
        ],
        theme: 'grid',
        columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold', fillColor: [250, 250, 250] } },
        styles: { fontSize: 9, cellPadding: 5 }
    });

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
