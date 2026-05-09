'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';

interface VerificationRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    verificationPath?: string;
    isAuthenticated?: boolean;
}

const VerificationRequiredModal: React.FC<VerificationRequiredModalProps> = ({
    isOpen,
    onClose,
    verificationPath = '',
    isAuthenticated = false,
}) => {
    const router = useRouter();

    if (!isOpen) return null;

    const handleAction = () => {
        onClose();
        if (!isAuthenticated) {
            router.push(PATHS.LOGIN);
        } else {
            window.open(verificationPath, '_blank');
        }
    };

    const title = !isAuthenticated ? 'Login Required' : 'Verification Required';
    const message = !isAuthenticated
        ? 'You need to login first to proceed with this action.'
        : 'You need to verify your account to proceed. Please complete the verification process to continue.';
    const buttonText = !isAuthenticated ? 'Login Now' : 'Verify Now';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 text-center mb-4">{title}</h2>

                <p className="text-gray-600 text-center mb-6 leading-relaxed">{message}</p>

                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="px-6 py-2 rounded-full font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAction}
                        className="bg-[#F6CD28] hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-full"
                    >
                        {buttonText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VerificationRequiredModal;
