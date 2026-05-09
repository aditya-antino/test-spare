import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Amenities({ data }) {
    // Return null if no data passed
    if (!data) return null;

    const amenities = data?.Amenities || [];
    const activities = data?.Activities || [];
    const spaceTypes = Array.isArray(data?.SpaceTypes) ? data.SpaceTypes : [];

    // If no amenities, still show the component with a message
    if (!Array.isArray(amenities) || amenities.length === 0) {
        return (
            <Card className="p-2 sm:p-8 flex flex-col gap-6">
                <h3 className="text-gray-900 text-2xl font-semibold">Amenities</h3>
                <p className="text-gray-500 text-base font-medium">
                    About the space's amenities and services
                </p>
                <div className="w-16 border-t" />
                <div className="text-gray-500 text-center py-8">
                    No amenities available for this space.
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-2 sm:p-8 flex flex-col gap-6">
            <h3 className="text-gray-900 text-2xl font-semibold">Sub Categories</h3>

            {spaceTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {spaceTypes.map((item, idx) => (
                        <div
                            key={item?.id || idx}
                            data-dot="False"
                            data-remove-button="False"
                            data-size="Small"
                            data-theme="Indigo"
                            data-type="Basic"
                            className="px-2.5 py-0.5 bg-indigo-100 rounded-[10px] inline-flex justify-center items-center"
                        >
                            <div className="text-center justify-start text-indigo-800 text-xs font-medium font-['Inter'] leading-none">
                                {item?.type || 'Conference Hall'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <h3 className="text-gray-900 text-2xl font-semibold">Activities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
                {activities.map((item) => (
                    <div key={item?.id || item?.activity} className="flex items-center gap-2">
                        <span className="text-gray-700">{item?.activity || '-'}</span>
                    </div>
                ))}
            </div>
            <h3 className="text-gray-900 text-2xl font-semibold">Amenities</h3>
            <p className="text-gray-500 text-base font-medium">
                About the space's amenities and services
            </p>
            <div className="w-16 border-t" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
                {amenities.map((item) => (
                    <div key={item?.id || item?.name} className="flex items-center gap-2">
                        <Image src={item?.imgUrl ?? item?.img_url} alt={item?.name || '-'} width={14} height={14} />
                        <span className="text-gray-700">{item?.name || '-'}</span>
                    </div>
                ))}
            </div>

            {/* <Button variant="outline" className="rounded-full w-fit">
        View all amenities
      </Button> */}
        </Card>
    );
}
