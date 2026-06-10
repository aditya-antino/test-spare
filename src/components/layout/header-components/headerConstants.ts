import { PATHS } from '@/constants/path';

export const HOST_ACCOUNT_OPTIONS = [
    { key: 1, title: 'Reservations', link: PATHS.RESERVATIONS || '#' },
    { key: 2, title: 'Earnings', link: PATHS.HOST_EARNINGS_ANALYTICS || '#' },
    { key: 3, title: 'Calendar', link: PATHS.HOST_CALENDAR || '#' },
    { key: 4, title: 'Your Listings', link: PATHS.YOUR_LISTING || '#' },
    { key: 5, title: 'Booking Requests', link: PATHS.HOST_BOOKING_REQUESTS || '#' },
    { key: 6, title: 'Chats', link: PATHS.HOST_CHAT_MESSAGES || '#' },
    { key: 7, title: 'Account', link: PATHS.HOST_PROFILE || '#' },
];

export const GUEST_ACCOUNT_OPTIONS = [
    { key: 1, title: 'Bookings', link: PATHS.GUEST_MY_BOOKINGS || '#' },
    { key: 2, title: 'Wishlist', link: PATHS.GUEST_WISHLISTS || '#' },
    { key: 3, title: 'Account', link: PATHS.GUEST_PROFILE || '#' },
];
