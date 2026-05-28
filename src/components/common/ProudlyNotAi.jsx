import { useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { PATHS } from '@/constants/path';

const ProudlyNotAi = ({ variant = 'badge', popoverAlign = 'left' }) => {
    const [showInfo, setShowInfo] = useState(false);

    const isPill = variant === 'pill';

    return (
        <Link
            href={PATHS.PROUDLY_NOT_AI}
            className={`relative inline-flex items-center bg-[#F6CD28] hover:bg-yellow-500 text-[#111111] shadow-sm hover:shadow-md transition-all duration-200 border border-[#F6CD28] ${isPill ? 'rounded-full text-sm font-medium' : 'rounded-[10px] sm:rounded-[12px] text-xs sm:text-sm font-semibold'
                }`}
        >
            {/* Left portion: Text */}
            <span
                className={`text-[#111111] leading-none border-r border-[#111111]/10 whitespace-nowrap ${isPill ? 'pl-4 pr-2.5 py-2 rounded-l-full' : 'pl-3 pr-2.5 py-1 sm:py-2 rounded-l-[10px] sm:rounded-l-[12px]'
                    }`}
            >
                Proudly Not AI
            </span>

            {/* Right portion: Info button with hover trigger */}
            <div
                className="relative inline-flex items-center"
                onMouseEnter={() => {
                    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                        setShowInfo(true);
                    }
                }}
                onMouseLeave={() => {
                    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                        setShowInfo(false);
                    }
                }}
            >
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowInfo(!showInfo);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowInfo(!showInfo);
                        }
                    }}
                    className={`text-[#111111] hover:bg-black/[0.04] transition-colors flex items-center justify-center focus:outline-none cursor-pointer ${isPill ? 'pl-2.5 pr-4 py-2 rounded-r-full' : 'pl-2.5 pr-3 py-1 sm:py-2 rounded-r-[10px] sm:rounded-r-[12px]'
                        }`}
                    aria-label="Proudly Not AI Info"
                >
                    <Info className={`text-[#111111] ${isPill ? 'w-4 h-4' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'}`} />
                </span>

                {showInfo && (
                    <div
                        className={`absolute top-full pt-2 w-72 z-[100] text-left cursor-default normal-case tracking-normal ${popoverAlign === 'left'
                            ? 'right-[-20px] left-auto'
                            : 'left-[-20px] right-auto'
                            }`}
                    >
                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                            <p className="text-xs text-gray-600 leading-normal mb-3 font-medium">
                                Every photo on Spare Space is real. Taken by real photographers of real spaces you can actually walk into. Zero AI-generated or enhanced images.
                            </p>
                            <Link
                                href={PATHS.PROUDLY_NOT_AI}
                                className="w-full py-1.5 px-3 bg-[#F6CD28] hover:bg-yellow-500 text-[#111111] text-xs font-semibold rounded-lg text-center inline-block transition-colors cursor-pointer"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProudlyNotAi;