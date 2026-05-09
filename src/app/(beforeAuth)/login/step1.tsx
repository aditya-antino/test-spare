'use client';
import GoogleLogin from '@/components/auth/googleLogin/googleLogin';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import React, { useState } from 'react';
import logo from '@/assets/logo.svg';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';
import PhoneInputComponent from '@/components/ui/phoneInput';
import Typography from '@/components/ui/typoGraphy';
import { Checkbox } from '@/components/ui/checkbox';

const Step1 = ({
    handleFormSubmit,
    isPending,
    roleId,
    onSuccess,
    phone,
    setPhone,
    code,
    setCode,
    handleSendOtp,
    isSendingOtp,
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const router = useRouter();

    const isFormValid = email.trim() !== '' && password.trim() && agreeTerms;

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            email: email.toLowerCase(),
            password: password,
        };
        handleFormSubmit(payload);
    };

    return (
        <div className="flex flex-col justify-center w-full animate-in fade-in duration-500">
            <div className="w-full mx-auto space-y-8">
                {/* Logo + heading */}
                <div className="text-center space-y-4">
                    <Link href={PATHS.HOME_PAGE} className="inline-block">
                        <Image src={logo} alt="Logo" width={220} height={110} className="mx-auto" />
                    </Link>
                    <Typography color="text-gray-500" align="center" size="sm" weight="normal">
                        Welcome to Spare Space
                    </Typography>
                </div>

                {!showEmailForm ? (
                    <div className="space-y-6">
                        {/* Phone Section */}
                        <div className="space-y-4">
                            <PhoneInputComponent
                                phone={phone}
                                code={code}
                                onChange={(phoneValue, dialCode) => {
                                    setPhone(phoneValue);
                                    setCode(dialCode);
                                }}
                            />
                            <Button
                                className="w-full rounded-full h-12 bg-[#F6CD28] hover:bg-[#E5BD24] text-gray-900 font-bold text-base border-none shadow-sm"
                                disabled={!phone || isSendingOtp}
                                onClick={handleSendOtp}
                            >
                                {isSendingOtp ? <Loader size={20} colorClass="text-gray-900" /> : 'Continue'}
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <Typography color="text-gray-400" size="xs" weight="medium" className="uppercase">
                                OR
                            </Typography>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        {/* Secondary Options */}
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowEmailForm(true)}
                                className="w-full rounded-full h-12 border-gray-300 text-zinc-800 font-bold hover:bg-gray-50"
                            >
                                Login with Email
                            </Button>
                            
                            <GoogleLogin onSuccess={onSuccess} roleId={roleId} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {/* Email Section */}
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                            <div className="space-y-1">
                                <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">Email</Typography>
                                <div className="relative group">
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        className="h-12 pl-6 pr-6 transition-all rounded-2xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">Password</Typography>
                                <div className="relative group">
                                    <Input
                                        type="password"
                                        placeholder="Enter password"
                                        required
                                        className="h-12 pl-6 pr-12 transition-all rounded-2xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <label
                                htmlFor="terms"
                                className="flex items-center gap-3 cursor-pointer group px-2"
                            >
                                <Checkbox
                                    id="terms"
                                    className="rounded-md w-5 h-5 border-gray-300 data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28]"
                                    checked={agreeTerms}
                                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                                    disabled={isPending}
                                />
                                <Typography size="xs" color="text-gray-600" className="leading-relaxed">
                                    I agree to the{' '}
                                    <Link
                                        href="/terms"
                                        target="_blank"
                                        className="text-[#F6CD28] font-bold hover:underline"
                                    >
                                        Terms & Conditions
                                    </Link>{' '}
                                    and would like to receive updates.
                                </Typography>
                            </label>

                            <Button
                                type="submit"
                                className="w-full rounded-full h-12 bg-[#F6CD28] hover:bg-[#E5BD24] text-gray-900 font-bold text-base shadow-none transition-all active:scale-95"
                                disabled={!isFormValid || isPending}
                            >
                                {isPending ? <Loader size={20} colorClass="text-gray-900" /> : 'Continue'}
                            </Button>
                        </form>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setShowEmailForm(false)}
                                className="text-gray-600 text-sm font-medium hover:underline cursor-pointer"
                            >
                                Back to Phone Login
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer (Always visible in Step 1) */}
                <div className="flex justify-between items-center pt-4">
                    <Link href="/forgot-password">
                        <Typography color="text-[#F6CD28]" size="sm" weight="bold">
                            Forgot Password
                        </Typography>
                    </Link>
                    <Typography color="text-gray-600" size="sm" weight="normal">
                        New user?{' '}
                        <Link href="/sign-up" className="text-[#F6CD28] font-bold">
                            Create an account
                        </Link>
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default Step1;
