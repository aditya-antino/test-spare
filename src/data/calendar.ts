import type {
    CalendarEvent,
    CalendarDay,
    TimeSlot,
    MonthlyCalendarData,
    DailyCalendarData,
} from '@/types/calendar';
import dayjs from 'dayjs';

// Dummy events data
const dummyEvents: CalendarEvent[] = [
    {
        id: '1',
        bookingId: 'CNF-456XYZ',
        guestName: 'John Doe',
        attendees: 6,
        startTime: '09:00 AM',
        endTime: '09:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-18',
    },
    {
        id: '2',
        bookingId: 'CNF-789ABC',
        guestName: 'Jane Smith',
        attendees: 4,
        startTime: '10:00 AM',
        endTime: '02:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-18',
    },
    {
        id: '3',
        bookingId: 'CNF-123DEF',
        guestName: 'Mike Johnson',
        attendees: 8,
        startTime: '03:00 PM',
        endTime: '07:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-18',
    },
    {
        id: '4',
        bookingId: 'CNF-456GHI',
        guestName: 'Sarah Wilson',
        attendees: 3,
        startTime: '11:00 AM',
        endTime: '03:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-19',
    },
    {
        id: '5',
        bookingId: 'CNF-789JKL',
        guestName: 'David Brown',
        attendees: 5,
        startTime: '02:00 PM',
        endTime: '06:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-19',
    },
    {
        id: '6',
        bookingId: 'CNF-123MNO',
        guestName: 'Emily Davis',
        attendees: 7,
        startTime: '09:00 AM',
        endTime: '01:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-20',
    },
    {
        id: '7',
        bookingId: 'CNF-456PQR',
        guestName: 'Alex Thompson',
        attendees: 2,
        startTime: '04:00 PM',
        endTime: '08:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-20',
    },
    {
        id: '8',
        bookingId: 'CNF-789STU',
        guestName: 'Lisa Anderson',
        attendees: 9,
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-21',
    },
    {
        id: '9',
        bookingId: 'CNF-123VWX',
        guestName: 'Tom Wilson',
        attendees: 4,
        startTime: '01:00 PM',
        endTime: '05:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-22',
    },
    {
        id: '10',
        bookingId: 'CNF-456YZA',
        guestName: 'Rachel Green',
        attendees: 6,
        startTime: '11:00 AM',
        endTime: '03:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-23',
    },
    {
        id: '11',
        bookingId: 'CNF-789BCD',
        guestName: 'Chris Martin',
        attendees: 3,
        startTime: '02:00 PM',
        endTime: '06:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-24',
    },
    {
        id: '12',
        bookingId: 'CNF-123EFG',
        guestName: 'Maria Garcia',
        attendees: 8,
        startTime: '09:00 AM',
        endTime: '01:00 PM',
        status: 'confirmed',
        propertyId: 'p1',
        spaceId: 's1',
        date: '2025-03-25',
    },
];

// Generate calendar days for March 2025
const generateMarch2025Days = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const today = dayjs();
    const currentDate = dayjs('2025-03-01');

    const firstDayOfWeek = currentDate.day();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = currentDate.subtract(i + 1, 'day');
        days.push({
            date: date.format('YYYY-MM-DD'),
            dayNumber: date.date(),
            isToday: date.isSame(today, 'day'),
            isSelected: false,
            isCurrentMonth: false,
            events: [],
            totalBookings: 0,
        });
    }

    for (let i = 0; i < 31; i++) {
        const date = currentDate.add(i, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        const dayEvents = dummyEvents.filter((event) => event.date === dateStr);

        days.push({
            date: dateStr,
            dayNumber: date.date(),
            isToday: date.isSame(today, 'day'),
            isSelected: false,
            isCurrentMonth: true,
            events: dayEvents,
            totalBookings: dayEvents.length,
        });
    }

    const lastDayOfWeek = dayjs('2025-03-31').day();
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        const date = dayjs('2025-03-31').add(i, 'day');
        days.push({
            date: date.format('YYYY-MM-DD'),
            dayNumber: date.date(),
            isToday: date.isSame(today, 'day'),
            isSelected: false,
            isCurrentMonth: false,
            events: [],
            totalBookings: 0,
        });
    }

    return days;
};

// Generate time slots for daily view
const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayEvents = dummyEvents.filter((event) => event.date === date);

    // Generate time slots from 10 AM to 8 PM
    for (let hour = 10; hour <= 20; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        const slotEvents = dayEvents.filter((event) => {
            const eventHour = parseInt(event.startTime.split(':')[0]);
            return eventHour === hour;
        });

        slots.push({
            time,
            events: slotEvents,
            isBooked: slotEvents.length > 0,
        });
    }

    return slots;
};

// Dummy data functions
export const getDummyMonthlyCalendar = (year: number, month: number): MonthlyCalendarData => {
    if (year === 2025 && month === 3) {
        return {
            month: 'March',
            year: 2025,
            days: generateMarch2025Days(),
            totalBookings: dummyEvents.length,
        };
    }

    // Return empty calendar for other months
    return {
        month: dayjs()
            .month(month - 1)
            .format('MMMM'),
        year,
        days: [],
        totalBookings: 0,
    };
};

export const getDummyDailyCalendar = (date: string): DailyCalendarData => {
    return {
        date,
        timeSlots: generateTimeSlots(date),
        totalBookings: dummyEvents.filter((event) => event.date === date).length,
    };
};

export const getDummyCalendarEvents = (startDate: string, endDate: string) => {
    return dummyEvents.filter((event) => {
        const eventDate = dayjs(event.date);
        return (
            eventDate.isAfter(dayjs(startDate).subtract(1, 'day')) &&
            eventDate.isBefore(dayjs(endDate).add(1, 'day'))
        );
    });
};
