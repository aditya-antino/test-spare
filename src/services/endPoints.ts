// apis/index.js
export const endpoints = {
    // auth paths
    GET_ROLE_IDS: '/auth/roles',
    AUTH_LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    AUTH_LOGOUT: `/auth/logout`,
    AUTH_SIGNUP: '/auth/sign-up',
    SEND_MOBILE_OTP: 'auth/send-mobile-otp',
    VERIFY_MOBILE_OTP: '/auth/verify-mobile-otp',
    //***** OTP verification during login *****\\
    SEND_PHONE_LOGIN_OTP: '/auth/send-phone-login-otp',
    VERIFY_PHONE_LOGIN_OTP: '/auth/verify-phone-login-otp',
    AUTH_PHONE_SIGNUP: '/auth/phone-signup',
    VERIFY_PHONE_SIGNUP_OTP: '/auth/verify-phone-signup',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    AUTH_PROFILE: '/auth/profile',
    AUTH_ADD_EMAIL_TO_ACCOUNT: '/auth/add-email',
    AUTH_GOOGLE_LOGIN: '/auth/google-login',
    AUTH_RESET_PASSWORD: '/auth/reset-password',
    AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
    UPLOAD_IMAGE: '/auth/upload',
    UPLOAD_IMAGE_WITH_WATERMARK: '/auth/upload?addWatermark=true',
    UPDATE_GUEST_TO_HOST: '/auth/ensure-host-role',
    GET_SPARE_PRICES: (id: number) => `host/space-prices?spaceId=${id}`,
    GET_AVATARS: (gender: string) => (gender === 'other' ? 'avatar' : `avatar?gender=${gender}`),
    UPDATE_AVATAR: '/auth/profile/avatar',

    // Properties
    GET_PROPERTIES: '/properties',
    GET_PROPERTY: '/properties/:id',

    // Spaces
    GET_SPACES: '/spaces',
    GET_SPACE: '/spaces/:id',

    // Reservations
    GET_RESERVATIONS: '/reservations',
    GET_RESERVATION: '/reservations/:id',
    GET_RESERVATION_PAYOUT: '/reservations/:id/payout',
    EXPORT_RESERVATIONS: '/host/reservations/export',

    // Calendar
    GET_CALENDAR: '/host/calendar',
    GET_DAILY_CALENDAR: '/calendar/daily',
    GET_CALENDAR_EVENTS: '/calendar/events',
    EDIT_LISITNG: '/host/edit-listing',
    ADD_BLOCK_SLOT: '/host/add-block-slot',
    GET_BLOCK_TIME_SLOTS: '/host/get-block-slots',
    DELETE_BLOCK_TIME_SLOT: '/host/delete-block-slot',

    // Reservations
    HOST_RESERVATION_LIST: '/host/reservation-list',
    HOST_SPACE_LIST: '/host/space-list',
    HOST_SPACE_LIST_FILTER: '/host/space-list/filter',
    HOST_CANCELLATION_REASONS: '/host/cancellation-reasons',
    HOST_REJECT_BOOKING: '/host/reject-booking',
    HOST_CANCEL_BOOKING: '/host/cancel-booking',
    HOST_APPROVE_BOOKING: '/host/approve-booking',
    HOST_REVIEW: '/host/review',
    HOST_UPDATE_REVIEW_FLAG: '/host/update-review-flag',
    GET_SPACE_SPACE_DETAILS: 'host/space-details',
    DEACTIVATE_SPACE: '/host/spaces/bulk-deactivate',
    DELETE_SPACE: '/host/spaces/bulk-delete',
    CANCEL_BULK_BOOKING: '/host/bookings/bulk-cancel',
    GUEST_SPACE_LIST: '/guest/spaces',
    GUEST_SPACE_DETAILS: '/guest/spaces/:slug',
    GUEST_AUTH_SPACE_DETAILS: '/guest/auth/spaces/:slug',
    GUEST_REQUEST_BOOKING: '/guest/request-booking',
    GUEST_BOOKING_DETAILS: '/guest/setting',
    GUEST_CANCELLATION_POLICY: '/guest/policies',
    GUEST_HOST_PROFILE: '/guest/host-spaces',
    GUEST_BOOKING_CALENDAR: '/guest/{spaceId}/non-operating-days',
    GUEST_BOOKING_TIME_SLOTS: '/guest/{spaceId}/space-availability',
    GUEST_SPACE_CATEGORIES: '/guest/categories',
    GUEST_BOOKING_STATUS: '/guest/booking/status',
    GUEST_ADD_COMMENT: '/guest/comment',
    GUEST_ADD_RATINGS: '/guest/rating',
    GUEST_SPACE_LIST_AUTH: '/guest/auth/spaces',
    HOST_CANCELLATION_DATA: `/host/apply-penalty`,

    // earning
    GET_MONTHLY_REVENUE: (page: number) =>
        `/host/earnings/time-wise-reports/monthly?page=${page}&limit=4`,
    GET_YEARLY_REVENUES: (page: number) =>
        `/host/earnings/time-wise-reports/yearly?page=${page}&limit=4`,
    GET_TIME_WISE_REPORT_DETAILS: (year: string, month: string, spaceId?: number) => {
        let endpoint = `/host/earnings/time-wise-reports/details?year=${year}&month=${month}`;
        if (spaceId !== undefined && spaceId !== null) {
            endpoint += `&spaceId=${spaceId}`;
        }
        return endpoint;
    },
    GET_SPACE_WISE_REVENUE: (page: number, isPending: boolean) => {
        if (isPending) {
            return `host/listings?page=${page}&limit=4&isPending=${true}`;
        }
        return `host/listings?page=${page}&limit=4&isPending=${false}`;
    },
    GET_SPACE_WISE_REPORT_DETAILS: (
        spaceID: string | number,
        queryParams?: { startDate?: string; endDate?: string },
    ) => {
        let endpoint = `host/earnings/property-wise-reports/details/${spaceID}`;

        const params: Record<string, string | number> = {};

        if (queryParams) {
            if (queryParams.startDate) params.startDate = queryParams.startDate;
            if (queryParams.endDate) params.endDate = queryParams.endDate;
        }

        const queryString = new URLSearchParams(params as Record<string, string>).toString();

        if (queryString) {
            endpoint += `?${queryString}`;
        }

        return endpoint;
    },

    GET_EARNINGS: '/host/earnings',
    GET_HOST_SPACES: `host/listings`,
    // DDL
    GET_CITIES: '/auth/cities',
    GET_LANGUAGES: '/auth/languages',

    // form
    GET_CATEGORIES: '/host/categories',
    GET_SPACE_TYPES: (id?: number) =>
        id !== undefined ? `/host/space-types?categoryId=${id}` : `/host/space-types`,
    GET_FORM_CITIES: '/host/cities',
    GET_AMENITIES: (id?: number) =>
        id !== undefined ? `/host/amenities?categoryId=${id}` : `/host/amenities`,
    GET_ACTIVITIES: (id?: number) =>
        id !== undefined ? `/host/activities?categoryId=${id}` : `/host/activities`,
    GET_RULES: '/host/rules',
    EDIT_SPACE_STEP_1: '/host/edit-space',
    SPACE_STEP_1: '/host/space-step-1',
    SPACE_STEP_2: '/host/space-step-2',
    SPACE_STEP_3: '/host/space-step-3',
    SPACE_STEP_4: '/host/space-step-4',
    SPACE_STEP_5: '/host/space-step-5',
    SPACE_STEP_6: '/host/space-step-6',
    SPACE_STEP_7: '/host/space-step-7',
    SPACE_STEP_8: '/host/space-step-8',
    SPACE_STEP_9: '/host/space-step-9',

    VERIFY_KYC: '/auth/verify-kyc',
    GET_KYC_DOCS: '/auth/kyc-docs',
    PAYOUT_DETAILS: '/host/payout-details',
    RAZORPAY_ORDER: '/payment/rzp/order',
    GUEST_INSTANT_BOOKING_ORDER: '/guest/instant-booking',

    GET_PUBLIC_CATEGORIES: `guest/search/what`,

    GET_BLOGS: '/blog',
    GET_BLOG_DETAILS: (slug: string) => `/blog/${slug}`,

    GET_ARTICLES: (articleType: string) => `/article?articleType=${articleType}`,
    GET_ARTICLE_DETAILS: (slug: string) => `/article/${slug}`,
};
