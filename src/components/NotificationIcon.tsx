import { Bell } from 'lucide-react';

export default function NotificationIcon({ unreadCount }: { unreadCount: number }) {
    return (
        <div className="relative cursor-pointer">
            <Bell className="w-5 h-5 text-gray-700 cursor-pointer" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </div>
    );
}
