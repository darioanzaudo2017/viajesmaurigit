
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

        console.log("Starting html2canvas with smart grayscale");

        // Configuration for html2canvas
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Allow loading cross-origin images
            backgroundColor: bgColor,
            logging: true,
            windowWidth: 1200,
            imageTimeout: 15000,
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);

                if (clonedElement) {
                    clonedElement.style.opacity = '1';
                    clonedElement.style.visibility = 'visible';

                    // --- SMART GRAYSCALE ---
                    // 1. Apply High Contrast Grayscale Filter
                    // brighten the image significantly to make text pop against dark backgrounds
                    clonedElement.style.filter = 'grayscale(100%) contrast(150%) brightness(130%)';

                    // 2. Force text contrast manually
                    // We iterate through all elements to ensure text is light enough
                    const allElements = clonedElement.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i] as HTMLElement;

                        // Safely get computed style from the clone's window context
                        const computedStyle = el.ownerDocument.defaultView?.getComputedStyle(el) || window.getComputedStyle(el);

                        const color = computedStyle.color;

                        // Heuristic: If it has a color (is text/icon) and we are in a dark theme context,
                        // force it to white to ensure it survives the grayscale filter with max contrast.
                        // We skip transparent elements or those that might be invisible.
                        if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
                            el.style.color = '#ffffff';
                            el.style.textShadow = 'none';
                            el.style.setProperty('text-decoration-color', '#ffffff', 'important');
                        }

                        // Ensure borders are visible too
                        const borderColor = computedStyle.borderColor;
                        if (borderColor && borderColor !== 'transparent' && borderColor !== 'rgba(0, 0, 0, 0)') {
                            el.style.borderColor = 'rgba(255, 255, 255, 0.3)'; // Settle for a light gray border
                        }
                    }
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
