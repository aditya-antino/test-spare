'use client';
import React from 'react';
import { X } from 'lucide-react';
import AuthLoginFlow from '@/components/modals/AuthModal/AuthLoginFlow';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[8000] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-t-[32px] md:rounded-[32px] shadow-2xl p-6 md:p-8 w-full md:max-w-md md:mx-4 animate-in slide-in-from-bottom md:slide-in-from-none md:zoom-in-95 fade-in duration-300 max-h-[90vh] md:max-h-[85vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                {/* Mobile Handle Bar */}
                <div className="md:hidden flex justify-center mb-4 -mt-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full z-10"
                >
                    <X className="h-6 w-6" />
                </button>

                <AuthLoginFlow 
                    onSuccess={() => {
                        onClose();
                    }}
                />
            </div>
        </div>
    );
};

export default AuthModal;
