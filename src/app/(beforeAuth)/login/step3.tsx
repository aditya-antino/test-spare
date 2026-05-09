'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PATHS } from '@/constants/path';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typoGraphy';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import PhoneInputComponent from '@/components/ui/phoneInput';

interface Step4Props {
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
    isPhoneLogin?: boolean;
}

const Step3 = ({
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
    isPhoneLogin,
}: Step4Props) => {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const onSendOtp = () => {
        if (!phone || isSendingOtp) return;
        handleSendOtp();
        setTimer(30);
    };

    return (
        <div className="w-full mx-auto min-h-screen flex flex-col justify-center items-center text-center space-y-8">
            {/* Logo + heading */}
            <div className="space-y-2">
                <Link href={PATHS.HOME_PAGE} className="inline-block">
                    <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
                </Link>
                <Typography size="xs" color="text-gray-500" align="center">
                    {isPhoneLogin ? 'Verify your login' : 'One Step Away! Verify Your Number'}
                </Typography>
            </div>

            {/* Form */}
            <form
                className="space-y-4 w-full max-w-sm text-left"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyOtp();
                }}
            >
                <div className="space-y-1">
                    <Typography size="xs" color="text-gray-700" weight="medium">
                        Phone number
                    </Typography>
                    <PhoneInputComponent
                        phone={phone}
                        code={code}
                        onChange={(phoneValue, dialCode) => {
                            setPhone(phoneValue);
                            setCode(dialCode);
                        }}
                        disabled={isPhoneLogin}
                    />
                </div>

                {!isPhoneLogin ? (
                    <Button
                        type="button"
                        className={`w-full rounded-full ${!phone || isSendingOtp || (timer > 0 && 'bg-gray-100 cursor-not-allowed')
                            }`}
                        disabled={!phone || isSendingOtp || timer > 0}
                        onClick={onSendOtp}
                    >
                        {isSendingOtp
                            ? 'Sending...'
                            : timer > 0
                                ? `Resend OTP in ${timer}s`
                                : 'Send OTP'}
                    </Button>
                ) : (
                    <div className="text-right">
                        <button
                            type="button"
                            className={`text-sm font-semibold ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-500 hover:text-yellow-600'}`}
                            disabled={timer > 0 || isSendingOtp}
                            onClick={onSendOtp}
                        >
                            {isSendingOtp ? 'Sending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                        </button>
                    </div>
                )}

                <div className="space-y-1">
                    <Typography size="xs" color="text-gray-700" weight="medium">
                        OTP
                    </Typography>
                    <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="rounded-full"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={!otp || isVerifyingOtp}
                >
                    {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                </Button>
            </form>
        </div>
    );
};

export default Step3;
