'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Circle, ChevronLeft, ChevronRight } from 'lucide-react';

type Tab = {
    label: string;
    href: string;
    isActive?: boolean;
    showBadge?: boolean;
};

type TabsNavProps = {
    tabs: Tab[];
    className?: string;
    tabClasses?: string;
};

export function TabsNav({ tabs, className, tabClasses }: TabsNavProps) {
    const pathname = usePathname();
    const navRef = useRef<HTMLDivElement>(null);

    const scrollBy = (offset: number) => {
        const nav = navRef.current;
        if (!nav) return;
        nav.scrollBy({ left: offset, behavior: 'smooth' });
    };

    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            nav.scrollTo({ left: 40, behavior: 'smooth' });
            setTimeout(() => nav.scrollTo({ left: 0, behavior: 'smooth' }), 400);
        }
    }, []);

    return (
        <div className="relative w-full">
            <div className="relative flex items-center md:hidden">
                <button
                    onClick={() => scrollBy(-120)}
                    className="absolute left-0 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow hover:bg-white transition"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <nav
                    ref={navRef}
                    className={cn(
                        'flex w-full items-center justify-start gap-3 overflow-x-auto scrollbar-hide px-10',
                        className,
                    )}
                >
                    {tabs.map((tab) => {
                        const isActive = tab.isActive ? tab.isActive : tab.href === pathname;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors px-3 py-2 rounded-full',
                                    isActive
                                        ? 'border-2 border-[#F6CD28] bg-white text-black font-semibold'
                                        : 'text-gray-400 hover:text-black',
                                    tabClasses,
                                )}
                            >
                                {tab.label}
                                {tab?.showBadge && (
                                    <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={() => scrollBy(120)}
                    className="absolute right-0 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow hover:bg-white transition"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>

                <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
            </div>

            <nav
                className={cn('hidden md:flex w-full items-center justify-center gap-6', className)}
            >
                {tabs.map((tab) => {
                    const isActive = tab.isActive ? tab.isActive : tab.href === pathname;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                'flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-full',
                                isActive
                                    ? 'border-2 border-[#F6CD28] bg-white text-black font-semibold'
                                    : 'text-gray-400 hover:text-black',
                                tabClasses,
                            )}
                        >
                            {tab.label}
                            {tab?.showBadge && (
                                <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
