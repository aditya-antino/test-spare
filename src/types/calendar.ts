export interface CalendarEvent {
    id: string;
    bookingId: string;
    guestName: string;
    attendees: number;
    startTime: string;
    endTime: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    propertyId: string;
    spaceId: string;
    date: string;
}

export interface CalendarDay {
    date: string;
    dayNumber: number;
    isToday: boolean;
    isSelected: boolean;
    isCurrentMonth: boolean;
    events: CalendarEvent[];
    totalBookings: number;
}

export interface CalendarView {
    type: 'daily' | 'monthly';
    currentDate: string;
    selectedDate?: string;
}

export interface CalendarFilters {
    spaceId?: number;
    dateFrom?: string;
    dateTo?: string;
}

export interface TimeSlot {
    time: string;
    events: CalendarEvent[];
    isBooked: boolean;
}

export interface MonthlyCalendarData {
    month: string;
    year: number;
    days: CalendarDay[];
    totalBookings: number;
}

export interface DailyCalendarData {
    date: string;
    timeSlots: TimeSlot[];
    totalBookings: number;
}
