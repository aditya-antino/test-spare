import { GeoPoint, City } from './common.types';

export interface Space {
    id: number;
    title: string;
    description: string;
    address: string | null;
    location: GeoPoint | null;
    city: string | null;
    City: {
        city: string;
        state: string;
    };
    capacity: number;
    category_id: number;
    state: string;
    space_type_id: number;
    status: string;
    height_ft: number;
    size_sqft: number;
    created_at: string;
    updated_at: string;
    SpaceImages: Array<any>; // map to image carousel
    startTime?: string;
    endTime?: string;
    price?: number;
    rating?: number;
    reviews?: number;
    isWishlist?: boolean;
    type?: string;
    seats?: number;
    SpaceType?: { id: number; type: string };
    computed_status?: string;
    current_step?: number;
    discountAmount?: number;
    isRefundable?: boolean;
    slug: string;
    [key: string]: any;
}

export interface SpaceFilter {
    id: number;
    title: string;
    description: string;
    capacity: number;
    size_sqft: number;
    height_ft: number;
    status: string;
    address: string | null;
    location_type: string;
    location_coordinates: [number, number];
    location_crs_name: string;
    area: string;
    created_at: string;
    updated_at: string;
    total_reviews: string;
    avg_rating: string;
    space_images: {
        id: number;
        image_url: string;
        is_featured: boolean;
    }[];
    category_id: number;
    category_name: string;
    city_name: string;
    state_name: string;
    space_type_id: number;
    space_type: string;
    price_per_hour: string;
    operating_hours: {
        Monday: { is_open: boolean; sessions?: { from: string; to: string }[] };
        Tuesday: { is_open: boolean; sessions?: { from: string; to: string }[] };
        Wednesday: { is_open: boolean; sessions?: { from: string; to: string }[] };
        Thursday: { is_open: boolean; sessions?: { from: string; to: string }[] };
        Friday: { is_open: boolean; sessions?: { from: string; to: string }[] };
        Saturday: { is_open: boolean; sessions?: { from: string; to: string }[] };
        Sunday: { is_open: boolean; sessions?: { from: string; to: string }[] };
    };
    available_window_date: string | null;
}

export interface SpaceDetailsInterface {
    id: number;
    slug: string;
    isDeactivated: boolean;
    title: string;
    description: string;
    detailed_description: string;
    detailedDescription?: string;
    capacity: number;
    size_sqft: number;
    sizeSqft?: number;
    height_ft: number;
    heightFt?: number;
    status: string;
    address: string;
    reviewCount?: string | number;
    location: {
        crs: {
            type: string;
            properties: {
                name: string;
            };
        };
        type: string;
        coordinates: [number, number];
    };
    street: string;
    area: string;
    locality: string;
    pincode: number;
    created_at: string;
    updated_at: string;
    total_reviews: string;
    avg_rating: string;
    City: {
        city: string;
        state: string;
        [key: string]: any;
    };
    User: {
        id: number;
        first_name: string;
        last_name: string;
        avatar: string | null;
    };
    CategoryMaster: {
        id: number;
        name: string;
    };
    SpaceType: {
        id: number;
        type: string;
    };
    SpaceTypes?: {
        id: number;
        type: string;
    }[];
    SpaceListing: {
        cancellationPolicy: {
            key: string;
            message: string;
        };
        isRefundable: boolean;
        price_per_hour: string;
        min_booking_hours: number;
        extra_hour_price: string;
        instant_booking: boolean;
        extra_discount_per?: ExtraDiscountPer;
        cancellation_policy: string | null;
        operating_hours: {
            [day: string]: {
                is_open: boolean;
                sessions?: {
                    from: string;
                    to: string;
                }[];
            };
        };
        policies: {
            regulations: {
                space_meets_regulations: boolean;
            };
            booking_policies: {
                follow_booking_policies: boolean;
                understand_no_external_contracts: boolean;
            };
            payment_processing: {
                understand_service_fee: boolean;
                process_payments_on_platform: boolean;
            };
            platform_communication: {
                keep_conversations_on_platform: boolean;
            };
        }[];
        rules: {
            rule_id: string;
            rule_type: string;
        }[];
        custom_rules: string[];
        arrival_instructions: string;
        parking_options: {
            free_onsite: boolean;
            paid_onsite: boolean;
            nearby_parking_lot: boolean;
        };
        base_price_mon_thurs: string | null;
        base_price_fri_sun: string | null;
        discount_amount: number;
        advance_booking_days: number;
        available_window_date: string | null;
        verification_documents: {
            image: string;
            number: string;
            verification_doc_type: string;
        }[];
    };
    SpaceImages: {
        id: number;
        image_url: string;
        is_featured: boolean;
    }[];
    Amenities: {
        id: number;
        name: string;
    }[];
    Activities: any[];
    Reviews: any[];
    hostReviewStats: {
        total_reviews: string | number;
        avg_rating: string | number;
    };
}

