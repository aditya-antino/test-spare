import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typoGraphy';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import Loader from '@/components/ui/loader';

interface Step3Props {
    newPassword: string;
    confirmPassword: string;
    onNewPasswordChange: (password: string) => void;
    onConfirmPasswordChange: (password: string) => void;
    onNext: () => void;
}

const Step3: React.FC<Step3Props> = ({
    newPassword,
    confirmPassword,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onNext,
}) => {
    const [isValidationShow, setIsValidationShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const validation = validatePassword(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    const isFormValid =
        validation.length &&
        validation.uppercase &&
        validation.lowercase &&
        validation.number &&
        validation.specialChar &&
        passwordsMatch;

    const handleNewPassword = (data: string) => {
        setIsValidationShow(true);
        onNewPasswordChange(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setErrorMsg('');

        try {
            // Simulate API call to reset password
            await new Promise((resolve) => setTimeout(resolve, 2000));
            onNext();
        } catch (error) {
            setErrorMsg('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Logo + heading */}
            <div className="text-center space-y-6">
                <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
                <Typography variant="h4" color="text-gray-800" weight="semibold" align="center">
                    Create a New Password
                </Typography>
                <Typography variant="body" color="text-gray-600" weight="normal" align="center">
                    Your new password should be strong and secure. Use at least 8 characters,
                    including a mix of letters, numbers, and symbols.
                </Typography>
            </div>

            {/* Password form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    type="password"
                    placeholder="Enter new password"
                    label="New Password"
                    required
                    value={newPassword}
                    onChange={(e) => handleNewPassword(e.target.value)}
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    placeholder="Confirm new password"
                    label="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                    disabled={isLoading}
                />

                {/* Password validation */}
                {isValidationShow && (
                    <ul className="space-y-1 text-sm text-gray-700 ml-1">
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
                        <ValidationItem isValid={passwordsMatch} text="Passwords match" />
                    </ul>
                )}

                {errorMsg && (
                    <Typography variant="caption" color="text-red-600" weight="normal">
                        {errorMsg}
                    </Typography>
                )}

                <div className="space-y-4">
                    <Button
                        variant={isFormValid ? 'default' : 'outline'}
                        type="submit"
                        className="w-full"
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? <Loader size={20} colorClass="text-gray-900" /> : 'Reset Password'}
                    </Button>

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                        onClick={() => (window.location.href = '/login')}
                    >
                        Back to Login
                    </Button>
                </div>
            </form>
        </div>
    );
};

function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
    return (
        <li className="flex items-center gap-2">
            {isValid ? (
                <Check className="text-green-600" size={16} />
            ) : (
                <X className="text-gray-400" size={16} />
            )}
            <Typography variant="caption" color="text-gray-700" weight="normal">
                {text}
            </Typography>
        </li>
    );
}

function validatePassword(password: string) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        specialChar: /[!@#$%^&*]/.test(password),
    };
}

export default Step3;
