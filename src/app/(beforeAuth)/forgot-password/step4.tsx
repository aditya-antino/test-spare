import React from 'react';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import Image from 'next/image';
import logo from '@/assets/logo.svg';

const Step4 = () => {
    return (
        <div className="w-full flex flex-col gap-8">
            {/* Logo + heading */}
            <div className="text-center space-y-6">
                <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
                <Typography variant="h4" color="text-gray-800" weight="semibold" align="center">
                    Password Reset Successful!
                </Typography>
                <Typography variant="body" color="text-gray-600" weight="normal" align="center">
                    Your password has been updated successfully. You can now log in with your new
                    password.
                </Typography>
            </div>

            {/* Action button */}
            <Button
                variant="default"
                className="w-full"
                onClick={() => (window.location.href = '/login')}
            >
                Back to Login
            </Button>
        </div>
    );
};

export default Step4;
