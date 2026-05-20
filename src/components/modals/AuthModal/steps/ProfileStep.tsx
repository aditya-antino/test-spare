'use client';

import React, { useState } from 'react';
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
import dayjs from 'dayjs';
import { useGetAvatars } from '@/services';
import { SkeletonBase } from '@/components/skeletons';
import { cn } from '@/lib/utils';

interface ProfileStepProps {
    onComplete: (data: {
        firstName: string;
        lastName: string;
        dob: Date;
        gender: string;
        avatar: string;
    }) => void;
    isSubmitting: boolean;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ onComplete, isSubmitting }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [gender, setGender] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');

    const { data: avatarsData, isLoading: isAvatarsLoading } = useGetAvatars(gender || 'other');

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

        onComplete({
            firstName,
            lastName,
            dob: dob as Date,
            gender,
            avatar: selectedAvatar,
        });
    };

    return (
        <div className="w-full flex flex-col py-4 space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
                <Typography size="lg" weight="bold" className="text-gray-900">
                    Complete Your Profile
                </Typography>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 w-full text-left">
                {/* First Name */}
                <div className="space-y-1">
                    <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                        First Name
                    </Typography>
                    <Input
                        type="text"
                        placeholder="Enter first name"
                        required
                        className="rounded-2xl h-11"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                    <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                        Last Name
                    </Typography>
                    <Input
                        type="text"
                        placeholder="Enter last name"
                        required
                        className="rounded-2xl h-11"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                {/* DOB & Gender */}
                <div className="flex gap-4">
                    <div className="w-1/2 space-y-1">
                        <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                            Date of Birth
                        </Typography>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="rounded-2xl w-full h-11 items-center text-gray-700 justify-between text-left font-normal border-gray-200"
                                    disabled={isSubmitting}
                                >
                                    <span className="truncate">
                                        {dob ? dayjs(dob).format('DD MMM YYYY') : 'Select date'}
                                    </span>
                                    <ChevronDown className="text-gray-400 h-4 w-4 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 z-[9000]" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dob}
                                    onSelect={setDob}
                                    fromYear={1950}
                                    toYear={new Date().getFullYear()}
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="w-1/2 space-y-1">
                        <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                            Gender
                        </Typography>
                        <Select value={gender} onValueChange={(val) => { setGender(val); setSelectedAvatar(''); }} disabled={isSubmitting}>
                            <SelectTrigger className="rounded-2xl h-11 border-gray-200">
                                <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent className="z-[9000]">
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Avatar Selection (Only show after gender is selected) */}
                {gender && (
                    <div className="space-y-2 pt-2 animate-in fade-in duration-500">
                        <Typography size="xs" color="text-gray-700" weight="medium" className="ml-1">
                            Select Avatar
                        </Typography>
                        {isAvatarsLoading ? (
                            <div className="grid grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <SkeletonBase key={i} variant="circle" className="w-12 h-12 mx-auto" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-3 max-h-[140px] overflow-y-auto py-1">
                                {avatarsData?.data?.map((avatar, index) => (
                                    <div
                                        key={avatar.id}
                                        className={cn(
                                            "relative w-12 h-12 rounded-full cursor-pointer transition-all duration-300 p-0.5 mx-auto",
                                            selectedAvatar === avatar.avatarUrl 
                                                ? "ring-2 ring-[#f6cd28] ring-offset-1 scale-105" 
                                                : "hover:scale-105 opacity-80 hover:opacity-100"
                                        )}
                                        onClick={() => setSelectedAvatar(avatar.avatarUrl)}
                                    >
                                        <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm">
                                            <Image
                                                width={64}
                                                height={64}
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

                {/* Continue button */}
                <Button
                    type="submit"
                    className="w-full rounded-full h-12 bg-[#F6CD28] hover:bg-[#E5BD24] text-gray-900 font-bold text-base shadow-none transition-all mt-4"
                    disabled={!isFormValid || isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Continue'}
                </Button>
            </form>
        </div>
    );
};

export default ProfileStep;
