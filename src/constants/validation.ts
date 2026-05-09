
export const REGEX = {
    EMAIL: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    PHONE_GENERIC: /(\+?\d{1,3}[-.\s]?)?\d{7,15}/,
    PHONE_INDIA: /^[6-9]\d{9}$/,
    URL: /\b((?:https?:\/\/|www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&//=]*))\b/i,
    GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
    PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    DIGIT: /\d/,
};

export const VALIDATION_MESSAGES = {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Invalid email address',
    PHONE_REQUIRED: 'Phone number is required',
    PHONE_INVALID: 'Invalid phone number',
    RESTRICTED_NUMBERS: 'Numbers are not allowed in messages.',
    RESTRICTED_EMAIL: 'Sharing email addresses is not allowed.',
    RESTRICTED_PHONE: 'Sharing phone numbers is not allowed.',
    RESTRICTED_LINK: 'Sharing links is not allowed.',
};
