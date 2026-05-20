'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typoGraphy';
import PhoneInputComponent from '@/components/ui/phoneInput';
import { ArrowLeft } from 'lucide-react';
import Loader from '@/components/ui/loader';

interface PhoneVerifyStepProps {
    phone: string;
    setPhone: (value: string) => void;
    otp: string;
    setOtp: (value: string) => void;
    handleSendOtp: () => void;
    handleVerifyOtp: () => void;
    isSendingOtp: boolean;
    isVerifyingOtp: boolean;
    code: string;
    setCode: (dialCode: string) => void;
    onBack: () => void;
}

const PhoneVerifyStep: React.FC<PhoneVerifyStepProps> = ({
    phone,
    setPhone,
    otp,
    setOtp,
    handleSendOtp,
    handleVerifyOtp,
    isSendingOtp,
    isVerifyingOtp,
    code,
    setCode,
    onBack,
}) => {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);

    const sendOtpHandler = () => {
        handleSendOtp();
        setTimer(30);
    };

    return (
        <div className="w-full flex flex-col py-4 space-y-6 animate-in fade-in duration-500">
            <div className="w-full flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <Typography size="lg" weight="bold" className="text-gray-900">
                    Verify Phone
                </Typography>
                <div className="w-8" />
            </div>

            <div className="text-center">
                <p className="text-gray-500 text-sm">
                    Please verify your phone number to secure your account.
                </p>
            </div>

            <form
                className="space-y-4 w-full text-left"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyOtp();
                }}
            >
                {/* Phone Number Input */}
                <div className="space-y-1">
                    <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                        Phone number
                    </Typography>
                    <PhoneInputComponent
                        phone={phone}
                        code={code}
                        onChange={(phoneValue, dialCode) => {
                            setPhone(phoneValue);
                            setCode(dialCode);
                        }}
                    />
                </div>

                {/* Send OTP button */}
                {timer > 0 ? (
                    <Button type="button" className="w-full rounded-full h-11 border-gray-200" variant="outline" disabled>
                        Resend OTP in {timer}s
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="w-full rounded-full h-11 bg-gray-900 hover:bg-black text-white font-semibold"
                        disabled={isSendingOtp || !phone}
                        onClick={sendOtpHandler}
                    >
                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                    </Button>
                )}

                {/* OTP input field */}
                <div className="space-y-1">
                    <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                        OTP
                    </Typography>
                    <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="rounded-2xl h-11 border-gray-200"
                        disabled={isVerifyingOtp}
                    />
                </div>

                {/* Verify OTP Button */}
                <Button
                    type="submit"
                    className="w-full rounded-full h-12 bg-[#F6CD28] hover:bg-[#E5BD24] text-gray-900 font-bold text-base shadow-none transition-all mt-4"
                    disabled={!otp || isVerifyingOtp}
                >
                    {isVerifyingOtp ? <Loader size={20} colorClass="text-gray-900" /> : 'Verify & Continue'}
                </Button>
            </form>
        </div>
    );
};

export default PhoneVerifyStep;
