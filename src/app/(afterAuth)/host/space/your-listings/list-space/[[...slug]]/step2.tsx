'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Typography from '@/components/ui/typoGraphy';
import { Label } from '@/components/ui/label';
import {
    useGetAmenities,
    useGetRules,
    useUpdateSpaceListStep2,
    SpaceDetailsInterface,
} from '@/services';
import { useRouter, useSearchParams } from 'next/navigation';
import { PATHS } from '@/constants/path';
import { toast } from 'react-toastify';
import { useForm, useFieldArray, FieldErrors, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema, Step2FormValues } from './schemas';

interface Step2Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
    selectedCategoryId: number;
}

const Step2 = ({ editData, isEdit, selectedCategoryId }: Step2Props) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');

    const [isLoading, setIsLoading] = useState(true);
    const isInitializedRef = useRef(false);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<Step2FormValues>({
        resolver: zodResolver(step2Schema) as Resolver<Step2FormValues>,
        defaultValues: {
            space_id: Number(spaceId),
            rules: [],
            arrival_instructions: '',
            parking_options: {
                free_onsite: true,
                paid_onsite: false,
                nearby_parking_lot: false,
            },
            amenities_id: [],
        }
    });

    const { fields } = useFieldArray({
        control,
        name: 'rules',
    });

    const categoryId = selectedCategoryId || editData?.CategoryMaster?.id;

    const { data: amenitiesResponse } = useGetAmenities(categoryId, {
        enabled: !!categoryId,
    });
    const amenities = amenitiesResponse?.data?.amenities ?? [];

    const { data: rulesResponse } = useGetRules();
    const rules = rulesResponse?.data?.rules ?? [];

    const { mutate: onStep2Submit, isPending } = useUpdateSpaceListStep2({
        onSuccess(response) {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit ? '&isEdit=true' : '';
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=3${editParam}`);
        },
        onError(error: any) {
            toast.error(error.message);
        },
    });

    useEffect(() => {
        if (rules.length > 0 && amenities.length > 0 && !isInitializedRef.current) {
            const readyToInit = isEdit === 'true' ? !!editData : true;

            if (readyToInit) {
                const mappedRules = rules.map(rule => {
                    let ruleType = 'allow';
                    let otherInput = '';

                    if (isEdit === 'true' && editData?.SpaceListing?.rules) {
                        const existing = editData.SpaceListing.rules.find(r => String(r.rule_id) === String(rule.id));
                        if (existing) {
                            if (existing.rule_type === 'allow' || existing.rule_type === 'do-not-allow') {
                                ruleType = existing.rule_type;
                            } else {
                                ruleType = 'other';
                                otherInput = existing.rule_type;
                            }
                        }
                    }

                    return {
                        rule_id: String(rule.id),
                        rule_type: ruleType,
                        otherInput: otherInput
                    };
                });

                const parking = {
                    free_onsite: true,
                    paid_onsite: false,
                    nearby_parking_lot: false
                };
                let arrival = '';
                let am_ids: number[] = [];

                if (isEdit === 'true' && editData) {
                    parking.free_onsite = editData.SpaceListing?.parking_options?.free_onsite || false;
                    parking.paid_onsite = editData.SpaceListing?.parking_options?.paid_onsite || false;
                    parking.nearby_parking_lot = editData.SpaceListing?.parking_options?.nearby_parking_lot || false;

                    arrival = editData.SpaceListing?.arrival_instructions || '';

                    if (editData.Amenities) {
                        am_ids = editData.Amenities.map(a => a.id);
                    }
                }

                reset({
                    space_id: Number(spaceId),
                    rules: mappedRules,
                    arrival_instructions: arrival,
                    parking_options: parking,
                    amenities_id: am_ids
                });

                isInitializedRef.current = true;
                setIsLoading(false);
            }
        }
    }, [rules, amenities, editData, isEdit, spaceId, reset]);

    const onSubmit = (data: any) => {
        const preparedRules = data.rules.map(r => {
            if (r.rule_type === 'other') {
                return { rule_id: r.rule_id, rule_type: r.otherInput || '' };
            }
            return { rule_id: r.rule_id, rule_type: r.rule_type };
        });

        const payload = {
            ...data,
            rules: preparedRules,
            is_edit: isEdit === 'true'
        };

        if (!payload.arrival_instructions?.trim()) {
            delete payload.arrival_instructions;
        }

        onStep2Submit(payload);
    };

    const onFormError = (errors: FieldErrors<Step2FormValues>) => {
        if (errors.amenities_id?.message) {
            toast.error(errors.amenities_id.message);
        } else if (errors.arrival_instructions?.message) {
            toast.error(errors.arrival_instructions.message);
        } else if (errors.rules) {
            toast.error("Please ensure all rule details are filled correctly.");
        } else {
            toast.error("Please fill in all required fields.");
        }
    };

    const handleGoBack = () => {
        router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=1&isEdit=true`);
    };

    const parking_options = watch('parking_options') || {
        free_onsite: true,
        paid_onsite: false,
        nearby_parking_lot: false,
    };
    const amenities_id = watch('amenities_id') || [];

    const setParkingType = (type: 'free' | 'paid') => {
        setValue('parking_options.free_onsite', type === 'free', { shouldValidate: true });
        setValue('parking_options.paid_onsite', type === 'paid', { shouldValidate: true });
    };

    const toggleAmenity = (id: number) => {
        if (amenities_id.includes(id)) {
            setValue('amenities_id', amenities_id.filter(x => x !== id), { shouldValidate: true });
        } else {
            setValue('amenities_id', [...amenities_id, id], { shouldValidate: true });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-20 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6CD28]"></div>
                    <Typography weight="medium" color="text-gray-600" size="lg">
                        Loading space details...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onFormError)}>
            <div className="space-y-8 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-200">
                <Typography weight="semibold" color="text-gray-900" size="2xl">
                    Additional information
                </Typography>
                <div className="w-20 border-t"></div>

                <div>
                    <div className="text-gray-900 text-base font-semibold">
                        Set house rules for your guests
                    </div>
                    <div className="text-gray-500 text-sm font-normal">
                        Guests must agree to your house rules before they book.
                    </div>
                </div>

                {/* Rules */}
                <div className="space-y-8">
                    {fields.map((field, index) => {
                        // Use rules[index] for metadata like name. Assuming order preserved.
                        // Safe to fallback if mismatch found (by ID maybe) but simple index logic for now
                        const ruleMeta = rules.find(r => String(r.id) === field.rule_id) || rules[index];
                        const ruleType = watch(`rules.${index}.rule_type`);

                        return (
                            <div key={field.id} className="space-y-3">
                                <Label className="text-zinc-800 text-base font-semibold">
                                    {ruleMeta?.name}
                                </Label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex gap-3 flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <Label className="flex text-nowrap items-center gap-2 cursor-pointer text-gray-700 text-sm">
                                            <input
                                                type="radio"
                                                {...register(`rules.${index}.rule_type`)}
                                                value="do-not-allow"
                                            />
                                            Do not allow
                                        </Label>
                                        <Label className="flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                                            <input
                                                type="radio"
                                                {...register(`rules.${index}.rule_type`)}
                                                value="allow"
                                            />
                                            Allow
                                        </Label>
                                        <Label className="flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                                            <input
                                                type="radio"
                                                {...register(`rules.${index}.rule_type`)}
                                                value="other"
                                            />
                                            Other
                                        </Label>
                                    </div>
                                    <div>
                                        <Input
                                            disabled={ruleType !== 'other'}
                                            placeholder="Other"
                                            className="col-span-6"
                                            {...register(`rules.${index}.otherInput`)}
                                            error={errors.rules?.[index]?.otherInput?.message}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Parking Options */}
                <div className="space-y-6">
                    <Label className="text-gray-900 text-base font-semibold">Parking Options</Label>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-1 text-gray-700 text-sm cursor-pointer">
                            <input
                                type="radio"
                                checked={!!parking_options.free_onsite}
                                onChange={() => setParkingType('free')}
                            />
                            Free
                        </label>
                        <label className="flex items-center gap-1 text-gray-700 text-sm cursor-pointer">
                            <input
                                type="radio"
                                checked={!!parking_options.paid_onsite}
                                onChange={() => setParkingType('paid')}
                            />
                            Paid
                        </label>
                    </div>

                    {/* Nearby parking lot */}
                    <div className="space-y-3 flex flex-col gap-4">
                        <Label className="text-gray-900 text-lg font-semibold">
                            Nearby parking lot
                        </Label>
                        <div className="flex items-center gap-44">
                            <label className="flex items-center gap-1 text-gray-700 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    value="yes"
                                    onChange={() => setValue('parking_options.nearby_parking_lot', true, { shouldValidate: true, shouldDirty: true })}
                                    checked={parking_options.nearby_parking_lot === true}
                                />
                                Yes
                            </label>
                            <label className="flex items-center gap-1 text-gray-700 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    value="no"
                                    onChange={() => setValue('parking_options.nearby_parking_lot', false, { shouldValidate: true, shouldDirty: true })}
                                    checked={parking_options.nearby_parking_lot === false}
                                />
                                No
                            </label>
                        </div>
                    </div>
                </div>

                {/* Arrival instructions */}
                <div className="space-y-3">
                    <Label className="text-zinc-800 text-base font-semibold">
                        Arrival instructions
                    </Label>
                    <Textarea
                        placeholder="Directions, building access details, etc. (Optional) Min characters to be 50 characters and maximum to be 300 characters."
                        className="min-h-[100px]"
                        {...register('arrival_instructions')}
                    />
                    {errors.arrival_instructions && (
                        <p className="text-red-500 text-xs">{errors.arrival_instructions.message}</p>
                    )}
                </div>

                {/* Amenities */}
                {amenities.length !== 0 && (
                    <div className="space-y-4">
                        <Label className="text-zinc-800 text-base font-semibold">
                            Amenities Available
                        </Label>
                        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4">
                            {amenities.map((amenity) => (
                                <div key={amenity.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={amenity.id + ''}
                                        checked={amenities_id.includes(amenity.id)}
                                        onCheckedChange={() => toggleAmenity(amenity.id)}
                                        className="cursor-pointer"
                                    />
                                    <label
                                        htmlFor={amenity.id + ''}
                                        className="text-gray-700 text-sm cursor-pointer"
                                    >
                                        {amenity.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.amenities_id && (
                            <p className="text-red-500 text-xs">{errors.amenities_id.message}</p>
                        )}
                    </div>
                )}
            </div>
            <div className="w-full flex justify-end gap-4 items-end h-20">
                <Button
                    type="button"
                    disabled={isPending}
                    variant="outline"
                    onClick={handleGoBack}
                >
                    Go Back
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    variant={isPending ? 'disabled' : 'default'}
                >
                    Continue
                </Button>
            </div>
        </form>
    );
};

export default Step2;
