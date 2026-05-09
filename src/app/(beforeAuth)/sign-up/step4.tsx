'use client';

import { useEffect, useState } from 'react';
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
}

const Step4 = ({
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
}: Step4Props) => {
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
        <div className="w-full mx-auto min-h-screen flex flex-col justify-center items-center text-center space-y-8">
            {/* Logo + heading */}
            <div className="space-y-2">
                <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
                <Typography color="text-gray-500" align="center">
                    One Step Away! Verify Your Number
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
                {/* Phone Number */}
                <div className="space-y-1">
                    <Typography color="text-gray-700" weight="medium">
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

                {/* Send OTP / Resend OTP */}
                {timer > 0 ? (
                    <Button type="button" className="w-full rounded-full" disabled>
                        Resend OTP in {timer}s
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="w-full rounded-full"
                        disabled={isSendingOtp}
                        onClick={sendOtpHandler}
                    >
                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                    </Button>
                )}

                {/* OTP Field */}
                <div className="space-y-1">
                    <Typography color="text-gray-700" weight="medium">
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

                {/* Verify Button */}
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

export default Step4;
