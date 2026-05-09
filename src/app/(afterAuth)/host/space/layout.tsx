'use client';

import { TabsNav } from '@/components/ui/tabs-nav';
import React, { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { getHeaderNotification } from '@/services/host/spaceHeaderNotification.services';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderNotification } from '@/store/slice/headerNotificationSlice';
import { RootState } from '@/store/store';
import { handleApiError } from '@/hooks/handleApiError';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const dispatch = useDispatch();

    const notifications = useSelector((state: RootState) => state.headerNotification);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getHeaderNotification();
                if (response.status === 200) {
                    dispatch(setHeaderNotification(response.data.data));
                }
            } catch (err) {
                handleApiError(err);
            }
        };

        fetchNotifications();
    }, [dispatch]);

    const tabs = useMemo(
        () => [
            {
                label: 'Reservations',
                href: '/host/space/reservations',
                matchPath: '/host/space/reservations',
                showBadge:
                    !notifications.reservation?.upcoming ||
                    !notifications.reservation?.completed ||
                    !notifications.reservation?.rejected ||
                    !notifications.reservation?.cancelled ||
                    !notifications.reservation?.pendingPayout,
            },
            {
                label: 'Earnings',
                href: '/host/space/earnings/analytics',
                matchPath: '/host/space/earnings',
                showBadge: false,
            },
            {
                label: 'Calendar',
                href: '/host/space/calendar',
                matchPath: '/host/space/calendar',
                showBadge: false,
            },
            {
                label: 'Your Listings',
                href: '/host/space/your-listings',
                matchPath: '/host/space/your-listings',
                showBadge: false,
            },
            {
                label: 'Booking Requests',
                href: '/host/space/booking-requests',
                matchPath: '/host/space/booking-requests',
                showBadge: !notifications.bookingRequest,
            },
            {
                label: 'Chat/Messages',
                href: '/host/space/chat-messages',
                matchPath: '/host/space/chat-messages',
                showBadge: !notifications.chat,
            },
        ],
        [notifications],
    );

    const allowedPaths = [
        '/host/space/reservations/*',
        '/host/space/earnings/*',
        '/host/space/calendar/*',
        '/host/space/your-listings',
        '/host/space/booking-requests/*',
        '/host/space/chat-messages/*',
    ];

    const showTabs = allowedPaths.some((path) => {
        if (path.endsWith('/*')) {
            const basePath = path.slice(0, -2);
            return pathname.startsWith(basePath);
        }
        return pathname === path;
    });

    const tabsWithActive = tabs.map((tab) => ({
        ...tab,
        isActive: pathname.startsWith(tab.matchPath),
    }));

    return (
        <div className="h-full flex flex-col flex-grow">
            {showTabs && (
                <div className="lg:px-20 pb-0 mb-0 sm:pb-4 py-8 px-4">
                    <TabsNav tabs={tabsWithActive} tabClasses="min-w-44 justify-center text-base" />
                </div>
            )}
            <div className="px-2 md:px-10 flex-grow w-full">{children}</div>
        </div>
    );
};

export default Layout;
