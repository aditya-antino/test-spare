'use client';

import React, { useId, useRef, useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import dayjs from 'dayjs';
import { ChevronDown, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DateInputProps = {
    label?: string;
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    align?: 'left' | 'right';
};

export function DateInput({
    label,
    value,
    onChange,
    placeholder = 'DD/MM/YY',
    className,
    align = 'left',
}: DateInputProps) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const popRef = useRef<HTMLDivElement>(null);
    const id = useId();

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (
                popRef.current &&
                !popRef.current.contains(e.target as Node) &&
                !btnRef.current?.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <div className={cn('relative', className)}>
            <button
                ref={btnRef}
                onClick={() => setOpen((p) => !p)}
                aria-expanded={open}
                aria-controls={id}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 flex items-center justify-between shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-all hover:border-[#F6CD28] focus:outline-none focus:ring-2 focus:ring-[#F6CD28]/20"
            >
                <span className="flex flex-col">
                    {label && <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</span>}
                    <span className={cn('font-medium', !value && 'text-gray-400')}>
                        {value ? dayjs(value).format('DD/MM/YY') : placeholder}
                    </span>
                </span>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", open && "rotate-180")} />
            </button>

            {open && (
                <div
                    id={id}
                    ref={popRef}
                    className={cn(
                        'absolute z-50 mt-2 bg-white rounded-2xl border border-gray-100 p-3 shadow-[0px_10px_40px_rgba(0,0,0,0.1)] backdrop-blur-sm bg-white/95 animate-in fade-in zoom-in-95 duration-200',
                        align === 'left' ? 'left-0' : 'right-0',
                    )}
                >
                    <style>{`
                        .rdp {
                            --rdp-cell-size: 40px;
                            --rdp-accent-color: #F6CD28;
                            --rdp-background-color: #F6CD2815;
                            margin: 0;
                        }
                        .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                            color: black !important;
                            font-weight: bold;
                        }
                        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                            background-color: var(--rdp-background-color);
                        }
                    `}</style>
                    <DayPicker
                        mode="single"
                        selected={value ?? undefined}
                        onSelect={(d) => {
                            onChange?.(d ?? null);
                            setOpen(false);
                        }}
                        captionLayout="dropdown"
                        className="rdp-root"
                    />
                </div>
            )}
        </div>
    );
}

export function SwapIcon() {
    return (
        <div className="mx-3 my-2 rounded-full p-2 text-yellow-600 flex items-center">
            <ArrowLeftRight className="w-4 h-4" />
        </div>
    );
}
