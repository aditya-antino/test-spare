import { toast } from 'react-toastify';
import { capitalizeWord } from '../utils/helperFunctions';

export const handleApiError = (error): void => {
    const data = error.response?.data;
    const isValidErrorMessage = (msg: unknown): boolean => {
        if (msg === null || msg === undefined) return false;
        if (typeof msg === 'string' && msg.trim() === '') return false;
        return true;
    };

    if (Array.isArray(data?.errors)) {
        const validErrors = data.errors.filter(isValidErrorMessage);

        if (validErrors.length > 0) {
            validErrors.forEach((message) => {
                const errorMsg =
                    typeof message === 'string'
                        ? message
                        : message.msg || message.message || JSON.stringify(message);
                toast.error(capitalizeWord(errorMsg));
            });
            return;
        }
    }

    if (data?.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors)
            .filter(isValidErrorMessage)
            .map((msg) => {
                const errorMsg =
                    typeof msg === 'string'
                        ? msg
                        : (msg as any).msg || (msg as any).message || JSON.stringify(msg);
                return capitalizeWord(errorMsg);
            });

        if (errorMessages.length > 0) {
            errorMessages.forEach((msg) => toast.error(msg));
            return;
        }
    }

    if (isValidErrorMessage(data?.message)) {
        toast.error(capitalizeWord(data.message));
        return;
    }

    if (isValidErrorMessage(error?.message)) {
        toast.error(capitalizeWord(error.message));
        return;
    }

    toast.error(capitalizeWord('Something went wrong'));
};
