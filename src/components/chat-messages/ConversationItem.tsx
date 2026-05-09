'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/types/chat';
import { format } from 'date-fns';
import { capitalizeWord } from '../../utils/helperFunctions';
import { Dot } from 'lucide-react';

type Props = {
    conv: Conversation;
    selected: boolean;
    onClick: () => void;
    statusLabel?: string;
    textColor?: string;
};

export default function ConversationItem({
    conv,
    selected,
    onClick,
    statusLabel,
    textColor,
}: Props) {
    const displayUser =
        conv.role === 1
            ? {
                avatar: conv.avatar,
                name: `${conv.firstName || ''} ${conv.lastName ? conv.lastName[0] + '.' : ''}`.trim(),
            }
            : {
                avatar: conv.spaceImages,
                name: `${conv.receiver?.firstName || ''} ${conv.receiver?.lastName ? conv.receiver.lastName[0] + '.' : ''}`.trim(),
            };

    const label = statusLabel || '';

    return (
        <div
            onClick={onClick}
            className={`flex items-start w-full max-w-md p-2 rounded-lg cursor-pointer mb-1 transition
      border ${selected ? 'border-2 border-[#F6CD28] bg-gray-100' : 'border-transparent bg-white'}
      md:ml-2 mr-1`}
        >
            <div className={`mr-2 relative rounded ${selected ? 'bg-gray-100' : 'bg-white'}`}>
                <Avatar className="w-14 h-14">
                    {displayUser.avatar ? (
                        <AvatarImage src={displayUser.avatar} />
                    ) : (
                        <AvatarFallback>
                            {displayUser.name
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('') || '-'}
                        </AvatarFallback>
                    )}
                </Avatar>

                {conv.role !== 1 && (
                    <div className="absolute right-0 bottom-0">
                        <Avatar className="w-8 h-8">
                            {conv.receiver.avatar ? (
                                <AvatarImage src={conv.receiver.avatar} />
                            ) : (
                                <AvatarFallback>
                                    {conv.receiver.firstName ? conv.receiver.firstName[0] : 'U'}
                                </AvatarFallback>
                            )}
                        </Avatar>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="font-medium truncate mr-1 flex items-center justify-center">
                        <h3>
                            {capitalizeWord(displayUser.name.split(' ')[0] || 'Unknown')}{' '}
                            {capitalizeWord(displayUser.name.split(' ')[1] || '')}
                        </h3>
                        {conv?.isBookingStatusUpdate && <Dot size={32} color="red" />}
                    </div>
                    {conv.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                            {format(new Date(conv.lastMessageTime), 'hh:mm a')}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between min-w-0">
                    <p className="text-sm text-gray-600 truncate block pr-2">{conv.lastMessage}</p>

                    {(conv.unreadCount || 0) > 0 && (
                        <Badge className="bg-yellow-500 text-black text-xm min-w-[20px] h-5 flex justify-center">
                            {conv.unreadCount}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between space-x-2 text-xs pt-1">
                    {selected && (
                        <p className="text-orange-400 font-medium">
                            <span
                                className={`py-1 text-xs font-medium rounded-full text-gray-500  mt-1`}
                            >
                                {label}
                            </span>
                        </p>
                    )}
                    <div className={`flex justify-end w-${selected ? 1 / 2 : 'full'}`}>
                        <p className="text-gray-500">{conv.spaceType || ''}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
