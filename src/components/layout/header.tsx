'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Menu, MessageSquareIcon, X, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import spareSpaceLogo from '@/assets/spare-space-logo.svg';
import ConfirmHostModal from './confirmHostModal';
import { logout } from '@/store/slice/authSlice';
import { PATHS } from '@/constants/path';
import { RootState } from '@/store/store';
import { capitalizeWord } from '@/utils/helperFunctions';
import { handleApiError } from '@/hooks/handleApiError';
import { useLogout, useNotificationUnReadCount, useUpdateGuestToHost } from '@/services';
import { useEffect, useState } from 'react';
import { IconButton, NotificationDropdownWrapper, ProfileDropdown } from '../../components';
import { setHostMessageBadge, setGuestMessageBadge } from '@/store/slice/headerNotificationSlice';

export const HOST_ACCOUNT_OPTIONS = [
    { key: 1, title: 'Reservations', link: PATHS.RESERVATIONS || '#' },
    { key: 2, title: 'Earnings', link: PATHS.HOST_EARNINGS_ANALYTICS || '#' },
    { key: 3, title: 'Calendar', link: PATHS.HOST_CALENDAR || '#' },
    { key: 4, title: 'Your Listings', link: PATHS.YOUR_LISTING || '#' },
    { key: 5, title: 'Booking Requests', link: PATHS.HOST_BOOKING_REQUESTS || '#' },
    { key: 6, title: 'Chats', link: PATHS.HOST_CHAT_MESSAGES || '#' },
    { key: 7, title: 'Account', link: PATHS.HOST_PROFILE || '#' },
];

export const GUEST_ACCOUNT_OPTIONS = [
    { key: 1, title: 'Bookings', link: PATHS.GUEST_MY_BOOKINGS || '#' },
    { key: 2, title: 'Wishlist', link: PATHS.GUEST_WISHLISTS || '#' },
    { key: 3, title: 'Account', link: PATHS.GUEST_PROFILE || '#' },
];

interface HeaderProps {
    onSwitchClick?: () => void;
    userName?: string;
}

interface MobileAuthContentProps {
    userData: any;
    userDisplayName: string;
    accountOptions: typeof HOST_ACCOUNT_OPTIONS | typeof GUEST_ACCOUNT_OPTIONS;
    switchButtonText: string;
    onSwitchClick: () => void;
    onLogout: () => void;
    isInHost: boolean;
}

interface MobileNavigationProps {
    isAuth: boolean;
    isHostMode: boolean;
    userData: any;
    userDisplayName: string;
    unreadCount: number;
    switchButtonText: string;
    onSwitchClick: () => void;
    onChatClick: () => void;
    onLogout: () => void;
    refectNotificationCount: () => void;
    showMessageBadge: boolean;
}

interface LogoSectionProps {
    onLogoClick: () => void;
}

interface DesktopAuthSectionProps {
    isHostMode: boolean;
    userData: any;
    unreadCount: number;
    switchButtonText: string;
    onSwitchClick: () => void;
    onChatClick: () => void;
    isNotificationOpen: boolean;
    onNotificationOpenChange: (open: boolean) => void;
    refectNotificationCount: () => void;
    isProfileOpen: boolean;
    onProfileOpenChange: (open: boolean) => void;
    onLogout: () => void;
    showMessageBadge: boolean;
}

