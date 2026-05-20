'use client';

import React, { useEffect, useState } from 'react';
import { PATHS } from '@/constants/path';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import NextLink from 'next/link';
import Loader from '@/components/ui/loader';

interface PhoneLoginVerifyProps {
    phone: string;
    otp: string;
    setOtp: (value: string) => void;
    handleSendOtp: () => void;
    handleVerifyOtp: () => void;
    isSendingOtp: boolean;
    isVerifyingOtp: boolean;
    code: string;
}

const RESEND_COOLDOWN = 60;

const PhoneLoginVerify = ({
    phone,
    otp,
    setOtp,
    handleSendOtp,
    handleVerifyOtp,
    isSendingOtp,
    isVerifyingOtp,
    code,
}: PhoneLoginVerifyProps) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

    // Start countdown on mount (OTP was just sent before navigating here)
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = () => {
        handleSendOtp();
        setCountdown(RESEND_COOLDOWN);
        setOtp('');
        inputRefs.current[0]?.focus();
    };

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        const otpArray = otp.split('');
        for (let i = 0; i < 6; i++) {
            if (otpArray[i] === undefined) otpArray[i] = '';
        }

        otpArray[index] = value.slice(-1);
        const finalOtp = otpArray.join('');
        setOtp(finalOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const formatPhone = (phoneStr: string) => {
        if (!phoneStr) return '';
        return `+${code} ${phoneStr.slice(code.length)}`;
    };

    return (
        <div className="w-full mx-auto space-y-12">
            {/* Logo + heading */}
            <div className="text-center space-y-4 pb-4">
                <NextLink href={PATHS.HOME_PAGE} className="inline-block">
                    <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
                </NextLink>

                <div className="space-y-1 text-center">
                    <Typography size="lg" weight="bold" className="text-gray-900" align="center">
                        Verify your number
                    </Typography>
                    <p className="text-gray-500 text-sm">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-semibold text-gray-900">{formatPhone(phone)}</span>
                    </p>
                </div>
            </div>

            {/* Form */}
            <form
                className="space-y-8 w-full flex flex-col items-center"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyOtp();
                }}
            >
                {/* OTP Inputs */}
                <div className="flex justify-between gap-2 sm:gap-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={1}
                            value={otp[index] || ''}
                            onChange={(e) => handleOtpChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold border border-gray-200 rounded-xl bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.05)] focus:border-[#F6CD28] focus:ring-4 focus:ring-[#F6CD28]/10 focus:outline-none transition-all"
                        />
                    ))}
                </div>

                {/* Resend */}
                <div className="text-center text-sm text-gray-500">
                    {countdown > 0 ? (
                        <p>
                            Resend OTP in{' '}
                            <span className="font-semibold text-gray-900">{countdown}s</span>
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isSendingOtp}
                            className="text-[#C8A800] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 mx-auto"
                        >
                            {isSendingOtp ? (
                                <>
                                    <Loader size={14} colorClass="text-[#C8A800]" />
                                    Sending...
                                </>
                            ) : (
                                'Resend OTP'
                            )}
                        </button>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-1/2 rounded-full h-12 text-lg font-bold shadow-lg"
                    disabled={otp.length < 6 || isVerifyingOtp}
                >
                    {isVerifyingOtp ? (
                        <Loader size={20} colorClass="text-gray-900" />
                    ) : (
                        'Continue'
                    )}
                </Button>
            </form>
        </div>
    );
};

export default PhoneLoginVerify;
