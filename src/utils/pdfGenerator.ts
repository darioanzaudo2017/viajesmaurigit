
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to resolve modern CSS colors to RGB that html2canvas supports
const resolveColor = (color: string, ctx: CanvasRenderingContext2D | null): string => {
    if (!color || color === 'transparent' || color === 'currentcolor') return color;
    // Check for modern color spaces or functions that html2canvas might not support
    if (!/oklch|oklab|lab|lch|color\(|hwb|light-dark/.test(color)) return color;

    if (!ctx) return color;

    // Use canvas to convert to RGBA
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;

    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};

export const generateMedicalPDF = async (elementId: string, fileName: string, bgColor: string = '#102218') => {
    console.log("PDF Utility starting for:", elementId);
    const element = document.getElementById(elementId);
    if (!element) {
        console.error("PDF element not found inside utility");
        return;
    }

    // Create a shared canvas for color resolution
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = 1;
    colorCanvas.height = 1;
    const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });

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
                const originalElement = document.getElementById(elementId);

                if (clonedElement && originalElement) {
                    clonedElement.style.opacity = '1';
                    clonedElement.style.visibility = 'visible';

                    // Recursive function to copy and resolve computed styles
                    const processNode = (source: Element, target: HTMLElement) => {
                        const computed = window.getComputedStyle(source);

                        // List of color properties to process
                        const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'textDecorationColor', 'columnRuleColor'];

                        colorProps.forEach(prop => {
                            // @ts-ignore
                            const val = computed[prop];
                            if (val) {
                                // @ts-ignore
                                target.style[prop] = resolveColor(val, colorCtx);
                            }
                        });

                        // Handle SVG specific properties
                        if (source.tagName.toLowerCase() === 'svg' || source.tagName.toLowerCase() === 'path' || source.tagName.toLowerCase() === 'circle' || source.tagName.toLowerCase() === 'rect') {
                            const fill = computed.getPropertyValue('fill');
                            const stroke = computed.getPropertyValue('stroke');
                            if (fill && fill !== 'none') target.style.fill = resolveColor(fill, colorCtx);
                            if (stroke && stroke !== 'none') target.style.stroke = resolveColor(stroke, colorCtx);
                        }

                        // Handle standard fill/stroke if they appear in computed styles (e.g. from CSS)
                        // Note: getComputedStyle might not return 'fill' on non-SVG elements, but valid on SVGs

                        // Recursively process children
                        // Use loop with index to match siblings (assuming identical structure)
                        const sourceChildren = source.children;
                        const targetChildren = target.children;

                        for (let i = 0; i < sourceChildren.length; i++) {
                            if (targetChildren[i]) {
                                processNode(sourceChildren[i], targetChildren[i] as HTMLElement);
                            }
                        }
                    };

                    // Start processing
                    processNode(originalElement, clonedElement);
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
