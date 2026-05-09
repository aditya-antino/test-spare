'use client';
import Image from 'next/image';
import loginImage from '@/assets/Login.png';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import PhoneLoginVerify from './phoneLoginVerify';
import Step6 from '../sign-up/step6';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import VerificationPage from './verificationPage';
import { PATHS } from '@/constants/path';
import axiosInstance from '@/lib/axiosInstance'; // Adjust path as needed
import { useDispatch } from 'react-redux';
import { setCredentials, setUserProfile } from '@/store/slice/authSlice';
import { endpoints } from '@/services/endPoints';
import { useAuth } from '@/hooks';

const Login = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [gender, setGender] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [avatar, setAvatar] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [roles, setRoles] = useState<any>([]);
    const [code, setCode] = useState<string>();
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [isPhoneLogin, setIsPhoneLogin] = useState(false);

    const [isPending, setIsPending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuth, user } = useAuth();

    // Fetch roles on component mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axiosInstance.get(endpoints.GET_ROLE_IDS);
                setRoles(response.data.data);
            } catch (error) {
                console.error('Failed to fetch roles:', error);
                toast.error('Failed to fetch roles');
            } finally {
                // Roles fetched
            }
        };

        fetchRoles();
    }, []);

    const handleAuthSuccess = (userData: any, message?: string) => {
        if (!userData) {
            toast.error('Authentication failed: Invalid user data');
            return;
        }

        // Set temp token if available
        if (userData.accessToken) {
            setTempToken(userData.accessToken);
        }

        // Update profile in store
        dispatch(setUserProfile(userData));

        // Check if user has completed all steps
        const hasIncompleteProfile =
            userData.isProfileCompleted === false || !userData.firstName || !userData.avatar;

        const isFullyComplete =
            Boolean(userData.accessToken) &&
            !hasIncompleteProfile &&
            Boolean(userData.email) &&
            Boolean(userData.isEmailVerified) && // always required
            Boolean(userData.isPhoneVerified);

        // If everything is complete, set credentials and redirect to home
        if (isFullyComplete) {
            dispatch(
                setCredentials({
                    accessToken: userData.accessToken,
                    refreshToken: userData.refreshToken,
                }),
            );
            router.replace(PATHS.HOME_PAGE);
            if (message) toast.success(message);
            return;
        }

        // Otherwise, determine which step to show based on what's missing
        if (message) toast.success(message);

        if (userData.isProfileCompleted === false) {
            setCurrentStep(3);
        } else if (!userData.email) {
            setCurrentStep(6);
        } else if (!userData.isEmailVerified) {
            setCurrentStep(2);
        } else if (!userData.isPhoneVerified) {
            setCurrentStep(4);
        }
    };

    // Login function
    const login = async (loginData: { email: string; password: string; roleId: number }) => {
        try {
            setIsPending(true);
            const response = await axiosInstance.post(endpoints.AUTH_LOGIN, loginData);
            handleAuthSuccess(response.data.data, response.data.message);
        } catch (error: any) {
            toast.error('Invalid Credentials');
            console.error('Login failed', error);
        } finally {
            setIsPending(false);
        }
    };

    // Update profile function
    const handleUpdateProfile = async (profileData: any) => {
        try {
            setIsSubmitting(true);
            
            // 1. Update Profile (Name, DOB, Gender, Avatar)
            const profileResponse = await axiosInstance.put(
                endpoints.AUTH_PROFILE,
                {
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    dob: profileData.dob,
                    gender: profileData.gender,
                    avatar: profileData.avatar,
                },
                {
                    headers: {
                        Authorization: `Bearer ${tempToken}`,
                    },
                },
            );

            toast.success(profileResponse.data.message);
            const updatedUser = profileResponse.data.data;
            dispatch(setUserProfile(updatedUser));

            // After profile update, determine next step
            if (isPhoneLogin) {
                // For phone login, if email is missing or unverified, ask for it
                if (!updatedUser?.email) {
                    setCurrentStep(6);
                } else if (!updatedUser?.isEmailVerified) {
                    setCurrentStep(2);
                } else {
                    router.replace(PATHS.HOME_PAGE);
                }
            } else {
                // For email login, check if phone verify needed
                if (!updatedUser?.isPhoneVerified) {
                    setCurrentStep(4);
                } else {
                    router.replace(PATHS.HOME_PAGE);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Profile update failed');
            console.error('Profile update failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add email to account (for phone-signup users who need to add email)
    const handleAddEmail = async () => {
        try {
            setIsSubmitting(true);
            const addEmailResponse = await axiosInstance.post(
                endpoints.AUTH_ADD_EMAIL_TO_ACCOUNT,
                { email, password },
                {
                    headers: tempToken ? { Authorization: `Bearer ${tempToken}` } : undefined,
                },
            );
            if (addEmailResponse.data?.data) {
                dispatch(setUserProfile(addEmailResponse.data.data));
            }
            toast.success(addEmailResponse.data?.message || 'Email added successfully! Please verify it.');
            setCurrentStep(2); // Step 2 is Email Verify
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add email');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = (e: { email: string; password?: string }) => {
        setEmail(e.email);
        const roleId = roles.find(
            (data: { id: number; name: string }) => data.name?.toLowerCase() === 'user',
        )?.id;
        if (e.password) {
            login({ email: e.email, password: e.password, roleId });
        }
    };

    // Send OTP function
    const handleSendOtp = async () => {
        if (!phone) return;
        try {
            setIsSendingOtp(true);
            const isPhoneLoginRoute = currentStep === 1 || currentStep === 5;
            const endpoint = isPhoneLoginRoute ? endpoints.SEND_PHONE_LOGIN_OTP : endpoints.SEND_MOBILE_OTP;
            
            const roleId = roles?.find(
                (data: { id: number; name: string }) => data.name?.toLowerCase() === 'user',
            )?.id;

            const response = await axiosInstance.post(
                endpoint,
                {
                    countryCode: code,
                    phoneNumber: phone?.slice(code?.length || 0),
                    ...(isPhoneLoginRoute && { roleId })
                },
                {
                    ...(tempToken && {
                        headers: {
                            Authorization: `Bearer ${tempToken}`,
                        },
                    }),
                },
            );
            if (response.data?.success) {
                toast.success(response?.data?.message);
                if (currentStep === 1) {
                    setIsPhoneLogin(true);
                    setCurrentStep(5);
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    // New Phone Login Verify Function
    const handlePhoneLoginVerify = async () => {
        if (!otp) return;
        try {
            setIsVerifyingOtp(true);
            const roleId = roles?.find(
                (data: { id: number; name: string }) => data.name?.toLowerCase() === 'user',
            )?.id;

            const response = await axiosInstance.post(
                endpoints.VERIFY_PHONE_LOGIN_OTP,
                {
                    countryCode: code,
                    phoneNumber: phone?.slice(code?.length || 0),
                    otp,
                    roleId
                }
            );

            handleAuthSuccess(response.data.data, 'Logged in successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'OTP verification failed');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // Verify OTP function (for signup)
    const handleVerifyOtp = async () => {
        if (!otp) return;
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
                },
            );

            if (response.data?.data?.isPhoneVerified) {
                dispatch(
                    setCredentials({
                        accessToken: tempToken,
                        refreshToken: response.data.data.refreshToken,
                    }),
                );
                router.replace(PATHS.HOME_PAGE);
                toast.success('Onboarded Successfully');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'OTP verification failed');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1
                        onSuccess={(data) => handleAuthSuccess(data.data, data.message)}
                        handleFormSubmit={handleFormSubmit}
                        isPending={isPending}
                        roleId={
                            roles?.find(
                                (data: { id: number; name: string }) =>
                                    data.name?.toLowerCase() === 'user',
                            )?.id
                        }
                        phone={phone}
                        setPhone={setPhone}
                        code={code}
                        setCode={setCode}
                        handleSendOtp={handleSendOtp}
                        isSendingOtp={isSendingOtp}
                    />
                );
            case 2:
                return (
                    <VerificationPage
                        userData={{
                            email: email,
                            roleId: roles?.find(
                                (data: { id: number; name: string }) =>
                                    data.name?.toLowerCase() === 'user',
                            )?.id,
                        }}
                        setAccessToken={(token) => {
                            setTempToken(token);
                        }}
                        handleVerification={(data) => {
                            // After email verification, check if profile is needed
                            if (!data.data?.isProfileCompleted) {
                                setCurrentStep(3);
                            } else if (!isPhoneLogin && !data.data?.isPhoneVerified) {
                                setCurrentStep(4);
                            } else {
                                // Fully complete
                                dispatch(
                                    setCredentials({
                                        accessToken: data.data?.accessToken || tempToken,
                                        refreshToken: data.data?.refreshToken,
                                    }),
                                );
                                router.replace(PATHS.HOME_PAGE);
                            }
                        }}
                    />
                );
            case 3:
                return (
                    <Step2
                        firstName={firstName}
                        lastName={lastName}
                        email={email}
                        password={password}
                        dob={dob}
                        gender={gender}
                        avatar={avatar}
                        onFirstNameChange={setFirstName}
                        onLastNameChange={setLastName}
                        onEmailChange={setEmail}
                        onPasswordChange={setPassword}
                        onDobChange={setDob}
                        onGenderChange={setGender}
                        onAvatarChange={setAvatar}
                        handleUpdateProfile={handleUpdateProfile}
                        isSubmitting={isSubmitting}
                        isNewPhoneUser={(isPhoneLogin || (isAuth && !user?.email)) && !email}
                    />
                );
            case 4:
                return isPhoneLogin ? (
                    <VerificationPage
                        userData={{
                            email: email,
                            roleId: roles?.find(
                                (data: { id: number; name: string }) =>
                                    data.name?.toLowerCase() === 'user',
                            )?.id,
                        }}
                        setAccessToken={(token) => {
                            setTempToken(token);
                        }}
                        handleVerification={(data) => {
                            // Fully complete (Step 4 for phone users is Email Verify)
                            dispatch(
                                setCredentials({
                                    accessToken: data.data?.accessToken || tempToken,
                                    refreshToken: data.data?.refreshToken,
                                }),
                            );
                            router.replace(PATHS.HOME_PAGE);
                        }}
                    />
                ) : (
                    <Step3
                        setCode={setCode}
                        code={code}
                        phone={phone}
                        setPhone={setPhone}
                        otp={otp}
                        setOtp={setOtp}
                        handleSendOtp={handleSendOtp}
                        handleVerifyOtp={handleVerifyOtp}
                        isSendingOtp={isSendingOtp}
                        isVerifyingOtp={isVerifyingOtp}
                        isPhoneLogin={isPhoneLogin}
                    />
                );
            case 5:
                return (
                    <PhoneLoginVerify
                        code={code || '91'}
                        phone={phone}
                        otp={otp}
                        setOtp={setOtp}
                        handleSendOtp={handleSendOtp}
                        handleVerifyOtp={handlePhoneLoginVerify}
                        isSendingOtp={isSendingOtp}
                        isVerifyingOtp={isVerifyingOtp}
                    />
                );
            case 6:
                return (
                    <Step6
                        email={email}
                        password={password}
                        onEmailChange={setEmail}
                        onPasswordChange={setPassword}
                        handleAddEmail={handleAddEmail}
                        isSubmitting={isSubmitting}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full md:h-screen h-[100dvh]">
            {/* Left side image */}
            <div className="hidden md:block relative w-1/2 h-screen">
                <Image
                    src={loginImage}
                    alt="Signup background"
                    className="w-full object-cover h-full"
                    priority
                />
            </div>

            {/* Right side form */}
            <div className="flex flex-col justify-center w-full md:w-1/2 px-4 md:px-10 xl:px-40 space-y-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default Login;
