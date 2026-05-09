
import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Record<string, string[]>;
}

export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const validate = useCallback(
        (data: unknown): ValidationResult<T> => {
            const result = schema.safeParse(data);

            if (result.success) {
                setErrors({});
                return { success: true, data: result.data };
            } else {
                const formattedErrors = result.error.flatten().fieldErrors;
                setErrors(formattedErrors as Record<string, string[]>);
                return { success: false, errors: formattedErrors as Record<string, string[]> };
            }
        },
        [schema]
    );

    const clearErrors = useCallback(() => setErrors({}), []);

    return { errors, validate, clearErrors, setErrors };
};
