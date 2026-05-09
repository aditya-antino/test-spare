import { z } from 'zod';
import { REGEX } from '@/constants';

export const gstSchema = z.object({
    companyName: z
        .string()
        .min(1, 'Company name is required')
        .min(3, 'Company name must be at least 3 characters long'),
    companyAddress: z
        .string()
        .min(1, 'Company address is required')
        .min(10, 'Company address must be at least 10 characters long'),
    phoneNumber: z
        .string()
        .min(1, 'Phone number is required')
        .regex(REGEX.PHONE_INDIA, 'Please enter a valid 10-digit phone number'),
    panNumber: z
        .string()
        .min(1, 'PAN number is required')
        .regex(REGEX.PAN, 'Please enter a valid PAN number'),
    gstNumber: z
        .string()
        .min(1, 'GST number is required')
        .regex(REGEX.GST, 'Please enter a valid GST number'),
});

export type GSTFormValues = z.infer<typeof gstSchema>;
