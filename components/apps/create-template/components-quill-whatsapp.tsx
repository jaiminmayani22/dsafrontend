import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import '../../../styles/style.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface CustomEditorProps {
    value: string;
    onChange: (newValue: string) => void;
}

const CustomEditor = ({ onChange, value }: CustomEditorProps) => {
    const [editorValue, setEditorValue] = useState(value || '');

    useEffect(() => {
        if (onChange) {
            const whatsappFormattedText = convertToWhatsAppFormat(editorValue);
            onChange(whatsappFormattedText);
        }
    }, [editorValue, onChange]);

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // Formatting options
            ['clean'],
        ],
    };

    const formats = ['bold', 'italic', 'underline', 'strike'];

    const convertToWhatsAppFormat = (html: string) => {
        let text = html
            .replace(/<strong>(.*?)<\/strong>/g, '*$1*') // Bold
            .replace(/<em>(.*?)<\/em>/g, '_$1_')         // Italic
            .replace(/<u>(.*?)<\/u>/g, '_$1_')           // Underline (treated as italic in WhatsApp)
            .replace(/<strike>(.*?)<\/strike>/g, '~$1~') // Strikethrough
            .replace(/<br\s*\/?>/g, '\n')                // Line breaks
            .replace(/<p>(.*?)<\/p>/g, '$1\n')           // Paragraphs to new lines
            .replace(/<\/?[^>]+(>|$)/g, '');             // Strip all other HTML tags

        return text.trim();
    };

    return (
        <div>
            <ReactQuill
                theme="snow"
                value={editorValue}
                onChange={setEditorValue}
                modules={modules}
                formats={formats}
            />
        </div>
    );
};

export default CustomEditor;
