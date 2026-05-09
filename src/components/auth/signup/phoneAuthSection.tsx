'use client';
import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import Loader from '@/components/ui/loader';
import GoogleLogin from '@/components/auth/googleLogin/googleLogin';
import PhoneInputComponent from '@/components/ui/phoneInput';

interface PhoneAuthSectionProps {
    phone: string;
    setPhone: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    handleSendOtp: () => void;
    isSendingOtp: boolean;
    onSwitchToEmail: () => void;
    rolesData: any;
    onSocialLoginSuccess: (data: any) => void;
}

const PhoneAuthSection: React.FC<PhoneAuthSectionProps> = ({
    phone,
    setPhone,
    code,
    setCode,
    handleSendOtp,
    isSendingOtp,
    onSwitchToEmail,
    rolesData,
    onSocialLoginSuccess,
}) => {
    const roleId = rolesData?.data?.find((r: any) => r.name?.toLowerCase() === 'user')?.id;

    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
            <div className="p-1">
                <div className="space-y-4">
                    <PhoneInputComponent
                        phone={phone}
                        code={code}
                        onChange={(value, dialCode) => {
                            setPhone(value);
                            setCode(dialCode);
                        }}
                    />
                    <Button
                        onClick={handleSendOtp}
                        disabled={!phone || isSendingOtp}
                        className="w-full rounded-full h-14 bg-[#F6CD28] hover:bg-[#E5BD24] text-gray-900 font-bold text-lg border-none shadow-lg shadow-yellow-100/50 transition-all active:scale-95"
                    >
                        {isSendingOtp ? (
                            <Loader size={24} colorClass="text-gray-900" />
                        ) : (
                            <span className="flex items-center gap-2">
                                Continue with Phone <ArrowRight size={20} />
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 py-2 px-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-200"></div>
                <Typography
                    color="text-gray-400"
                    size="xs"
                    weight="bold"
                    className="tracking-widest uppercase"
                >
                    OR
                </Typography>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-gray-200"></div>
            </div>

            <div className="space-y-4">
                <Button
                    variant="outline"
                    onClick={onSwitchToEmail}
                    className="w-full rounded-full h-14 border-2 border-gray-100 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center gap-3"
                >
                    <Mail size={20} className="text-gray-400" />
                    Continue with Email
                </Button>

                <GoogleLogin
                    roleId={roleId ? Number(roleId) : (undefined as any)}
                    onSuccess={onSocialLoginSuccess}
                />
            </div>
        </div>
    );
};

export default PhoneAuthSection;
