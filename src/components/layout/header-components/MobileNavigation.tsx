import React, { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, MessageSquareIcon, X, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import spareSpaceLogo from '@/assets/spare-space-logo.svg';
import { PATHS } from '@/constants/path';
import { NotificationDropdownWrapper } from '../../../components';
import { HOST_ACCOUNT_OPTIONS, GUEST_ACCOUNT_OPTIONS } from './headerConstants';

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
                    <Image
                        src={userData.avatar}
                        alt="user avatar"
                        width={40}
                        height={40}
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
                    <button
                        type="button"
                        onClick={onLogout}
                        className="cursor-pointer hover:text-amber-500 bg-transparent border-none"
                    >
                        Logout
                    </button>
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

function MobileSheetHeader() {
    return (
        <div className="flex justify-between items-center">
            <Image src={spareSpaceLogo || '/default-logo.svg'} alt="Logo" width={80} height={20} />
            <SheetClose asChild>
                <button
                    type="button"
                    aria-label="Close menu"
                    className="bg-transparent border-none outline-none"
                >
                    <X className="h-6 w-6 text-gray-800" />
                </button>
            </SheetClose>
        </div>
    );
}

const MobileNavigation = function MobileNavigation({
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
                                <button
                                    type="button"
                                    aria-label="Chat"
                                    className="bg-transparent border-none p-0 outline-none"
                                    onClick={onChatClick}
                                >
                                    <MessageSquareIcon className="h-4 w-4 text-gray-700 cursor-pointer" />
                                </button>
                                {showMessageBadge && (
                                    <span className="absolute -top-[0.5px] -right-[0.5px] block w-2 h-2 bg-red-600 rounded-full" />
                                )}
                            </div>
                        </>
                    )}

                    <SheetTrigger asChild>
                        <button
                            type="button"
                            aria-label="Open menu"
                            className="bg-transparent border-none p-0 outline-none"
                        >
                            <Menu className="w-6 h-6 text-gray-800 cursor-pointer" />
                        </button>
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
};

export default MobileNavigation;
