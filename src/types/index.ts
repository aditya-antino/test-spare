import {
    PersonProps,
    TestimonialCardProps,
    TestimonialProps,
    TestimonialCarouselProps,
    TestimonialAvatarProps,
} from './@types.testimonial';
export interface SignupData {
    email: string;
    password: string;
    roleId: number;
}

export interface Activity {
    name: string;
    ids: number[];
}

export interface VerifyOtpData {
    countryCode: string;
    phoneNumber: string;
    otp: string;
}

export interface UpdateProfileData {
    firstName: string;
    lastName: string;
    dob: Date | undefined;
    gender: string;
    avatar: string;
}

export type {
    PersonProps,
    TestimonialProps,
    TestimonialCardProps,
    TestimonialCarouselProps,
    TestimonialAvatarProps,
};

export * from './auth.types';
export * from './common.types';
export * from './spaces.types';
export * from './reservations.types';
export * from './calendar.types';
export * from './reviews.types';
export * from './user.types';
export * from './earnings.types';
export * from './booking.types';
