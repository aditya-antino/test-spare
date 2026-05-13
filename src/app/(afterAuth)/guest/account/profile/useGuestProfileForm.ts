'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { profileSchema, type ProfileFormData } from '@/lib/schemas/profile.schema';
import {
    useGetCities,
    useGetLanguages,
    useGetProfile,
    useUpdateProfile,
    useUploadImage,
} from '@/services';
import dayjs from 'dayjs';
import { handleApiError } from '@/hooks/handleApiError';
import default_avtar from '../../../../../assets/default-avtar.svg';

export const useGuestProfileForm = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);

    const { data: details, isLoading: detailsLoading, error, refetch } = useGetProfile();
    const { data: cities } = useGetCities();
    const { data: languages } = useGetLanguages();

    const ddlCity = cities?.data;
    const ddlLanguages = languages?.data;
    const profileDetails = details?.data;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: '',
            phoneNumber: '',
            email: '',
            myWork: '',
            city: '',
            about: '',
            Languages: [],
            avatar: null,
        },
    });

    const watchedAvatar = watch('avatar');

    useEffect(() => {
        if (profileDetails && ddlLanguages) {
            const langIds =
                ddlLanguages
                    ?.filter((item) => profileDetails.languages?.includes(item.name))
                    .map((item) => item.id) || [];

            reset({
                firstName: profileDetails.firstName ?? '',
                lastName: profileDetails.lastName ?? '',
                dateOfBirth: profileDetails.dob
                    ? dayjs(profileDetails.dob).format('YYYY-MM-DD')
                    : '',
                gender: profileDetails.gender ?? '',
                phoneNumber: profileDetails.phoneNumber ?? '',
                email: profileDetails.email ?? '',
                myWork: profileDetails.jobTitle ?? '',
                city: profileDetails.City?.name ?? '',
                about: profileDetails.about ?? '',
                Languages: langIds,
                avatar: profileDetails.avatar ?? null,
            });
            setPreview(profileDetails.avatar ?? null);
        }
    }, [profileDetails, ddlLanguages, reset]);

    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
        onSuccess: () => {
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            refetch();
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to update profile');
        },
    });

    const { mutate: uploadImage, isPending: isUploading } = useUploadImage({
        onSuccess: (data) => {
            const newAvatar = data.data?.[0]?.url;
            setValue('avatar', newAvatar);
            setPreview(newAvatar);
            toast.success(data.message || 'Image uploaded successfully');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Image upload failed');
        },
    });

    const convertHeicToJpeg = async (file: File): Promise<File> => {
        try {
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9,
            });

            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

            return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg',
            });
        } catch (error) {
            console.error('HEIC conversion error:', error);
            throw new Error('Failed to convert HEIC image');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            let file = e.target.files[0];

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('File size should be less than 5 MB');
                return;
            }

            const isHeic =
                file.name.toLowerCase().endsWith('.heic') ||
                file.name.toLowerCase().endsWith('.heif') ||
                file.type === 'image/heic' ||
                file.type === 'image/heif';

            if (isHeic) {
                try {
                    setIsConverting(true);
                    file = await convertHeicToJpeg(file);
                } catch (error) {
                    toast.error('Could not convert HEIC file');
                    return;
                } finally {
                    setIsConverting(false);
                }
            }

            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('files', file);
            uploadImage(formData);
        }
    };

    const onSubmit: SubmitHandler<ProfileFormData> = (data) => {
        const langNames =
            ddlLanguages
                ?.filter((item) => data.Languages.includes(item.id))
                .map((item) => item.name) || [];

        const payload: any = {
            firstName: data.firstName,
            lastName: data.lastName,
            dob: data.dateOfBirth ? dayjs(data.dateOfBirth).format('YYYY-MM-DD') : null,
            gender: data.gender,
            avatar: data.avatar,
        };

        payload.jobTitle = data.myWork?.trim() || "";
        if (data.city) {
            const city = ddlCity?.find((city: any) => city.name === data.city);
            if (city?.id) {
                payload.cityId = +city.id;
            }
        }
        if (langNames.length > 0) {
            payload.languages = langNames;
        }
        // Always include about field, even if empty, to allow clearing it
        payload.about = data.about?.trim() || '';

        updateProfile(payload);
    };

    const handleRemoveAvatar = () => {
        setValue('avatar', null);
        setPreview(default_avtar);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (profileDetails) {
            const langIds =
                ddlLanguages
                    ?.filter((item) => profileDetails.languages?.includes(item.name))
                    .map((item) => item.id) || [];

            reset({
                firstName: profileDetails.firstName ?? '',
                lastName: profileDetails.lastName ?? '',
                dateOfBirth: profileDetails.dob
                    ? dayjs(profileDetails.dob).format('YYYY-MM-DD')
                    : '',
                gender: profileDetails.gender ?? '',
                phoneNumber: profileDetails.phoneNumber ?? '',
                email: profileDetails.email ?? '',
                myWork: profileDetails.jobTitle ?? '',
                city: profileDetails.City?.name ?? '',
                about: profileDetails.about ?? '',
                Languages: langIds,
                avatar: profileDetails.avatar ?? null,
            });
            setPreview(profileDetails.avatar ?? default_avtar);
        }
    };

    return {
        register,
        handleSubmit: handleSubmit(onSubmit),
        errors,
        control,
        setValue,
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
        avatar: watchedAvatar,
        handleRemoveAvatar,
    };
};
