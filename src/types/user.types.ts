import { City } from './common.types';

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    is_phone_verified: boolean;
    is_email_verified: boolean;
    is_profile_completed: boolean;
}

export interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dob: string;
    gender: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    isProfileCompleted: boolean;
    avatar?: string;
    address: string | null;
    cityId: number | null;
    jobTitle: string | null;
    about: string | null;
    status: string | null;
    created_at: string;
    updated_at: string;
    City: City | null;
    languages: string[];
    roles: number[];
}

export interface HostProfileParams {
    page?: number;
    limit?: number;
    categoryId?: number;
    hostId?: number;
}
