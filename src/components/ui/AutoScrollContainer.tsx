import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AutoScrollContainerProps {
    children: React.ReactNode;
    scrollSpeed?: number;
    arrowVariant?: 'default' | 'yellow';
    minItemsForInfinite?: number;
}

const AutoScrollContainer: React.FC<AutoScrollContainerProps> = ({
    children,
    scrollSpeed = 1,
    arrowVariant = 'default',
    minItemsForInfinite = 3,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);
    const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const childrenArray = React.Children.toArray(children);
    const shouldUseInfinite = childrenArray.length >= minItemsForInfinite;

    const updateButtons = () => {
        const el = containerRef.current;
        if (!el) return;
        setShowLeft(el.scrollLeft > 10);
        setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };

    const smoothScrollTo = (target: number) => {
        const el = containerRef.current;
        if (!el) return;

        const start = el.scrollLeft;
        const distance = target - start;
        const duration = 300;
        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeProgress =
                progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            el.scrollLeft = start + distance * easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    const handleScrollLeft = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const el = containerRef.current;
        if (!el) return;
        const target = Math.max(0, el.scrollLeft - 300);
        smoothScrollTo(target);
    };

    const handleScrollRight = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const el = containerRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const target = Math.min(maxScroll, el.scrollLeft + 300);
        smoothScrollTo(target);
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        if (shouldUseInfinite) {
            const singleSetWidth = el.scrollWidth / 3;
            el.scrollLeft = singleSetWidth;
        }

        const timer = setTimeout(updateButtons, 100);

        const startAutoScroll = () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }

            if (!shouldUseInfinite) return;

            autoScrollIntervalRef.current = setInterval(() => {
                if (!isHovered && el) {
                    const singleSetWidth = el.scrollWidth / 3;
                    const maxScrollLeft = singleSetWidth * 2;

                    el.scrollLeft += scrollSpeed;

                    if (el.scrollLeft >= maxScrollLeft) {
                        el.scrollLeft = singleSetWidth;
                    }

                    if (el.scrollLeft <= 0) {
                        el.scrollLeft = singleSetWidth;
                    }
                }
            }, 20);
        };

        startAutoScroll();
        el.addEventListener('scroll', updateButtons);
        window.addEventListener('resize', updateButtons);

        return () => {
            clearTimeout(timer);
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }
            el.removeEventListener('scroll', updateButtons);
            window.removeEventListener('resize', updateButtons);
        };
    }, [isHovered, scrollSpeed, shouldUseInfinite]);

    const buttonClass =
        arrowVariant === 'yellow'
            ? 'bg-yellow-400 hover:bg-yellow-500 text-white'
            : 'bg-white hover:bg-gray-100 text-black';

    return (
        <div className="relative w-full">
            {showLeft && (
                <button
                    type="button"
                    aria-label="Scroll left"
                    onClick={handleScrollLeft}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-xl transition-all z-50 pointer-events-auto ${buttonClass}`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            <div
                ref={containerRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-none"
            >
                {shouldUseInfinite ? (
                    <>
                        {childrenArray.map((child, index) => (
                            <div key={`clone-left-${index}`}>{child}</div>
                        ))}
                        {childrenArray.map((child, index) => (
                            <div key={`main-${index}`}>{child}</div>
                        ))}
                        {childrenArray.map((child, index) => (
                            <div key={`clone-right-${index}`}>{child}</div>
                        ))}
                    </>
                ) : (
                    childrenArray.map((child, index) => <div key={index}>{child}</div>)
                )}
            </div>

            {showRight && (
                <button
                    type="button"
                    aria-label="Scroll right"
                    onClick={handleScrollRight}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-xl transition-all z-50 pointer-events-auto ${buttonClass}`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}


        </div>
    );
};

export default AutoScrollContainer;
