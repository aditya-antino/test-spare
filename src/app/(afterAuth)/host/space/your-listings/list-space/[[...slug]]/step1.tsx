'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Typography from '@/components/ui/typoGraphy';
import { Label } from '@/components/ui/label';
import {
    useUpdateSpaceListStep1,
    useGetActivities,
    useGetSpaceTypes,
    SpaceDetailsInterface,
    useEditSpaceListStep1,
    useGetCategories,
} from '@/services';
import { useRouter, useSearchParams } from 'next/navigation';
import { PATHS } from '@/constants/path';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setSpaceId } from '@/store/slice/spaceTypeSlice';
import { handleApiError } from '@/hooks/handleApiError';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, Step1FormValues } from './schemas';

interface Step1Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
    selectedCategoryId: number;
}

const Step1 = ({ editData, isEdit, selectedCategoryId }: Step1Props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');

    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(isEdit === 'true');
    const isEditDataLoadedRef = useRef(false);

    const [categorySelections, setCategorySelections] = useState<
        Record<
            number,
            {
                space_type_id: number[];
                activities_id: number[];
            }
        >
    >({});

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<Step1FormValues>({
        resolver: zodResolver(step1Schema) as any,
        defaultValues: {
            title: '',
            category_id: 0,
            space_type_id: [],
            activities_id: [],
            capacity: 0,
            short_description: '',
            detailed_description: '',
            size: undefined,
            height: undefined,
        },
    });

    const title = watch('title') || '';
    const category_id = watch('category_id');
    const space_type_id = watch('space_type_id') || [];
    const activities_id = watch('activities_id') || [];
    const capacity = watch('capacity');
    const short_description = watch('short_description') || '';
    const detailed_description = watch('detailed_description') || '';

    const { data: categoryDataResponse } = useGetCategories({});
    const categoryData = categoryDataResponse?.data?.categories ?? [];

    const { data: spaceTypesResponse } = useGetSpaceTypes(category_id, {
        enabled: !!category_id,
    });
    const spaceTypes = spaceTypesResponse?.data?.spaceTypes ?? [];

    const { data: activitiesResponse } = useGetActivities(category_id, {
        enabled: !!category_id,
    });
    const activities = activitiesResponse?.data?.activities ?? [];

    const { mutate: createSpace, isPending: isCreatePending } = useUpdateSpaceListStep1({
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', response?.data?.id] });
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${response?.data?.id}&step=2`);
        },
        onError: (error) => {
            handleApiError(error);
        },
    });

    const { mutate: editSpaceStep1, isPending: isEditPending } = useEditSpaceListStep1({
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit === 'true' ? '&isEdit=true' : '';
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=2${editParam}`);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const isPending = isCreatePending || isEditPending;

    useEffect(() => {
        if (isEdit === 'true' && editData && !isEditDataLoadedRef.current) {
            setIsLoading(true);

            const categoryId = editData.CategoryMaster?.id || 0;

            const timer = setTimeout(() => {
                reset({
                    title: editData.title || '',
                    category_id: categoryId,
                    space_type_id: editData.SpaceTypes?.map((item) => item.id) || [],
                    activities_id: editData.Activities?.map((activity) => activity.id) || [],
                    capacity: editData.capacity || 0,
                    short_description: editData.description || '',
                    detailed_description: editData.detailed_description || '',
                    size: editData.size_sqft || undefined,
                    height: editData.height_ft || undefined,
                });

                if (categoryId) {
                    dispatch(setSpaceId(categoryId));
                }

                isEditDataLoadedRef.current = true;
                setIsLoading(false);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [editData, dispatch, isEdit, reset]);

    const onSubmit: SubmitHandler<Step1FormValues> = (data) => {
        const payload = {
            ...data,
            size: data.size ?? 0,
            height: data.height ?? 0,
        };

        if (spaceId) {
            editSpaceStep1({ spaceId: Number(spaceId), body: payload });
        } else {
            createSpace(payload);
        }
    };

    const handleCategoryChange = (value: string) => {
        const newCategoryId = parseInt(value);
        const oldCategoryId = category_id;

        if (oldCategoryId) {
            setCategorySelections((prev) => ({
                ...prev,
                [oldCategoryId]: {
                    space_type_id: space_type_id,
                    activities_id: activities_id,
                },
            }));
        }

        const savedSelections = categorySelections[newCategoryId] || {
            space_type_id: [],
            activities_id: [],
        };

        setValue('category_id', newCategoryId);
        setValue('space_type_id', savedSelections.space_type_id);
        setValue('activities_id', savedSelections.activities_id);

        dispatch(setSpaceId(newCategoryId));
    };

    const handleSpaceTypeChange = (id: number, checked: boolean) => {
        const current = space_type_id || [];
        if (checked) {
            setValue('space_type_id', [...current, id]);
        } else {
            setValue(
                'space_type_id',
                current.filter((val) => val !== id),
            );
        }
    };

    const handleActivityChange = (id: number, checked: boolean) => {
        const current = activities_id || [];
        if (checked) {
            setValue('activities_id', [...current, id]);
        } else {
            setValue(
                'activities_id',
                current.filter((val) => val !== id),
            );
        }
    };

    const handleGoBack = () => {
        router.push(`${PATHS.YOUR_LISTING}`);
    };

    if (isEdit === 'true' && isLoading) {
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
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-20">
                <Typography weight="semibold" color="text-gray-900" size="2xl">
                    Space Brief
                </Typography>
                <div>
                    <Input
                        label="Space Brief"
                        placeholder="Give your space a title"
                        {...register('title')}
                        disabled={isLoading && isEdit === 'true'}
                        error={errors.title?.message}
                        maxLength={60}
                    />
                    <div className="flex justify-between text-zinc-600 text-sm italic mt-1">
                        <span>Maximum 60 characters</span>
                        <span>{title.length}/60</span>
                    </div>
                    <div className="mt-4 p-4 bg-[#FFFDF0] border border-[#F6CD28] rounded-lg">
                        <p className="text-sm text-zinc-700 leading-relaxed">
                            Create a descriptive title that highlights the look, vibe, or use of
                            your space. Titles containing brand names or actual business/space names
                            will not be accepted.{' '}
                            <span className="relative group inline-block">
                                <span className="text-[#B48F00] font-medium cursor-pointer underline decoration-[#B48F00] underline-offset-2">
                                    More Info
                                </span>
                                <span className="italic absolute left-1/2 top-full mt-2 w-80 -translate-x-1/2 scale-0 rounded-lg bg-gray-900 p-3 text-xs text-white shadow-lg transition-transform group-hover:scale-100 z-50">
                                    <span className="block mb-2 font-normal not-italic">
                                        Use a clear, experience-led title instead, for example:
                                    </span>
                                    “Sunlit Minimal Studio for Shoots & Workshops”
                                </span>
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 max-w-[400px] gap-6">
                    <div>
                        <Label className="text-zinc-800 text-base font-semibold">My Space is</Label>
                        <Controller
                            control={control}
                            name="category_id"
                            render={({ field }) => (
                                <Select
                                    onValueChange={handleCategoryChange}
                                    value={field.value ? String(field.value) : undefined}
                                    disabled={isLoading && isEdit === 'true'}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="My Space is" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryData?.map((space) => (
                                            <SelectItem key={space.id} value={String(space.id)}>
                                                {space.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category_id && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.category_id.message}
                            </p>
                        )}
                    </div>

                    {category_id > 0 && spaceTypes.length > 0 && (
                        <div>
                            <Label className="text-zinc-800 text-base font-semibold">
                                Type of Space
                            </Label>
                            <div className="flex flex-col gap-2 mt-2">
                                {spaceTypes.map((space) => (
                                    <div key={space.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`space-type-${space.id}`}
                                            className="cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28]"
                                            checked={space_type_id?.includes(space.id)}
                                            onCheckedChange={(checked) =>
                                                handleSpaceTypeChange(space.id, checked as boolean)
                                            }
                                            disabled={isLoading && isEdit === 'true'}
                                        />
                                        <label
                                            htmlFor={`space-type-${space.id}`}
                                            className="cursor-pointer text-zinc-800 text-sm font-normal"
                                        >
                                            {space.type}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {errors.space_type_id && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.space_type_id.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {category_id > 0 && activities.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-zinc-800 text-base font-semibold">
                            Activities Allowed
                        </Label>
                        <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`activity-${activity.id}`}
                                        className="cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28]"
                                        checked={activities_id?.includes(activity.id)}
                                        onCheckedChange={(checked) =>
                                            handleActivityChange(activity.id, checked as boolean)
                                        }
                                        disabled={isLoading && isEdit === 'true'}
                                    />
                                    <label
                                        htmlFor={`activity-${activity.id}`}
                                        className="cursor-pointer text-zinc-800 text-sm font-normal"
                                    >
                                        {activity.activity}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.activities_id && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.activities_id.message}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between max-w-[400px] space-y-2">
                    <Label className="text-zinc-800 text-base font-semibold">Attendees</Label>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="border-[#F6CD28] text-[#F6CD28]"
                            onClick={() => setValue('capacity', Math.max(0, (capacity || 0) - 1))}
                            disabled={isLoading && isEdit === 'true'}
                        >
                            -
                        </Button>
                        <input
                            type="text"
                            className="text-center w-16 border rounded px-2 py-1 outline-none border-none"
                            {...register('capacity')}
                            disabled={isLoading && isEdit === 'true'}
                        />
                        <Button
                            type="button"
                            className="border-[#F6CD28] text-[#F6CD28]"
                            variant="outline"
                            size="icon"
                            onClick={() => setValue('capacity', (capacity || 0) + 1)}
                            disabled={isLoading && isEdit === 'true'}
                        >
                            +
                        </Button>
                    </div>
                </div>
                {errors.capacity && (
                    <p className="text-red-500 text-sm">{errors.capacity.message}</p>
                )}

                <div>
                    <div className="text-zinc-800 text-base font-semibold">
                        Short description of your <span className="text-[#F6CD28]">Space</span> for
                        client
                    </div>
                    <Textarea
                        className="mt-4"
                        placeholder="Details about layout, features, activities"
                        {...register('short_description')}
                        maxLength={150}
                        disabled={isLoading && isEdit === 'true'}
                    />
                    {errors.short_description && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.short_description.message}
                        </p>
                    )}
                    <div className="flex justify-between text-zinc-600 text-sm italic my-1">
                        <span>Minimum 30, Maximum 150 characters</span>
                        <span>{short_description.length}/150</span>
                    </div>
                </div>

                <div>
                    <Typography color="text-gray-900" size="2xl" weight="semibold">
                        Detailed description of your <span className="text-[#F6CD28]">Space</span>
                        for client
                    </Typography>
                    <Textarea
                        className="mt-4"
                        placeholder="Mention best features, amenities, neighborhood info"
                        {...register('detailed_description')}
                        maxLength={1000}
                        disabled={isLoading && isEdit === 'true'}
                    />
                    {errors.detailed_description && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.detailed_description.message}
                        </p>
                    )}
                    <div className="flex justify-between text-zinc-600 text-sm italic my-1">
                        <span>Minimum 150, Maximum 1000 characters</span>
                        <span>{detailed_description.length}/1000</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 max-w-[400px]">
                    <Input
                        label="Size (Sq Ft) (Optional)"
                        placeholder="Area"
                        {...register('size')}
                        disabled={isLoading && isEdit === 'true'}
                        error={errors.size?.message}
                    />
                    <Input
                        label="Height (Ft) (Optional)"
                        placeholder="Height"
                        {...register('height')}
                        disabled={isLoading && isEdit === 'true'}
                        error={errors.height?.message}
                    />
                </div>
            </div>

            <div className="w-full flex justify-end gap-4 items-end h-20">
                <Button
                    type="button"
                    disabled={isPending || (isLoading && isEdit === 'true')}
                    variant="outline"
                    onClick={handleGoBack}
                >
                    Go Back
                </Button>
                <Button
                    type="submit"
                    disabled={isPending || (isLoading && isEdit === 'true')}
                    variant={isPending || (isLoading && isEdit === 'true') ? 'disabled' : 'default'}
                >
                    Continue
                </Button>
            </div>
        </form>
    );
};

export default Step1;
