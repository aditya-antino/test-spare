
export interface ReservationFilters {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    spaceId?: number;
    bookingId?: number;
}

export interface PayoutBreakdown {
    guest: {
        title: string;
        rows: Array<{
            label: string;
            value: {
                amount: number;
                currency: string;
                formatted: string;
            };
        }>;
        total: {
            amount: number;
            currency: string;
            formatted: string;
        };
    };
    host: {
        title: string;
        rows: Array<{
            label: string;
            value: {
                amount: number;
                currency: string;
                formatted: string;
            };
        }>;
        total: {
            amount: number;
            currency: string;
            formatted: string;
        };
    };
}

export interface ReservationListParams {

    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    spaceId?: number;
    bookingId?: number;
}

export interface ReservationUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
}

export interface ReservationSpace {
    User: ReservationUser;
    id: number;
    title: string;
    description: string;
    capacity: number;
    size_sqft: number;
    address: string;
    CategoryMaster: { name: string };
    Reviews?: {
        comments: string;
        rating: number;
    }[];
    SpaceTypes?: any;
}

export interface Reservation {
    id: number;
    status: string;
    amount?: number;
    start_datetime: string;
    end_datetime: string;
    totalAmount: string | number;
    guest_message: string;
    created_at: string;
    updated_at: string;
    User: ReservationUser;
    Space: ReservationSpace;
    attendees?: string | number;
    startDatetime?: string;
    endDatetime?: string;
    gst_percent?: number;
    cgst?: number | string;
    sgst?: number | string;
    sgst_percent?: number;
    cgst_percent?: number;
    host_platform_fee_percent?: number;
    tds_percent?: number;
    tcs_percent?: number;
    hostTDSPer?: number;
    hostPlatformFeePer?: number;
    Financial?: {
        baseAmount: string | number;
        cgstAmount: string | number;
        sgstAmount: string | number;
        guestPlatformFeeAmount: string | number;
        guestPlatformFeeCgstAmount: string | number;
        guestPlatformFeeSgstAmount: string | number;
        hostPlatformFeeCgstAmount: string | number;
        hostPlatformFeeSgstAmount: string | number;
        hostPlatformFeeAmount: string | number;
        tdsAmount: string | number;
        refundPercentage: string | number;
        hostGst: boolean;
        tcsAmount: number | string;
        penaltyAmount?: number | string;
    };
}

export interface ReservationListResponse {
    data: {
        rows: Reservation[];
        count: number;
        gst?: string | number;
        sgst?: string | number;
        cgst?: string | number;
        host_platform_fee?: string | number;
        tds?: string | number;
        tcs?: string | number;
    };
}

export interface CancellationPolicy {
    refundAmount?: number;
    refundPercent?: number;
    refundPercentage?: number;
    cancellationFee?: number;
    reason?: string;
    policyApplied?: string;
    isPolicyApplicable?: boolean;
    policy?: {
        key: string;
        fullRefundHours: number;
        partialRefundHours: number;
        partialRefundPercent: number;
    };
    hoursUntilStart?: number;
}

export interface BookingRequest {
    id: number;
    spaceId: number;
    guestId: number;
    CategoryMaster?: any;
    guest: string;
    listing: string;
    spaceName: string;
    activityCategory: string;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    guestMessage: string;
    User: any;
    status: string;
    startDatetime: string;
    endDatetime: string;
    totalAmount: number;
    guest_message: string;
    created_at: string;
    updated_at: string;
    attendees: number;
    Space: any;
    hostPlatformFeePer: number;
    hostTDSPer: number;
}

export interface CancellationReasonResponse {
    success: boolean;
    data: CancellationPolicy;
    message?: string;
}

export interface CancellationDataResponse {
    success: boolean;
    message: string;
    data: {
        hostPayout: {
            baseAmount: string;
            hostPlatformFeeAmount: string;
            hostPlatformFeeCgstAmount: string;
            hostPlatformFeeSgstAmount: string;
            cgstAmount: string;
            sgstAmount: string;
            tdsAmount: string;
            hostGst: boolean;
            refundPercentage: number;
            penaltyAmount: string;
            tcsAmount: string;
        };
        guestPayout: {
            baseAmount: string;
            cgstAmount: string;
            sgstAmount: string;
            guestPlatformFeeAmount: string;
            guestPlatformFeeCgstAmount: string;
            guestPlatformFeeSgstAmount: string;
            refundPercentage: number;
        };
        cancelledBy: {
            cancelledByType: 'host' | 'guest';
        };
    };
}

export interface HostCancellationDataResponse {
    success: boolean;
    type: string;
    message: string;
    data: HostCancellationData;
}

export interface HostCancellationData {
    penaltyAmount: number;
    penaltyPercent: number;
    reason: string;
    hoursUntilStart: number;
    policyApplied: string;
}

export interface CancellationReason {
    id: number;
    reason: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CancellationReasonsData {
    rows: CancellationReason[];
    pagination: any; // Using any for now to avoid circular dependency or import Pagination
}

export interface GetCancellationReasonsResponse {
    success: boolean;
    type: 'success' | 'error';
    message: string;
    data: CancellationReasonsData;
}

export interface ExportOptions {
    startDate?: string;
    endDate?: string;
    bookingId?: number;
    spaceId?: number;
}

export interface ExportResponse {
    success: boolean;
    message?: string;
    data?: any;
}
