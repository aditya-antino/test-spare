'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import loginImage from '@/assets/Login.png';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import PhoneLoginVerify from './phoneLoginVerify';
import Step6 from './step6';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setCredentials, setUserProfile, setUserRole } from '@/store/slice/authSlice';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';
import axiosInstance from '@/lib/axiosInstance';
import { endpoints } from '@/services/endPoints';
import { useAuth } from '@/hooks';
import { useGetProfile, useGetRoles } from '@/services';

interface SignupData {
    email: string;
    password: string;
    roleId: number;
    isSubscribeToNewsletter: boolean;
}

interface VerifyOtpData {
    countryCode: string;
    phoneNumber: string;
    otp: string;
}

interface UpdateProfileData {
    firstName: string;
    lastName: string;
    dob: Date | undefined;
    gender: string;
    avatar: string;
}

enum SIGNUP_STEPS {
    INITIAL = 1,
    EMAIL_VERIFY = 2,
    PROFILE_SETUP = 3,
    PHONE_VERIFY = 4,
    PHONE_OTP_LOGIN = 5,
    ADD_EMAIL = 6,
}

const SignUp = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuth, user } = useAuth();
    const { data: profileData } = useGetProfile();
    const { data: rolesData } = useGetRoles();

    const [currentStep, setCurrentStep] = useState<SIGNUP_STEPS>(SIGNUP_STEPS.INITIAL);
    const [emailVerifyToken, setEmailVerifyToken] = useState<string | null>(null);
    const [isPhoneLogin, setIsPhoneLogin] = useState(false);
    const [loading, setLoading] = useState({
        signup: false,
        updateProfile: false,
        verifyOtp: false,
        sendOtp: false,
        phoneVerify: false,
    });

    // Sync profile data to Redux during signup
    useEffect(() => {
        if (profileData?.data && rolesData?.data) {
            const userRoleIds: number[] = profileData?.data?.roles || [];
            const userRoles = rolesData.data.filter((role: any) => userRoleIds.includes(role.id));
            const roleNames = userRoles.map((role: any) => role.name?.toLowerCase() || '');

            dispatch(setUserProfile(profileData.data));
            dispatch(setUserRole(roleNames));
        }
    }, [profileData, rolesData, dispatch]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const t = params.get('token');
            setEmailVerifyToken(t);
            if (t) {
                setCurrentStep(SIGNUP_STEPS.EMAIL_VERIFY);
                return;
            }
        }
    }, []);

    const handleStepNavigation = (userData: any) => {
        if (!userData) return;

        const { isProfileCompleted, isPhoneVerified, isEmailVerified, email } = userData;

        if (isProfileCompleted && isPhoneVerified && (email ? isEmailVerified : true)) {
            router.replace(PATHS.HOME_PAGE);
            return;
        }

        if (email && !isEmailVerified) {
            setCurrentStep(SIGNUP_STEPS.EMAIL_VERIFY);
        } else if (!isProfileCompleted) {
            setCurrentStep(SIGNUP_STEPS.PROFILE_SETUP);
        } else if (!isPhoneVerified) {
            setCurrentStep(SIGNUP_STEPS.PHONE_VERIFY);
        } else {
            router.replace(PATHS.HOME_PAGE);
        }
    };

    // Auto-detect step based on profile completeness (for refreshes)
    useEffect(() => {
        if (isAuth && user && currentStep === SIGNUP_STEPS.INITIAL) {
            handleStepNavigation(user);
        }
    }, [isAuth, user, currentStep]);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [gender, setGender] = useState('');
    const [avatar, setAvatar] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState<string>('');
    const [otp, setOtp] = useState('');
    const [userData, setUserData] = useState<{ email: string; roleId: number }>({
        email: '',
        roleId: 0,
    });

    const [tempToken, setTempToken] = useState<string | null>(null);
    const [tempRefreshToken, setTempRefreshToken] = useState<string | null>(null);

    const handleAuthSuccess = (userData: any, message?: string) => {
        if (!userData) {
            toast.error('Authentication failed: Invalid user data');
            return;
        }

        // 1. Update Profile in Redux
        dispatch(setUserProfile(userData));

        // 2. Set temp token if available
        if (userData.accessToken) {
            setTempToken(userData.accessToken);
            setTempRefreshToken(userData.refreshToken);
        }

        const token = userData.accessToken || tempToken;
        const refreshToken = userData.refreshToken || tempRefreshToken;

        // 3. Profile is incomplete if any key fields are missing
        // For phone users: email is null initially — treat as incomplete until they provide one
        // Note: Some APIs omit fields entirely rather than sending null. We only trigger incomplete
        // if isProfileCompleted is explicitly false, OR if the fields are explicitly returned as null.
        const hasIncompleteProfile =
            userData.isProfileCompleted === false ||
            userData.firstName === null ||
            userData.avatar === null ||
            (userData.email === null && !userData.isEmailVerified);

        // 4. Check if user has fully completed all onboarding steps
        const isFullyComplete =
            Boolean(token) &&
            !hasIncompleteProfile &&
            Boolean(userData.isEmailVerified) && // always required
            Boolean(userData.isPhoneVerified);

        // 5. If everything is complete, set credentials and redirect to home
        if (isFullyComplete) {
            dispatch(
                setCredentials({
                    accessToken: token,
                    refreshToken: refreshToken,
                }),
            );
            router.replace(PATHS.HOME_PAGE);
            if (message) toast.success(message);
            return;
        }

        if (userData.isProfileCompleted === false) {
            // Missing name/avatar goes to profile setup
            setCurrentStep(SIGNUP_STEPS.PROFILE_SETUP);
        } else if (!userData.email) {
            // Profile is complete but email is missing (phone users) goes to add email step
            setCurrentStep(SIGNUP_STEPS.ADD_EMAIL);
        } else if (!userData.isEmailVerified) {
            // Email exists but not yet verified
            setCurrentStep(SIGNUP_STEPS.EMAIL_VERIFY);
        } else if (!userData.isPhoneVerified) {
            setCurrentStep(SIGNUP_STEPS.PHONE_VERIFY);
        } else {
            handleStepNavigation(userData);
        }
    };

    // API functions
    const handleUpdateProfile = async (
        data: UpdateProfileData & { email?: string; password?: string },
    ) => {
        setLoading((prev) => ({ ...prev, updateProfile: true }));
        try {
            // 1. Update Profile
            const profileResponse = await axiosInstance.put(
                endpoints.AUTH_PROFILE,
                {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    dob: data.dob,
                    gender: data.gender,
                    avatar: data.avatar,
                },
                {
                    headers: tempToken ? { Authorization: `Bearer ${tempToken}` } : undefined,
                },
            );

            const updatedUser = profileResponse.data.data;
            handleAuthSuccess(updatedUser, profileResponse.data.message);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading((prev) => ({ ...prev, updateProfile: false }));
        }
    };

    const handleAddEmail = async () => {
        setLoading((prev) => ({ ...prev, updateProfile: true }));
        try {
            const addEmailResponse = await axiosInstance.post(
                endpoints.AUTH_ADD_EMAIL_TO_ACCOUNT,
                {
                    email: email,
                    password: password,
                },
                {
                    headers: tempToken ? { Authorization: `Bearer ${tempToken}` } : undefined,
                },
            );

            // If successful, the next logical step is to verify the email they just added (Step 2)
            if (addEmailResponse.data?.data) {
                const updatedUser = addEmailResponse.data.data;
                dispatch(setUserProfile(updatedUser));
                setUserData({
                    email: updatedUser.email || email,
                    roleId: updatedUser.roles?.[0] || 0,
                });
            }
            toast.success(addEmailResponse.data?.message || 'Email added successfully! Please verify it.');
            setCurrentStep(SIGNUP_STEPS.EMAIL_VERIFY);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add email');
        } finally {
            setLoading((prev) => ({ ...prev, updateProfile: false }));
        }
    };

    const signUp = async (data: SignupData) => {
        setLoading((prev) => ({ ...prev, signup: true }));
        try {
            const payload = {
                email: data.email.toLocaleLowerCase(),
                password: data.password,
                roleId: data.roleId,
                isSubscribeToNewsletter: data.isSubscribeToNewsletter,
            };
            const response = await axiosInstance.post(endpoints.AUTH_SIGNUP, payload);
            const responseData = response.data;

            // Set temp token and determine next step automatically
            handleAuthSuccess(responseData.data, responseData.message);
            // Specifically for email signup case, force Step 2 (Email Verify screen)
            setCurrentStep(SIGNUP_STEPS.EMAIL_VERIFY);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Signup failed');
        } finally {
            setLoading((prev) => ({ ...prev, signup: false }));
        }
    };

    const verifyOtp = async (data: VerifyOtpData) => {
        setLoading((prev) => ({ ...prev, verifyOtp: true }));
        try {
            const response = await axiosInstance.post(endpoints.VERIFY_MOBILE_OTP, data, {
                ...(tempToken && {
                    headers: {
                        Authorization: `Bearer ${tempToken}`,
                    },
                }),
            });

            if (response.data.data?.isPhoneVerified) {
                handleAuthSuccess(response.data.data, response.data.message);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading((prev) => ({ ...prev, verifyOtp: false }));
        }
    };

    const handleSendOtp = async () => {
        if (!phone) return;
        const isPhoneLoginRoute = currentStep === 1 || currentStep === 5;
        const endpoint = isPhoneLoginRoute ? endpoints.AUTH_PHONE_SIGNUP : endpoints.SEND_MOBILE_OTP;

        setLoading((prev) => ({ ...prev, sendOtp: true }));
        try {
            const roleId = rolesData?.data?.find(
                (data: { id: string; name: string }) => data.name?.toLowerCase() === 'user',
            )?.id;

            const response = await axiosInstance.post(
                endpoint,
                {
                    countryCode: code,
                    phoneNumber: phone?.slice(code.length),
                    ...(isPhoneLoginRoute && { roleId: roleId ? Number(roleId) : undefined }),
                },
                {
                    ...(tempToken && {
                        headers: {
                            Authorization: `Bearer ${tempToken}`,
                        },
                    }),
                },
            );

            if (response.data.success) {
                toast.success(response.data.message);
                if (currentStep === 1) {
                    setIsPhoneLogin(true);
                    setCurrentStep(5); // Phone Login Verify Step
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading((prev) => ({ ...prev, sendOtp: false }));
        }
    };

    const handleVerifyOtp = () => {
        if (!otp) return;
        verifyOtp({ countryCode: code, phoneNumber: phone?.slice(code.length), otp });
    };

    const handlePhoneLoginVerify = async () => {
        setLoading((prev) => ({ ...prev, phoneVerify: true }));
        try {
            const response = await axiosInstance.post(
                endpoints.VERIFY_PHONE_SIGNUP_OTP,
                {
                    countryCode: code,
                    phoneNumber: phone?.slice(code.length),
                    otp,
                },
                {
                    ...(tempToken && {
                        headers: {
                            Authorization: `Bearer ${tempToken}`,
                        },
                    }),
                },
            );

            handleAuthSuccess(response.data.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading((prev) => ({ ...prev, phoneVerify: false }));
        }
    };

    const handleStep1Submit = (data: any) => {
        setUserData(data);
        signUp({
            email: data.email,
            password: data.password,
            roleId: data.roleId,
            isSubscribeToNewsletter: data.isSubscribeToNewsletter,
        });
    };

    const handleSignupSuccess = (data: any) => {
        handleAuthSuccess(data?.data);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1
                        handleSubmit={handleStep1Submit}
                        onSocialLoginSuccess={handleSignupSuccess}
                        isPending={loading.signup}
                        phone={phone}
                        setPhone={setPhone}
                        code={code}
                        setCode={setCode}
                        handleSendOtp={handleSendOtp}
                        isSendingOtp={loading.sendOtp}
                    />
                );
            case 2:
                return (
                    <Step2
                        userData={{
                            email: userData.email || user?.email || '',
                            roleId: userData.roleId || (user?.roles?.[0] as number) || 0,
                        }}
                        handleVerification={() => setCurrentStep(3)}
                    />
                );
            case 3:
                return (
                    <Step3
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
                        isSubmitting={loading.updateProfile}
                        isNewPhoneUser={
                            (isPhoneLogin || (isAuth && !user?.email)) && !userData.email
                        }
                    />
                );
            case 4:
                return (
                    <Step4
                        code={code}
                        setCode={setCode}
                        phone={phone}
                        setPhone={setPhone}
                        otp={otp}
                        setOtp={setOtp}
                        handleSendOtp={handleSendOtp}
                        handleVerifyOtp={handleVerifyOtp}
                        isSendingOtp={loading.sendOtp}
                        isVerifyingOtp={loading.verifyOtp}
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
                        isSendingOtp={loading.sendOtp}
                        isVerifyingOtp={loading.phoneVerify}
                        mode="signup"
                    />
                );
            case SIGNUP_STEPS.ADD_EMAIL:
                return (
                    <Step6
                        email={email}
                        password={password}
                        onEmailChange={setEmail}
                        onPasswordChange={setPassword}
                        handleAddEmail={handleAddEmail}
                        isSubmitting={loading.updateProfile}
                    />
                );
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

export default SignUp;
