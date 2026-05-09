'use client';

import Image from 'next/image';
import Link from 'next/link';
import Typography from '@/components/ui/typoGraphy';
import logo from '@/assets/logo.svg';
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResendVerification, useVerifyEmail } from '@/services';
import { toast } from 'react-toastify';
import Loader from '@/components/ui/loader';
import { PATHS } from '@/constants/path';

const VerificationPage = ({
    userData,
    handleVerification,
    setAccessToken
}: {
    userData: { email: string; roleId: number };
    handleVerification: (data: any) => void;
    setAccessToken: (token: string | null) => void;
}) => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const { data, isLoading, error } = useVerifyEmail(token || '');

    useEffect(() => {
        if (data) {
            handleVerification(data);
            setAccessToken(data?.data?.accessToken || null);
        }
        if (error) {
            toast.error(error.message)
            router.replace(PATHS.LOGIN);
        }
    }, [data, handleVerification, error]);

    const { mutate: resendVerification, isPending: isResending } = useResendVerification({
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (err) => {
            console.error('Failed to resend verification:', err);
        },
    });

    const handleResendLink = () => {
        resendVerification({ email: userData.email });
    };

    return (
        <div className="w-full mx-auto min-h-screen flex flex-col justify-center items-center space-y-8 text-center">
            {/* Logo + heading */}
            <div className="space-y-4">
                <Link href={PATHS.HOME_PAGE} className="inline-block">
                    <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
                </Link>
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
                    <Typography
                        color="text-green-600"
                        weight="semibold"
                        align="center"
                    >
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
                    <div
                        onClick={isResending ? undefined : handleResendLink}
                        className="cursor-pointer text-yellow-500 hover:underline"
                    >
                        <Typography color="text-yellow-500" weight="medium">
                            Resend Link
                        </Typography>
                    </div>
                </Typography>
            )}
            {isResending && <Loader />}
        </div>
    );
};

export default VerificationPage;
