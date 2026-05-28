// Base API response structure
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    error?: string;
}

// Pagination interface
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Paginated API response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}

// Space interfaces
export interface Space {
    id: string;
    propertyId: string;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    images?: string[];
    capacity: number;
    amenities?: string[];
    pricePerHour: number;
    pricePerDay: number;
    currency: string;
    status: 'available' | 'booked' | 'maintenance';
    createdAt: string;
    updatedAt: string;
}

// Filter interfaces
export interface ReservationFilters {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    spaceId?: number;
    bookingId?: number;
}

// Export interfaces
export interface ExportOptions {
    propertyId?: string;
    spaceId?: string;
    dateFrom?: string;
    dateTo?: string;
    format: 'csv' | 'excel' | 'pdf';
    includeDetails?: boolean;
}

// Payout breakdown interfaces
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

export interface BookingRequest {
    id: number;
    spaceId: number;
    guest: string;
    attendees: number;
    listing: string;
    spaceName: string;
    CategoryMaster?: {
        id: number;
        name: string;
    };
    activityCategory: string;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    guestMessage: string;
    guestId?: string | number;
    User?: {
        phone_number: string;
        first_name?: string;
        last_name?: string;
        id?: number;
    };
    hostPlatformFeePer?: number;
    hostTDSPer?: number;
    status: string;
    startDatetime?: string | null;
    endDatetime?: string | null;
    totalAmount?: number;
    guest_message?: string;
    created_at?: string | null;
    updated_at?: string | null;
    Space?: any;
    isGst?: boolean;
    hostGst?: boolean;
    totalHostAmount?: number;
}
