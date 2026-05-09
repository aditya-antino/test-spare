
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export const formatDate = (date: string | Date, dateFormat: string = 'dd MMM yyyy') => {
    if (!date) return '';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, dateFormat) : '';
};

export const formatTime = (date: string | Date, timeFormat: string = 'hh:mm a') => {
    if (!date) return '';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, timeFormat) : '';
};

export const formatDateTime = (date: string | Date) => {
    return formatDate(date, 'dd MMM yyyy, hh:mm a');
};

export const formatRelativeTime = (date: string | Date) => {
    if (!date) return '';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
};

export const toISOString = (date: Date) => {
    return isValid(date) ? date.toISOString() : '';
};
