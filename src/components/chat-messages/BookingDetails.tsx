import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function BookingDetails({ details }: { details: any }) {
    return (
        <div className="hidden lg:block w-80 border-l p-4 bg-white">
            <h2 className="text-lg font-semibold text-yellow-500">Booking Details</h2>
            <div className="flex justify-between mt-4">
                <div>
                    <p className="text-sm text-orange-500">Request sent</p>
                    <h3 className="font-bold text-xl">{details.hostName}</h3>
                    <p className="mt-2 text-gray-700">{details.dates}</p>
                </div>
                <div className="flex flex-col items-center">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={details.hostAvatar} />
                        <AvatarFallback>{details.hostName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="mt-2 px-2 py-0.5 text-xs rounded-md bg-yellow-100 text-yellow-600">
                        {details.status}
                    </span>
                </div>
            </div>
            <div className="mt-4">
                <p className="font-medium">{details.spaceName}</p>
                <p className="text-sm text-gray-600">{details.address}</p>
            </div>
            <p className="text-sm text-gray-700 mt-2">{details.guests} guests</p>
            <p className="font-semibold mt-2">{details.price}</p>
        </div>
    );
}
