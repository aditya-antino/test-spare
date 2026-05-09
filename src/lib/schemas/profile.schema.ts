import { z } from 'zod';

export const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    phoneNumber: z.string(),
    email: z.string().email(),
    myWork: z.string(),
    city: z.string(),
    about: z.string(),
    Languages: z.array(z.number()),
    avatar: z.string().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
