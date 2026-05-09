'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TestimonialAvatarProps } from '@/types';
import React from 'react';

const getInitials = (name: string): string => {
    if (!name || name.trim() === '') {
        return '?';
    }

    return name
        .trim()
        .split(' ')
        .filter((word) => word.length > 0)
        .map((word) => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
};

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
} as const;

const TestimonialAvatar: React.FC<TestimonialAvatarProps> = ({
    name,
    avatarUrl,
    AvatarComponent = Avatar,
    size = 'md',
    className = '',
    fallbackClassName = '',
}) => {
    if (!name) {
        return null;
    }

    const initials = getInitials(name);
    const sizeClass = sizeClasses[size];

    return (
        <AvatarComponent className={`${sizeClass} ${className}`}>
            {avatarUrl && (
                <AvatarImage
                    src={avatarUrl}
                    alt={`${name}'s profile picture`}
                    onError={(e) => {
                        console.warn(`Failed to load avatar image for ${name}:`, avatarUrl);
                    }}
                />
            )}
            <AvatarFallback
                className={`
                    bg-gradient-to-br from-blue-500 to-purple-600 
                    text-white 
                    font-semibold
                    ${fallbackClassName}
                `}
                title={name}
            >
                {initials}
            </AvatarFallback>
        </AvatarComponent>
    );
};

export default TestimonialAvatar;
