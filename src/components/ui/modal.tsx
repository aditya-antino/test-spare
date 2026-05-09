'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg';

export type ModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    showClose?: boolean;
    size?: ModalSize;
    className?: string;
    ariaLabel?: string;
    closeOnOverlay?: boolean;
};

export function Modal({
    open,
    onClose,
    title,
    description,
    icon,
    children,
    footer,
    showClose = true,
    size = 'sm',
    className,
    ariaLabel,
    closeOnOverlay = true,
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Handle mount/unmount with animation
    useEffect(() => {
        if (open) {
            setIsMounted(true);
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsMounted(false), 200);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Lock body scroll
    useEffect(() => {
        if (isMounted) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [isMounted]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!closeOnOverlay) return;
        if (e.target === overlayRef.current) onClose();
    };

    const sizes: Record<ModalSize, string> = {
        sm: 'max-w-[343px]',
        md: 'max-w-[560px]',
        lg: 'max-w-[720px]',
    };

    if (!isMounted) return null;

    return (
        <div
            ref={overlayRef}
            onMouseDown={onOverlayClick}
            className={cn(
                'fixed h-screen w-screen top-0 left-0 inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]',
                'transition-all duration-200 ease-out',
                isVisible ? 'opacity-100' : 'opacity-0',
            )}
            aria-modal="true"
            role="dialog"
            aria-label={ariaLabel ?? title}
        >
            <div
                ref={modalRef}
                className={cn(
                    'relative bg-white rounded-2xl p-4 w-full',
                    sizes[size],
                    className,
                    'transition-all duration-200 ease-out transform',
                    isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
                )}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {showClose && (
                    <button
                        aria-label="Close"
                        onClick={onClose}
                        className="p-1 rounded-full absolute text-gray-600 hover:bg-gray-100 right-6 top-4 cursor-pointer transition-colors duration-150"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                {(title || showClose || icon) && (
                    <div className="flex items-center justify-center my-4">
                        <div className="flex flex-col justify-center items-center gap-2">
                            {icon && (
                                <span className="text-gray-700 transition-colors duration-150">
                                    {icon}
                                </span>
                            )}
                            {title && (
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 transition-colors duration-150">
                                    {title}
                                </h2>
                            )}
                        </div>
                    </div>
                )}
                {description && (
                    <p className="text-sm text-gray-600 mb-4 text-center transition-colors duration-150">
                        {description}
                    </p>
                )}
                <div>{children}</div>
                {footer && <div className="mt-6 transition-colors duration-150">{footer}</div>}
            </div>
        </div>
    );
}
