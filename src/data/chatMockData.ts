import { Conversation, Message } from '../types/chat';

export const conversations: Conversation[] = [
    {
        id: 21,
        name: 'Kevin Francis',
        avatar: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/672499989.jpg',
        lastMessage: 'That sounds perfect! What time works best for you?',
        timestamp: '09:00 PM',
        unread: 3,
        online: true,
        starred: true,
    },
    {
        id: 13,
        name: 'Shivam Johnson',
        avatar: '/api/placeholder/40/40',
        lastMessage: 'Thanks for the update!',
        timestamp: '08:45 PM',
        unread: 0,
        online: false,
        starred: false,
    },
    // ... more
];

export const bookingDetails = {
    hostName: 'Kevin Francis',
    hostAvatar: '/api/placeholder/60/60',
    spaceName: 'Conference Room',
    address: '456 Conference Avenue, Business Tower, Downtown Plaza',
    date: 'Mar 01, 2025',
    timeStart: '10:00 AM',
    timeEnd: '02:00 PM',
    attendees: 4,
    price: '₹5,000',
    status: 'Confirmed',
};

export const initialMessages: Record<number, Message[]> = {
    21: [
        {
            id: 1,
            text: 'Hi Kevin, is the space available on March 1st?',
            sender: 'You',
            timestamp: new Date(Date.now() - 3600000),
            isOwn: true,
            status: 'read',
        },
        {
            id: 2,
            text: 'Yes, it is! How many people?',
            sender: 'Kevin Francis',
            timestamp: new Date(Date.now() - 3300000),
            isOwn: false,
            status: 'delivered',
        },
    ],
};
