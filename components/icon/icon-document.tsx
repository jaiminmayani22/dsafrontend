import { FC } from 'react';

interface IconDocumentProps {
    className?: string;
}

const IconDocument: FC<IconDocumentProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M14 2H7C5.34315 2 4 3.34315 4 5V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V9L14 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                opacity="0.5"
                d="M14 2V8C14 8.55228 14.4477 9 15 9H20"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M9 13H15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M9 17H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default IconDocument;
