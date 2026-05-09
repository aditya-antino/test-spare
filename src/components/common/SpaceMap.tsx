'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useGetGuestSpaceDetails, useGetGuestBookingDetails } from '@/services';
import { X, MapPin, Clock, Users, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Typography from '../ui/typoGraphy';
import { formatCurrency } from '@/lib/utils';
import ImageCarousel from './imageCarousel/imageCarousel';

interface SpaceLocation {
    id: number;
    title: string;
    slug?: string;
    location: {
        crs?: {
            type: string;
            properties: {
                name: string;
            };
        };
        type?: string;
        coordinates?: [number, number];
        pricePerHour?: string | null;
    };
    pricePerHour?: string | null;
    discountAmount?: number;
    isRefundable?: boolean;
}

interface SpaceMapProps {
    spaces: SpaceLocation[];
    onSpaceClick?: (slug: string) => void;
    className?: string;
}

interface BookingCardProps {
    spaceId: number;
    spaceIds: number[];
    currentIndex: number;
    onClose: () => void;
    onNavigateToDetails: (slug: string) => void;
    onPrevious: () => void;
    onNext: () => void;
}

// Booking Card Component
const BookingCard: React.FC<BookingCardProps> = ({
    spaceId,
    spaceIds,
    currentIndex,
    onClose,
    onNavigateToDetails,
    onPrevious,
    onNext,
}) => {
    const {
        data: spaceDetails,
        isLoading,
        error,
    } = useGetGuestSpaceDetails({
        spaceId: spaceId,
    });

    const { data: bookingDetails } = useGetGuestBookingDetails();

    if (isLoading) {
        return (
            <div className="absolute top-4 right-4 w-80 bg-white rounded-2xl shadow-lg p-4 z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="animate-pulse bg-gray-200 h-48 w-full rounded-lg mb-4"></div>
                <div className="space-y-2">
                    <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !spaceDetails?.data) {
        return (
            <div className="absolute top-4 right-4 w-80 bg-white rounded-2xl shadow-lg p-4 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Error</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-gray-500">Failed to load space details</p>
            </div>
        );
    }

    const space = spaceDetails.data;

    // Filter and validate image URLs
    const validImages =
        space.SpaceImages?.filter((img: any) => {
            const imageUrl = typeof img === 'string' ? img : img?.image_url;
            return (
                imageUrl &&
                typeof imageUrl === 'string' &&
                imageUrl.startsWith('http') &&
                imageUrl !== 'string11111' &&
                imageUrl.length > 10
            ); // Basic validation for real URLs
        }) || [];

    const firstImage =
        validImages.length > 0
            ? typeof validImages[0] === 'string'
                ? validImages[0]
                : validImages[0]?.image_url
            : null;

    const discountPercent = space?.SpaceListing?.discountAmount ?? 0;
    const originalPrice = parseFloat(space?.price || space?.SpaceListing?.price_per_hour || '0');

    const effectiveDiscount = space?.SpaceListing?.isRefundable
        ? discountPercent + 10
        : discountPercent;

    const hasDiscount = effectiveDiscount > 0;

    const discountedPrice = hasDiscount
        ? originalPrice - (originalPrice * effectiveDiscount) / 100
        : originalPrice;

    // Fetch dynamic pricing settings from API config
    const platformFeePercentage = parseFloat(bookingDetails?.data?.guest_platform_fee || '5') / 100;
    const cgstPercentage = parseFloat(bookingDetails?.data?.cgst || '9') / 100;
    const sgstPercentage = parseFloat(bookingDetails?.data?.sgst || '9') / 100;
    const taxMultiplier = (1 + platformFeePercentage) * (1 + cgstPercentage + sgstPercentage);

    // adding platform fee and taxes in final original price
    const grossOriginalPrice = originalPrice * taxMultiplier;
    // adding platform fee and taxes in final discounted price
    const grossDiscountedPrice = discountedPrice * taxMultiplier;

    const hasMultipleSpaces = spaceIds.length > 1;
    const canGoPrevious = hasMultipleSpaces && currentIndex > 0;
    const canGoNext = hasMultipleSpaces && currentIndex < spaceIds.length - 1;

    return (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-2xl shadow-lg overflow-hidden z-10">
            {hasDiscount && (
                <div
                    className={`absolute  left-2 top-3 z-30 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1`}
                >
                    <span className="text-sm font-bold">{effectiveDiscount}% OFF</span>
                </div>
            )}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white rounded-full p-1 transition-colors"
            >
                <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Carousel Navigation - Only show if multiple spaces */}
            {hasMultipleSpaces && (
                <>
                    {/* Previous Button */}
                    {canGoPrevious && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPrevious();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                            aria-label="Previous space"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                    )}

                    {/* Next Button */}
                    {canGoNext && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onNext();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                            aria-label="Next space"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    )}

                    {/* Carousel Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-black/50 rounded-full px-3 py-1 flex items-center gap-1">
                        {spaceIds.map((id, idx) => (
                            <button
                                key={id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Navigate to specific space
                                    if (idx < currentIndex) {
                                        for (let i = 0; i < currentIndex - idx; i++) {
                                            onPrevious();
                                        }
                                    } else if (idx > currentIndex) {
                                        for (let i = 0; i < idx - currentIndex; i++) {
                                            onNext();
                                        }
                                    }
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentIndex
                                        ? 'bg-white w-6'
                                        : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Go to space ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            <div className="w-full select-none h-48 relative bg-gray-100 cursor-pointer">
                {Array.isArray(space.SpaceImages) && space?.SpaceImages?.length > 0 ? (
                    <ImageCarousel images={space?.SpaceImages} isBookingCard={true} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No Image
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category */}
                <p className="text-sm text-gray-500 mb-1">
                    {space.SpaceType?.type || space.CategoryMaster?.name || 'Space'}
                </p>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                    {space.title}
                </h3>

                {/* Details */}
                <div className="space-y-2 mb-4">
                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                            {[space.area, space.locality, space.City?.name, space.City?.state]
                                .filter(Boolean)
                                .join(', ') || '-'}
                        </span>
                    </div>

                    {/* Operating Hours */}
                    {space.SpaceListing?.operating_hours && (
                        <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Check availability</span>
                        </div>
                    )}

                    {/* Capacity */}
                    <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{space.capacity} Seats</span>
                    </div>
                </div>

                {/* Price and Rating */}
                <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start">
                        {hasDiscount ? (
                            <div className="flex flex-row items-baseline gap-2">
                                <Typography
                                    size="lg"
                                    weight="semibold"
                                    className="text-gray-900"
                                >
                                    ₹{formatCurrency(grossDiscountedPrice)}
                                    <span className="text-gray-500 text-sm font-normal"> /hr</span>
                                </Typography>
                                <Typography size="xs" className="text-red-400 line-through">
                                    ₹{formatCurrency(grossOriginalPrice)}
                                    <span className="text-red-400 text-sm font-normal"> /hr</span>
                                </Typography>
                            </div>
                        ) : (
                            <Typography size="lg" weight="semibold" className="text-gray-900">
                                {originalPrice > 0 ? (
                                    <>
                                        ₹{formatCurrency(grossOriginalPrice)}
                                        <span className="text-gray-500 text-sm font-normal"> /hr</span>
                                    </>
                                ) : (
                                    '—'
                                )}
                            </Typography>
                        )}

                        {/* Incl. of all taxes simple statement */}
                        {originalPrice > 0 && (
                            <span className="text-[10px] text-gray-500 font-medium mt-0.5 mr-1">
                                incl. of all taxes
                            </span>
                        )}
                    </div>
                    {space?.avg_rating && Number(space?.avg_rating) !== 0 && (
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-[#F6CD28] fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-800">
                                {space.avg_rating ? Number(space.avg_rating).toFixed(1) : '0.0'}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">
                                ({space.total_reviews || '0'})
                            </span>
                        </div>
                    )}
                </div>

                {/* View Details Button */}
                <button
                    onClick={() => onNavigateToDetails(space.slug)}
                    className="w-full mt-4 bg-[#F6CD28] hover:bg-amber-500 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

const SpaceMap: React.FC<SpaceMapProps> = ({ spaces, onSpaceClick, className }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [selectedSpaceIds, setSelectedSpaceIds] = useState<number[]>([]);
    const [currentSpaceIndex, setCurrentSpaceIndex] = useState<number>(0);

    const { data: bookingDetails } = useGetGuestBookingDetails();

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map with same configuration as PlacesSearchMap
        const initMap = () => {
            // Default center (Gurgaon - same as PlacesSearchMap)
            const defaultCenter = { lat: 28.4595, lng: 77.0266 };

            // Create map instance with same settings as PlacesSearchMap
            if (window.google && window.google.maps) {
                mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                    center: defaultCenter,
                    zoom: 13,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    streetViewControl: false,
                    draggable: true,
                    zoomControl: true,
                    scrollwheel: true,
                    disableDoubleClickZoom: false,
                    mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        },
                    ],
                });
            }
        };

        // Load Google Maps if not already loaded
        if (!window.google) {
            const script = document.createElement('script');
            const key =
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !spaces.length) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // Filter spaces that have coordinates and prices
        const validSpaces = spaces.filter(
            (space) =>
                space.location?.coordinates &&
                space.location.coordinates.length === 2 &&
                (space.location.pricePerHour || space.pricePerHour),
        );

        // Group spaces by coordinates (with tolerance for floating point differences)
        const spacesByLocation = new Map<string, SpaceLocation[]>();
        const TOLERANCE = 0.0001; // Small tolerance for coordinate matching

        validSpaces.forEach((space) => {
            const [lng, lat] = space.location.coordinates!;
            // Round coordinates to avoid floating point precision issues
            const roundedLat = Math.round(lat / TOLERANCE) * TOLERANCE;
            const roundedLng = Math.round(lng / TOLERANCE) * TOLERANCE;
            const locationKey = `${roundedLat},${roundedLng}`;

            if (!spacesByLocation.has(locationKey)) {
                spacesByLocation.set(locationKey, []);
            }
            spacesByLocation.get(locationKey)!.push(space);
        });

        // Create markers for each location (one marker per location, showing count if multiple)
        spacesByLocation.forEach((spacesAtLocation, locationKey) => {
            const firstSpace = spacesAtLocation[0];
            const [lng, lat] = firstSpace.location.coordinates!;
            const rawPrice = firstSpace.location.pricePerHour || firstSpace.pricePerHour || '0';
            const spaceCount = spacesAtLocation.length;

            const originalPrice = parseFloat(rawPrice);
            const discountPercent = firstSpace.discountAmount ?? 0;
            const effectiveDiscount = firstSpace.isRefundable ? discountPercent + 10 : discountPercent;
            const hasDiscount = effectiveDiscount > 0;
            const discountedPrice = hasDiscount
                ? originalPrice - (originalPrice * effectiveDiscount) / 100
                : originalPrice;

            const platformFeePercentage = parseFloat(bookingDetails?.data?.guest_platform_fee || '5') / 100;
            const cgstPercentage = parseFloat(bookingDetails?.data?.cgst || '9') / 100;
            const sgstPercentage = parseFloat(bookingDetails?.data?.sgst || '9') / 100;
            const taxMultiplier = (1 + platformFeePercentage) * (1 + cgstPercentage + sgstPercentage);
            const grossDiscountedPrice = discountedPrice * taxMultiplier;

            // Create marker
            if (window.google && window.google.maps) {
                // Create a simple marker using Lucide-style icon
                const createMarkerIcon = (bgColor: string, textColor: string) => ({
                    url:
                        'data:image/svg+xml;charset=UTF-8,' +
                        encodeURIComponent(`
                        <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="5" width="50" height="20" rx="6" fill="${bgColor}" stroke="${bgColor}" strokeWidth="1"/>
                            <text x="30" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="${textColor}">₹${formatCurrency(grossDiscountedPrice)}${spaceCount > 1 ? ` (${spaceCount})` : ''}</text>
                            <polygon points="25,25 30,30 35,25" fill="${bgColor}"/>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(60, 40),
                    anchor: new window.google.maps.Point(30, 30),
                });

                const defaultIcon = createMarkerIcon('#F7CD29', '#000000');
                const hoverIcon = createMarkerIcon('white', '#1f2937');

                const marker = new window.google.maps.Marker({
                    map: mapInstanceRef.current,
                    position: { lat, lng },
                    title:
                        spaceCount > 1 ? `${spaceCount} spaces at this location` : firstSpace.title,
                    icon: defaultIcon,
                });

                // Add hover effects
                marker.addListener('mouseover', () => {
                    marker.setIcon(hoverIcon);
                });

                marker.addListener('mouseout', () => {
                    marker.setIcon(defaultIcon);
                });

                // Add click listener - set all space IDs at this location
                marker.addListener('click', () => {
                    const spaceIds = spacesAtLocation.map((s) => s.id);
                    setSelectedSpaceIds(spaceIds);
                    setCurrentSpaceIndex(0);
                });

                markersRef.current.push(marker);
            }
        });
        // Fit map to show all markers
        if (spacesByLocation.size > 0 && window.google && window.google.maps) {
            const bounds = new window.google.maps.LatLngBounds();
            spacesByLocation.forEach((spacesAtLocation) => {
                const [lng, lat] = spacesAtLocation[0].location.coordinates!;
                bounds.extend({ lat, lng });
            });
            mapInstanceRef.current.fitBounds(bounds);
        } else if (spaces.length > 0 && window.google && window.google.maps) {
            // If no valid spaces, center on default location (Gurgaon - same as PlacesSearchMap)
            mapInstanceRef.current.setCenter({ lat: 28.4595, lng: 77.0266 });
            mapInstanceRef.current.setZoom(13);
        }
    }, [spaces, onSpaceClick, bookingDetails]);

    const handleCloseBookingCard = () => {
        setSelectedSpaceIds([]);
        setCurrentSpaceIndex(0);
    };

    const handleNavigateToDetails = (slug?: string) => {
        if (slug && onSpaceClick) {
            onSpaceClick(slug);
        } else {
            console.warn('Space slug is missing, cannot navigate');
        }
        setSelectedSpaceIds([]);
        setCurrentSpaceIndex(0);
    };

    const handlePrevious = () => {
        if (currentSpaceIndex > 0) {
            setCurrentSpaceIndex(currentSpaceIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentSpaceIndex < selectedSpaceIds.length - 1) {
            setCurrentSpaceIndex(currentSpaceIndex + 1);
        }
    };

    return (
        <div className={`w-full h-full relative ${className}`}>
            <div className="w-full h-full rounded-2xl overflow-hidden">
                <div ref={mapRef} className="w-full h-full" />
            </div>

            {/* Booking Card Overlay */}
            {selectedSpaceIds.length > 0 && (
                <BookingCard
                    spaceId={selectedSpaceIds[currentSpaceIndex]}
                    spaceIds={selectedSpaceIds}
                    currentIndex={currentSpaceIndex}
                    onClose={handleCloseBookingCard}
                    onNavigateToDetails={handleNavigateToDetails}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                />
            )}
        </div>
    );
};

export default SpaceMap;