function MobileAuthContent({
    userData,
    userDisplayName,
    accountOptions,
    switchButtonText,
    onSwitchClick,
    onLogout,
    isInHost,
}: MobileAuthContentProps) {
    const hostProfileUrl = `${PATHS?.GUEST_HOST_PROFILE || '/'}/${userData?.id || ''}`;
    const guestProfileUrl = `${PATHS?.GUEST_DETAILS || '/'}/${userData?.id || ''}`;

    const dynamicProfileUrl = isInHost ? hostProfileUrl : guestProfileUrl;
    const dynamicProfileLabel = isInHost ? 'Host Profile' : 'Guest Profile';

    return (
        <>
            <div className="flex flex-col items-center">
                {userData?.avatar ? (
                    <img
                        src={userData.avatar}
                        alt="user avatar"
                        className="rounded-full w-10 h-10 object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                ) : (
                    <UserIcon className="w-8 h-8 text-gray-400" />
                )}
            </div>

            <div className="flex flex-col items-center gap-4 text-lg font-medium">
                <span className="text-lg font-bold">{userDisplayName || 'User'}</span>
                {(accountOptions || []).map((item) => (
                    <SheetClose asChild key={item?.key || Math.random()}>
                        <Link href={item?.link || '#'} className="hover:text-amber-500">
                            {item?.title || 'Link'}
                        </Link>
                    </SheetClose>
                ))}
                <SheetClose asChild>
                    <Link href={dynamicProfileUrl || '#'} className="hover:text-amber-500">
                        {dynamicProfileLabel}
                    </Link>
                </SheetClose>

                <SheetClose asChild>
                    <span onClick={onLogout} className="cursor-pointer">
                        Logout
                    </span>
                </SheetClose>
            </div>

            <Button
                onClick={onSwitchClick}
                className="w-fit bg-[#F6CD28] hover:bg-yellow-500 text-black rounded-full px-6 py-3 font-semibold mx-auto"
            >
                {switchButtonText || 'Switch'}
            </Button>
        </>
    );
}

function MobileGuestContent() {
    return (
        <div className="flex flex-col items-center gap-4 text-lg font-medium">
            <SheetClose asChild>
                <Link href={PATHS?.LOGIN || '/'}>Login</Link>
            </SheetClose>
            <SheetClose asChild>
                <Link href={PATHS?.SIGN_UP || '/'}>Sign Up</Link>
            </SheetClose>
        </div>
    );
}

function LogoSection({ onLogoClick }: LogoSectionProps) {
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
}

function DesktopAuthSection({
    isHostMode,
    userData,
    unreadCount = 0,
    switchButtonText,
    onSwitchClick,
    onChatClick,
    isNotificationOpen,
    refectNotificationCount,
    onNotificationOpenChange,
    showMessageBadge,
    isProfileOpen,
    onProfileOpenChange,
    onLogout,
}: DesktopAuthSectionProps) {
    const accountOptions = isHostMode ? HOST_ACCOUNT_OPTIONS : GUEST_ACCOUNT_OPTIONS;

    return (
        <div className="hidden md:flex items-center gap-4 relative">
            <Button
                variant="default"
                onClick={onSwitchClick}
                className="text-black rounded-full px-5 py-2 font-semibold"
            >
                {switchButtonText || 'Switch'}
            </Button>

            <div className="flex gap-2">
                <NotificationDropdownWrapper
                    isOpen={isNotificationOpen}
                    onOpenChange={onNotificationOpenChange}
                    unreadCount={unreadCount}
                    isHostMode={isHostMode}
                    refectNotificationCount={refectNotificationCount || (() => {})}
                />

                <div className="relative">
                    <IconButton
                        icon={<MessageSquareIcon className="h-4 w-4" />}
                        isActive={false}
                        onClick={onChatClick}
                    />

                    {showMessageBadge && (
                        <span className="absolute -top-[0.5px] -right-[0.5px] block w-2 h-2 bg-red-600 rounded-full" />
                    )}
                </div>
            </div>

            <ProfileDropdown
                isOpen={isProfileOpen}
                onOpenChange={onProfileOpenChange}
                userData={userData}
                accountOptions={accountOptions}
                isHostMode={isHostMode}
                onLogout={onLogout}
            />
        </div>
    );
}

