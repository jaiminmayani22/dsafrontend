import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import '../../../styles/style.css';
import Quill from 'quill';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Font = Quill.import('formats/font');
Font.whitelist = ['serif', 'sans-serif', 'monospace', 'roboto', 'open-sans', 'lato'];
Quill.register(Font, true);

interface CustomEditorProps {
    value: string;
    onChange: (newValue: string) => void;
}

const CustomEditor = ({ onChange, value }: CustomEditorProps) => {
    const [editorValue, setEditorValue] = useState(value || '');
    useEffect(() => {
        if (value !== editorValue) {
            setEditorValue(value || '');
        }
    }, [value, editorValue]);

    const handleEditorChange = (newValue: string) => {
        if (newValue !== editorValue) {
            setEditorValue(newValue);
            if (onChange) {
                onChange(newValue);
            }
        }
    };

    const modules = {
        toolbar: [
            [{ 'font': ['serif', 'sans-serif', 'monospace', 'roboto', 'open-sans', 'lato'] }],
            [{ 'size': ['small', false, 'large', 'huge', '12px', '14px', '16px', '18px', '24px', '36px'] }],
            [{ 'color': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['clean'],
        ],
    };

    const formats = [
        'font',
        'size',
        'color',
        'bold', 'italic', 'underline', 'strike',
    ];

    return (
        <div>
            <ReactQuill
                theme="snow"
                value={editorValue}
                onChange={handleEditorChange}
                modules={modules}
                formats={formats}
            />
        </div>
    );
};

export default CustomEditor;
