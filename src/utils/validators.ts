import { REGEX } from '@/constants';

export const emailRegex = REGEX.EMAIL;
export const phoneRegex = REGEX.PHONE_GENERIC;
export const urlRegex = REGEX.URL;

export const checkRestrictedContent = (text: string): string | null => {
    if (!text || text.trim() === '') return null;

    const digitRegex = /\d/;
    if (digitRegex.test(text)) {
        return 'Numbers are not allowed in messages.';
    }

    if (emailRegex.test(text)) return 'Sharing email addresses is not allowed.';
    if (phoneRegex.test(text)) return 'Sharing phone numbers is not allowed.';
    if (urlRegex.test(text)) return 'Sharing links is not allowed.';
    return null;
};

export const validateGSTNumber = (gstNumber: string): boolean => {
    return REGEX.GST.test(gstNumber);
};

export const validatePANNumber = (panNumber: string): boolean => {
    return REGEX.PAN.test(panNumber);
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
    return REGEX.PHONE_INDIA.test(phoneNumber.replace(/\D/g, ''));
};