function DesktopGuestSection() {
    return (
        <div className="hidden md:flex items-center justify-end gap-3">
            <Link
                href={PATHS?.SIGN_UP || '/'}
                className="text-zinc-800 text-base font-semibold px-3"
            >
                Sign Up
            </Link>
            <Link
                href={PATHS?.LOGIN || '/'}
                className="text-base font-semibold px-6 py-3 bg-[#F6CD28] rounded-full"
            >
                Log In
            </Link>
        </div>
    );
}

function MobileNavigation({
    isAuth,
    isHostMode,
    userData,
    userDisplayName,
    unreadCount = 0,
    switchButtonText,
    refectNotificationCount,
    onSwitchClick,
    onChatClick,
    onLogout,
    showMessageBadge = false,
}: MobileNavigationProps) {
    const accountOptions = isHostMode ? HOST_ACCOUNT_OPTIONS : GUEST_ACCOUNT_OPTIONS;
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    return (
        <div className="md:hidden">
            <Sheet>
                <div className="flex gap-4 items-center">
                    {isAuth && (
                        <>
                            <NotificationDropdownWrapper
                                isOpen={isNotificationOpen}
                                onOpenChange={setIsNotificationOpen}
                                unreadCount={unreadCount}
                                isHostMode={isHostMode}
                                refectNotificationCount={refectNotificationCount || (() => {})}
                            />

                            <div className="relative">
                                <MessageSquareIcon
                                    className="h-4 w-4 text-gray-700 cursor-pointer"
                                    onClick={onChatClick}
                                />
                                {showMessageBadge && (
                                    <span className="absolute -top-[0.5px] -right-[0.5px] block w-2 h-2 bg-red-600 rounded-full" />
                                )}
                            </div>
                        </>
                    )}

                    <SheetTrigger asChild>
                        <Menu className="w-6 h-6 text-gray-800 cursor-pointer" />
                    </SheetTrigger>
                </div>

                <SheetContent side="top" className="p-6 flex flex-col gap-6 h-[55vh] min-h-fit">
                    <MobileSheetHeader />

                    {isAuth ? (
                        <MobileAuthContent
                            userData={userData}
                            userDisplayName={userDisplayName || 'User'}
                            accountOptions={accountOptions}
                            switchButtonText={switchButtonText || 'Switch'}
                            onSwitchClick={onSwitchClick}
                            onLogout={onLogout}
                            isInHost={isHostMode}
                        />
                    ) : (
                        <MobileGuestContent />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function MobileSheetHeader() {
    return (
        <div className="flex justify-between items-center">
            <Image src={spareSpaceLogo || '/default-logo.svg'} alt="Logo" width={80} height={20} />
            <SheetClose asChild>
                <X className="h-6 w-6 text-gray-800" />
            </SheetClose>
        </div>
    );
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

    // Safe extraction with defaults
    const isAuth = authState?.isAuth || false;
    const userRole = authState?.userRole || [];
    const userId = userData?.id || '';

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
        // Extract both host and guest badge values from API response
        const apiHostBadgeValue = Boolean(notificationsCount?.data?.showHostMessageBadge);
        const apiGuestBadgeValue = Boolean(notificationsCount?.data?.showGuestMessageBadge);

        // Update host badge if changed
        if (apiHostBadgeValue !== currentHostBadgeValue) {
            dispatch(setHostMessageBadge(apiHostBadgeValue));
        }

        // Update guest badge if changed
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

    // Show the appropriate badge based on current mode
    const showMessageBadge = isHostMode ? currentHostBadgeValue : currentGuestBadgeValue;

    const unreadCount = notificationsCount?.data || 0;

    const handleSwitchClick = () => {
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
    };

    const handleChatClick = () => {
        if (!router) return;

        const chatPath = isHostMode ? '/host/space/chat-messages' : '/chat-messages';
        router.push(chatPath);
    };

    const handleLogout = () => {
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
    };

    const handleLogoClick = () => {
        if (!router) return;

        const targetPath = isHostMode ? PATHS?.RESERVATIONS || '/' : PATHS?.HOME_PAGE || '/';
        router.push(targetPath);
    };

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
