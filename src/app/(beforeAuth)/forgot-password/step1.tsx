import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typoGraphy';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/logo.svg';
import Loader from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';

interface Step1Props {
    onSubmit: (email: string) => void;
    isLoading: boolean;
    error: any;
}

const Step1: React.FC<Step1Props> = ({ onSubmit, isLoading, error }) => {
    const [email, setEmail] = useState('');

    const isEmailValid = validateEmail(email);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEmailValid) return;
        onSubmit(email);
    };

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Logo + heading */}
            <div className="text-center space-y-6">
                <Image
                    onClick={() => router.replace(PATHS.HOME_PAGE)}
                    src={logo}
                    alt="Logo"
                    width={219}
                    height={112}
                    className="mx-auto"
                />
                <Typography variant="h4" color="text-gray-800" weight="semibold" align="center">
                    Forgot password
                </Typography>
                <Typography variant="body" color="text-gray-600" weight="normal" align="center">
                    Enter your email or phone number to receive a password reset link.
                </Typography>
            </div>

            {/* Email form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    type="email"
                    placeholder="you@example.com"
                    label="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />

                {error && (
                    <Typography variant="caption" color="text-red-600" weight="normal">
                        {error}
                    </Typography>
                )}

                <Button
                    variant={isEmailValid ? 'default' : 'outline'}
                    type="submit"
                    className="w-full"
                    disabled={!isEmailValid || isLoading}
                >
                    {isLoading ? <Loader size={20} colorClass="text-gray-900" /> : 'Continue'}
                </Button>
            </form>

            {/* Go back to sign in/sign up */}
            <div className="text-center flex justify-center items-center gap-1">
                <Typography
                    variant="caption"
                    color="text-gray-600"
                    weight="normal"
                    align="center"
                    className="text-center"
                >
                    Go back for{' '}
                </Typography>
                <Link href="/login" className="text-yellow-500">
                    <Typography variant="caption" color="text-yellow-500" weight="medium">
                        Log in
                    </Typography>
                </Link>
                <Typography
                    variant="caption"
                    color="text-gray-600"
                    weight="normal"
                    align="center"
                    className="text-center"
                >
                    {' '}
                    /{' '}
                </Typography>
                <Link href="/sign-up" className="text-yellow-500">
                    <Typography variant="caption" color="text-yellow-500" weight="medium">
                        Sign up
                    </Typography>
                </Link>
            </div>
        </div>
    );
};

function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export default Step1;
