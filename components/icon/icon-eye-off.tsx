import { FC } from 'react';

interface IconEyeOffProps {
  className?: string;
}

const IconEyeOff: FC<IconEyeOffProps> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        opacity="0.5"
        d="M9.9497 9.94974C10.5962 9.30326 11.4649 9 12.4 9C13.9305 9 15.2 10.2695 15.2 11.8C15.2 12.7351 14.8967 13.6037 14.2503 14.2503M18.2092 17.2092C16.5452 18.5169 14.385 19.4 12 19.4C7.81811 19.4 4.97196 16.9004 3.27489 14.6957C2.42496 13.5915 2 13.0394 2 11.4C2 10.597 2.25771 9.91408 2.69767 9.3218M9.9497 14.2503C9.30326 13.6037 9 12.7351 9 11.8C9 10.2695 10.2695 9 11.8 9C12.7351 9 13.6037 9.30326 14.2503 9.94974M18.2092 17.2092L20 19M18.2092 17.2092L3.79085 2.79086M3.79085 2.79086L1 0M3.79085 2.79086L5.58165 4.58165"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconEyeOff;
