'use client';
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typoGraphy';
import PlacesSearchMap from './step5map';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { PATHS } from '@/constants/path';
import {
    UpdateSpaceStep5Payload,
    useGetCities,
    useUpdateSpaceListStep5,
    SpaceDetailsInterface,
} from '@/services';
import { toast } from 'react-toastify';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

interface CityOption {
    id: number;
    name: string;
}

interface LocationFormData {
    street: string;
    area: string;
    locality: string;
    city: CityOption | null;
    state: string;
    postalCode: number | null;
    location: {
        type: 'Point';
        coordinates: [number?, number?];
    };
}

interface Errors {
    street?: string;
    area?: string;
    locality?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    location?: string;
}

interface Step5Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
}

const Step5 = ({ editData, isEdit }: Step5Props) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');

    const [formData, setFormData] = useState<LocationFormData>({
        street: '',
        area: '',
        locality: '',
        city: null,
        state: '',
        postalCode: null,
        location: {
            type: 'Point',
            coordinates: [undefined, undefined],
        },
    });

    const [errors, setErrors] = useState<Errors>({});

    const { data: citiesDataResponse } = useGetCities();
    const citiesData = citiesDataResponse?.data || [];

    const { mutate: submitStep5, isPending } = useUpdateSpaceListStep5({
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit === 'true' ? '&isEdit=true' : '';
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=6${editParam}`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Something went wrong');
        },
    });

    // Populate form data when editData is available
    useEffect(() => {
        if (editData && citiesData.length > 0) {
            // Find the city from citiesData that matches the editData city name
            const matchingCity = citiesData.find(
                (city) => city.name.toLowerCase() === editData.City?.city.toLowerCase(),
            );

            setFormData({
                street: editData.street || '',
                area: editData.area || '',
                locality: editData.locality || '',
                city: matchingCity || null,
                state: editData.City?.state || '',
                postalCode: editData.pincode || null,
                location: {
                    type: 'Point',
                    coordinates: editData.location?.coordinates || [undefined, undefined],
                },
            });
        }
    }, [editData, citiesData, spaceId]);

    const handleInputChange = (field: keyof LocationFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMapClick = (lat: number, lng: number) => {
        setFormData((prev) => ({
            ...prev,
            location: { type: 'Point', coordinates: [lng, lat] },
        }));
    };

    const validate = (): boolean => {
        const newErrors: Errors = {};
        if (!formData.street) newErrors.street = 'Street is required';
        if (!formData.area) newErrors.area = 'Area is required';
        if (!formData.locality) newErrors.locality = 'Locality is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.postalCode || formData.postalCode <= 0)
            newErrors.postalCode = 'Valid postal code is required';

        const coords = formData.location.coordinates;
        if (
            !coords ||
            coords.length !== 2 ||
            typeof coords[0] !== 'number' ||
            typeof coords[1] !== 'number' ||
            isNaN(coords[0]) ||
            isNaN(coords[1])
        ) {
            newErrors.location =
                'Choose your space’s location by clicking on the map or searching above.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGoBack = () => {
        router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=4&isEdit=true`);
    };

    const handleSubmit = () => {
        if (!spaceId) return toast.error('Space ID is missing');
        if (validate()) {
            if (!formData.city) return toast.error('City is required');

            const payload: UpdateSpaceStep5Payload = {
                space_id: parseInt(spaceId),
                street: formData.street,
                area: formData.area,
                locality: formData.locality,
                city_id: formData.city.id,
                pincode: formData.postalCode!,
                location: formData.location,
                is_edit: isEdit === 'true',
            };
            submitStep5(payload);
        }
    };

    return (
        <>
            <div className="space-y-6 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-200 lg:max-w-[50vw] md:max-w-full max-w-[100vw]">
                <Typography weight="semibold" color="text-gray-900" size="2xl">
                    Location
                </Typography>

                {/* Map */}
                <PlacesSearchMap
                    handleSelect={(e) => {
                        handleMapClick(e.position.lat, e.position.lng);
                        const addressComponents = e.fullPlaceData?.address_components || [];
                        const getComponent = (type: string) => {
                            const component =
                                addressComponents.find((c: any) => c.types.includes(type))
                                    ?.long_name || '';
                            return component;
                        };

                        const addressParts = e.address?.split(',') || [];
                        const isLocalityType = e.types?.includes('locality');

                        // Build form data
                        const newFormData = {
                            street: isLocalityType
                                ? ''
                                : getComponent('route') ||
                                addressParts[0]?.trim() ||
                                e.vicinity?.split(',')[0]?.trim() ||
                                '',
                            area: isLocalityType
                                ? ''
                                : getComponent('sublocality') ||
                                getComponent('neighborhood') ||
                                addressParts[1]?.trim() ||
                                e.vicinity?.split(',')[1]?.trim() ||
                                '',
                            locality:
                                getComponent('locality') ||
                                (isLocalityType ? e.title : '') ||
                                getComponent('sublocality_level_1') ||
                                addressParts[0]?.trim() ||
                                e.vicinity?.split(',')[0]?.trim() ||
                                '',
                            state:
                                getComponent('administrative_area_level_1') ||
                                (isLocalityType ? addressParts[1]?.trim() : '') ||
                                addressParts[addressParts.length - 2]?.trim() ||
                                '',
                            postalCode:
                                parseInt(getComponent('postal_code')) ||
                                (isLocalityType
                                    ? null
                                    : parseInt(
                                        addressParts[addressParts.length - 1]?.match(
                                            /\d+/,
                                        )?.[0] || '',
                                    )) ||
                                null,
                        };

                        setFormData((prev) => ({ ...prev, ...newFormData }));

                        if (citiesData.length > 0) {
                            const cityName = isLocalityType
                                ? e.title
                                : getComponent('locality') || addressParts[0]?.trim();

                            if (cityName) {
                                const matchingCity = citiesData.find(
                                    (city) => city.name.toLowerCase() === cityName.toLowerCase(),
                                );

                                if (matchingCity) {
                                    handleInputChange('city', matchingCity);
                                }
                            }
                        }
                    }}
                    coordinates={
                        formData.location.coordinates?.[1] &&
                        formData.location.coordinates?.[0] && {
                            lat: formData.location.coordinates[1],
                            lng: formData.location.coordinates[0],
                        }
                    }
                    // coordinates={{}}
                    setCoordinates={(coords) => handleMapClick(coords.lat, coords.lng)}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}

                <p className="text-sm text-gray-600 mt-1 italic">
                    Please fill and re-check the exact street address as it will be shared with the
                    guest
                </p>

                {/* Form Fields */}
                <div className="space-y-4">
                    <Input
                        label="Street"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder="Enter street"
                        error={errors.street}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Area"
                            value={formData.area}
                            onChange={(e) => handleInputChange('area', e.target.value)}
                            placeholder="Enter area"
                            error={errors.area}
                        />
                        <Input
                            label="Locality"
                            value={formData.locality}
                            onChange={(e) => handleInputChange('locality', e.target.value)}
                            placeholder="Enter locality"
                            error={errors.locality}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* City Dropdown with label */}
                        <div className="flex flex-col">
                            <label className="text-gray-700 font-medium mb-1">City</label>
                            <Select
                                value={formData.city?.id?.toString() || ''}
                                onValueChange={(val) => {
                                    const selected = citiesData?.find(
                                        (c) => c.id === parseInt(val),
                                    );
                                    handleInputChange('city', selected || null);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent>
                                    {citiesData?.map((city) => (
                                        <SelectItem key={city.id} value={city.id.toString()}>
                                            {city.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.city && (
                                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                            )}
                        </div>

                        <Input
                            label="State"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            placeholder="Enter state"
                            error={errors.state}
                        />
                        <Input
                            label="Postal Code"
                            type="number"
                            value={formData.postalCode || ''}
                            onChange={(e) =>
                                handleInputChange('postalCode', parseInt(e.target.value))
                            }
                            placeholder="Enter postal code"
                            error={errors.postalCode}
                        />
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-end gap-4 items-end h-20">
                <Button type="button" disabled={isPending} variant="outline" onClick={handleGoBack}>
                    Go Back
                </Button>
                <Button
                    disabled={isPending}
                    variant={isPending ? 'disabled' : 'default'}
                    onClick={handleSubmit}
                >
                    Continue
                </Button>
            </div>
        </>
    );
};

export default Step5;