export interface SpaceListData {
    count: number;
    rows: Space[];
}

export interface SpaceListResponse {
    success: boolean;
    message: string;
    data: SpaceListData;
}

export interface SpaceListStep1 {
    title: string;
    category_id: number;
    space_type_id: number[];
    activities_id: number[];
    capacity: number;
    short_description: string;
    detailed_description: string;
    detailedDescription?: string;
    size: number;
    height: number;
}

export interface EditSpaceStep1Payload {
    spaceId: number;
    body: SpaceListStep1;
}

export interface SpaceListStep2 {
    space_id: number;
    rules: Rule[];
    arrival_instructions?: string;
    parking_options: ParkingOptions;
    amenities_id: number[];
    is_edit: boolean;
}

export interface Rule {
    rule_id: string;
    rule_type: string;
}

export interface ParkingOptions {
    free_onsite: boolean;
    paid_onsite: boolean;
    nearby_parking_lot: boolean;
}

export interface SpaceImage {
    image_url: string;
    is_featured: boolean;
}

export interface SpaceListStep3 {
    space_id: number;
    images: SpaceImage[];
    is_edit?: boolean;
}

export interface SpaceListStep6 {
    space_id: number;
    price_per_hour: number;
    min_booking_hours: number;
    extra_hour_price: number;
    instant_booking: boolean;
    extra_discount_per?: ExtraDiscountPer;
}

export interface ExtraDiscountPer {
    four: number;
    six: number;
    eight: number;
    twelve: number;
}

export interface SpaceStep7Payload {
    space_id: number;
    policies: Policy[];
    custom_rules: string[];
}

export interface Policy {
    platform_communication: PlatformCommunication;
    payment_processing: PaymentProcessing;
    booking_policies: BookingPolicies;
    regulations: Regulations;
}

export interface PlatformCommunication {
    keep_conversations_on_platform: boolean;
}

export interface PaymentProcessing {
    process_payments_on_platform: boolean;
    understand_service_fee: boolean;
}

export interface BookingPolicies {
    follow_booking_policies: boolean;
    understand_no_external_contracts: boolean;
}

export interface Regulations {
    space_meets_regulations: boolean;
}

export interface VerificationDocument {
    verification_doc_type: 'ownership_proof' | 'pan_card' | 'gst_document';
    number?: string;
    image?: string;
}

export interface Step8Payload {
    spaceId: number;
    isRefundable: boolean;
    cancellationPolicy: {
        message: string;
        key: string;
    };
    is_edit: boolean;
}

export interface Step9Payload {
    space_id: number | string;
    verification_documents: VerificationDocument[];
}

export interface OperatingSession {
    from: string;
    to: string;
}

export interface OperatingDay {
    is_open: boolean;
    sessions?: OperatingSession[];
}

export interface SpaceStep4Payload {
    space_id: number;
    operating_hours: Record<string, OperatingDay>;
}

export interface Activity {
    id: number;
    activity: string;
}

export interface ActivitiesResponse {
    activities: Activity[];
}

export interface SpaceType {
    id: number;
    type: string;
}

export interface SpaceTypeResponse {
    success: boolean;
    data: {
        spaceTypes: SpaceType[];
    };
}

export interface Amenity {
    id: number;
    name: string;
}

export interface AmenitiesData {
    amenities: Amenity[];
}

export interface RuleItem {
    id: number;
    name: string;
}

export interface RulesData {
    rules: RuleItem[];
}

export interface EditListingPayload {
    spaceId: number;
    basePriceMonThurs: number;
    basePriceFriSun: number;
    discountAmount: number;
    minBookingHours: number;
    extraHoursPrice: number;
    advanceBookingDays: number;
    availableWindowDate: string;
}

export interface UpdateSpaceStep5Payload {
    space_id: number;
    location: {
        type: 'Point';
        coordinates: [number?, number?];
    };
    street: string;
    area: string;
    locality: string;
    city_id: number;
    pincode: number;
    is_edit: boolean;
}

export interface Category {
    id: number;
    name: string;
}

export interface CategoriesResponse {
    success: boolean;
    data: {
        categories: Category[];
    };
}

export interface GuestSpaceCategory {
    id: number;
    name: string;
}

export interface GuestSpaceCategoriesResponse {
    success: boolean;
    message: string;
    data: any[];
}
