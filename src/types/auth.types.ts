
export interface LoginProps {
    email: string;
    password: string;
    roleId: number;
}

export interface SignUpProps {
    email: string;
    password: string;
    roleId: number;
}

export interface GetOtpPayload {
    phoneNumber: string;
    countryCode: string;
}

export interface VerifyOtpPayload {
    phoneNumber: string;
    otp: string;
    countryCode: string;
}

export interface VerifyEmailResponse {
    verified: boolean;
    accessToken: string;
}

export interface ResendVerificationPayload {
    email: string;
}

export interface ResendVerificationResponse {
    success: boolean;
    message: string;
}

export interface GoogleLoginProps {
    idToken: string;
    roleId: number;
}

export interface ForgotPasswordProps {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    password: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

export interface UpdateProfilePayload {
    firstName: string;
    lastName: string;
    dob: Date | string;
    gender: string;
    cityId?: number;
    jobTitle?: string;
    about?: string;
    languages?: string[];
    avatar: string | null;
}

export interface UpdateProfileResponse {
    updated: boolean;
}

export interface Avatar {
    id: number;
    gender: string;
    avatarUrl: string;
}
