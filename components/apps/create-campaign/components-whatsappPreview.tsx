import ImageWithLayers from './components-finalPreview';

interface WhatsAppMessagePreviewProps {
    selectedTemplate: {
        imageUrl: string; 
    };
    selectedRefTemplate: {
        layers: Array<{
            type: string;
        }>;
    };
}

const WhatsAppMessagePreview: React.FC<WhatsAppMessagePreviewProps> = ({ selectedTemplate, selectedRefTemplate }) => {
    return (
        <ImageWithLayers 
            selectedTemplate={selectedTemplate} 
            selectedRefTemplate={selectedRefTemplate} 
        />
    );
};

export default WhatsAppMessagePreview;
