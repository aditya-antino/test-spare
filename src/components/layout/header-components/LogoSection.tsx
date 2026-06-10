import React, { memo } from 'react';
import Image from 'next/image';
import spareSpaceLogo from '@/assets/spare-space-logo.svg';

interface LogoSectionProps {
    onLogoClick: () => void;
}

const LogoSection = memo(function LogoSection({ onLogoClick }: LogoSectionProps) {
    return (
        <div className="relative w-[124px] h-[40px] sm:w-[140px] sm:h-[60px]">
            <Image
                onClick={onLogoClick}
                src={spareSpaceLogo || '/default-logo.svg'}
                alt="Spare Space Logo"
                fill
                className="object-contain hover:cursor-pointer"
                priority
            />
        </div>
    );
});

export default LogoSection;
