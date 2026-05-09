import { KYCDoc } from '@/constants/enums';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number | string | undefined | null): string => {
    const num = Number(value ?? 0);
    if (Number.isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Extract ID number (Aadhaar, PAN, DL) and DOB (for DL) from OCR text
 * @param text - OCR extracted text
 * @param type - 'aadhaar' | 'pan' | 'dl'
 * @returns For aadhar/pan -> string | null, for dl -> {dlNumber: string|null, dob: string|null}
 */
export function extractDetails(
    text: string,
    type: KYCDoc,
): string | { dlNumber: string | null; dob: string | null } | null {
    if (!text) return null;

    // Normalize text: remove extra spaces, convert to uppercase for consistency
    const normalized = text.replace(/\s+/g, ' ').trim().toUpperCase();

    if (type === KYCDoc.AADHAR) {
        const aadhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
        const match = normalized.match(aadhaarRegex);
        return match ? match[0].replace(/\s/g, '') : null;
    }

    if (type === KYCDoc.PAN) {
        const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/;
        const match = normalized.match(panRegex);
        return match ? match[0] : null;
    }

    if (type === KYCDoc.DL) {
        // DL number pattern: e.g., DL0420123456789, MH1420120012345
        const dlRegex = /\b[A-Z]{2}[0-9]{2}\s?[0-9]{4,11}\b/;
        const dlMatch = normalized.match(dlRegex);
        const dlNumber = dlMatch ? dlMatch[0].replace(/\s/g, '') : null;

        // DOB pattern: common date formats like DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
        const dobRegex = /\b\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}\b/;
        const dobMatch = normalized.match(dobRegex);
        const dob = dobMatch ? dobMatch[0] : null;

        return { dlNumber, dob };
    }

    return null;
}

export const convert12to24 = (time12h: string): string => {
    if (!time12h) return '';

    const cleanTime = time12h.trim().toUpperCase();

    if (/^([01]?\d|2[0-3]):([0-5]\d)$/.test(cleanTime)) {
        return `${cleanTime}:00`;
    }

    const match = cleanTime.match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/);
    if (!match) {
        console.warn('Invalid time format:', time12h);
        return '';
    }

    const [, hours, minutes, period] = match;
    let hourNum = parseInt(hours, 10);

    if (period === 'PM' && hourNum < 12) {
        hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
        hourNum = 0;
    }

    return `${hourNum.toString().padStart(2, '0')}:${minutes}:00`;
};
