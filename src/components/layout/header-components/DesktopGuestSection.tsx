import React, { memo } from 'react';
import Link from 'next/link';
import { PATHS } from '@/constants/path';

const DesktopGuestSection = memo(function DesktopGuestSection() {
    return (
        <div className="hidden md:flex items-center justify-end gap-3">
            <Link
                href={PATHS?.SIGN_UP || '/'}
                className="text-zinc-800 text-base font-semibold px-3 hover:text-black transition-colors"
            >
                Sign Up
            </Link>
            <Link
                href={PATHS?.LOGIN || '/'}
                className="text-black text-base font-semibold px-6 py-3 bg-[#F6CD28] hover:bg-yellow-500 transition-colors rounded-full"
            >
                Log In
            </Link>
        </div>
    );
});

export default DesktopGuestSection;
