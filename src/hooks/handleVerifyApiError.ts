import { toast } from 'react-toastify';

interface ApiError {
    success?: boolean;
    type?: string;
    message?: string;
    data?: any;
    status?: number;
}

export const handleVerifyApiError = (error) => {
    const apiError: ApiError | undefined = error?.data?.error;

    const internalErrorMsg = apiError?.message;

    if (internalErrorMsg) {
        toast.error(internalErrorMsg);
        return;
    }

    const data = error?.data;

    const isValidErrorMessage = (msg: unknown): boolean => {
        if (msg === null || msg === undefined) return false;
        if (typeof msg === 'string' && msg.trim() === '') return false;
        return true;
    };
    if (Array.isArray(data?.errors)) {
        const validErrors = data.errors.filter(isValidErrorMessage);

        if (validErrors.length > 0) {
            validErrors.forEach((message) => {
                toast.error(
                    typeof message === 'string'
                        ? message
                        : message.msg || message.message || JSON.stringify(message),
                );
            });
            return;
        }
    }

    if (apiError?.data?.name === 'SequelizeUniqueConstraintError') {
        const fields = apiError?.data?.fields
            ? Object.keys(apiError.data.fields).join(', ')
            : 'one or more fields';
        toast.error(`Duplicate value detected. Please check: ${fields}`);
        return;
    }

    if (data?.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors)
            .filter(isValidErrorMessage)
            .map((msg) =>
                typeof msg === 'string'
                    ? msg
                    : (msg as any).msg || (msg as any).message || JSON.stringify(msg),
            );

        if (errorMessages.length > 0) {
            errorMessages.forEach((msg) => toast.error(msg));
            return;
        }
    }

    if (isValidErrorMessage(data?.message)) {
        toast.error(data.message[0].toUpperCase() + data.message.slice(1));
        return;
    }

    if (apiError?.message) {
        toast.error(apiError.message);
        return;
    }

    if (error?.response?.status) {
        toast.error(`Request failed with status ${error.response.status}`);
        return;
    }

    if (error?.message) {
        toast.error(error.message);
        return;
    }

    toast.error('An unexpected error occurred. Please try again.');
};
