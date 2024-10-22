import { useEffect, useRef, useState } from 'react';

interface ImageWithLayersProps {
    selectedTemplate: any;
    selectedRefTemplate: any;
}

const ImageWithLayers: React.FC<ImageWithLayersProps> = ({ selectedTemplate, selectedRefTemplate }) => {
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        if (selectedTemplate && selectedRefTemplate) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = selectedTemplate.data.width;
            canvas.height = selectedTemplate.data.height;

            if (ctx) {
                const img = new Image();
                img.src = selectedTemplate.imageUrl;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    selectedRefTemplate.layers.forEach((layer: any) => {
                        if (layer.type === 'text') {
                            const quillClassMapping: { [key: string]: string } = {
                                'ql-size-small': '20px',
                                'ql-size-large': '38px',
                                'ql-size-huge': '66px',
                                'ql-font-serif': 'serif',
                                'ql-font-monospace': 'monospace',
                                'ql-font-sans-serif': 'sans-serif',
                                'ql-font-roboto': 'Roboto',
                                'ql-font-open-sans': 'Open Sans',
                                'ql-font-lato': 'Lato',
                            };

                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = layer.content;
                            const textElements = tempDiv.querySelectorAll('p, span, em, strong, u');

                            const extractTextContent = (element: any) => {
                                if (element.children.length === 0) {
                                    return element.innerText || element.textContent;
                                }
                                return '';
                            };

                            let currentY = layer.y;

                            textElements.forEach((textElement) => {
                                const text = extractTextContent(textElement);
                                if (!text.trim()) return;

                                let fontSize = '24px';
                                let fontFamily = 'Times New Roman';
                                let fontWeight = 'normal';
                                let fontStyle = 'normal';
                                let textDecoration = 'none';
                                let fillColor = 'black';

                                textElement.classList.forEach((cls: any) => {
                                    if (quillClassMapping[cls as keyof typeof quillClassMapping]) {
                                        if (cls.startsWith('ql-font')) {
                                            fontFamily = quillClassMapping[cls];
                                        }
                                        if (cls.startsWith('ql-size')) {
                                            fontSize = quillClassMapping[cls];
                                        }
                                    }
                                });

                                const style = textElement.getAttribute('style');
                                if (style) {
                                    const colorMatch = style.match(/color:\s*([^;]+);?/i);
                                    if (colorMatch) {
                                        fillColor = colorMatch[1];
                                    }
                                }

                                if (textElement.tagName === 'STRONG' || (textElement instanceof HTMLElement && textElement.style.fontWeight === 'bold')) {
                                    fontWeight = 'bold';
                                }
                                if (textElement.tagName === 'EM' || (textElement instanceof HTMLElement && textElement.style.fontWeight === 'italic')) {
                                    fontStyle = 'italic';
                                }
                                if (textElement.tagName === 'U' || (textElement instanceof HTMLElement && textElement.style.fontWeight === 'underline')) {
                                    textDecoration = 'underline';
                                }

                                ctx.font = `${fontWeight} ${fontStyle} ${fontSize} ${fontFamily}`;
                                ctx.fillStyle = fillColor;
                                ctx.textBaseline = 'top';
                                ctx.fillText(text, layer.x, currentY);

                                if (textDecoration === 'underline') {
                                    ctx.beginPath();
                                    ctx.moveTo(layer.x, currentY + parseFloat(fontSize));
                                    ctx.lineTo(layer.x + ctx.measureText(text).width, currentY + parseFloat(fontSize));
                                    ctx.strokeStyle = fillColor;
                                    ctx.lineWidth = 1;
                                    ctx.stroke();
                                }
                                currentY += parseFloat(fontSize);
                            });
                        }
                    });

                    setImageUrl(canvas.toDataURL('image/png'));
                };
            } else {
                console.error("Failed to get canvas context");
            }
        }
    }, [selectedTemplate, selectedRefTemplate]);

    return (
        <div>
            {imageUrl && <img src={imageUrl} alt="Generated Preview" className="w-full h-auto" />}
        </div>
    );
};

export default ImageWithLayers;
