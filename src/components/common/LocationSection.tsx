import { Card } from '@/components/ui/card';
import PlacesSearchMap from '../../app/(afterAuth)/host/space/your-listings/list-space/[[...slug]]/step5map';
import ReadOnlyMap from '../readOnlyMap/ReadOnlyMap';
import { AlertTriangle } from 'lucide-react';

export default function LocationSection({ location, address, city, area, locality, street }) {
    const coords = location?.coordinates;

    // GeoJSON format is [lng, lat], so map properly
    const lat = coords?.[1];
    const lng = coords?.[0];

    const formatAddress = () => {
        const addressParts = [];

        if (area) {
            addressParts.push(area);
        } else if (street) {
            addressParts.push(street);
        }

        // Add locality if available
        if (locality) {
            addressParts.push(locality);
        }

        if (city?.city) {
            addressParts.push(city.city);
        }

        return addressParts.join(', ');
    };

    return (
        <Card className="p-2 sm:p-8 flex flex-col gap-6">
            <h2 className="text-gray-900 text-2xl font-semibold">Location</h2>
            <p className="text-gray-500 text-base font-medium">{formatAddress()}</p>
            <div className="w-16 border-t" />

            <div className="max-w-[720px] w-full">
                {/* <PlacesSearchMap isInput={false} isDisabled={false} coordinates={{ lat, lng }} /> */}
                <div className="text-sm italic text-gray-600 mt-1 flex items-start gap-1.5 ml-4">
                    <span>
                        Exact Location details are confidential and will be disclosed only after booking
                        confirmation
                    </span>
                </div>
                <ReadOnlyMap
                    coordinates={{ lat: lat || 28.4595, lng: lng || 77.0266 }}
                    radiusMeters={1400}
                    initialZoom={13}
                    minZoom={3}
                    maxZoom={20}
                    heightClassName="h-[500px]"
                />
            </div>
        </Card>
    );
}
