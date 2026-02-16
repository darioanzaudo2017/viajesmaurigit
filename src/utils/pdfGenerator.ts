import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateMedicalPDF = async (elementId: string, fileName: string, bgColor: string = '#102218') => {
    console.log("PDF Utility starting for:", elementId);
    const element = document.getElementById(elementId);
    if (!element) {
        console.error("PDF element not found inside utility");
        return;
    }

    try {
        // Force scroll to top of element to ensure full capture
        element.scrollTop = 0;

        console.log("Element dimensions:", element.offsetWidth, "x", element.offsetHeight);
        if (element.offsetHeight === 0) {
            console.warn("Element has 0 height, html2canvas might produce a blank image or fail.");
        }

        console.log("Starting html2canvas with element:", element);
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: bgColor,
            logging: true,
            windowWidth: 1200,
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.opacity = '1';
                    clonedElement.style.visibility = 'visible';
                }

                // Aggressive fix for modern CSS functions that break html2canvas
                const styleTags = clonedDoc.getElementsByTagName('style');
                for (let i = 0; i < styleTags.length; i++) {
                    const style = styleTags[i];
                    if (/(oklch|oklab|lab|lch|color-mix|color|light-dark)/.test(style.innerHTML)) {
                        // Replace modern color functions with a generic dark color
                        style.innerHTML = style.innerHTML.replace(/(oklch|oklab|lab|lch|color-mix|color|light-dark)\([^)]+\)/g, '#102218');
                    }
                }
            }
        });

        console.log("Canvas generated:", canvas.width, "x", canvas.height);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`${fileName}.pdf`);
        console.log("PDF save called");
    } catch (error: any) {
        console.error("Critical error in generateMedicalPDF:", error);
        throw error;
    }
};
