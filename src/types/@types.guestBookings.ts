export interface GuestBooking {
    id: number;
    start_datetime: string;
    end_datetime: string;
    total_amount: string;
    status: string;
    attendees: number;
    guest_message?: string | null;
    created_at: string;
    updated_at: string;
    bookingStatus: string;
    Cancellations: any;
    Space: {
        id: number;
        title: string;
        slug?: string;
        description: string;
        capacity: number;
        size_sqft: number;
        height_ft: number;
        address?: string | null;
        location: {
            crs: {
                type: string;
                properties: {
                    name: string;
                };
            };
            type: string;
            coordinates: [number, number];
        };
        category_id: number;
        area?: string | null;
        locality?: string | null;
        street?: string | null;
        pincode?: number | null;
        City: {
            city: string;
            state: string;
        };
        CategoryMaster: {
            id: number;
            name: string;
        };
        SpaceImages: {
            id: number;
            image_url: string;
            is_featured: boolean;
        }[];
        User: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
        };
    };
    mapsUrl?: string;
    refundStatus: string;
    Payments: {
        id: number;
        status: string;
        amount: string;
    }[];
    isReviewed?: 'reviewed' | 'non-reviewed' | 'expired';
    guestReviewStatus?: 'reviewed' | 'non-reviewed' | 'expired';
    isGst?: boolean;
    Financial?: {
        baseAmount: string | number;
        cgstAmount: string | number;
        sgstAmount: string | number;
        guestPlatformFeeAmount: string | number;
        guestPlatformFeeCgstAmount: string | number;
        guestPlatformFeeSgstAmount: string | number;
        hostPlatformFeeAmount: string | number;
        tdsAmount: string | number;
        refundPercentage: string | number;
        hostGst: boolean;
    };
}
