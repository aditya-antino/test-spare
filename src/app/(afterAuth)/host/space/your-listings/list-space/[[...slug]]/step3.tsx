'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Typography from '@/components/ui/typoGraphy';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash, Star } from 'lucide-react';
import Image from 'next/image';
import FileUploadArea from '@/components/common/fileUploadArea/fileUploadArea';
import { useUpdateSpaceListStep3, SpaceDetailsInterface } from '@/services';
import { PATHS } from '@/constants/path';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema, Step3FormValues } from './schemas';
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    arrayMove,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Step3Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
}

const Step3 = ({ editData, isEdit }: Step3Props) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');

    const [isLoading, setIsLoading] = useState(isEdit === 'true');
    const isInitializedRef = useRef(false);

    const {
        setValue,
        watch,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<Step3FormValues>({
        resolver: zodResolver(step3Schema),
        defaultValues: {
            space_id: Number(spaceId),
            images: [],
        },
    });

    const images = watch('images') || [];

    const { mutate: updateSpaceImages, isPending } = useUpdateSpaceListStep3({
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit === 'true' ? '&isEdit=true' : '';
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=4${editParam}`);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to update images. Please try again.');
        },
    });

    useEffect(() => {
        if (isEdit === 'true' && editData && !isInitializedRef.current) {
            const mappedImages = editData.SpaceImages?.map((img) => ({
                image_url: img.image_url,
                is_featured: img.is_featured,
            })) || [];

            reset({
                space_id: Number(spaceId),
                images: mappedImages,
            });
            setIsLoading(false);
            isInitializedRef.current = true;
        }
    }, [editData, isEdit, spaceId, reset]);

    const handleFeatureUpload = (field: string, urls: string | string[]) => {
        const urlArray = Array.isArray(urls) ? urls : [urls];
        if (!urlArray.length) return;

        const currentRegular = images.filter((img) => !img.is_featured);
        if (currentRegular.length + 1 > 25) {
            setError('images', { message: 'Maximum 25 images allowed in total' });
            return;
        }

        const newFeatured = { image_url: urlArray[0], is_featured: true };
        setValue('images', [newFeatured, ...currentRegular], { shouldValidate: true });
        toast.success('Featured image set successfully.');
    };

    const handleSpaceImagesUpload = (field: string, urls: string | string[]) => {
        const urlArray = Array.isArray(urls) ? urls : [urls];
        const currentImages = images.length;
        const newTotal = currentImages + urlArray.length;

        if (newTotal > 25) {
            const remaining = 25 - currentImages;
            setError('images', { message: `Maximum 25 images allowed. You can only add ${remaining} more image(s)` });
            return;
        }

        const newImages = urlArray.map((url) => ({ image_url: url, is_featured: false }));
        // Keep existing order: featured first, then existing regular, then new regular
        const featured = images.filter(img => img.is_featured);
        const regular = images.filter(img => !img.is_featured);

        setValue('images', [...featured, ...regular, ...newImages], { shouldValidate: true });
        const count = urlArray.length;
        toast.success(`${count} image${count !== 1 ? 's' : ''} added successfully.`);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,     // drag starts only after moving 5px (prevents click conflict)
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // const oldIndex = regularImages.findIndex(i => i.id === active.id);
        // const newIndex = regularImages.findIndex(i => i.id === over.id);
        const oldIndex = regularImages.findIndex(
            (i) => i.image_url === active.id
        );
        const newIndex = regularImages.findIndex(
            (i) => i.image_url === over.id
        );

        const reorderedRegular = arrayMove(regularImages, oldIndex, newIndex);

        const reorderedFull = [
            ...images.filter(img => img.is_featured),
            ...reorderedRegular,
        ];

        setValue("images", reorderedFull, { shouldValidate: true });
    };

    // const removeImage = (index: number) => {
    //     const newImages = images.filter((_, i) => i !== index);
    //     setValue('images', newImages, { shouldValidate: true });
    // };
    const removeImage = (imageUrl: string) => {
        const newImages = images.filter((img) => img.image_url !== imageUrl);
        setValue('images', newImages, { shouldValidate: true });
    };


    // const setAsFeatured = (index: number) => {
    //     const newImages = images.map((img, i) => ({
    //         ...img,
    //         is_featured: i === index,
    //     }));
    //     // Optional: Re-sort to put featured first? Original code didn't strictly sort in state, but logic relied on filtering.
    //     // But UI renders separate lists.
    //     setValue('images', newImages, { shouldValidate: true });
    // };
    const setAsFeatured = (imageUrl: string) => {
        const newImages = images.map((img) => ({
            ...img,
            is_featured: img.image_url === imageUrl,
        }));
        setValue('images', newImages, { shouldValidate: true });
    };


    const handleGoBack = () => {
        router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=2&isEdit=true`);
    };

    const onSubmit = (data: Step3FormValues) => {
        updateSpaceImages({
            ...data,
            is_edit: isEdit === 'true',
        });
    };

    const featuredImages = images.filter((img) => img.is_featured);
    const regularImages = images.filter((img) => !img.is_featured);
    const totalImages = images.length;
    const canAddMore = totalImages < 25;

    function SortableImageItem({ image, setAsFeatured, removeImage }) {
        const { attributes, listeners, setNodeRef, transform, transition } =
            useSortable({ id: image.image_url });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                className="relative border rounded-lg overflow-hidden group"
            >
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing"
                >
                    <Image
                        src={image.image_url}
                        alt="Space Image"
                        width={150}
                        height={150}
                        className="object-cover w-full h-36 select-none"
                        draggable={false}    
                    />
                </div>

                {/* Hover actions (NOT draggable) */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            type="button"
                            onClick={() => setAsFeatured(image.image_url)}
                            className="bg-amber-500 text-white rounded-full p-2"
                        >
                            <Star className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => removeImage(image.image_url)}
                            className="bg-red-500 text-white rounded-full p-2"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-8 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-20 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6CD28]"></div>
                    <Typography weight="medium" color="text-gray-600" size="lg">
                        Loading images...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-200">
                <div className="space-y-2">
                    <Typography weight="semibold" color="text-gray-900" size="2xl">
                        Images
                    </Typography>
                    <div className="text-gray-500 text-sm">
                        Requirements: Horizontal orientation, color, no watermarks
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="text-zinc-800 text-base font-semibold">
                            Featured Image
                        </Label>
                        <div className="text-gray-500 text-sm mt-1">
                            Upload one featured image. ({totalImages}/25 images total)
                        </div>
                    </div>

                    {featuredImages.length === 0 && canAddMore && (
                        <FileUploadArea
                            fieldName="featureImage"
                            onUploadSuccess={handleFeatureUpload}
                            title="Upload featured image"
                            subtitle=""
                            fileTypes="PNG, JPG, JPEG, HEIC up to 10MB"
                            isOptional={false}
                            multiple={false}
                            addWatermark={true}
                            allowedExtensions={['png', 'jpg', 'jpeg', 'heic']}
                        />
                    )}

                    {!canAddMore && featuredImages.length === 0 && (
                        <div className="border-2 h-60 w-80 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <div className="text-sm font-medium">
                                    Maximum image limit reached
                                </div>
                                <div className="text-xs">
                                    Remove some images to add a featured image
                                </div>
                            </div>
                        </div>
                    )}

                    {featuredImages.length > 0 && (
                        <div className="space-y-4">
                            <div className="relative w-80 h-60 border rounded-lg overflow-hidden group">
                                <Image
                                    src={featuredImages[0].image_url}
                                    alt="Featured Image"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-2 left-2">
                                    <div className="bg-amber-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Star className="w-3 h-3" fill="white" />
                                        Featured
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // To remove featured, we find its index in main array
                                            // The main array order matters for index based removal in `removeImage`.
                                            // Here simpler: filter out featured image.
                                            const others = images.filter(img => !img.is_featured);
                                            setValue('images', others, { shouldValidate: true });
                                        }}
                                        className="bg-red-500 text-white rounded-full p-2"
                                    >
                                        <Trash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="text-zinc-800 text-base font-semibold">
                            Space Images
                        </Label>
                        <div className="text-gray-500 text-sm mt-1">
                            Upload at least 3 high-quality photos of your space. Maximum 25 images
                            total.
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                            Current: {regularImages.length} regular image(s) +{' '}
                            {featuredImages.length} featured = {totalImages}/25 total
                        </div>
                    </div>

                    {canAddMore && (
                        <FileUploadArea
                            fieldName="spaceImages"
                            onUploadSuccess={handleSpaceImagesUpload}
                            title="Upload space images"
                            subtitle=""
                            fileTypes="PNG, JPG, JPEG, HEIC up to 10MB each"
                            isOptional={false}
                            multiple
                            addWatermark={true}
                            allowedExtensions={['png', 'jpg', 'jpeg', 'heic']}
                        />
                    )}

                    {!canAddMore && (
                        <div className="border-2 h-60 w-80 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <div className="text-sm font-medium">
                                    Maximum image limit reached (25/25)
                                </div>
                                <div className="text-xs">Remove some images to add more</div>
                            </div>
                        </div>
                    )}

                    {regularImages.length > 0 && (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                                {regularImages.length} regular image(s) uploaded (minimum 3
                                required)
                            </div>
                            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={regularImages.map(img => img.image_url)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {/* {regularImages.map((image, index) => {
                                            // Find index in main `images` array to control it
                                            // Main array might be mixed.
                                            // `setAsFeatured` expects index in main array.
                                            // `removeImage` expects index in main array.
                                            // We need to match this image to the main array.
                                            // Since duplicates allowed? No, URLs unique likely.
                                            // But safer to assume stable sort?
                                            // In `handleSpaceImagesUpload` I appended new (regular) at end.
                                            // So finding index via reference or URL.
                                            const realIndex = images.indexOf(image);

                                            return (
                                                <div
                                                    key={index}
                                                    className="relative border rounded-lg overflow-hidden group"
                                                >
                                                    <Image
                                                        src={image.image_url}
                                                        alt={`Space Image ${index + 1}`}
                                                        width={150}
                                                        height={150}
                                                        className="object-cover w-full h-36"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setAsFeatured(realIndex)}
                                                            className="bg-amber-500 text-white rounded-full p-2"
                                                            title="Set as featured cursor-pointer"
                                                        >
                                                            <Star className="w-4 h-4 cursor-pointer" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(realIndex)}
                                                            className="bg-red-500 text-white rounded-full p-2 cursor-pointer"
                                                            title="Remove image"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })} */}
                                        {regularImages.map((image, index) => (
                                            <SortableImageItem
                                                key={image.image_url || index}
                                                image={image}
                                                setAsFeatured={setAsFeatured}
                                                removeImage={removeImage}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}

                    {errors.images && <div className="text-red-500 text-sm">{errors.images.message}</div>}
                </div>
            </div>

            <div className="w-full flex justify-end gap-4 items-end h-20">
                <Button type="button" disabled={isPending || isSubmitting} variant="outline" onClick={handleGoBack}>
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

export default Step3;
