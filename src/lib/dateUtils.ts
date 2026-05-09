import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Converts a UTC date string to IST (Asia/Kolkata)
 * @param utcDate - The UTC date string (ISO format)
 * @param format - Optional output format, default 'YYYY-MM-DD HH:mm:ss'
 * @returns IST date string
 */
export function convertUtcToIst(utcDate: string, format = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs.utc(utcDate).tz('Asia/Kolkata').format(format);
}

/**
 * Converts an array of UTC date strings to IST
 * @param utcDates - Array of UTC ISO strings
 * @param format - Optional output format
 * @returns Array of IST date strings
 */
export function convertUtcArrayToIst(utcDates: string[], format = 'YYYY-MM-DD HH:mm:ss'): string[] {
    return utcDates.map((date) => convertUtcToIst(date, format));
}

/**
 * Get start and end datetime of a day in IST from a UTC date
 * @param utcDate - UTC date string
 * @returns Object with startDatetime and endDatetime in IST
 */
export function getDayRangeIst(utcDate: string) {
    const d = dayjs.utc(utcDate).tz('Asia/Kolkata');
    return {
        startDatetime: d.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endDatetime: d.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    };
}
