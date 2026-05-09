'use client';
import React, { useRef } from 'react';
import { GoogleLogin as GoogleButton, CredentialResponse } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useGoogleAuthLogin } from '@/services';
import { setCredentials, logout } from '@/store/slice/authSlice';
import Loader from '@/components/ui/loader';
import GoogleIcon from '@/assets/logoGoogle.svg';
import Image from 'next/image';

interface GoogleLoginProps {
    roleId: number;
    onSuccess: (data: any) => void;
    customButtonText?: string;
    customButtonClassName?: string;
    showCustomButton?: boolean;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({
    roleId,
    onSuccess,
    customButtonText = "Continue with Google",
    customButtonClassName = "",
    showCustomButton = true
}) => {
    const dispatch = useDispatch();
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const { mutate: googleLoginMutation, isPending } = useGoogleAuthLogin({
        onSuccess: (data) => {
            dispatch(
                setCredentials({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    userDetails: data.user,
                    isAuth: true,
                }),
            );
            onSuccess(data);
        },
        onError: () => dispatch(logout()),
    });

    const handleGoogleLogin = (response: CredentialResponse) => {
        if (response.credential) {
            googleLoginMutation({ idToken: response.credential, roleId });
        }
    };

    const triggerGoogleLogin = () => {
        if (googleButtonRef.current && !isPending) {
            // Find the actual Google button element and click it
            const googleBtn = googleButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
            if (googleBtn) {
                googleBtn.click();
            }
        }
    };

    return (
        <div className="relative w-full">
            {/* Backdrop loader */}
            {isPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50">
                    <Loader />
                </div>
            )}

            {/* Custom Button */}
            {showCustomButton && (
                <button
                    onClick={triggerGoogleLogin}
                    disabled={isPending}
                    className={`
                       rounded-full cursor-pointer w-full flex items-center justify-between px-6 py-3 bg-white border border-gray-300
                        ${customButtonClassName}
                    `}
                    type="button"
                >
                    <Image src={GoogleIcon} alt="Google" width={20} height={20} />
                    <span className='text-zinc-800 text-base font-semibold '>{customButtonText}</span>
                    <div></div>
                </button>
            )}

            {/* Hidden Google Button */}
            <div
                ref={googleButtonRef}
                className="absolute opacity-0 pointer-events-none -z-10 invisible"
            >
                <GoogleButton
                    onSuccess={handleGoogleLogin}
                    onError={() => console.error('Google login failed')}
                    text="continue_with"
                    shape="pill"
                    theme="outline"
                    size="large"
                />
            </div>
        </div>
    );
};

export default GoogleLogin;