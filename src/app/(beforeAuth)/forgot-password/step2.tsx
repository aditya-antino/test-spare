import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import { toast } from 'react-toastify';

interface Step2Props {
    isLoading: boolean;
    email: string;
    onSubmit: (email: string) => void;
}

const Step2: React.FC<Step2Props> = ({ isLoading, email, onSubmit }) => {
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleResend = () => {
        if (email) {
            onSubmit(email);
            setTimer(30);
            return;
        }
        toast.error('Something went wrong!');
    };

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Logo + heading */}
            <div className="text-center space-y-6">
                <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
                <Typography variant="h4" color="text-gray-800" weight="semibold" align="center">
                    {isLoading ? 'Verifying' : 'Password Reset Link Sent!'}
                </Typography>
                <Typography variant="body" color="text-gray-600" weight="normal" align="center">
                    We&apos;ve sent a password reset link to your registered email. Click the link
                    to create a new password. If you don&apos;t see the email, check your spam
                    folder or try again.
                </Typography>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
                <Button
                    variant="default"
                    className="w-full"
                    onClick={() => (window.location.href = '/login')}
                >
                    Login
                </Button>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = '/forgot-password')}
                >
                    Go Back
                </Button>
            </div>

            {/* Resend link with timer */}
            <div>
                <Typography
                    variant="caption"
                    color="text-gray-600"
                    weight="normal"
                    align="center"
                    className="flex flex-row items-center justify-center gap-2"
                >
                    Didn&apos;t receive the email?
                    {timer > 0 ? (
                        <span className="text-gray-400 hover: cursor-pointer">
                            Resend in {timer}s
                        </span>
                    ) : (
                        <button
                            onClick={handleResend}
                            className="text-yellow-500 hover:underline disabled:opacity-50 hover: cursor-pointer"
                        >
                            <Typography variant="caption" color="text-yellow-500" weight="medium">
                                Resend Link
                            </Typography>
                        </button>
                    )}
                </Typography>
            </div>
        </div>
    );
};

export default Step2;
