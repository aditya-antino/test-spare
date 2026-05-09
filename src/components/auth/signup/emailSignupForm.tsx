'use client';
import React from 'react';
import { Eye, EyeOff, Phone } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typoGraphy';
import Loader from '@/components/ui/loader';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import ValidationItem from './validationItem';

interface EmailSignupFormProps {
    form: UseFormReturn<any>;
    isPending: boolean;
    isRolesLoading: boolean;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    onBackToPhone: () => void;
    showPassword: boolean;
    setShowPassword: (v: boolean) => void;
    isPasswordFocused: boolean;
    setIsPasswordFocused: (v: boolean) => void;
    password: string;
    validation: any;
}

const EmailSignupForm: React.FC<EmailSignupFormProps> = ({
    form,
    isPending,
    isRolesLoading,
    onSubmit,
    onBackToPhone,
    showPassword,
    setShowPassword,
    isPasswordFocused,
    setIsPasswordFocused,
    password,
    validation,
}) => (
    <form className="space-y-6 animate-in slide-in-from-right-4 duration-500" onSubmit={onSubmit}>
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                    Email
                </Typography>
                <div className="relative group">
                    <Input
                        {...form.register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className={cn(
                            'h-12 pl-6 pr-6 transition-all rounded-2xl',
                            form.formState.errors.email && 'border-red-400 focus:ring-red-100',
                        )}
                        disabled={isPending}
                    />
                </div>
                {form.formState.errors.email && (
                    <Typography
                        size="xs"
                        className="text-red-500 ml-4 animate-in fade-in slide-in-from-top-1"
                    >
                        {form.formState.errors.email.message as string}
                    </Typography>
                )}
            </div>

            <div className="space-y-1.5">
                <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                    Password
                </Typography>
                <div className="relative group">
                    <Input
                        {...form.register('password')}
                        type="password"
                        placeholder="Enter password"
                        onFocus={() => setIsPasswordFocused(true)}
                        className={cn(
                            'h-12 pl-6 pr-12 transition-all rounded-2xl',
                            form.formState.errors.password && 'border-red-400 focus:ring-red-100',
                        )}
                        disabled={isPending}
                    />
                </div>

                {password && password.length > 0 && (
                    <div className="space-y-1.5 pt-2 ml-4 animate-in fade-in duration-300">
                        <ValidationItem isValid={validation.length} text="At least 8 characters" />
                        <ValidationItem
                            isValid={validation.uppercase}
                            text="One uppercase letter (A-Z)"
                        />
                        <ValidationItem
                            isValid={validation.lowercase}
                            text="One lowercase letter (a-z)"
                        />
                        <ValidationItem isValid={validation.number} text="One number (0-9)" />
                        <ValidationItem
                            isValid={validation.specialChar}
                            text="One special character (!@#$%^&*)"
                        />
                    </div>
                )}
            </div>
        </div>

        <div className="px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                    id="terms"
                    className="rounded-md w-5 h-5 border-gray-300 data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28]"
                    checked={form.watch('isSubscribeToNewsletter')}
                    onCheckedChange={(checked) =>
                        form.setValue('isSubscribeToNewsletter', checked as boolean, {
                            shouldValidate: true,
                        })
                    }
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
        </div>

        <div className="space-y-4 pt-2">
            <Button
                type="submit"
                className="w-full rounded-full h-14 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-base transition-all active:scale-95 shadow-none"
                disabled={!form.formState.isValid || isPending || isRolesLoading}
            >
                {isPending ? <Loader size={24} colorClass="text-gray-700" /> : 'Sign Up'}
            </Button>

            <button
                type="button"
                onClick={onBackToPhone}
                className="w-full flex items-center justify-center gap-2 text-gray-500 text-sm font-semibold hover:underline transition-all"
            >
                <Phone size={16} />
                Back to Phone Sign up
            </button>
        </div>
    </form>
);

export default EmailSignupForm;
