'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { ProfileSkeleton } from '@/components/skeletons';
import { useGuestProfileForm } from './useGuestProfileForm';
import { Controller } from 'react-hook-form';
import default_avtar from '../../../../../assets/default-avtar.svg';

export default function ProfileClient() {
    const {
        register,
        handleSubmit,
        errors,
        control,
        isEditing,
        setIsEditing,
        preview,
        detailsLoading,
        error,
        ddlCity,
        ddlLanguages,
        isUpdating,
        isUploading,
        isConverting,
        handleFileChange,
        handleCancel,
        avatar,
        handleRemoveAvatar,
    } = useGuestProfileForm();

    const isProcessing = isUploading || isConverting;

    if (detailsLoading) return <ProfileSkeleton />;
    if (error) return <div className="text-red-500">Error loading profile: {error.message}</div>;

    return (
        <div className="flex w-full flex-col md:flex-row md:gap-36 md:py-16 pb-10">
            <div className="flex flex-col items-center py-8">
                <div className="relative w-40 h-40 rounded-full overflow-hidden">
                    <Image
                        src={preview || avatar || default_avtar}
                        alt="Profile Picture"
                        fill
                        className="object-cover"
                    />
                    {isEditing && (
                        <>
                            <div
                                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm cursor-pointer"
                                onClick={() =>
                                    !isProcessing && document.getElementById('file-upload')?.click()
                                }
                            >
                                {isUploading ? 'Uploading...' : 'Change Image'}
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".jpg,.jpeg,.png,.heic,.heif"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isProcessing}
                            />
                        </>
                    )}
                </div>
                {isEditing && (preview || avatar) && (
                    <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="mt-3 text-xs text-red-500 hover:underline"
                    >
                        Remove image
                    </button>
                )}
            </div>

            <div className="md:w-[70%]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Profile Details</h2>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <Input
                            label="First Name"
                            placeholder="John"
                            disabled={!isEditing}
                            {...register('firstName')}
                            className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-xs">{errors.firstName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="Last Name (optional)"
                            placeholder="Oliver"
                            disabled={!isEditing}
                            {...register('lastName')}
                            className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-xs">{errors.lastName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="Date of Birth"
                            type="date"
                            disabled={!isEditing}
                            {...register('dateOfBirth')}
                            className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}
                        />
                        {errors.dateOfBirth && (
                            <p className="text-red-500 text-xs">{errors.dateOfBirth.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700 text-base font-semibold">Gender</Label>
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={field.value}
                                    disabled={!isEditing}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}>
                                        <SelectValue placeholder="Select your gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.gender && (
                            <p className="text-red-500 text-xs">{errors.gender.message}</p>
                        )}
                    </div>

                    <Input
                        label="Phone number"
                        placeholder="Phone"
                        disabled={true}
                        {...register('phoneNumber')}
                        className="cursor-not-allowed bg-gray-50 opacity-70"
                    />
                    <Input
                        label="Email"
                        placeholder="Email"
                        disabled={true}
                        {...register('email')}
                        className="cursor-not-allowed bg-gray-50 opacity-70"
                    />

                    <div className="space-y-2">
                        <Input
                            label="My Work (optional)"
                            placeholder="Work"
                            disabled={!isEditing}
                            {...register('myWork')}
                            className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700 text-base font-semibold">
                            Where I live (optional)
                        </Label>
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    disabled={!isEditing}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}>
                                        <SelectValue placeholder="Select your city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ddlCity?.map((city: any) => (
                                            <SelectItem key={city.id} value={city.name}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {ddlLanguages && ddlLanguages.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-gray-700 text-base font-semibold">
                                Languages I Speak (optional)
                            </Label>
                            <Controller
                                name="Languages"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={ddlLanguages}
                                        value={field.value}
                                        valueKey="id"
                                        labelKey="name"
                                        disabled={!isEditing}
                                        onChange={field.onChange}
                                        placeholder="Select Languages"
                                    />
                                )}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Textarea
                            label="About You (optional)"
                            placeholder="Something about myself."
                            disabled={!isEditing}
                            {...register('about')}
                            className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}
                        />
                    </div>

                    {isEditing && (
                        <div className="flex gap-4">
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? 'Saving...' : 'Save'}
                            </Button>
                            <Button variant="outline" type="button" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
