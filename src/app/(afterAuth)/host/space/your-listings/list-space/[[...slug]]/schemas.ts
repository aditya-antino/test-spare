import { z } from 'zod';

export const step1Schema = z.object({
    title: z.string().min(1, 'Title is required').max(60, 'Title must be 60 characters or less'),
    category_id: z.coerce.number().min(1, 'Please select a category'),
    space_type_id: z.array(z.number()).min(1, 'Please select at least one space type'),
    activities_id: z.array(z.number()).min(1, 'Select at least one activity'),
    capacity: z.coerce.number().min(1, 'Number of attendees must be greater than 0'),
    short_description: z
        .string()
        .min(30, 'Short description must be at least 30 characters')
        .max(150, 'Short description must be 150 characters or less'),
    detailed_description: z
        .string()
        .min(150, 'Detailed description must be at least 150 characters')
        .max(1000, 'Detailed description must be less than 1000 characters'),
    size: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
});

export type Step1FormValues = z.infer<typeof step1Schema>;

const step2RuleSchema = z
    .object({
        rule_id: z.string(),
        rule_type: z.string(),
        otherInput: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.rule_type === 'other') {
                return !!data.otherInput && data.otherInput.trim().length > 0;
            }
            return true;
        },
        {
            message: "Please provide a value for 'Other'",
            path: ['otherInput'],
        },
    );

export const step2Schema = z.object({
    space_id: z.coerce.number(),
    amenities_id: z.array(z.number()).min(1, 'Select at least one amenity'),
    arrival_instructions: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val.trim().length === 0) return true;
            return val.length >= 50 && val.length <= 300;
        }, 'Arrival instructions must be between 50 and 300 characters'),
    parking_options: z.object({
        free_onsite: z.boolean(),
        paid_onsite: z.boolean(),
        nearby_parking_lot: z.boolean(),
    }),
    rules: z.array(step2RuleSchema),
});

export type Step2FormValues = z.infer<typeof step2Schema>;

export const step3Schema = z.object({
    space_id: z.number(),
    images: z
        .array(
            z.object({
                image_url: z.string(),
                is_featured: z.boolean(),
            }),
        )
        .max(25, 'Maximum 25 images allowed')
        .refine((images) => images.some((img) => img.is_featured), 'Please upload a featured image')
        .refine(
            (images) => images.filter((img) => !img.is_featured).length >= 3,
            'Please upload at least 3 space images',
        ),
});

export type Step3FormValues = z.infer<typeof step3Schema>;

function convertToMinutes(hours: number, minutes: number, period: string) {
    let h = hours % 12;
    if (period === 'PM') h += 12;
    return h * 60 + minutes;
}

const sessionSchema = z
    .object({
        fromHours: z.string(),
        fromMinutes: z.string(),
        fromPeriod: z.string(),
        toHours: z.string(),
        toMinutes: z.string(),
        toPeriod: z.string(),
    })
    .superRefine((data, ctx) => {
        if (!data.fromHours || !data.fromMinutes || !data.toHours || !data.toMinutes) return;

        // Check if strings are valid numbers before parsing
        if (isNaN(parseInt(data.fromHours)) || isNaN(parseInt(data.fromMinutes))) return;

        const start = convertToMinutes(
            parseInt(data.fromHours),
            parseInt(data.fromMinutes),
            data.fromPeriod,
        );
        const end = convertToMinutes(
            parseInt(data.toHours),
            parseInt(data.toMinutes),
            data.toPeriod,
        );

        const duration = end >= start ? end - start : 24 * 60 - start + end;

        if (duration === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Start and end time cannot be the same',
                path: ['fromHours'],
            });
        }
        if (duration > 720) {
            // 12 hours
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Slot exceeds 12 hours',
                path: ['fromHours'],
            });
        }
    });

