'use client';
import React from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface MobileSearchModalProps {
    title: string;
    placeholder: string;
    searchVal: string;
    onSearchValChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
    modalRef: React.RefObject<HTMLDivElement | null>;
    children: React.ReactNode;
}

const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
    title,
    placeholder,
    searchVal,
    onSearchValChange,
    onClose,
    modalRef,
    children,
}) => (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col" ref={modalRef}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Button
                variant="ghost"
                onClick={onClose}
                className="p-2 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 h-auto w-auto"
                aria-label="Close modal"
            >
                <X className="w-5 h-5" />
            </Button>
            <div className="text-lg font-semibold">{title}</div>
            <div className="w-9" aria-hidden="true"></div>
        </div>

        <div className="p-4 border-b border-gray-200">
            <Input
                value={searchVal}
                onChange={onSearchValChange}
                placeholder={placeholder}
                className="w-full"
                autoFocus
            />
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
);

export default MobileSearchModal;
