'use client';

import React, { useEffect, useState, useRef } from 'react';
import Typography from '@/components/ui/typoGraphy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '@/components/ui/loader';
import { ArrowLeft } from 'lucide-react';

interface EmailOtpStepProps {
    email: string;
    onVerify: (otp: string) => void;
    onResend: () => void;
    onBack: () => void;
    isVerifying: boolean;
    isResending: boolean;
}

const EmailOtpStep: React.FC<EmailOtpStepProps> = ({
    email,
    onVerify,
    onResend,
    onBack,
    isVerifying,
    isResending,
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const val = element.value;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        // Auto focus next
        if (val !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Trigger verify when complete
        if (newOtp.every((digit) => digit !== '')) {
            onVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (pastedData.length === 6 && !isNaN(Number(pastedData))) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            onVerify(pastedData);
        }
    };

    const handleResendClick = () => {
        onResend();
        setTimer(30);
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    return (
        <div className="w-full flex flex-col items-center py-4 space-y-6">
            <div className="w-full flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <Typography size="lg" weight="bold" className="text-gray-900">
                    Verify Email
                </Typography>
                <div className="w-8" />
            </div>

            <div className="text-center space-y-2">
                <p className="text-gray-500 text-sm">
                    We sent a verification code to
                </p>
                <Typography size="sm" weight="semibold" className="text-gray-900 block break-all">
                    {email}
                </Typography>
            </div>

            {/* OTP Grid */}
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((data, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength={1}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        value={data}
                        onChange={(e) => handleChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-xl focus:border-[#F6CD28] focus:ring-2 focus:ring-[#F6CD28]/20 outline-none transition-all disabled:opacity-50"
                        disabled={isVerifying}
                    />
                ))}
            </div>

            <Button
                onClick={() => onVerify(otp.join(''))}
                className="w-full rounded-full h-12 bg-[#F6CD28] hover:bg-[#E5BD24] text-gray-900 font-bold text-base shadow-none transition-all"
                disabled={!isOtpComplete || isVerifying}
            >
                {isVerifying ? <Loader size={20} colorClass="text-gray-900" /> : 'Verify Code'}
            </Button>

            {/* Resend timer */}
            <div className="text-center">
                <Typography size="sm" color="text-gray-600" className="flex items-center justify-center gap-1">
                    Didn’t receive the code?{' '}
                    {timer > 0 ? (
                        <span className="text-gray-400 font-medium">Resend in {timer}s</span>
                    ) : (
                        <button
                            onClick={handleResendClick}
                            className="text-[#F6CD28] font-bold hover:underline"
                            disabled={isResending}
                        >
                            {isResending ? 'Resending...' : 'Resend Code'}
                        </button>
                    )}
                </Typography>
            </div>
        </div>
    );
};

export default EmailOtpStep;
