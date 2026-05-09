import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Post, Get, Patch, Put } from '@/services/api';
import { endpoints } from '@/services/endPoints';
import { ApiResponse } from '@/types/common.types';
import {
    LoginProps,
    SignUpProps,
    GetOtpPayload,
    VerifyOtpPayload,
    VerifyEmailResponse,
    ResendVerificationPayload,
    ResendVerificationResponse,
    GoogleLoginProps,
    ForgotPasswordProps,
    ResetPasswordPayload,
    ResetPasswordResponse,
    UpdateProfilePayload,
    UpdateProfileResponse,
    Avatar,
} from '@/types/auth.types';

// get role ids
export const useGetRoles = () => {
    return useQuery({
        queryKey: ['get-user-roles'],
        queryFn: async () =>
            await Get<ApiResponse<[{ id: string; name: string }]>>(endpoints.GET_ROLE_IDS),
        enabled: true,
    });
};

// Auth mutations
export const useLogin = (props?: UseMutationOptions<any, any, LoginProps>) => {
    return useMutation({
        mutationKey: ['auth-login'],
        mutationFn: async (data: LoginProps) => await Post(endpoints.AUTH_LOGIN, data),
        ...props,
    });
};

export const useLogout = () => {
    return useMutation<void, unknown>({
        mutationKey: ['auth-logout'],
        mutationFn: async () => await Post(endpoints.AUTH_LOGOUT),
    });
};

// google login
export const useGoogleAuthLogin = (props?: UseMutationOptions<any, any, GoogleLoginProps>) => {
    return useMutation({
        mutationKey: ['auth-google-login'],
        mutationFn: async (data: GoogleLoginProps) => await Post(endpoints.AUTH_GOOGLE_LOGIN, data),
        ...props,
    });
};

// sign up
export const useSignup = (props?: UseMutationOptions<any, any, SignUpProps>) => {
    return useMutation({
        mutationKey: ['auth-signup'],
        mutationFn: async (data: SignUpProps) => await Post(endpoints.AUTH_SIGNUP, data),
        ...props,
    });
};

// get otp
export const useGetOtp = (
    options?: UseMutationOptions<ApiResponse<{ otpSent: boolean }>, unknown, GetOtpPayload>,
) => {
    return useMutation({
        mutationKey: ['get-otp'],
        mutationFn: async (payload: GetOtpPayload) => {
            return await Post<ApiResponse<{ otpSent: boolean }>>(
                endpoints.SEND_MOBILE_OTP,
                payload,
            );
        },
        ...options,
    });
};

// verify mobile otp
export const useVerifyMobileOtp = (
    options?: UseMutationOptions<ApiResponse<{ verified: boolean }>, unknown, VerifyOtpPayload>,
) => {
    return useMutation({
        mutationKey: ['verify-mobile-otp'],
        mutationFn: async (payload: VerifyOtpPayload) => {
            return await Post<ApiResponse<{ verified: boolean }>>(
                endpoints.VERIFY_MOBILE_OTP,
                payload,
            );
        },
        ...options,
    });
};

// verify email
export const useVerifyEmail = (
    token: string,
    options?: UseQueryOptions<ApiResponse<VerifyEmailResponse>>,
) => {
    return useQuery<ApiResponse<VerifyEmailResponse>>({
        queryKey: ['verify-email', token],
        queryFn: async () =>
            await Get<ApiResponse<VerifyEmailResponse>>(`${endpoints.VERIFY_EMAIL}?token=${token}`),
        enabled: !!token, 
        ...options,
    });
};

// resend verification
export const useResendVerification = (
    options?: UseMutationOptions<
        ApiResponse<ResendVerificationResponse>,
        unknown,
        ResendVerificationPayload
    >,
) => {
    return useMutation({
        mutationKey: ['resend-verification'],
        mutationFn: async (payload: ResendVerificationPayload) =>
            await Post<ApiResponse<ResendVerificationResponse>>(
                endpoints.RESEND_VERIFICATION,
                payload,
            ),
        ...options,
    });
};

export const useUpdateGuestToHost = (props?: UseMutationOptions<any, any>) => {
    return useMutation({
        mutationKey: ['update-guest-to-host-role'],
        mutationFn: async () => await Put(endpoints.UPDATE_GUEST_TO_HOST, {}),
        ...props,
    });
};

// update user profile on login
export const useUpdateProfile = (
    options?: UseMutationOptions<ApiResponse<UpdateProfileResponse>, unknown, UpdateProfilePayload>,
) => {
    return useMutation({
        mutationKey: ['update-profile'],
        mutationFn: async (payload: UpdateProfilePayload) =>
            await Put<ApiResponse<UpdateProfileResponse>>(endpoints.AUTH_PROFILE, payload),
        ...options,
    });
};

// forgot password
export const useForgotPassword = (props?: UseMutationOptions<any, any, ForgotPasswordProps>) => {
    return useMutation({
        mutationKey: ['auth-forgot-password'],
        mutationFn: async (data: ForgotPasswordProps) =>
            await Post(endpoints.AUTH_FORGOT_PASSWORD, data),
        ...props,
    });
};

export const useResetPassword = (
    options?: UseMutationOptions<ApiResponse<ResetPasswordResponse>, Error, ResetPasswordPayload>,
) => {
    return useMutation<ApiResponse<ResetPasswordResponse>, Error, ResetPasswordPayload>({
        mutationKey: ['reset-password'],
        mutationFn: async (data: ResetPasswordPayload) =>
            await Post<ApiResponse<ResetPasswordResponse>>(endpoints.AUTH_RESET_PASSWORD, data),
        ...options,
    });
};

export const useGetAvatars = (gender: string) => {
    return useQuery<ApiResponse<Avatar[]>>({
        queryKey: ['get-avatars', gender],
        queryFn: async () => await Get<ApiResponse<Avatar[]>>(endpoints.GET_AVATARS(gender)),
        enabled: !!gender,
    });
};

export const useUpdateAvatar = (props?: UseMutationOptions<any, any, { avatar: string }>) => {
    return useMutation({
        mutationKey: ['update-avatar'],
        mutationFn: async (data: { avatar: string }) => await Patch(endpoints.UPDATE_AVATAR, data),
        ...props,
    });
};
