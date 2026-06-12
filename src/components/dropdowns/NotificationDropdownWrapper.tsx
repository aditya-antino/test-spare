import { Bell } from 'lucide-react';
import IconButton from '../common/IconButton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { NotificationDropdown } from '../ui/NotificationDropdown';

interface NotificationDropdownWrapperProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    unreadCount: number;
    isHostMode: boolean;
    refectNotificationCount: () => void;
}

const NotificationDropdownWrapper = ({
    isOpen,
    onOpenChange,
    unreadCount,
    isHostMode,
    refectNotificationCount,
}: NotificationDropdownWrapperProps) => {
    return (
        <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <div className="relative">
                    <IconButton
                        icon={<Bell className="w-5 h-5 cursor-pointer" />}
                        isActive={isOpen}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-fit mt-4 bg-white rounded-md shadow-lg p-0 z-[70]"
                align="end"
            >
                <NotificationDropdown
                    isHostMode={isHostMode}
                    refectNotificationCount={refectNotificationCount}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdownWrapper;
