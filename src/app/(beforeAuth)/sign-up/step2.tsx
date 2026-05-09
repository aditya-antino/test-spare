'use client';

import Image from 'next/image';
import Typography from '@/components/ui/typoGraphy';
import logo from '@/assets/logo.svg';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResendVerification, useVerifyEmail } from '@/services';
import { toast } from 'react-toastify';
import { PATHS } from '@/constants/path';

import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slice/authSlice';

const Step2 = ({
    userData,
    handleVerification,
}: {
    userData: { email: string; roleId: number };
    handleVerification: (data: any) => void;
}) => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const dispatch = useDispatch();
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const { data, isLoading, error } = useVerifyEmail(token || '');

    useEffect(() => {
        if (data) {
            if (data?.data?.accessToken) {
                dispatch(
                    setCredentials({
                        accessToken: data.data.accessToken,
                        refreshToken: (data.data as any).refreshToken || '',
                    }),
                );
            }
            handleVerification(data);
        }
        if (error) {
            toast.error(error.message);
            router.replace(PATHS.LOGIN);
        }
    }, [data, handleVerification, error, dispatch]);

    const { mutate: resendVerification, isPending: isResending } = useResendVerification({
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (err: any) => {
            toast.error(err.message);
            console.error('Failed to resend verification:', err);
        },
    });

    const handleResendLink = () => {
        if (userData.email) {
            resendVerification({ email: userData.email });
            setTimer(30);
            return;
        }
        toast.error('Something went wrong!');
    };

    return (
        <div className="w-full mx-auto min-h-screen flex flex-col justify-center items-center space-y-8 text-center">
            {/* Logo + heading */}
            <div className="space-y-4">
                <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
            </div>

            {/* Title */}
            <div className="space-y-2 max-w-md">
                {isLoading ? (
                    <Typography color="text-gray-800" weight="semibold" align="center">
                        Verifying your email...
                    </Typography>
                ) : error ? (
                    <Typography color="text-red-600" weight="semibold" align="center">
                        Verification failed.
                    </Typography>
                ) : data?.success ? (
                    <Typography color="text-green-600" weight="semibold" align="center">
                        Email verified successfully!
                    </Typography>
                ) : (
                    <Typography color="text-gray-800" weight="semibold" align="center">
                        Verification Link Sent!
                    </Typography>
                )}

                <Typography color="text-gray-600" weight="normal" align="center">
                    {data?.success
                        ? 'You can now log in to your account.'
                        : 'We’ve sent a verification link to your email. Please check your inbox and click the link to verify your email address.'}
                </Typography>
            </div>

            {/* Resend link */}
            {!data?.success && (
                <Typography
                    className="flex gap-1 text-no"
                    color="text-gray-600"
                    weight="normal"
                    align="center"
                >
                    Didn’t receive the email?{' '}
                    {timer > 0 ? (
                        <span className="text-gray-400 hover: cursor-pointer">
                            Resend in {timer}s
                        </span>
                    ) : (
                        <button
                            onClick={handleResendLink}
                            className="text-yellow-500 hover:underline disabled:opacity-50 hover: cursor-pointer"
                        >
                            <Typography variant="caption" color="text-yellow-500" weight="medium">
                                Resend Link
                            </Typography>
                        </button>
                    )}
                </Typography>
            )}
        </div>
    );
};

export default Step2;
