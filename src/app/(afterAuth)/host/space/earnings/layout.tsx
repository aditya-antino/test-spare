'use client';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { PATHS } from '@/constants/path';
import { Wallet } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import React, { useMemo } from 'react';

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        { value: 'analytics', label: 'Analytics' },
        { value: 'time-wise-reports', label: 'Time-Wise Reports' },
        { value: 'property-wise-reports', label: 'Property-Wise Reports' },
    ];

    const activeTab = useMemo(() => {
        if (!pathname) return 'analytics';

        const segments = pathname.split('/').filter(Boolean);
        const tabSegment = segments.find((seg) => tabs.some((tab) => tab.value === seg));
        return tabSegment || 'analytics';
    }, [pathname, tabs]);

    return (
        <div>
            <div className="flex justify-between items-center pb-6 pt-4 px-2 md:px-0 sm:mt-0">
                <h2 className="text-[#F6CD28] text-3xl sm:text-4xl font-bold">Earnings</h2>
                <Button
                    onClick={() => router.push(PATHS.HOST_LINK_PAYOUT)}
                    className="gap-3"
                    variant="outline"
                >
                    <Wallet className="h-5 w-5 text-zinc-800" /> Manage Payout
                </Button>
            </div>
            <div className="md:flex w-full gap-8">
                <div className="w-full max-w-50 hidden md:block">
                    <div className="flex flex-col w-[200px]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => router.push(`${PATHS.HOST_EARNINGS}/${tab.value}`)}
                                className={`
                                        flex cursor-pointer items-center px-4 py-4 text-left rounded text-base font-medium transition-colors
                                        ${activeTab === tab.value
                                        ? 'bg-[#FDF6DD] text-neutral-800'
                                        : 'text-neutral-800 font-medium hover:bg-gray-50'
                                    }
                                     `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="md:hidden w-full pb-5 px-3">
                    <Tabs
                        variant="ghost"
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={(tab) => router.push(`${PATHS.HOST_EARNINGS}/${tab}`)}
                    />
                </div>
                <div className="w-full max-h-[100vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
