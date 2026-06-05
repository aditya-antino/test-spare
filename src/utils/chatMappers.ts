import { Reservation } from '@/services';
import { Conversation, Message } from '@/types/chat';
import { capitalizeWord } from './helperFunctions';
import { format } from 'date-fns';

export const transformToReservation = (data: any): Reservation | null => {
    if (!data) return null;

    return {
        id: data.id,
        status: data.status,
        start_datetime: data.startDatetime || data.start_datetime || null,
        end_datetime: data.endDatetime || data.end_datetime || null,
        amount: data.amount ?? 0,
        totalAmount: (data.totalAmount ?? data.amount ?? 0).toString(),
        guest_message: data.guestMessage ?? data.guest_message ?? '',
        created_at: data.created_at ?? data.createdAt ?? null,
        updated_at: data.updated_at ?? data.updatedAt ?? null,
        attendees: data.attendees ?? 0,
        User: data.User ?? null,
        Space: data.spaceData ?? null,
        hostPlatformFeePer: data?.hostPlatformFeePer,
        hostTDSPer: data?.hostTDSPer,
    };
};

export const formatConversations = (bookings: any[], isInHost: boolean): Conversation[] => {
    if (!Array.isArray(bookings)) return [];

    return bookings.map((item) => {
        const user = item?.User;
        return {
            id: item.id,
            User: user,
            userId: user?.id,
            firstName: user?.firstName || '',
            lastName: user?.lastName ? `${user.lastName[0]}.` : '',
            avatar: user?.avatar,
            lastMessage:
                item.Messages?.length > 0 ? item.Messages[item.Messages.length - 1].message : null,
            lastMessageTime: item.updated_at || item.created_at,
            unreadCount: item.unreadCount,
            online: false,
            starred: false,
            booking: item,
            spaceImages: item.Space?.SpaceImages?.[0]?.imageUrl,
            spaceType: item.Space?.SpaceTypes?.[0]?.type,
            paymentStatus: item.Payments?.[0]?.status || 'NOT',
            bookingStatus: item.status,
            role: isInHost ? 1 : 2,
            receiver: item.Space?.User,
            isBookingStatusUpdate: item.isBookingStatusUpdate ?? false,
            isPayout: item.isPayout ?? false,
        };
    });
};

export const formatBookingDetails = (fetchedData: any) => {
    if (!fetchedData) return null;
    const {
        id,
        User: hostUser,
        Space: space,
        startDatetime,
        endDatetime,
        Payments,
        settings,
    } = fetchedData;

    return {
        id: id || 0,
        status: fetchedData.status || 'INSTANT',
        paymentStatus: Payments?.[0]?.status || 'PENDING',
        isInstantBooking: space?.SpaceListing?.instant_booking || false,
        hostId: hostUser?.id,
        hostUserMobileNumber: hostUser?.phoneNumber || '',
        hostName: hostUser
            ? `${capitalizeWord(hostUser.firstName || '')} ${hostUser.lastName ? hostUser.lastName[0].toUpperCase() + '.' : ''
                }`.trim() || 'Host Name'
            : 'Host Name',
        hostAvatar: hostUser?.avatar || '/api/placeholder/60/60',
        spaceData: space || {},
        spaceId: space?.id || 0,
        spaceName: space?.title || '-',
        address: space?.street || space?.description || 'Space Description',
        area: space?.area || '',
        locality: space?.locality || '',
        city: space?.City?.city || '',
        state: space?.City?.state || '',
        pincode: space?.pincode || '',
        spaceType: space?.SpaceTypes?.[0]?.type || 'Space',
        receiver: space?.User
            ? {
                id: space.User.id || 0,
                firstName: capitalizeWord(space.User.firstName || 'Guest'),
                lastName: space?.User?.lastName ? space.User.lastName[0].toUpperCase() + '.' : '',
                email: space.User.email || '',
                phoneNumber: space.User.phoneNumber || '',
                avatar: space.User.avatar || '/api/placeholder/60/60',
            }
            : null,
        startDateTime: startDatetime ? new Date(startDatetime).toISOString() : '',
        endDateTime: endDatetime ? new Date(endDatetime).toISOString() : '',
        dates: startDatetime ? format(new Date(startDatetime), 'MMMM d, yyyy') : '-',
        guests: fetchedData?.attendees,
        amount: fetchedData.amount || 0,
        price: fetchedData.amount || 0,
        totalAmount: fetchedData?.totalAmount || 0,
        guestPlatformFee: fetchedData.guestPlatformFee || 0,
        sgst: fetchedData.sgst || 0,
        cgst: fetchedData.cgst || 0,
        attendees: fetchedData.attendees || 0,
        financial: fetchedData.Financial || {},
        platformSettingDetail: settings,
        hostPlatformFeePer: settings?.host_platform_fee,
        hostTDSPer: settings?.tds,
        isPayout: fetchedData.isPayout ?? false,
        isGst: fetchedData.isGst ?? fetchedData.Financial?.isGst ?? fetchedData.Financial?.hostGst ?? false,
    };
};
