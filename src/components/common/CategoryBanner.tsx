'use client';

import React from 'react';
import { BannerContent } from '@/constants/categoryBanners';

interface CategoryBannerProps {
    content: BannerContent;
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({ content }) => {
    return (
        <div className="w-full border-y py-8 md:py-12 mb-6 relative overflow-hidden flex flex-col items-center text-center px-4">
            {/* Editorial background texture */}
            <div
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }}
            />

            <div className="relative z-10 max-w-4xl w-full">
                {/* Editorial Breadcrumb/Tag */}

                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight font-poppins leading-[1.1]">
                    {content.title}
                </h1>

                <div className="flex flex-col items-center gap-4">
                    <p className="text-gray-500 text-base md:text-xl leading-tight font-medium max-w-2xl mx-auto font-figtree opacity-90">
                        {content.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="h-px w-12 bg-[#F6CD28]" />
                        <div className="w-2 h-2 rounded-full bg-[#F6CD28]" />
                        <div className="h-px w-12 bg-[#F6CD28]" />
                    </div>
                </div>

                {/* Editorial Stats/Footer - Dynamic Keywords */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-gray-400 text-[11px] md:text-sm font-semibold tracking-wider uppercase border-t border-gray-100 pt-6">
                    {(() => {
                        const defaultItems = [
                            'Verified Locations',
                            'Instant Booking',
                            'Premium Amenities',
                        ];
                        const keywords = content.keywords
                            ? content.keywords.split(',').map((k) => k.trim())
                            : defaultItems;

                        return keywords.map((item, index) => (
                            <React.Fragment key={item}>
                                <span className="hover:text-[#F6CD28] transition-colors cursor-default whitespace-nowrap">
                                    {item}
                                </span>
                                {index < keywords.length - 1 && (
                                    <span className="text-gray-200 hidden sm:inline">/</span>
                                )}
                            </React.Fragment>
                        ));
                    })()}
                </div>
            </div>

            {/* Subtle corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-gray-100 rounded-tl-3xl m-4 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-gray-100 rounded-br-3xl m-4 opacity-50 pointer-events-none" />
        </div>
    );
};

export default CategoryBanner;
