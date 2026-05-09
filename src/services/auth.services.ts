import axiosInstance from '@/lib/axiosInstance';
import { endpoints } from '@/services/endPoints';
import { SignupData, UpdateProfileData, VerifyOtpData } from '@/types';

const signUpApi = (data: SignupData) => axiosInstance.post(endpoints.AUTH_SIGNUP, data);

const verifyOtpApi = (data: VerifyOtpData, token: string) =>
    axiosInstance.post(endpoints.VERIFY_MOBILE_OTP, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

const sendOtpApi = (data: Omit<VerifyOtpData, 'otp'>, token: string) =>
    axiosInstance.post(endpoints.SEND_MOBILE_OTP, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

const updateProfileApi = (data: UpdateProfileData, token: string) =>
    axiosInstance.put(endpoints.AUTH_PROFILE, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

export { updateProfileApi, signUpApi, verifyOtpApi, sendOtpApi };
