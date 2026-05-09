import axiosInstance from '@/lib/axiosInstance';

const verifyAadhar = async (aadharNumber: string, otp: number | string) => {
    const response = await axiosInstance.post('/auth/aadhaar/verify-otp', {
        aadharNumber: aadharNumber,
        otp: otp,
    });
    return response;
};

const resendAadharOTP = async (aadharNumber: string) => {
    const response = await axiosInstance.post('auth/aadhaar/resend-otp', {
        aadharNumber: aadharNumber,
    });
    return response;
};

export { verifyAadhar, resendAadharOTP };
