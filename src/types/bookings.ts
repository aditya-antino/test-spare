import { BookingStatus } from '@/constants/booking-status';

export interface Booking {
    host: string;
    phone?: string | null;
    location: string;
    spaceName: string;
    attendees: number;
    activityCategory: string;
    date: string;
    time: string;
    status: BookingStatus;
    totalAmount: number;
}
