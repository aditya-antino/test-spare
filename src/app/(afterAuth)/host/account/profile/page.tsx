'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
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
import dummy from '@/assets/Login.png';
import {
    useGetCities,
    useGetLanguages,
    useGetProfile,
    useUpdateProfile,
    useUploadImage,
} from '@/services';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { handleApiError } from '@/hooks/handleApiError';
import default_avtar from '../../../../../assets/default-avtar.svg';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);

    const { data: details, isLoading, error, refetch } = useGetProfile();
    const { data: cities } = useGetCities();
    const { data: languages } = useGetLanguages();

    const ddlCity = cities?.data;
    const ddlLanguages = languages?.data;

    const profileDetails = details?.data;

    const { mutate: handleUpdateProfile, isPending: isUpdating } = useUpdateProfile({
        onSuccess: (data) => {
            refetch();
        },
        onError: (err: any) => {
            toast.error(err?.message);
            console.error('Profile update failed:', err);
        },
    });

    const { mutate: uploadImage, isPending: isUploading } = useUploadImage({
        onSuccess: (data) => {
            setProfileDetails('avatar', data.data?.[0]?.url);
            toast.success(data.message);
        },
        onError: (err: any) => {
            toast.error(err.message);
        },
    });

    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        myWork: '',
        email: '',
        city: '',
        about: '',
        Languages: [],
        avatar: null as string | null,
    });

    useEffect(() => {
        if (profileDetails) {
            const langIds =
                ddlLanguages
                    ?.filter((item) => profileDetails.languages?.includes(item.name))
                    .map((item) => item.id) || [];

            setProfile({
                firstName: profileDetails.firstName ?? '',
                lastName: profileDetails.lastName ?? '',
                dateOfBirth: profileDetails.dob
                    ? dayjs(profileDetails.dob).format('YYYY-MM-DD')
                    : '',
                gender: profileDetails.gender ?? '',
                phoneNumber: profileDetails.phoneNumber ?? '',
                myWork: profileDetails.jobTitle ?? '',
                city: profileDetails.City?.name ?? '',
                about: profileDetails.about ?? '',
                Languages: langIds,
                email: profileDetails.email ?? '',
                avatar: profileDetails.avatar ?? null,
            });
        }
    }, [profileDetails, ddlLanguages]);

    const setProfileDetails = (key: keyof typeof profile, value: any) => {
        setProfile((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = () => {
        if (!profile.firstName?.trim()) {
            toast.error('First name is required');
            return;
        }
        setIsEditing(false);

        const langNames =
            ddlLanguages
                ?.filter((item) => profile.Languages.includes(item.id))
                .map((item) => item.name) || [];

        try {
            const payload: any = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                dob: profile.dateOfBirth ? dayjs(profile.dateOfBirth).format('YYYY-MM-DD') : null,
                gender: profile.gender,
                avatar: profile.avatar,
            };

            if (profile.myWork?.trim()) {
                payload.jobTitle = profile.myWork;
            }
            if (profile.city) {
                const city = ddlCity?.find((city) => city.name === profile.city);
                if (city?.id) {
                    payload.cityId = +city.id;
                }
            }
            if (langNames.length > 0) {
                payload.languages = langNames;
            }
            // Always include about field, even if empty, to allow clearing it
            payload.about = profile.about?.trim() || '';

            handleUpdateProfile(payload, {
                onSuccess: () => {
                    toast.success('Profile updated successfully!');
                    setIsEditing(false);
                    refetch();
                },
            });
        } catch (error) {
            handleApiError(error);
        }
    };

    const convertHeicToJpeg = async (file: File): Promise<File> => {
        try {
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9,
            });

            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

            const convertedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg',
            });

            return convertedFile;
        } catch (error) {
            toast.error('Somthing went wrong! Please try again later..');
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
                    toast.error('Something went wrong!');
                    setIsConverting(false);
                    return;
                } finally {
                    setIsConverting(false);
                }
            }

            setFile(file);

            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('files', file);
            uploadImage(formData);
        }
    };

    const isProcessing = isUploading || isConverting;

    const handleRemoveAvatar = () => {
        setPreview(default_avtar);
        setProfileDetails('avatar', null);
    };

    if (isLoading) return <div className="text-center py-6">Loading profile...</div>;
    if (error) return <div className="text-red-500">Error loading profile: {error.message}</div>;

    return (
        <div className="flex w-full flex-col md:flex-row md:gap-36 md:py-16 pb-10">
            <div className="flex flex-col items-center py-8">
                <div className="relative w-40 h-40 rounded-full overflow-hidden">
                    <Image
                        src={preview || profile.avatar || default_avtar}
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
                {isEditing && (preview || profile.avatar) && (
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

                <div className="space-y-8">
                    <Input
                        label="First Name"
                        placeholder="John"
                        disabled={!isEditing}
                        value={profile.firstName}
                        onChange={(e) => setProfileDetails('firstName', e.target.value)}
                    />
                    <Input
                        label="Last Name (optional)"
                        placeholder="Oliver"
                        disabled={!isEditing}
                        value={profile.lastName}
                        onChange={(e) => setProfileDetails('lastName', e.target.value)}
                    />
                    <Input
                        label="Date of Birth"
                        type="date"
                        disabled={!isEditing}
                        value={profile.dateOfBirth || ''}
                        onChange={(e) => setProfileDetails('dateOfBirth', e.target.value)}
                    />

                    <div>
                        <Label className="text-gray-700 text-base font-semibold">Gender</Label>
                        <Select
                            disabled={!isEditing}
                            value={profile.gender}
                            onValueChange={(value) => setProfileDetails('gender', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Input
                        label="Phone number"
                        placeholder="Phone"
                        disabled={true}
                        value={profile.phoneNumber}
                        onChange={(e) => setProfileDetails('phoneNumber', e.target.value)}
                    />
                    <Input
                        label="Email"
                        placeholder="Email"
                        disabled={true}
                        value={profile.email}
                        onChange={(e) => setProfileDetails('email', e.target.value)}
                    />
                    <Input
                        label="My Work (optional)"
                        placeholder="Work"
                        disabled={!isEditing}
                        value={profile.myWork}
                        onChange={(e) => setProfileDetails('myWork', e.target.value)}
                    />

                    <div>
                        <Label className="text-gray-700 text-base font-semibold">
                            Where I live (optional)
                        </Label>
                        <Select
                            disabled={!isEditing}
                            value={profile.city}
                            onValueChange={(value) => setProfileDetails('city', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select your city" />
                            </SelectTrigger>
                            <SelectContent>
                                {ddlCity?.map((city) => (
                                    <SelectItem key={city.id} value={city.name}>
                                        {city.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {ddlLanguages?.length > 0 && (
                        <div>
                            <Label className="text-gray-700 text-base font-semibold">
                                Languages I Speak (optional)
                            </Label>
                            <MultiSelect
                                options={ddlLanguages}
                                value={profile.Languages}
                                valueKey="id"
                                labelKey="name"
                                disabled={!isEditing}
                                onChange={(value) => setProfileDetails('Languages', value)}
                                placeholder="Select Languages"
                            />
                        </div>
                    )}

                    <Textarea
                        label="About You (optional)"
                        placeholder="Something about myself."
                        disabled={!isEditing}
                        value={profile.about}
                        onChange={(e) => setProfileDetails('about', e.target.value)}
                    />

                    {isEditing && (
                        <div className="flex-1 flex justify-between items-start">
                            <Button onClick={handleSave}>Save</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
