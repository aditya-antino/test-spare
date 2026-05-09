'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArrowScrollWrapperProps {
    children: React.ReactNode;
    arrowVariant?: 'default' | 'yellow';
    gapClassName?: string;
    autoScroll?: boolean;
    autoScrollInterval?: number;
    arrowTopClassName?: string;
}

const ArrowScrollWrapper: React.FC<ArrowScrollWrapperProps> = ({
    children,
    arrowVariant = 'default',
    gapClassName = 'gap-4',
    autoScroll = false,
    autoScrollInterval = 3000,
    arrowTopClassName = 'top-1/2 -translate-y-1/2',
}) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const updateButtons = () => {
        const el = scrollerRef.current;
        if (!el) return;
        setShowLeft(el.scrollLeft > 0);
        setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5); // 5px buffer for rounding
    };

    const scrollBy = (dir: 'left' | 'right') => {
        const el = scrollerRef.current;
        if (!el) return;
        const amount = 300; // fixed scroll distance
        if (dir === 'right' && el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        updateButtons();
        const el = scrollerRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateButtons);
        window.addEventListener('resize', updateButtons);
        return () => {
            el.removeEventListener('scroll', updateButtons);
            window.removeEventListener('resize', updateButtons);
        };
    }, []);

    useEffect(() => {
        if (!autoScroll) return;
        const interval = setInterval(() => {
            scrollBy('right');
        }, autoScrollInterval);
        return () => clearInterval(interval);
    }, [autoScroll, autoScrollInterval]);

    // Arrow styles
    const arrowBase =
        `p-2 rounded-full shadow transition-opacity absolute ${arrowTopClassName} z-20`;
    const arrowVariantClass =
        arrowVariant === 'yellow'
            ? 'bg-[#F6CD28] text-black hover:bg-yellow-500'
            : 'bg-white text-black hover:bg-gray-100';

    return (
        <div className="relative max-w-screen">
            {/* Left Arrow */}
            <button
                type="button"
                aria-hidden={!showLeft}
                aria-label="Scroll left"
                onClick={() => scrollBy('left')}
                className={`${arrowBase} cursor-pointer -left-4 ${arrowVariantClass} ${showLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                <ChevronLeft
                    className={`w-5 h-5 ${arrowVariant === 'yellow' ? 'text-white' : 'text-black'}`}
                />
            </button>

            {/* Scroll Container */}
            <div
                ref={scrollerRef}
                className={`flex overflow-x-auto py-2 px-2 ${gapClassName} scroll-smooth no-scrollbar`}
            >
                {children}
            </div>

            {/* Right Arrow */}
            <button
                type="button"
                aria-hidden={!showRight}
                aria-label="Scroll right"
                onClick={() => scrollBy('right')}
                className={`${arrowBase} cursor-pointer -right-4 ${arrowVariantClass} ${showRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                <ChevronRight
                    className={`w-5 h-5 ${arrowVariant === 'yellow' ? 'text-white' : 'text-black'}`}
                />
            </button>
        </div>
    );
};

export default ArrowScrollWrapper;
