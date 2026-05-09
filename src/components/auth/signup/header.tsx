'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Typography from '@/components/ui/typoGraphy';
import logo from '@/assets/logo.svg';
import { PATHS } from '@/constants/path';

const Header = () => {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center text-center space-y-4">
            <div
                className="relative inline-block cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => router.replace(PATHS.HOME_PAGE)}
            >
                <Image src={logo} alt="Spare Space Logo" width={220} height={110} priority />
            </div>
            <div className="space-y-1 flex flex-col items-center text-center">
                <Typography color="text-gray-500" size="sm">
                    Welcome to Spare Space
                </Typography>
            </div>
        </div>
    );
};

export default Header;
