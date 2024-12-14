import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import '../../../styles/style.css';
import Quill from 'quill';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Font = Quill.import('formats/font');
Font.whitelist = ['serif', 'sans-serif', 'monospace'];
Quill.register(Font, true);

const Size = Quill.import('formats/size');
Size.whitelist = ['small', false, 'large', 'huge'];
Quill.register(Size, true);

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
            [{ font: Font.whitelist }],
            [{ size: Size.whitelist }],
            [{ color: [] }],
            ['bold', 'italic', 'underline'],
            ['clean'],
        ],
    };

    const formats = [
        'font', 'size', 'color', 'background',
        'bold', 'italic', 'underline',
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
