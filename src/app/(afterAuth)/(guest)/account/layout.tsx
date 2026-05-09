'use client';
import CompletionStatus from '@/components/account/CompletionStatus';
import { Tabs } from '@/components/ui/tabs';
import { GuestAccountPageTabs } from '@/constants/booking-status';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const pathname = usePathname();
    const currentPage = pathname.split('/').filter(Boolean).pop();
    const [active, setActive] = useState(currentPage || 'profile');
    const router = useRouter();

    const handleTabChange = (tab: string) => {
        setActive(tab);
        router.push('/account/' + tab);
    };

    return (
        <div className="flex flex-col w-full md:px-20 px-4 gap-4">
            <div className="text-[#F6CD28] text-2xl font-semibold">Account</div>
            <CompletionStatus currentTab={active} setCurrentTab={setActive} isInHost={false} />

            <Tabs
                tabs={GuestAccountPageTabs}
                activeTab={active}
                onTabChange={handleTabChange}
                variant="pill"
                activeClass="font-normal text-base"
                inActiveClass="text-base bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 "
            />
            {children}
        </div>
    );
};

export default Layout;
