'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { useDispatch } from 'react-redux';
import { setCredentials, setUserProfile } from '@/store/slice/authSlice';
import { endpoints } from '@/services/endPoints';
import { PATHS } from '@/constants/path';

import PhoneLoginVerify from '@/app/(beforeAuth)/login/phoneLoginVerify';
import UserSelection from '@/app/(beforeAuth)/login/userSelection';
import AuthStep1 from '@/components/modals/AuthModal/AuthStep1';
import { useGetRoles } from '@/services';

// Progressive signup modal steps
import EmailOtpStep from './steps/EmailOtpStep';
import ProfileStep from './steps/ProfileStep';
import PhoneVerifyStep from './steps/PhoneVerifyStep';
import AddEmailStep from './steps/AddEmailStep';

interface AuthLoginFlowProps {
    onSuccess: () => void;
}

const STEPS = {
    INITIAL: 1,
    EMAIL_VERIFY: 2,
    PROFILE_SETUP: 3,
    PHONE_VERIFY: 4,
    PHONE_OTP_LOGIN: 5,
    ADD_EMAIL: 6,
    USER_SELECTION: 7,
};

const AuthLoginFlow: React.FC<AuthLoginFlowProps> = ({ onSuccess }) => {
    const [flowMode, setFlowMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [currentStep, setCurrentStep] = useState(STEPS.INITIAL);
    const [code, setCode] = useState<string>('91');
    const [tempToken, setTempToken] = useState<string | null>(null);

    const [isPending, setIsPending] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isResendingEmailOtp, setIsResendingEmailOtp] = useState(false);
    const [multiUsers, setMultiUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const router = useRouter();
    const dispatch = useDispatch();

    // Fetch roles using cached React Query hook
    const { data: rolesData } = useGetRoles();
    const rolesList = rolesData?.data || [];
    const getRoleId = () => {
        const found = rolesList.find(
            (data: { id: any; name: string }) => data.name?.toLowerCase() === 'user',
        );
        return found?.id ? Number(found.id) : 1;
    };

    const handleAuthSuccess = (userData: any, message?: string) => {
        if (!userData) {
            toast.error('Authentication failed: Invalid user data');
            return;
        }

        if (userData.accessToken) {
            setTempToken(userData.accessToken);
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', userData.accessToken);
                if (userData.refreshToken) {
                    localStorage.setItem('refreshToken', userData.refreshToken);
                }
            }
        }

        dispatch(setUserProfile(userData));

        const isFullyComplete =
            Boolean(userData.isPhoneVerified) &&
            Boolean(userData.isProfileCompleted) &&
            Boolean(userData.isEmailVerified);

        if (isFullyComplete) {
            dispatch(
                setCredentials({
                    accessToken: userData.accessToken || tempToken || '',
                    refreshToken: userData.refreshToken || '',
                }),
            );
            if (message) toast.success(message);
            onSuccess(); // Close modal
            return;
        }

        if (message) toast.success(message);

        // State Machine for Signup / Onboarding steps
        if (userData.isProfileCompleted === false) {
            setCurrentStep(STEPS.PROFILE_SETUP);
        } else if (!userData.email) {
            setCurrentStep(STEPS.ADD_EMAIL);
        } else if (!userData.isEmailVerified) {
            setCurrentStep(STEPS.EMAIL_VERIFY);
        } else if (!userData.isPhoneVerified) {
            setCurrentStep(STEPS.PHONE_VERIFY);
        }
    };

    const login = async (loginData: { email: string; password: string; roleId: number }) => {
        try {
            setIsPending(true);
            const response = await axiosInstance.post(endpoints.AUTH_LOGIN, loginData);
            handleAuthSuccess(response.data.data, response.data.message);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Invalid Credentials');
        } finally {
            setIsPending(false);
        }
    };

    const signUp = async (signUpData: any) => {
        try {
            setIsPending(true);
            const response = await axiosInstance.post(endpoints.AUTH_SIGNUP, {
                ...signUpData,
                is_module: true,
            });
            toast.success(response.data.message || 'Signup successful. Verification code sent.');
            if (response.data?.data) {
                const userData = response.data.data;
                if (userData.accessToken) {
                    setTempToken(userData.accessToken);
                }
                dispatch(setUserProfile(userData));
                setEmail(signUpData.email);
                setCurrentStep(STEPS.EMAIL_VERIFY);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Signup failed');
        } finally {
            setIsPending(false);
        }
    };

    const handleFormSubmit = (payload: { email: string; password?: string; isSubscribeToNewsletter?: boolean }, mode: 'login' | 'signup') => {
        const roleId = getRoleId();
        
        if (mode === 'signup') {
            signUp({
                email: payload.email,
                password: payload.password,
                isSubscribeToNewsletter: payload.isSubscribeToNewsletter,
                roleId,
            });
        } else {
            if (payload.password) {
                login({ email: payload.email, password: payload.password, roleId });
            }
        }
    };

    const handleSendOtp = async (mode: 'login' | 'signup') => {
        if (!phone) return;
        try {
            setIsSendingOtp(true);
            const isPhoneLoginRoute = mode === 'login';
            const endpoint = isPhoneLoginRoute ? endpoints.SEND_PHONE_LOGIN_OTP : endpoints.AUTH_PHONE_SIGNUP;
            
            const roleId = getRoleId();

            const response = await axiosInstance.post(
                endpoint,
                {
                    countryCode: code,
                    phoneNumber: phone?.slice(code?.length || 0),
                    roleId,
                }
            );
            if (response.data?.success) {
                toast.success(response?.data?.message);
                setCurrentStep(STEPS.PHONE_OTP_LOGIN);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handlePhoneVerify = async (userId?: number) => {
        if (!otp) return;
        try {
            setIsVerifyingOtp(true);
            const roleId = getRoleId();

            const isPhoneLoginRoute = flowMode === 'login';
            const endpoint = isPhoneLoginRoute ? endpoints.VERIFY_PHONE_LOGIN_OTP : endpoints.VERIFY_PHONE_SIGNUP_OTP;

            const response = await axiosInstance.post(
                endpoint,
                {
                    countryCode: code,
                    phoneNumber: phone?.slice(code?.length || 0),
                    otp,
                    ...(isPhoneLoginRoute && { roleId }),
                    ...(isPhoneLoginRoute && userId && { userId })
                }
            );

            if (response.data?.data?.isMultiUser) {
                setMultiUsers(response.data.data.users);
                setCurrentStep(STEPS.USER_SELECTION);
                return;
            }

            handleAuthSuccess(response.data.data, 'Phone verified successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'OTP verification failed');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleSelectUser = (userId: number) => {
        setSelectedUserId(userId);
        handlePhoneVerify(userId);
    };

    const handleEmailOtpVerify = async (otpCode: string) => {
        try {
            setIsVerifyingOtp(true);
            const response = await axiosInstance.post(endpoints.VERIFY_EMAIL_OTP, {
                email,
                otp: otpCode,
            });
            handleAuthSuccess(response.data.data, 'Email verified successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Email verification failed');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendEmailOtp = async () => {
        try {
            setIsResendingEmailOtp(true);
            const response = await axiosInstance.post(endpoints.RESEND_VERIFICATION, {
                email,
                is_module: true,
            });
            toast.success(response.data.message || 'Verification code resent.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsResendingEmailOtp(false);
        }
    };

    const handleProfileComplete = async (profileData: {
        firstName: string;
        lastName: string;
        dob: Date;
        gender: string;
        avatar: string;
    }) => {
        try {
            setIsPending(true);
            const response = await axiosInstance.put(
                endpoints.AUTH_PROFILE,
                profileData,
                {
                    headers: {
                        Authorization: `Bearer ${tempToken}`,
                    },
                }
            );
            handleAuthSuccess(response.data.data, 'Profile updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Profile update failed');
        } finally {
            setIsPending(false);
        }
    };

    const handleSendMobileOtp = async () => {
        try {
            setIsSendingOtp(true);
            const response = await axiosInstance.post(
                endpoints.SEND_MOBILE_OTP,
                {
                    countryCode: code,
                    phoneNumber: phone?.slice(code?.length || 0),
                },
                {
                    headers: {
                        Authorization: `Bearer ${tempToken}`,
                    },
                }
            );
            toast.success(response.data.message || 'OTP sent successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyMobileOtp = async () => {
        try {
            setIsVerifyingOtp(true);
            const response = await axiosInstance.post(
                endpoints.VERIFY_MOBILE_OTP,
                {
                    countryCode: code,
                    phoneNumber: phone?.slice(code?.length || 0),
                    otp,
                },
                {
                    headers: {
                        Authorization: `Bearer ${tempToken}`,
                    },
                }
            );
            handleAuthSuccess(response.data.data, 'Phone verified successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleAddEmail = async () => {
        try {
            setIsPending(true);
            const response = await axiosInstance.post(
                endpoints.AUTH_ADD_EMAIL_TO_ACCOUNT,
                {
                    email,
                    password,
                    is_module: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${tempToken}`,
                    },
                }
            );
            toast.success(response.data.message || 'Email updated. Please verify via OTP.');
            setCurrentStep(STEPS.EMAIL_VERIFY);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update email');
        } finally {
            setIsPending(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case STEPS.INITIAL:
                return (
                    <AuthStep1
                        flowMode={flowMode}
                        setFlowMode={setFlowMode}
                        onSuccess={(data) => handleAuthSuccess(data.data, data.message)}
                        phone={phone}
                        setPhone={setPhone}
                        code={code}
                        setCode={setCode}
                        handleSendOtp={handleSendOtp}
                        isSendingOtp={isSendingOtp}
                        handleFormSubmit={handleFormSubmit}
                        isPending={isPending}
                        roleId={getRoleId()}
                    />
                );
            case STEPS.EMAIL_VERIFY:
                return (
                    <EmailOtpStep
                        email={email}
                        onVerify={handleEmailOtpVerify}
                        onResend={handleResendEmailOtp}
                        onBack={() => setCurrentStep(STEPS.INITIAL)}
                        isVerifying={isVerifyingOtp}
                        isResending={isResendingEmailOtp}
                    />
                );
            case STEPS.PROFILE_SETUP:
                return (
                    <ProfileStep
                        onComplete={handleProfileComplete}
                        isSubmitting={isPending}
                    />
                );
            case STEPS.PHONE_VERIFY:
                return (
                    <PhoneVerifyStep
                        phone={phone}
                        setPhone={setPhone}
                        otp={otp}
                        setOtp={setOtp}
                        handleSendOtp={handleSendMobileOtp}
                        handleVerifyOtp={handleVerifyMobileOtp}
                        isSendingOtp={isSendingOtp}
                        isVerifyingOtp={isVerifyingOtp}
                        code={code}
                        setCode={setCode}
                        onBack={() => setCurrentStep(STEPS.INITIAL)}
                    />
                );
            case STEPS.PHONE_OTP_LOGIN:
                return (
                    <PhoneLoginVerify
                        code={code || '91'}
                        phone={phone}
                        otp={otp}
                        setOtp={setOtp}
                        handleSendOtp={() => handleSendOtp(flowMode)}
                        handleVerifyOtp={handlePhoneVerify}
                        isSendingOtp={isSendingOtp}
                        isVerifyingOtp={isVerifyingOtp}
                    />
                );
            case STEPS.ADD_EMAIL:
                return (
                    <AddEmailStep
                        email={email}
                        password={password}
                        onEmailChange={setEmail}
                        onPasswordChange={setPassword}
                        handleAddEmail={handleAddEmail}
                        isSubmitting={isPending}
                        onBack={() => setCurrentStep(STEPS.INITIAL)}
                    />
                );
            case STEPS.USER_SELECTION:
                return (
                    <UserSelection
                        users={multiUsers}
                        onSelect={handleSelectUser}
                        onBack={() => setCurrentStep(STEPS.PHONE_OTP_LOGIN)}
                        isVerifying={isVerifyingOtp}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            {renderStep()}
        </div>
    );
};

export default AuthLoginFlow;
