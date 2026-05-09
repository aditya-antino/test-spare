import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatToIST = (utcDateTime: string | Date | dayjs.Dayjs): string => {
    if (!utcDateTime) return '';
    const d = dayjs.isDayjs(utcDateTime) ? utcDateTime : dayjs(utcDateTime);
    return d.utc().tz('Asia/Kolkata').format('hh:mm A');
};

export const capitalizeWord = (words: string) => {
    if (!words) return '';
    return words[0].toUpperCase() + words.slice(1).toLowerCase();
};

/** Represents a start/end Date range for FilterPill */
export interface DateTimeRange {
    start?: Date;
    end?: Date;
}

export const useReduxDateTimeRange = (): DateTimeRange => {
    const { date, startTime, endTime } = useSelector((state: RootState) => state.homeSearchData);

    if (!date) return {};

    const start = new Date(date);
    if (startTime) {
        const [sh, sm] = startTime.split(':').map(Number);
        start.setHours(sh, sm);
    }

    const end = new Date(date);
    if (endTime) {
        const [eh, em] = endTime.split(':').map(Number);
        end.setHours(eh, em);
    }

    return { start, end };
};




