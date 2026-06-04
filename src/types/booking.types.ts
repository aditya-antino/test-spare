export enum BookingStatus {
    INSTANT = 'INSTANT',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

export enum PaymentStatus {
    NOT = 'NOT',
    PENDING = 'PENDING',
    CAPTURED = 'CAPTURED',
}

export type BookingDetailsType = {
    id: number | string;
    paymentStatus: string;
    hostName: string;
    hostAvatar: string;
    hostUserMobileNumber?: string;
    receiver?: {
        id: string | number;
        firstName?: string;
        lastName?: string;
        avatar?: string;
        phoneNumber?: string;
    };
    spaceName: string;
    spaceSlug?: string;
    address?: string;
    area?: string;
    locality?: string;
    city?: string;
    hostId?: string | number;
    state?: string;
    pincode?: string | number;
    dates?: string;
    startDateTime?: string;
    endDateTime?: string;
    duration?: string;
    guests?: string;
    price?: number | string;
    status?: string;
    spaceId?: string | number;
    spaceData?: any;
    isInstantBooking?: boolean;
    totalAmount?: string | number;
    guestPlatformFee?: string | number;
    sgst?: string | number;
    cgst?: string | number;
    isGst?: boolean;
    amount?: number | string;
    attendees?: number | string;
    financial?: any;
    platformSettingDetail?: any;
    isPayout?: boolean;
    discountAmount?: string | number;
    couponCode?: string;
};

export interface LastBookingResponse {
    success: boolean;
    data: any;
    message?: string;
}
