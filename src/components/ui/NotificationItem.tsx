interface NotificationItemProps {
    title: string;
    message: string;
    timeAgo: string;
    onClick?: () => void;
}

export function NotificationItem({ title, message, timeAgo, onClick }: NotificationItemProps) {
    const truncatedMessage = message.length > 100 ? message.substring(0, 100) + '...' : message;

    return (
        <div
            className="flex gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
            onClick={onClick}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-1 flex-1">
                        {title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {timeAgo}
                    </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {truncatedMessage}
                </p>
            </div>
        </div>
    );
}
