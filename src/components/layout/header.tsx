'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ConfirmHostModal from './confirmHostModal';
import { logout } from '@/store/slice/authSlice';
import { PATHS } from '@/constants/path';
import { RootState } from '@/store/store';
import { capitalizeWord } from '@/utils/helperFunctions';
import { handleApiError } from '@/hooks/handleApiError';
import { useLogout, useNotificationUnReadCount, useUpdateGuestToHost } from '@/services';
import { setHostMessageBadge, setGuestMessageBadge } from '@/store/slice/headerNotificationSlice';

import LogoSection from './header-components/LogoSection';
import DesktopGuestSection from './header-components/DesktopGuestSection';
import DesktopAuthSection from './header-components/DesktopAuthSection';
import MobileNavigation from './header-components/MobileNavigation';

// Exporting these just in case any other files were directly importing them from header.tsx
export { HOST_ACCOUNT_OPTIONS, GUEST_ACCOUNT_OPTIONS } from './header-components/headerConstants';

interface HeaderProps {
    onSwitchClick?: () => void;
    userName?: string;
}

export function Header({ userName = '-' }: HeaderProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isHostChangeModalOpen, setIsHostChangeModalOpen] = useState(false);
    const [isHostMode, setIsHostMode] = useState(false);

    const authState = useSelector((state: RootState) => state.auth);
    const userData = authState?.user;

    const isAuth = authState?.isAuth || false;
    const userRole = authState?.userRole || [];

    useEffect(() => {
        try {
            const storedHostMode = localStorage.getItem('hostMode');
            if (storedHostMode) {
                setIsHostMode(storedHostMode === 'true');
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            setIsHostMode(false);
        }
    }, []);

    const role = isHostMode ? 2 : 3;

    const { mutate: updateGuestRole } = useUpdateGuestToHost({
        onSuccess: (res) => {
            toast.success(res?.message || 'Role updated successfully');
            setIsHostChangeModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['get-profile'] });
            try {
                localStorage.setItem('hostMode', 'true');
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
            setIsHostMode(true);
            router.replace(PATHS?.YOUR_LISTING || '/');
        },
        onError: (err) => {
            handleApiError(err);
            setIsHostChangeModalOpen(false);
        },
    });

    const { mutate: performLogout } = useLogout();
    const { data: notificationsCount, refetch: refetchNotificationsCount } =
        useNotificationUnReadCount(isAuth, role);

    const currentHostBadgeValue = useSelector(
        (state: RootState) => state.headerNotification?.showHostMessageBadge || false,
    );
    const currentGuestBadgeValue = useSelector(
        (state: RootState) => state.headerNotification?.showGuestMessageBadge || false,
    );

    useEffect(() => {
        const apiHostBadgeValue = Boolean(notificationsCount?.data?.showHostMessageBadge);
        const apiGuestBadgeValue = Boolean(notificationsCount?.data?.showGuestMessageBadge);

        if (apiHostBadgeValue !== currentHostBadgeValue) {
            dispatch(setHostMessageBadge(apiHostBadgeValue));
        }

        if (apiGuestBadgeValue !== currentGuestBadgeValue) {
            dispatch(setGuestMessageBadge(apiGuestBadgeValue));
        }
    }, [
        notificationsCount?.data?.showHostMessageBadge,
        notificationsCount?.data?.showGuestMessageBadge,
        currentHostBadgeValue,
        currentGuestBadgeValue,
        dispatch,
    ]);

    const showMessageBadge = isHostMode ? currentHostBadgeValue : currentGuestBadgeValue;
    const unreadCount = notificationsCount?.data || 0;

    const handleSwitchClick = useCallback(() => {
        if (!router) return;

        if (isHostMode) {
            try {
                localStorage.setItem('hostMode', 'false');
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
            setIsHostMode(false);
            router.replace(PATHS?.HOME_PAGE || '/');
        } else if (Array.isArray(userRole) && userRole.includes('host')) {
            try {
                localStorage.setItem('hostMode', 'true');
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
            setIsHostMode(true);
            router.replace(PATHS?.YOUR_LISTING || '/');
        } else {
            setIsHostChangeModalOpen(true);
        }
    }, [isHostMode, router, userRole]);

    const handleChatClick = useCallback(() => {
        if (!router) return;
        const chatPath = isHostMode ? '/host/space/chat-messages' : '/chat-messages';
        router.push(chatPath);
    }, [isHostMode, router]);

    const handleLogout = useCallback(() => {
        if (!performLogout || !dispatch || !router) return;

        performLogout(undefined, {
            onSuccess: () => {
                dispatch(logout());
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (error) {
                    console.error('Error clearing storage:', error);
                }
                setIsHostMode(false);
                toast.success('Successfully logged out');
                router.push('/login');
            },
            onError: handleApiError,
        });
    }, [performLogout, dispatch, router]);

    const handleLogoClick = useCallback(() => {
        if (!router) return;
        const targetPath = isHostMode ? PATHS?.RESERVATIONS || '/' : PATHS?.HOME_PAGE || '/';
        router.push(targetPath);
    }, [isHostMode, router]);

    function getUserDisplayName() {
        const firstName = capitalizeWord(userData?.firstName || '');
        const lastName = userData?.lastName
            ? capitalizeWord(userData.lastName[0] || '') + '.'
            : capitalizeWord(userName || '');

        return `${firstName} ${lastName}`.trim() || 'User';
    }

    function getSwitchButtonText() {
        if (isHostMode) return 'Switch to Booking';
        if (Array.isArray(userRole) && userRole.includes('host')) return 'Switch to Hosting';
        return 'List your Space';
    }

    const switchBTNText = getSwitchButtonText();
    const userDisplayName = getUserDisplayName();

    return (
        <>
            <header className="bg-white flex items-center justify-between px-4 md:px-20 py-4 border-b sm:border-b-0 border-gray-100">
                <LogoSection onLogoClick={handleLogoClick} />

                {isAuth ? (
                    <DesktopAuthSection
                        isHostMode={isHostMode}
                        userData={userData}
                        unreadCount={unreadCount}
                        switchButtonText={switchBTNText}
                        onSwitchClick={handleSwitchClick}
                        onChatClick={handleChatClick}
                        isNotificationOpen={isNotificationOpen}
                        onNotificationOpenChange={setIsNotificationOpen}
                        isProfileOpen={isProfileOpen}
                        onProfileOpenChange={setIsProfileOpen}
                        onLogout={handleLogout}
                        refectNotificationCount={refetchNotificationsCount}
                        showMessageBadge={showMessageBadge}
                    />
                ) : (
                    <DesktopGuestSection />
                )}

                <MobileNavigation
                    isAuth={isAuth}
                    isHostMode={isHostMode}
                    userData={userData}
                    userDisplayName={userDisplayName}
                    unreadCount={unreadCount}
                    switchButtonText={switchBTNText}
                    onSwitchClick={handleSwitchClick}
                    onChatClick={handleChatClick}
                    onLogout={handleLogout}
                    refectNotificationCount={refetchNotificationsCount}
                    showMessageBadge={showMessageBadge}
                />
            </header>

            <ConfirmHostModal
                onConfirm={updateGuestRole}
                onClose={() => setIsHostChangeModalOpen(false)}
                open={isHostChangeModalOpen}
            />
        </>
    );
}
