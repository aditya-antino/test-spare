import React, { ElementType, ReactNode } from 'react';

type Weight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type Align = 'left' | 'center' | 'right';
type DisplayStyle = 'plain' | 'underline' | 'accent-bar' | 'shadow';

// map tailwind text size -> responsive classes
const TEXT_SIZES: Record<string, string> = {
    xs: 'text-xs md:text-sm',
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
    '3xl': 'text-3xl md:text-4xl',
    '4xl': 'text-3xl md:text-4xl',
    '5xl': 'text-4xl md:text-5xl',
    '6xl': 'text-5xl md:text-6xl',
    '7xl': 'text-6xl md:text-7xl',
};

const WEIGHTS: Record<Weight, string> = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
};

interface TypographyProps {
    as?: ElementType;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: string;

    /** Core props */
    size?: keyof typeof TEXT_SIZES; // restrict to defined keys
    weight?: Weight | string;
    color?: string;
    align?: Align;
    leading?: string;
    displayStyle?: DisplayStyle;
}

export default function Typography({
    as,
    children,
    className = '',
    onClick,
    size = 'base',
    weight = 'normal',
    color = 'text-gray-900',
    align = 'left',
    leading = 'leading-none',
    displayStyle = 'plain',
    ...rest
}: TypographyProps) {
    const Tag = as || 'p';

    const baseSize = TEXT_SIZES[size] || TEXT_SIZES.base;
    const weightClass =
        typeof weight === 'string' && WEIGHTS[weight as Weight]
            ? WEIGHTS[weight as Weight]
            : (weight as string);

    const alignClass =
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    const decorClass =
        displayStyle === 'underline'
            ? 'underline'
            : displayStyle === 'accent-bar'
              ? 'relative pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-6 before:rounded-sm before:bg-indigo-500'
              : displayStyle === 'shadow'
                ? 'drop-shadow'
                : '';

    const combined = [baseSize, leading, weightClass, color, alignClass, decorClass, className]
        .filter(Boolean)
        .join(' ');

    return (
        <Tag onClick={onClick} className={combined} {...rest}>
            {children}
        </Tag>
    );
}
