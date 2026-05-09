import { Get } from './api';
import { endpoints } from './endPoints';
import type { MonthlyCalendarData, DailyCalendarData, CalendarFilters } from '@/types/calendar';

export const calendarApi = {
    // Get monthly calendar data
    getMonthlyCalendar: async (
        startDatetime: string,
        endDatetime: string,
        spaceId: number,
        filters?: CalendarFilters,
    ): Promise<MonthlyCalendarData> => {
        const params = {
            startDatetime,
            endDatetime,
            spaceId,
            ...filters,
        };
        const response = await Get<MonthlyCalendarData>(endpoints.GET_CALENDAR, { params });
        console.log("response", response);
        return response;
    },

    // Get daily calendar data
    getDailyCalendar: async (
        date: string,
        filters?: CalendarFilters,
    ): Promise<DailyCalendarData> => {
        return;
        const params = {
            date,
            ...filters,
        };
        const response = await Get<DailyCalendarData>(endpoints.GET_DAILY_CALENDAR, { params });
        return response;
    },

    // Get calendar events for a specific date range
    getCalendarEvents: async (startDate: string, endDate: string, filters?: CalendarFilters) => {
        return;
        const params = {
            startDate,
            endDate,
            ...filters,
        };
        const response = await Get(endpoints.GET_CALENDAR_EVENTS, { params });
        return response;
    },
};
