
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface ErrorState {
    hasError: boolean;
    message: string;
    code?: string | number;
}

export const useErrorHandler = (initialState: ErrorState = { hasError: false, message: '' }) => {
    const [error, setError] = useState<ErrorState>(initialState);

    const handleError = useCallback((err: any, showToast = true) => {
        const message = err?.response?.data?.message || err?.message || 'An unexpected error occurred';
        const code = err?.response?.status || err?.code;

        const errorState = { hasError: true, message, code };
        setError(errorState);

        if (showToast) {
            toast.error(message);
        }

        console.error('Error caught by useErrorHandler:', err);
        return errorState;
    }, []);

    const clearError = useCallback(() => {
        setError({ hasError: false, message: '' });
    }, []);

    return { error, handleError, clearError };
};
