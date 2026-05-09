'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import loginImage from '@/assets/Login.png';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import { useForgotPassword, useResetPassword } from '@/services';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const t = params.get('token');
            setToken(t);
            if (t) {
                setCurrentStep(2);
            }
        }
    }, []);

    useEffect(() => {
        if (token) {
            setCurrentStep(3);
        }
    }, [token]);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const { mutate: forgotPassword, isPending: isForgotPassword } = useForgotPassword({
        onSuccess: (data) => {
            toast.success(data.message);
            setCurrentStep(2);
        },
        onError: (err) => {
            toast.error(String(err.message));
        },
    });

    const {
        mutate: resetPassword,
        isPending: isResetLoading,
        error,
    } = useResetPassword({
        onSuccess: (res) => {
            toast.success(res.message);
            setCurrentStep(4);
        },
        onError: (err) => {
            toast.error('Password reset failed: ' + String(err.message));
        },
    });

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1
                        isLoading={isForgotPassword}
                        onSubmit={(email) => {
                            forgotPassword({ email });
                            setEmail(email);
                        }}
                        error={error}
                    />
                );
            case 2:
                return (
                    <Step2
                        isLoading={isResetLoading}
                        email={email}
                        onSubmit={(email) => {
                            forgotPassword({ email });
                        }}
                    />
                );
            case 3:
                return (
                    <Step3
                        newPassword={newPassword}
                        confirmPassword={confirmPassword}
                        onNewPasswordChange={setNewPassword}
                        onConfirmPasswordChange={setConfirmPassword}
                        onNext={() => {
                            resetPassword({ token, password: newPassword });
                        }}
                    />
                );
            case 4:
                return <Step4 />;
            default:
                return null;
        }
    };

    return (
        <div className="flex md:h-screen h-[100dvh]">
            {/* Left side image */}
            <div className="hidden md:block relative w-1/2 h-screen">
                <Image
                    src={loginImage}
                    alt="Forgot password background"
                    className="w-full object-cover h-full"
                    priority
                />
            </div>

            {/* Right side form */}
            <div className="flex flex-col justify-center w-full md:w-1/2 px-4 md:px-10 lg:px-40 space-y-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default ForgotPassword;
