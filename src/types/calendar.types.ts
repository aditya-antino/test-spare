
export interface CalendarFilters {
    spaceId?: number;
    dateFrom?: string;
    dateTo?: string;
}

export interface CalendarBooking {
    bookingCount: number;
    bookings: any;
    date: string;
}

export interface Session {
    start: string;
    end: string;
}

export interface DayOperatingHours {
    is_open: boolean;
    sessions?: Session[];
}

export type OperatingHours = {
    Monday: DayOperatingHours;
    Tuesday: DayOperatingHours;
    Wednesday: DayOperatingHours;
    Thursday: DayOperatingHours;
    Friday: DayOperatingHours;
    Saturday: DayOperatingHours;
    Sunday: DayOperatingHours;
};

export interface CalenderData {
    calendar: Array<CalendarBooking>;
    dateRange: { end: string; start: string };
    spaceId: number;
    spaceTitle: string;
    operatingHours: OperatingHours;
}

export interface MonthlyCalendarData {
    data: CalenderData;
    message: string;
    success: any;
}

export interface BlockedSlot {
    id: number;
    date: string; // "YYYY-MM-DD"
    availableFrom: string; // "HH:mm:ss"
    availableTo: string; // "HH:mm:ss"
    createdAt: string; // ISO datetime
    updatedAt: string; // ISO datetime
    reason?: string;
}

export interface BlockedSlotsData {
    success: boolean;
    message: string;
    spaceId: number;
    spaceTitle: string;
    totalBlockedSlots: number;
    bookingSlots: BlockedSlot[];
}

export interface BlockedSlotsResponse {
    success: boolean;
    type: string;
    message: string;
    data: BlockedSlotsData;
}

export interface DeleteBlockedSlotsPayload {
    slotId: number;
}

export interface BlockBookingSlots {
    spaceId: number;
    date: string;
    availableFrom: string;
    availableTo: string;
}

export interface getCalendarProps {
    startDatetime: string;
    endDatetime: string;
    spaceId?: number;
    filters?: CalendarFilters;
}

export interface GuestBookingCalendarResponse {
    success: boolean;
    message: string;
    data: string[]; // Array of day names
}

export interface GuestTimeSlotsResponse {
    success: boolean;
    message: string;
    data: {
        available: boolean;
        reason?: string;
        message?: string;
        operatingHours?: Array<{
            from: string;
            to: string;
        }>;
        availableTimeSlots?: Array<{
            startTime: string;
            endTime: string;
        }>;
    };
}
