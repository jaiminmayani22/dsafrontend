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
            ['bold', 'italic', 'underline'],
            ['clean'],
        ],
    };

    const formats = ['bold', 'italic', 'underline'];

    function convertToWhatsAppFormat(html: any) {
        let text = html
            .replace(/<strong><em><u>(.*?)<\/u><\/em><\/strong>/g, '*___$1___*')
            .replace(/<strong><u>(.*?)<\/u><\/strong>/g, '*__$1__*')
            .replace(/<strong><em>(.*?)<\/em><\/strong>/g, '*_$1_*')
            .replace(/<u><strong>(.*?)<\/strong><\/u>/g, '__*$1*__')
            .replace(/<em>(.*?)<\/em>/g, '_$1_')
            .replace(/<strong>(.*?)<\/strong>/g, '*$1*')
            .replace(/<u>(.*?)<\/u>/g, '__$1__')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<p>(.*?)<\/p>/g, '$1\n')
            .replace(/<\/?[^>]+(>|$)/g, '');

        return text.trim();
    }

    return (
        <div className="flex w-full overflow-hidden">
            <div className="w-full max-w-[600px] sm:max-w-[550px]">
                <ReactQuill
                    theme="snow"
                    value={editorValue}
                    onChange={setEditorValue}
                    modules={modules}
                    formats={formats}
                    className="editor-container"
                />
            </div>
        </div>
    );
};

export default CustomEditor;
