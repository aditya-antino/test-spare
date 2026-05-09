import React from 'react';

interface LoaderProps {
    size?: number; // in px, default 40
    colorClass?: string; // Tailwind text color class, default primary-p1
    className?: string; // additional classes if needed
}

const Loader: React.FC<LoaderProps> = ({
    size = 25,
    colorClass = 'text-primary-p1',
    className = '',
}) => {
    return (
        <svg
            role="status"
            className={`animate-spin ${colorClass} ${className}`}
            style={{ width: size, height: size }}
            viewBox="0 0 50 50"
            aria-label="Loading"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                className="opacity-25"
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
            />
            <circle
                className="opacity-75"
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="90"
                strokeDashoffset="60"
            />
        </svg>
    );
};

export default Loader;
