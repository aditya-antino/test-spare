'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typoGraphy';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Clock } from 'lucide-react';
import { useUpdateSpaceListStep6, SpaceDetailsInterface } from '@/services';
import { PATHS } from '@/constants/path';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useForm, Controller, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { formatPriceInput, parsePriceInput } from '@/utils/currency';
import { zodResolver } from '@hookform/resolvers/zod';
import { step6Schema, Step6FormValues } from './schemas';

interface Step6Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
}

const Step6 = ({ editData, isEdit }: Step6Props) => {
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(isEdit === 'true');
    const isInitializedRef = useRef(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    }: UseFormReturn<Step6FormValues> = useForm<Step6FormValues>({
        resolver: zodResolver(step6Schema) as any,
        defaultValues: {
            basePrice: '' as unknown as number,
            minimumHours: 1,
            overtimePrice: '' as unknown as number,
            instantBooking: false,
            extraDiscountPer: {
                four: 0,
                six: 0,
                eight: 0,
                twelve: 0,
            },
        },
    });

    const { mutate: submitStep6, isPending } = useUpdateSpaceListStep6({
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit === 'true' ? '&isEdit=true' : '';
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=${7}${editParam}`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Something went wrong');
        },
    });

    useEffect(() => {
        if (isEdit === 'true' && editData && editData.SpaceListing && !isInitializedRef.current) {
            reset({
                basePrice: editData.SpaceListing.price_per_hour
                    ? Number(editData.SpaceListing.price_per_hour)
                    : undefined,
                minimumHours: editData.SpaceListing.min_booking_hours || 1,
                overtimePrice: editData.SpaceListing.extra_hour_price
                    ? Number(editData.SpaceListing.extra_hour_price)
                    : undefined,
                instantBooking: editData.SpaceListing.instant_booking || false,
                extraDiscountPer: {
                    four: editData.SpaceListing.extra_discount_per?.four || 0,
                    six: editData.SpaceListing.extra_discount_per?.six || 0,
                    eight: editData.SpaceListing.extra_discount_per?.eight || 0,
                    twelve: editData.SpaceListing.extra_discount_per?.twelve || 0,
                },
            });
            setIsLoading(false);
            isInitializedRef.current = true;
        }
    }, [editData, spaceId, isEdit, reset]);

    const onSubmit: SubmitHandler<Step6FormValues> = (data) => {
        const payload = {
            space_id: Number(spaceId),
            price_per_hour: data.basePrice,
            min_booking_hours: data.minimumHours,
            extra_hour_price: data.overtimePrice || 0,
            instant_booking: data.instantBooking,
            extra_discount_per: data.extraDiscountPer,
            is_edit: isEdit === 'true',
        };
        submitStep6(payload);
    };

    const handleGoBack = () => {
        router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=5&isEdit=true`);
    };

    if (isLoading) {
        return (
            <div className="space-y-8 md:p-8 p-4 w-full max-w-[784px] rounded-2xl outline outline-offset-[-1px] outline-gray-200 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6CD28]"></div>
                    <Typography weight="medium" color="text-gray-600" size="lg">
                        Loading pricing...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 md:p-8 p-4 w-full max-w-[784px] rounded-2xl outline outline-offset-[-1px] outline-gray-200">
                {/* Header */}
                <div className="space-y-2">
                    <Typography weight="semibold" color="text-gray-900" size="2xl">
                        Price your space
                    </Typography>
                    <div className="max-w-[720px] text-gray-600 text-sm">
                        The host&#39;s revenue is directly dependent on the setting of rates and
                        regulations on the number of guests, the number of nights, and the
                        cancellation policy.
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Base Price */}
                    <div className="space-y-1">
                        <Label className="text-zinc-800 text-base font-semibold">
                            Base price (per hour)
                        </Label>
                        <div className="relative max-w-xs">
                            <span className="absolute z-50 left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ₹
                            </span>
                            <Controller
                                control={control}
                                name="basePrice"
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        className="pl-8 pr-12"
                                        placeholder="0.00"
                                        value={formatPriceInput(field.value)}
                                        onFocus={() => {
                                            if (Number(field.value) === 0) {
                                                field.onChange('');
                                            }
                                        }}
                                        onChange={(e) =>
                                            field.onChange(parsePriceInput(e.target.value))
                                        }
                                        error={errors.basePrice?.message}
                                    />
                                )}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                INR
                            </span>
                        </div>
                    </div>

                    {/* Minimum Booking Hours */}
                    <div className="space-y-1">
                        <Label className="text-zinc-800 text-base font-semibold">
                            Minimum booking hours (1-12)
                        </Label>
                        <div className="max-w-xs">
                            <Input
                                type="number"
                                placeholder="12"
                                className="pl-8"
                                {...register('minimumHours')}
                                onFocus={(e) => {
                                    if (e.target.value === '1') {
                                        setValue('minimumHours', '' as any);
                                    }
                                }}
                                error={errors.minimumHours?.message}
                            />
                        </div>
                    </div>

                    {/* Extra Hourly Price */}
                    <div className="space-y-1">
                        <Label className="text-zinc-800 text-base font-semibold">
                            Extra hourly price for overtime. (Optional)
                        </Label>
                        <div className="relative max-w-xs">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-50 text-gray-500">
                                ₹
                            </span>
                            <Controller
                                control={control}
                                name="overtimePrice"
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        className="pl-8 pr-12"
                                        placeholder="0.00"
                                        value={formatPriceInput(field.value)}
                                        onFocus={() => {
                                            if (Number(field.value) === 0) {
                                                field.onChange('');
                                            }
                                        }}
                                        onChange={(e) =>
                                            field.onChange(parsePriceInput(e.target.value))
                                        }
                                        error={errors.overtimePrice?.message}
                                    />
                                )}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                INR
                            </span>
                        </div>
                    </div>

                    {/* Instant Booking */}
                    <div>
                        <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <Controller
                                        control={control}
                                        name="instantBooking"
                                        render={({ field }) => (
                                            <Checkbox
                                                id="instant-booking"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28]"
                                            />
                                        )}
                                    />
                                    <Label
                                        htmlFor="instant-booking"
                                        className="text-zinc-800 text-base font-semibold cursor-pointer"
                                    >
                                        Instant Booking
                                    </Label>
                                </div>
                                <p className=" text-gray-500 text-sm font-normal max-w-[700px]">
                                    Enable Instant Booking to allow guests to book your space
                                    without waiting for approval. If selected, bookings will be
                                    confirmed automatically instead of requiring your approval.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Long Booking Discount */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <Label className="text-zinc-800 text-base font-semibold">
                                Long Booking Discounts
                            </Label>
                        </div>
                        <p className="text-gray-500 text-sm font-normal max-w-[700px]">
                            Offer discounts for longer bookings. Enter 0 if you don&#39;t want to
                            offer a discount for a specific duration.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            {[
                                {
                                    id: 'four',
                                    label: '4 hours or more',
                                    name: 'extraDiscountPer.four',
                                },
                                {
                                    id: 'six',
                                    label: '6 hours or more',
                                    name: 'extraDiscountPer.six',
                                },
                                {
                                    id: 'eight',
                                    label: '8 hours or more',
                                    name: 'extraDiscountPer.eight',
                                },
                                {
                                    id: 'twelve',
                                    label: '12 hours or more',
                                    name: 'extraDiscountPer.twelve',
                                },
                            ].map((tier) => (
                                <div key={tier.id} className="flex items-start gap-3">
                                    <div className="space-y-1 flex-1">
                                        <Label
                                            htmlFor={tier.id}
                                            className="text-zinc-700 text-sm font-medium"
                                        >
                                            {tier.label}
                                        </Label>
                                        <div className="relative max-w-xs">
                                            <Input
                                                id={tier.id}
                                                type="number"
                                                step="any"
                                                min="0"
                                                max="100"
                                                className="pr-8"
                                                placeholder="0"
                                                {...register(tier.name as any)}
                                                onFocus={(e) => {
                                                    if (e.target.value === '0') {
                                                        setValue(tier.name as any, '' as any);
                                                    }
                                                }}
                                                error={
                                                    (errors.extraDiscountPer as any)?.[tier.id]
                                                        ?.message
                                                }
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full flex justify-end gap-4 items-end h-20">
                <Button
                    type="button"
                    disabled={isPending || isSubmitting}
                    variant="outline"
                    onClick={handleGoBack}
                >
                    Go Back
                </Button>
                <Button
                    type="submit"
                    disabled={isPending || isSubmitting}
                    variant={isPending || isSubmitting ? 'disabled' : 'default'}
                >
                    {isPending || isSubmitting ? 'Submitting...' : 'Continue'}
                </Button>
            </div>
        </form>
    );
};

export default Step6;
