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
            ['bold', 'italic', 'underline', 'strike'],
            ['clean'],
        ],
    };

    const formats = [
        'bold', 'italic', 'underline', 'strike',
    ];

    const convertToWhatsAppFormat = (html: string) => {
        let text = html
            .replace(/<strong>(.*?)<\/strong>/g, '*$1*')
            .replace(/<em>(.*?)<\/em>/g, '_$1_')
            .replace(/<u>(.*?)<\/u>/g, '_$1_')
            .replace(/<strike>(.*?)<\/strike>/g, '~$1~');
        text = text.replace(/<\/?[^>]+(>|$)/g, "");
        return text;
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
