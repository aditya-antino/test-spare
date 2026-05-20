'use client';
import GoogleLogin from '@/components/auth/googleLogin/googleLogin';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import React, { useState } from 'react';
import logo from '@/assets/logo.svg';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { PATHS } from '@/constants/path';
import PhoneInputComponent from '@/components/ui/phoneInput';
import Typography from '@/components/ui/typoGraphy';
import { Checkbox } from '@/components/ui/checkbox';
import ValidationItem from '@/components/auth/signup/validationItem';
import { cn } from '@/lib/utils';

interface AuthStep1Props {
    flowMode: 'login' | 'signup';
    setFlowMode: (mode: 'login' | 'signup') => void;
    handleFormSubmit: (payload: { email: string; password?: string; isSubscribeToNewsletter?: boolean }, mode: 'login' | 'signup') => void;
    isPending: boolean;
    roleId?: number;
    onSuccess: (data: any) => void;
    phone: string;
    setPhone: (val: string) => void;
    code: string;
    setCode: (val: string) => void;
    handleSendOtp: (mode: 'login' | 'signup') => void;
    isSendingOtp: boolean;
}

const AuthStep1: React.FC<AuthStep1Props> = ({
    flowMode,
    setFlowMode,
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
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const validation = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        specialChar: /[!@#$%^&*]/.test(password),
    };

    const isPasswordValid = Object.values(validation).every(Boolean);

    const isFormValid =
        email.trim() !== '' &&
        password.trim() !== '' &&
        (flowMode === 'login' || (isPasswordValid && agreeTerms));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        const payload = {
            email: email.toLowerCase(),
            password: password,
            isSubscribeToNewsletter: agreeTerms,
        };
        handleFormSubmit(payload, flowMode);
    };

    const handlePhoneSubmit = () => {
        if (!phone) return;
        handleSendOtp(flowMode);
    };

    return (
        <div className="flex flex-col justify-center w-full animate-in fade-in duration-500">
            <div className="w-full mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <Link href={PATHS.HOME_PAGE} className="inline-block">
                        <Image src={logo} alt="Logo" width={220} height={110} className="mx-auto" />
                    </Link>
                    <Typography color="text-gray-500" align="center" size="sm" weight="normal">
                        {flowMode === 'login' ? 'Welcome to Spare Space' : 'Create your account'}
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
                                onClick={handlePhoneSubmit}
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
                                {flowMode === 'login' ? 'Login with Email' : 'Sign up with Email'}
                            </Button>
                            
                            <GoogleLogin onSuccess={onSuccess} roleId={roleId || 1} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {/* Email Section */}
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                            <div className="space-y-1">
                                <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1 text-left">Email</Typography>
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
                                <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1 text-left">Password</Typography>
                                <div className="relative group">
                                    <Input
                                        type="password"
                                        placeholder="Enter password"
                                        required
                                        onFocus={() => setIsPasswordFocused(true)}
                                        className={cn(
                                            'h-12 pl-6 pr-12 transition-all rounded-2xl',
                                            flowMode === 'signup' && isPasswordFocused && !isPasswordValid && password
                                                ? 'border-yellow-400 focus:ring-yellow-100'
                                                : '',
                                        )}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                {flowMode === 'signup' && password && password.length > 0 && (
                                    <div className="space-y-1.5 pt-2 ml-4 animate-in fade-in duration-300 text-left">
                                        <ValidationItem isValid={validation.length} text="At least 8 characters" />
                                        <ValidationItem isValid={validation.uppercase} text="One uppercase letter (A-Z)" />
                                        <ValidationItem isValid={validation.lowercase} text="One lowercase letter (a-z)" />
                                        <ValidationItem isValid={validation.number} text="One number (0-9)" />
                                        <ValidationItem isValid={validation.specialChar} text="One special character (!@#$%^&*)" />
                                    </div>
                                )}
                            </div>

                            {flowMode === 'signup' && (
                                <label
                                    htmlFor="terms"
                                    className="flex items-center gap-3 cursor-pointer group px-2 text-left"
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
                            )}

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
                                {flowMode === 'login' ? 'Back to Phone Login' : 'Back to Phone Signup'}
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
                    {flowMode === 'login' ? (
                        <button
                            onClick={() => {
                                setFlowMode('signup');
                                setShowEmailForm(false);
                            }}
                            className="text-gray-600 text-sm font-normal cursor-pointer"
                        >
                            New user?{' '}
                            <span className="text-[#F6CD28] font-bold hover:underline">
                                Create an account
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setFlowMode('login');
                                setShowEmailForm(false);
                            }}
                            className="text-gray-600 text-sm font-normal cursor-pointer"
                        >
                            Already a user?{' '}
                            <span className="text-[#F6CD28] font-bold hover:underline">
                                Login
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthStep1;
