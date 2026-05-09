import { TestimonialCardProps } from '@/types';
import { IMAGE_URL } from './app';
import {
    arsheya,
    arsheyaCompany,
    aryan,
    aryanCompany,
    ayaan,
    ayaanCompany,
    manika,
    manikaCompany,
    nandika,
    nandikaCompany,
    puneet,
    puneetCompany,
} from '@/assets';

export * from './validation';
export * from './theme';
export * from './app';

export const termsAndPrivacyLastUpdated = '18-09-2025';
export const ROW_LIMIT = 10;
export const HOST_PLATFORM_FEE_PER = 10;
export const HOST_TDS_PER = 0.1;
export const SLOT_HEIGHT = 64;

export const TESTIMONIALS: TestimonialCardProps[] = [
    {
        name: 'Nandika K.',
        avatarUrl: nandika,
        testimonial:
            "As a marketing agency, we're always hunting for fresh shoot spaces. Spare Space makes it easy with plenty of diverse and styled options. It's been a game-changer in keeping our content creative and our brands happy.",
        role: 'Chief Marketing Officer',
        organizationName: 'dotMCBC',
        organizationAvatarUrl: nandikaCompany,
    },
    {
        name: 'Arsheya O.',
        avatarUrl: arsheya,
        testimonial:
            'We were looking for a large industrial setup with both indoor and outdoor options, but our search led nowhere. Even with our highly specific requirements, Spare Space helped us find the perfect location effortlessly!',
        role: 'Founder & CEO',
        organizationName: '&then_some',
        organizationAvatarUrl: arsheyaCompany,
    },
    {
        name: 'Puneet K.',
        avatarUrl: puneet,
        testimonial:
            'We manage events for a lot of corporates and brands, so finding spaces to host them quickly is key. Spare Space has helped us find some amazing venues, and the whole process has been super hassle-free.',
        role: 'Director',
        organizationName: 'Brand Connect India',
        organizationAvatarUrl: puneetCompany,
    },
    {
        name: 'Ayaan H.',
        avatarUrl: ayaan,
        testimonial:
            "From warehouses to rooftops, Spare Space keeps surprising me with the sickest spots. Booking's easy — I just show up and play.",
        role: 'Artist / DJ',
        organizationName: undefined,
        organizationAvatarUrl: ayaanCompany,
    },
    {
        name: 'Aryan V.',
        avatarUrl: aryan,
        testimonial:
            'As a producer with 3+ years in the film industry, the biggest struggle has always been finding the perfect space in a time crunch. Spare Space makes it possible with a seamless, wide range of options.',
        role: 'Producer',
        organizationName: 'Jugaad Motion Pictures',
        organizationAvatarUrl: aryanCompany,
    },
    {
        name: 'Manika C.',
        avatarUrl: manika,
        testimonial:
            'I needed a real kitchen for my Well Seasoned campaign shoot, not just a set — and Spare Space found me the perfect one. It felt effortless, personal, and exactly right for my story.',
        role: 'Chef & Founder',
        organizationName: 'Well Seasoned',
        organizationAvatarUrl: manikaCompany,
    },
];
