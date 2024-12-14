import { FC } from 'react';

interface IconImageProps {
    className?: string;
}

const IconImage: FC<IconImageProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M3 5.5C3 4.67157 3.67157 4 4.5 4H19.5C20.3284 4 21 4.67157 21 5.5V18.5C21 19.3284 20.3284 20 19.5 20H4.5C3.67157 20 3 19.3284 3 18.5V5.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M8 14L11 11L14 14L19 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
        </svg>
    );
};

export default IconImage;
