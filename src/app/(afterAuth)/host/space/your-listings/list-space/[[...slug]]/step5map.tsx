'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function PlacesSearchMap({
    coordinates,
    setCoordinates,
    isInput = true,
    isDisabled = false,
    handleSelect, // Prop to handle all selected data
}: {
    coordinates: any;
    setCoordinates?: any;
    isInput?: boolean;
    isDisabled?: boolean;
    handleSelect?: (data: {
        position: { lat: number; lng: number };
        title?: string;
        address?: string;
        placeId?: string;
        fullPlaceData?: google.maps.places.PlaceResult | null;
        eventType: 'click' | 'autocomplete' | 'drag';
        // Additional fields for autocomplete selections
        addressComponents?: google.maps.GeocoderAddressComponent[];
        businessStatus?: string;
        icon?: string;
        photos?: google.maps.places.PlacePhoto[];
        types?: string[];
        url?: string;
        vicinity?: string;
        website?: string;
    }) => void;
}) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const autocompleteRef = useRef<HTMLInputElement | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const mapInstance = useRef<google.maps.Map | null>(null);
    const marker = useRef<google.maps.Marker | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);

    // -------- Wait for Google Maps to Load ----------
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 50; // 5 seconds max wait time

        const checkGoogleMaps = () => {
            if (window.google && window.google.maps) {
                setIsLoaded(true);
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(checkGoogleMaps, 100);
            }
        };
        checkGoogleMaps();
    }, []);

    // -------- Set Marker Function ----------
    const setMarker = (
        position: any,
        title = '',
        address = '',
        placeId = '',
        fullPlaceData: google.maps.places.PlaceResult | null = null,
        eventType: 'click' | 'autocomplete' | 'drag' = 'click',
        shouldCallHandleSelect = true,
    ) => {
        const map = mapInstance.current;
        if (!map) {
            return;
        }

        // Extract lat/lng
        const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
        const lng = typeof position.lng === 'function' ? position.lng() : position.lng;

        // Remove existing marker if it exists
        if (marker.current) {
            marker.current.setMap(null);
        }

        // Create new marker
        marker.current = new window.google.maps.Marker({
            map,
            position: { lat, lng },
            title,
            draggable: !isDisabled,
        });

        // Center map
        map.panTo({ lat, lng });

        // Update coordinates if needed
        if (!isDisabled && setCoordinates) {
            setCoordinates({ lat, lng });
        }

        // Pass all data to parent
        if (handleSelect && shouldCallHandleSelect) {
            handleSelect({
                position: { lat, lng },
                title,
                address,
                placeId,
                fullPlaceData,
                eventType,
                // Additional fields for autocomplete selections
                addressComponents: fullPlaceData?.address_components,
                businessStatus: fullPlaceData?.business_status,
                icon: fullPlaceData?.icon,
                photos: fullPlaceData?.photos,
                types: fullPlaceData?.types,
                url: fullPlaceData?.url,
                vicinity: fullPlaceData?.vicinity,
                website: fullPlaceData?.website,
            });
        }
    };

    // -------- Select Place from Autocomplete ----------
    const selectPlace = (place: google.maps.places.PlaceResult) => {
        if (!place.geometry?.location || isDisabled) return;
        setMarker(
            place.geometry.location,
            place.name || 'Selected Place',
            place.formatted_address || '',
            place.place_id || '',
            place,
            'autocomplete',
        );
    };

    // -------- Initialize Map & Autocomplete ----------
    useEffect(() => {
        if (!isLoaded || !window.google || !window.google.maps || !mapRef.current) return;

        const defaultCenter = { lat: 28.6317, lng: 77.2272 };
        const initialCenter = (coordinates && coordinates.lat && coordinates.lng)
            ? { lat: coordinates.lat, lng: coordinates.lng }
            : defaultCenter;

        const map = new window.google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: 13,
            mapTypeControl: false,
            fullscreenControl: true,
            streetViewControl: false,
            draggable: !isDisabled,
            zoomControl: !isDisabled,
            scrollwheel: !isDisabled,
            disableDoubleClickZoom: isDisabled,
        });
        mapInstance.current = map;

        // Click on map - only if not disabled
        if (!isDisabled) {
            map.addListener('click', (e: google.maps.MapMouseEvent) => {
                if (!e.latLng) return;
                setMarker(e.latLng, 'Clicked Location', '', '', null, 'click');
            });
        }

        // Places Service
        placesService.current = new window.google.maps.places.PlacesService(map);

        // Autocomplete - only if input is enabled and not disabled
        if (isInput && !isDisabled && autocompleteRef.current) {
            const ac = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
                fields: [
                    'address_components',
                    'adr_address',
                    'business_status',
                    'formatted_address',
                    'geometry',
                    'icon',
                    'icon_background_color',
                    'icon_mask_base_uri',
                    'name',
                    'permanently_closed',
                    'photos',
                    'place_id',
                    'plus_code',
                    'types',
                    'url',
                    'utc_offset_minutes',
                    'vicinity',
                    'website',
                ],
            });

            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (!place.geometry?.location) return;
                selectPlace(place);
            });
        }
    }, [isLoaded, isDisabled, isInput]); // Added isLoaded to dependencies

    // Separate useEffect for handling coordinates changes
    useEffect(() => {
        if (coordinates && coordinates.lat && coordinates.lng && mapInstance.current) {
            // Use false for updateCoordinates to prevent infinite loop
            setMarker(coordinates, 'Location', '', '', null, 'click', false);
            mapInstance.current.setCenter({ lat: coordinates.lat, lng: coordinates.lng });
        }
    }, [coordinates?.lat, coordinates?.lng]); // Only depend on lat/lng values

    // Handle marker drag (only if not disabled)
    useEffect(() => {
        if (marker.current && !isDisabled) {
            const dragListener = marker.current.addListener(
                'dragend',
                (e: google.maps.MapMouseEvent) => {
                    if (e.latLng && setCoordinates) {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setCoordinates({ lat, lng });
                        setMarker(e.latLng, 'Dragged Location', '', '', null, 'drag');
                    }
                },
            );

            // Cleanup listener
            return () => {
                window.google.maps.event.removeListener(dragListener);
            };
        }
    }, [isDisabled, setCoordinates]);

    return (
        <div className="p-4">
            {isInput && (
                <div className="flex items-center gap-2 mb-4">
                    <input
                        ref={autocompleteRef}
                        placeholder="Search places here.."
                        className="w-full px-3 py-2 text-base bg-white rounded-3xl placeholder:text-base shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-1 outline-offset-[-1px] outline-gray-300 flex overflow-hidden"
                        disabled={isDisabled || !isLoaded}
                    />
                </div>
            )}

            <div className="h-[500px] rounded-2xl overflow-hidden relative">
                {!isLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6CD28] mb-4"></div>
                        <div className="text-gray-600 font-medium">Loading map...</div>
                        <div className="text-gray-400 text-sm mt-2">Please wait while we initialize Google Maps</div>
                    </div>
                )}
                <div ref={mapRef} className="w-full h-full" />
            </div>
        </div>
    );
}
