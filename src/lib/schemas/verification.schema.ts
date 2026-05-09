import { z } from 'zod';
import { KYCDoc } from '@/constants/enums';

const baseSchema = z.object({
    docLink: z.string().min(1, 'Please upload a document'),
});

const aadharSchema = baseSchema.extend({
    idType: z.literal(KYCDoc.AADHAR),
    aadhar: z.string().length(12, 'Aadhar must be 12 digits'),
});

const passportSchema = baseSchema.extend({
    idType: z.literal(KYCDoc.PASSPORT),
    fileNumber: z.string().min(1, 'Passport file number is required'),
    dob: z.date({ message: 'Date of birth is required' }),
});

const dlSchema = baseSchema.extend({
    idType: z.literal(KYCDoc.DL),
    dlNumber: z.string().min(1, 'Driving license number is required'),
    dob: z.date({ message: 'Date of birth is required' }),
});

export const verificationSchema = z.discriminatedUnion('idType', [
    aadharSchema,
    passportSchema,
    dlSchema,
]);

export type VerificationFormData = z.infer<typeof verificationSchema>;
