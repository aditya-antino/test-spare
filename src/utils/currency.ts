
export const formatCurrency = (amount: number, currency = 'INR', locale = 'en-IN') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatPrice = (amount: number | string) => {
    const num = Number(amount);
    return isNaN(num) ? '₹0' : formatCurrency(num);
};

export const parseCurrency = (amountString: string) => {
    return Number(String(amountString).replace(/[^0-9.-]+/g, '')) || 0;
};

// Formats a raw number/string into a comma-separated display string for input fields
export const formatPriceInput = (value: string | number): string => {
    if (value === '' || value === undefined || value === null) return '';
    const num = Number(String(value).replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN');
};

// Parses a comma-separated input string back to a plain number for API
export const parsePriceInput = (value: string | number): number => {
    return Number(String(value).replace(/,/g, '')) || 0;
};
