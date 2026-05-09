/**
 * Common PII (Personally Identifiable Information) validation utilities
 * Used to detect and prevent sharing of sensitive information like emails and phone numbers
 */

export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
export const PHONE_REGEX = /(\+?\d{1,4}[\s.-]?)?(\(?\d{3,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4,6}|(\d[\s.-]?){10,15}/g;

export interface PIICheckResult {
    hasEmail: boolean;
    hasPhone: boolean;
}

/**
 * Checks if a given text contains PII (email addresses or phone numbers)
 * @param text - The text to check for PII
 * @returns An object indicating whether email or phone patterns were found
 */
export const containsPII = (text: string): PIICheckResult => {
    if (!text || text.trim() === '') {
        return { hasEmail: false, hasPhone: false };
    }

    // Check for email - reset lastIndex to ensure fresh match
    EMAIL_REGEX.lastIndex = 0;
    const hasEmail = EMAIL_REGEX.test(text);

    // Clean text for phone check (remove dates, currency, time patterns)
    const cleanedText = text
        .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '') // Remove date patterns like 12/25/2024
        .replace(/₹\s?\d+/g, '')                   // Remove currency patterns like ₹500
        .replace(/\$\s?\d+/g, '')                  // Remove dollar patterns like $500
        .replace(/\d{1,2}:\d{2}/g, '');            // Remove time patterns like 10:30

    // Reset lastIndex and check for phone
    PHONE_REGEX.lastIndex = 0;
    const matches = cleanedText.match(PHONE_REGEX);

    let hasPhone = false;
    if (matches) {
        const validMatches = matches.filter((match) => {
            const digitsOnly = match.replace(/\D/g, '');
            return digitsOnly.length >= 10 && digitsOnly.length <= 15;
        });
        hasPhone = validMatches.length > 0;
    }

    return { hasEmail, hasPhone };
};

/**
 * Checks if text contains any numeric digits
 * @param text - The text to check
 * @returns true if text contains any digit
 */
export const containsNumbers = (text: string): boolean => {
    return /\d/.test(text);
};
