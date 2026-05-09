export type Message = {
    id: number | string;
    text: string;
    sender: string | number;
    timestamp: Date | string;
    isOwn: boolean;
    status: 'sent' | 'delivered' | 'read';
};

export type Conversation = {
    spaceImages: string;
    spaceType: string;
    User: any;
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    avatar: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    online: boolean;
    starred: boolean;
    paymentStatus?: string;
    bookingStatus?: string;
    role?: number;
    booking: any;
    receiver: any;
    isBookingStatusUpdate?: boolean;
    isPayout?: boolean;
};

// export type Conversations = {
//   id: number;
//   firstName: string;
//   lastName: string;
//   lastMessage: string;
//   lastMessageTime: Date;
//   unreadCount: number;
// };
