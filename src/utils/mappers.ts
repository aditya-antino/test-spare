
import { Space } from '@/services';
import { BookingRequest } from '@/types/reservations';
import { Reservation } from '@/types/reservations.types';

//@ts-ignore
export const mapApiToSpace = (record: any): Space => ({
    id: record.id,
    title: record.title || '-',
    description: record.description || '',
    address: record.address || '',
    location: record.location || null,
    City: record.city ? { city: record.city, state: record.state } : null,
    SpaceImages: record.spaceImages || [],
    SpaceType: { id: 0, type: 'Workspace' },
    computed_status: 'live',
    isWishlist: true,
    current_step: 1,
    price: record.pricePerHour || 0,
    rating: record.avgRating || 0,
    reviews: record.reviewCount || 0,
    seats: record.capacity || 0,
    street: record.street || '',
    area: record.area || '',
    locality: record.locality || '',
    state: record.state || '',
    pincode: record.pincode || '',
    minBookingHours: record.minBookingHours || 1,
    operatingHours: record.operatingHours || {},
    basePriceMonThurs: record.basePriceMonThurs || null,
    basePriceFriSun: record.basePriceFriSun || null,
    detailedDescription: record.detailedDescription || '',
    discountAmount: record.discountAmount || 0,
    slug: record.slug,
});

export function transformBookingRequest(data: any): BookingRequest {
    const startDate = new Date(data.startDatetime || data.start_datetime || '');
    const endDate = new Date(data.endDatetime || data.end_datetime || '');

    return {
        id: data.id,
        spaceId: data.Space?.id,
        guestId: data.User?.id,
        CategoryMaster: data?.Space?.CategoryMaster,
        guest: `${data.User?.first_name || ''} ${data.User?.last_name?.[0] || ''}`.trim(),
        listing: data.Space?.title || 'N/A',
        spaceName: data.Space?.City?.city || data.Space?.title || 'N/A',
        activityCategory: data.Space?.CategoryMaster?.name || 'N/A',
        date: isNaN(startDate.getTime())
            ? ''
            : startDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
        startTime: isNaN(startDate.getTime())
            ? ''
            : startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            }),
        endTime: isNaN(endDate.getTime())
            ? ''
            : endDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            }),
        amount: Number(data.amount ?? 0),
        guestMessage: data.guestMessage ?? data.guest_message ?? 'N/A',
        User: data.User,
        status: data.status ?? 'PENDING',
        startDatetime: data.startDatetime || data.start_datetime || null,
        endDatetime: data.endDatetime || data.end_datetime || null,
        totalAmount: Number(data.totalAmount ?? data.amount ?? 0),
        guest_message: data.guestMessage,
        created_at: data.created_at ?? data.createdAt ?? null,
        updated_at: data.updated_at ?? data.updatedAt ?? null,
        attendees: data.attendees ?? 0,
        Space: data.Space ?? null,
        hostPlatformFeePer: data?.hostPlatformFeePer,
        hostTDSPer: data?.hostTDSPer,
        isGst: data?.isGst ?? false,
        hostGst: data?.hostGst ?? false,
    };
}

export function transformToReservation(data: any): Reservation | null {
    if (!data) return null;

    return {
        id: data.id,
        status: data.status,
        start_datetime: data.startDatetime || data.start_datetime || null,
        end_datetime: data.endDatetime || data.end_datetime || null,
        amount: data.amount ?? 0,
        totalAmount: (data.totalAmount ?? data.amount ?? 0).toString(),
        guest_message: data.guestMessage ?? data.guest_message ?? '',
        created_at: data.created_at ?? data.createdAt ?? null,
        updated_at: data.updated_at ?? data.updatedAt ?? null,
        attendees: data.attendees ?? 0,
        User: data.User ?? null,
        Space: data.Space ?? null,
        hostPlatformFeePer: data?.hostPlatformFeePer,
        hostTDSPer: data?.hostTDSPer,
    };
}

export const mapYourListingToSpace = (data: any): any => {
    return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        address: data?.address ?? null,
        street: data?.street ?? null,
        locality: data?.locality ?? null,
        pincode: data?.pincode ?? null,
        area: data?.area ?? null,
        location: data?.location ?? null,
        city: data?.City?.city ?? null,
        state: data?.City?.state ?? null,
        seats: data?.capacity,
        category_id: data?.CategoryMaster?.id ?? 0,
        category_name: data?.CategoryMaster?.name ?? null,
        space_type_id: data?.SpaceType?.id ?? 0,
        space_type_name: data?.SpaceType?.type ?? data?.space_type ?? null,
        status: data?.status,
        height_ft: data?.height_ft,
        size_sqft: data?.size_sqft,
        created_at: data?.created_at,
        updated_at: data?.updated_at,
        rating: data?.avg_rating,
        reviews: data?.total_reviews,
        price: data?.SpaceListing?.price_per_hour ?? null,
        operating_hours: data?.SpaceListing?.operating_hours ?? null,
        available_window_date: data?.SpaceListing?.available_window_date ?? null,
        SpaceImages:
            data?.SpaceImages
                ?.slice()
                ?.sort((a: any, b: any) => Number(b.is_featured) - Number(a.is_featured))
                ?.map((img: any) => ({
                    id: img.id,
                    image_url: img.image_url,
                    is_featured: img.is_featured,
                })) ?? [],
        computed_status: data?.computed_status || data?.status,
        current_step: data?.current_step || 1,
        discountAmount: data?.SpaceListing?.discountAmount,
        isRefundable: data?.SpaceListing?.isRefundable,
        slug: data?.slug,
    };
};
