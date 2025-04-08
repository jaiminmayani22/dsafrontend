import { useEffect, useRef, useState } from 'react';
import { log } from 'util';

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

            if (selectedTemplate.data && selectedTemplate.data.width && selectedTemplate.data.height) {
                canvas.width = selectedTemplate.data.width;
                canvas.height = selectedTemplate.data.height;
            } else if (typeof selectedTemplate === 'string') {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = selectedTemplate;
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                };

                img.onerror = () => {
                    console.error("Failed to load image from URL.");
                };
            }

            if (ctx) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = selectedTemplate.imageUrl ? selectedTemplate.imageUrl : selectedTemplate;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    selectedRefTemplate.layers.forEach((layer: any) => {
                        if (layer.type === 'text') {
                            let text = layer.content;
                            let currentY = layer.calculatedy;
                            const replacements: Record<'logo' | 'name' | 'address' | 'number' | 'website' | 'email' | 'instagramId' | 'facebookId', string> = {
                                logo: "logo", // This will trigger rectangle rendering
                                name: "Tom Smith",
                                address: "Rajkot",
                                number: "+919586985698",
                                website: "www.dashrathsilverart.com",
                                email: "dashrathsilverart@gmail.com",
                                instagramId: "dashrathsilverart",
                                facebookId: "Dashrath Silver Art",
                            };

                            text = replacements[text as keyof typeof replacements] || text;

                            if (!text.trim()) return;
                            if (text.toLowerCase() === "logo") {
                                const rectWidth = layer.width;
                                const rectHeight = layer.size;

                                ctx.fillStyle = 'white';
                                ctx.fillRect(
                                    layer.calculatedx - rectWidth / 2,
                                    currentY - rectHeight / 2,
                                    rectWidth,
                                    rectHeight
                                );

                                ctx.strokeStyle = 'black';
                                ctx.lineWidth = 2;
                                ctx.strokeRect(
                                    layer.calculatedx - rectWidth / 2,
                                    currentY - rectHeight / 2,
                                    rectWidth,
                                    rectHeight
                                );

                                const fontSize = `${rectHeight}px`;
                                const fontFamily = layer.fontFamily || 'Times New Roman';
                                ctx.font = `${fontSize} ${fontFamily}`;
                                ctx.fillStyle = layer.fillStyle || 'black';
                                ctx.textAlign = layer.textAlign || 'center';
                                ctx.textBaseline = layer.textBaseline || 'middle';

                                ctx.fillText("logo", layer.calculatedx, currentY);
                                currentY += rectHeight;
                                return;
                            }

                            let fontSize = `${layer.size}px`;
                            let fontFamily = layer.fontFamily || 'Times New Roman';
                            let fontWeight = layer.fontWeight || 'normal';
                            let fontStyle = layer.fontStyle || 'normal';
                            let textDecoration = layer.textDecoration;
                            let fillColor = layer.fillColor || 'black';

                            ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;

                            ctx.fillStyle = fillColor;
                            ctx.textAlign = layer.textAlign || 'center';
                            ctx.textBaseline = layer.textBaseline || 'middle';

                            ctx.fillText(text, layer.calculatedx, currentY);
                            if (textDecoration === 'underline') {
                                const textWidth = ctx.measureText(text).width;
                                const underlineY = currentY + parseFloat(fontSize) * 0.1;

                                ctx.beginPath();
                                ctx.moveTo(layer.calculatedx - textWidth / 2, underlineY);
                                ctx.lineTo(layer.calculatedx + textWidth / 2, underlineY);
                                ctx.strokeStyle = fillColor;
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            }
                            currentY += parseFloat(fontSize);
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
            {imageUrl && <img src={imageUrl} alt="Generated Preview" className="max-w-full max-h-screen" />}
        </div>
    );
};

export default ImageWithLayers;
