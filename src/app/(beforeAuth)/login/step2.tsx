'use client';

import Link from 'next/link';
import { PATHS } from '@/constants/path';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ChevronDown } from 'lucide-react';
import Typography from '@/components/ui/typoGraphy';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import React from 'react';
import dayjs from 'dayjs';
import { useGetAvatars } from '@/services';
import { SkeletonBase } from '@/components/skeletons';
import { cn } from '@/lib/utils';

interface Step3Props {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    dob?: Date;
    gender?: string;
    avatar?: string;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onDobChange: (date: Date | undefined) => void;
    onGenderChange: (value: string) => void;
    onAvatarChange: (value: string) => void;
    handleUpdateProfile: (data: {
        firstName: string;
        lastName: string;
        email?: string;
        password?: string;
        dob: Date;
        gender: string;
        avatar: string;
    }) => void;
    isSubmitting: boolean;
    isNewPhoneUser?: boolean;
}

const Step2: React.FC<Step3Props> = ({
    firstName,
    lastName,
    email,
    password,
    dob,
    gender,
    avatar: selectedAvatar,
    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    onPasswordChange,
    onDobChange,
    onGenderChange,
    onAvatarChange: setSelectedAvatar,
    handleUpdateProfile,
    isSubmitting,
    isNewPhoneUser,
}) => {
    const { data: avatarsData, isLoading } = useGetAvatars(gender || 'other');

    const isFormValid =
        firstName?.trim() !== '' &&
        lastName?.trim() !== '' &&
        dob !== undefined &&
        gender !== undefined &&
        gender !== '' &&
        selectedAvatar !== undefined &&
        selectedAvatar !== '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        handleUpdateProfile({
            firstName,
            lastName,
            dob: dob as Date,
            gender: gender as string,
            avatar: selectedAvatar as string,
        });
    };

    return (
        <div className="w-full mx-auto min-h-screen py-10 flex flex-col justify-center items-center text-center space-y-8">
            {/* Logo + heading */}
            <div className="space-y-2">
                <Link href={PATHS.HOME_PAGE} className="inline-block">
                    <Image src={logo} alt="Logo" width={219} height={112} className="mx-auto" />
                </Link>
                <Typography size="xs" color="text-gray-500" align="center">
                    Complete Your Profile
                </Typography>
            </div>

            {/* Form */}
            <form
                className="space-y-6 w-full max-w-sm text-left"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isFormValid) {
                        handleSubmit(e);
                    }
                }}
            >
                <div className="space-y-4">
                    {/* First Name */}
                    <div className="space-y-1">
                        <Typography size="xs" color="text-gray-700" weight="medium">
                            First Name
                        </Typography>
                        <Input
                            type="text"
                            placeholder="Mention the name as per your ID."
                            required
                            className="rounded-full"
                            value={firstName}
                            onChange={(e) => onFirstNameChange(e.target.value)}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1">
                        <Typography size="xs" color="text-gray-700" weight="medium">
                            Last Name
                        </Typography>
                        <Input
                            type="text"
                            placeholder="Mention the name as per your ID."
                            required
                            className="rounded-full"
                            value={lastName}
                            onChange={(e) => onLastNameChange(e.target.value)}
                        />
                    </div>

                    {/* DOB + Gender */}
                    <div className="flex md:gap-2 flex-col md:flex-row gap-6">
                        {/* Date Picker */}
                        <div className="w-full">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="rounded-full w-full items-center text-gray-700 justify-between text-left font-normal"
                                    >
                                        {dob ? dayjs(dob).format('DD MMM YYYY') : 'Date of Birth'}
                                        <ChevronDown className="text-gray-400 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dob}
                                        onSelect={onDobChange}
                                        fromYear={1950}
                                        toYear={new Date().getFullYear()}
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="w-full">
                            {/* Gender */}
                            <Select value={gender} onValueChange={onGenderChange}>
                                <SelectTrigger className="rounded-full">
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Avatar Selection (Only show after gender is selected) */}
                    {gender && (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                            <Typography size="xs" color="text-gray-700" weight="medium">
                                Select Avatar
                            </Typography>
                            {isLoading ? (
                                <div className="grid grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <SkeletonBase key={i} variant="circle" className="w-16 h-16 mx-auto" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-4">
                                    {avatarsData?.data?.map((avatar, index) => (
                                        <div
                                            key={avatar.id}
                                            className={cn(
                                                "relative w-16 h-16 rounded-full cursor-pointer transition-all duration-300 p-0.5",
                                                selectedAvatar === avatar.avatarUrl 
                                                    ? "ring-2 ring-[#f6cd28] ring-offset-2 scale-110" 
                                                    : "hover:scale-105 opacity-70 hover:opacity-100"
                                            )}
                                            onClick={() => setSelectedAvatar(avatar.avatarUrl)}
                                        >
                                            <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm border border-gray-100">
                                                <Image
                                                    width={100}
                                                    height={100}
                                                    src={avatar.avatarUrl}
                                                    alt={`Avatar ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Continue button */}
                <Button
                    type="submit"
                    className="w-full rounded-full h-11"
                    variant={isFormValid ? 'default' : 'outline'}
                    disabled={!isFormValid || isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Continue'}
                </Button>
            </form>
        </div>
    );
};

export default Step2;
