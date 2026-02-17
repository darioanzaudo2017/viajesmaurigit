
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateMedicalPDF = async (elementId: string, fileName: string, bgColor: string = '#ffffff') => {
    console.log("PDF Utility starting for:", elementId);
    const element = document.getElementById(elementId);
    if (!element) {
        console.error("PDF element not found inside utility");
        return;
    }

    try {
        // Force scroll to top of element to ensure full capture
        const originalScrollTop = element.scrollTop;
        element.scrollTop = 0;

        console.log("Starting html2canvas with grayscale mode");

        // Configuration for html2canvas
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Allow loading cross-origin images (like Unsplash)
            backgroundColor: bgColor,
            logging: true,
            windowWidth: 1200, // Force desktop width for consistent layout
            imageTimeout: 15000, // Longer timeout for images
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);

                if (clonedElement) {
                    clonedElement.style.opacity = '1';
                    clonedElement.style.visibility = 'visible';
                    // Force grayscale filter on the entire cloned element
                    // This is the key: it converts ALL colors to grayscale visually
                    // effectively bypassing the color parsing issues with modern CSS
                    clonedElement.style.filter = 'grayscale(100%) contrast(120%)';
                    clonedElement.style.color = '#000000'; // Force base text to black
                    clonedElement.style.backgroundColor = '#ffffff'; // Force background to white
                }
            }
        });

        // Restore scroll position
        element.scrollTop = originalScrollTop;

        console.log("Canvas generated successfully");
        const imgData = canvas.toDataURL('image/png');

        // Create PDF document
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2] // Match PDF size to canvas size (scaled down)
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`${fileName}.pdf`);
        console.log("PDF save called");

    } catch (error: any) {
        console.error("Critical error in generateMedicalPDF:", error);
        throw error;
    }
};
