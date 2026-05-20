'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typoGraphy';
import ValidationItem from '@/components/auth/signup/validationItem';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import Loader from '@/components/ui/loader';

interface AddEmailStepProps {
    email: string;
    password?: string;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    handleAddEmail: () => void;
    isSubmitting: boolean;
    onBack: () => void;
}

const AddEmailStep: React.FC<AddEmailStepProps> = ({
    email,
    password,
    onEmailChange,
    onPasswordChange,
    handleAddEmail,
    isSubmitting,
    onBack,
}) => {
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const validation = {
        length: (password?.length || 0) >= 8,
        uppercase: /[A-Z]/.test(password || ''),
        lowercase: /[a-z]/.test(password || ''),
        number: /\d/.test(password || ''),
        specialChar: /[!@#$%^&*]/.test(password || ''),
    };

    const isPasswordValid = Object.values(validation).every(Boolean);

    const isFormValid =
        email?.trim() !== '' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') &&
        isPasswordValid &&
        agreeTerms;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        handleAddEmail();
    };

    return (
        <div className="w-full flex flex-col py-4 space-y-6 animate-in fade-in duration-500">

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
                {/* Email Input */}
                <div className="space-y-1">
                    <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                        Email
                    </Typography>
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="h-11 rounded-2xl border-gray-200"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                    <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                        Password
                    </Typography>
                    <Input
                        type="password"
                        placeholder="Enter password"
                        required
                        onFocus={() => setIsPasswordFocused(true)}
                        className={cn(
                            'h-11 rounded-2xl border-gray-200',
                            isPasswordFocused && !isPasswordValid && password
                                ? 'border-yellow-400 focus:ring-yellow-100'
                                : '',
                        )}
                        value={password || ''}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        disabled={isSubmitting}
                    />

                    {/* Password Strength validation checklist */}
                    {password && password.length > 0 && (
                        <div className="space-y-1.5 pt-2 ml-4 animate-in fade-in duration-300">
                            <ValidationItem isValid={validation.length} text="At least 8 characters" />
                            <ValidationItem isValid={validation.uppercase} text="One uppercase letter (A-Z)" />
                            <ValidationItem isValid={validation.lowercase} text="One lowercase letter (a-z)" />
                            <ValidationItem isValid={validation.number} text="One number (0-9)" />
                            <ValidationItem isValid={validation.specialChar} text="One special character (!@#$%^&*)" />
                        </div>
                    )}
                </div>

                {/* Terms Agreement Checkbox */}
                <label htmlFor="terms" className="flex items-center gap-3 cursor-pointer group px-1 pt-1">
                    <Checkbox
                        id="terms"
                        className="rounded-md w-5 h-5 border-gray-300 data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28]"
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                        disabled={isSubmitting}
                    />
                    <Typography size="xs" color="text-gray-600" className="leading-relaxed">
                        I agree to the{' '}
                        <a
                            href="/terms"
                            target="_blank"
                            className="text-[#F6CD28] font-bold hover:underline"
                        >
                            Terms & Conditions
                        </a>{' '}
                        and would like to receive updates.
                    </Typography>
                </label>

                {/* Submit button */}
                <Button
                    type="submit"
                    className="w-full rounded-full h-12 bg-[#F6CD28] hover:bg-[#E5BD24] text-gray-900 font-bold text-base shadow-none transition-all mt-4"
                    disabled={!isFormValid || isSubmitting}
                >
                    {isSubmitting ? <Loader size={20} colorClass="text-gray-900" /> : 'Continue'}
                </Button>
            </form>
        </div>
    );
};

export default AddEmailStep;