const daySchema = z
    .object({
        isOpen: z.boolean(),
        sessions: z.array(sessionSchema),
    })
    .superRefine((data, ctx) => {
        if (!data.isOpen) return;

        const ranges: { start: number; end: number }[] = [];

        data.sessions.forEach((s, idx) => {
            // Enforce required fields if isOpen is true
            if (!s.fromHours) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Required',
                    path: ['sessions', idx, 'fromHours'],
                });
            }
            if (!s.fromMinutes) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Required',
                    path: ['sessions', idx, 'fromMinutes'],
                });
            }
            if (!s.toHours) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Required',
                    path: ['sessions', idx, 'toHours'],
                });
            }
            if (!s.toMinutes) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Required',
                    path: ['sessions', idx, 'toMinutes'],
                });
            }

            if (!s.fromHours || !s.fromMinutes || !s.toHours || !s.toMinutes) return;
            const start = convertToMinutes(
                parseInt(s.fromHours),
                parseInt(s.fromMinutes),
                s.fromPeriod,
            );
            const end = convertToMinutes(parseInt(s.toHours), parseInt(s.toMinutes), s.toPeriod);

            for (const r of ranges) {
                if (start < r.end && end > r.start) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Slot overlaps with another slot',
                        path: ['sessions', idx, 'fromHours'],
                    });
                }
            }
            ranges.push({ start, end });
        });
    });

export const step4Schema = z
    .object({
        Monday: daySchema,
        Tuesday: daySchema,
        Wednesday: daySchema,
        Thursday: daySchema,
        Friday: daySchema,
        Saturday: daySchema,
        Sunday: daySchema,
    })
    .refine((data) => Object.values(data).some((d) => d.isOpen), {
        message: 'At least one day should be operational',
        path: ['root'],
    });

export type Step4FormValues = z.infer<typeof step4Schema>;

const locationPointSchema = z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
});

export const step5Schema = z.object({
    street: z.string().min(1, 'Street is required'),
    area: z.string().min(1, 'Area is required'),
    locality: z.string().min(1, 'Locality is required'),
    city: z
        .object({ id: z.number(), name: z.string() })
        .nullable()
        .refine((val) => val !== null, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.coerce.number().min(1, 'Valid postal code is required'),
    location: locationPointSchema,
});

export type Step5FormValues = z.infer<typeof step5Schema>;

export const step6Schema = z.object({
    basePrice: z.coerce.number().positive('Base price must be greater than 0'),
    minimumHours: z.coerce.number().int().min(1, 'Minimum 1 hour').max(12, 'Maximum 12 hours'),
    overtimePrice: z.coerce.number().nonnegative('Must be positive').optional(),
    instantBooking: z.boolean(),
    extraDiscountPer: z.object({
        four: z.coerce.number().min(0).max(100).default(0),
        six: z.coerce.number().min(0).max(100).default(0),
        eight: z.coerce.number().min(0).max(100).default(0),
        twelve: z.coerce.number().min(0).max(100).default(0),
    }),
});

export type Step6FormValues = z.infer<typeof step6Schema>;

export const step7Schema = z.object({
    keepConversations: z
        .boolean()
        .refine((val) => val === true, { message: 'You must agree to this' }),
    processPayments: z
        .boolean()
        .refine((val) => val === true, { message: 'You must agree to this' }),
    payoutDeposit: z.boolean().refine((val) => val === true, { message: 'You must agree to this' }),
    followPolicies: z
        .boolean()
        .refine((val) => val === true, { message: 'You must agree to this' }),
    noConflictingContracts: z
        .boolean()
        .refine((val) => val === true, { message: 'You must agree to this' }),
    localRegulations: z
        .boolean()
        .refine((val) => val === true, { message: 'You must agree to this' }),
    customRules: z.array(z.string()).optional(),
});

export type Step7FormValues = z.infer<typeof step7Schema>;

export const step8Schema = z.object({
    cancellationPolicy: z.enum(['super-flexible', 'flexible', 'moderate', 'firm', 'strict']),
    isNonRefundable: z.boolean(),
});

export type Step8FormValues = z.infer<typeof step8Schema>;

export const step9Schema = z.object({
    ownershipProof: z.array(z.string()).optional(),
});

export type Step9FormValues = z.infer<typeof step9Schema>;
