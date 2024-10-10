import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import '../../../styles/style.css';
import Quill from 'quill';

// Register custom formats for lineheight and letterspacing
const Parchment = Quill.import('parchment');

// Line Height
const lineHeightConfig = {
    scope: Parchment.Scope.INLINE,
    whitelist: ['1', '1.5', '2'] // allowed values for lineheight
};
const LineHeightStyle = new Parchment.Attributor.Style('lineheight', 'line-height', lineHeightConfig);
Quill.register(LineHeightStyle, true);

// Letter Spacing
const letterSpacingConfig = {
    scope: Parchment.Scope.INLINE,
    whitelist: ['0.5px', '1px', '1.5px', '2px'] // allowed values for letterspacing
};
const LetterSpacingStyle = new Parchment.Attributor.Style('letterspacing', 'letter-spacing', letterSpacingConfig);
Quill.register(LetterSpacingStyle, true);

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const CustomEditor = ({ onChange }) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (onChange) {
            onChange(value);
        }
    }, [value, onChange]);

    const modules = {
        toolbar: [
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'lineheight': ['1', '1.5', '2'] }], // Custom lineheight
            [{ 'letterspacing': ['0.5px', '1px', '1.5px', '2px'] }], // Custom letterspacing
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    const formats = [
        'font',
        'size',
        'align',
        'color',
        'background',
        'lineheight', // Custom format
        'letterspacing', // Custom format
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link', 'image'
    ];

    return (
        <div>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={setValue}
                modules={modules}
                formats={formats}
            />
        </div>
    );
};

export default CustomEditor;
