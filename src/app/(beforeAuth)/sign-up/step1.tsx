import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { useGetRoles } from '@/services';
import Typography from '@/components/ui/typoGraphy';
import Header from '@/components/auth/signup/header';
import PhoneAuthSection from '@/components/auth/signup/phoneAuthSection';
import EmailSignupForm from '@/components/auth/signup/emailSignupForm';

// --- Types & Schema ---

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'At least 8 characters')
        .regex(/[A-Z]/, 'One uppercase letter')
        .regex(/[a-z]/, 'One lowercase letter')
        .regex(/\d/, 'One number')
        .regex(/[!@#$%^&*]/, 'One special character'),
    isSubscribeToNewsletter: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the terms',
    }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface Step1Props {
    handleSubmit: (data: {
        email: string;
        password: string;
        roleId: number;
        isSubscribeToNewsletter: boolean;
    }) => void;
    onSocialLoginSuccess: (data: any) => void;
    isPending: boolean;
    phone: string;
    setPhone: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    handleSendOtp: () => void;
    isSendingOtp: boolean;
}

// --- Main Component ---

const Step1: React.FC<Step1Props> = ({
    handleSubmit: onSignupSubmit,
    isPending,
    onSocialLoginSuccess,
    phone,
    setPhone,
    code,
    setCode,
    handleSendOtp,
    isSendingOtp,
}) => {
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const { data: rolesData, isLoading: isRolesLoading } = useGetRoles();

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        mode: 'onChange',
        defaultValues: {
            isSubscribeToNewsletter: false,
        },
    });

    const password = form.watch('password', '');
    const validation = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        specialChar: /[!@#$%^&*]/.test(password),
    };

    const roleId = rolesData?.data?.find((r: any) => r.name?.toLowerCase() === 'user')?.id;
    const numericRoleId = roleId ? Number(roleId) : undefined;

    const handleFormSubmit = (data: SignupFormValues) => {
        if (!numericRoleId) return;
        onSignupSubmit({
            email: data.email,
            password: data.password,
            roleId: numericRoleId,
            isSubscribeToNewsletter: data.isSubscribeToNewsletter,
        });
    };

    return (
        <div className="flex flex-col justify-center w-full animate-in fade-in duration-700">
            <div className="w-full mx-auto space-y-8">
                <Header />

                {!showEmailForm && (
                    <PhoneAuthSection
                        phone={phone}
                        setPhone={setPhone}
                        code={code}
                        setCode={setCode}
                        handleSendOtp={handleSendOtp}
                        isSendingOtp={isSendingOtp}
                        onSwitchToEmail={() => setShowEmailForm(true)}
                        rolesData={rolesData}
                        onSocialLoginSuccess={onSocialLoginSuccess}
                    />
                )}

                {showEmailForm && (
                    <EmailSignupForm
                        form={form}
                        isPending={isPending}
                        isRolesLoading={isRolesLoading}
                        onSubmit={form.handleSubmit(handleFormSubmit)}
                        onBackToPhone={() => setShowEmailForm(false)}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        isPasswordFocused={isPasswordFocused}
                        setIsPasswordFocused={setIsPasswordFocused}
                        password={password}
                        validation={validation}
                    />
                )}

                <div className="flex flex-col items-center text-center pt-2">
                    <Typography size="sm" className="text-gray-600">
                        Already a user?{' '}
                        <Link href="/login" className="text-[#F6CD28] font-semibold ml-1">
                            Login
                        </Link>
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default Step1;
