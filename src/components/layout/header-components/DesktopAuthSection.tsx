import React, { memo } from 'react';
import { MessageSquareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconButton, NotificationDropdownWrapper, ProfileDropdown } from '../../../components';
import { HOST_ACCOUNT_OPTIONS, GUEST_ACCOUNT_OPTIONS } from './headerConstants';

interface DesktopAuthSectionProps {
    isHostMode: boolean;
    userData: unknown;
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

const DesktopAuthSection = function DesktopAuthSection({
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
                className="text-black rounded-full px-5 py-2 font-semibold bg-[#F6CD28] hover:bg-yellow-500 transition-colors"
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
};

export default DesktopAuthSection;
