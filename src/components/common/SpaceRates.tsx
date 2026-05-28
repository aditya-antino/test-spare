import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SpaceRates({
    listing,
    bookingSettings,
}: {
    listing: any;
    bookingSettings?: any;
}) {
    if (!listing) return null;

    // GST and Platform Fee Calculation
    const guestPlatformFeePercentage = parseFloat(bookingSettings?.guest_platform_fee || '5') / 100;
    const cgstPercentage = parseFloat(bookingSettings?.cgst || '9') / 100;
    const sgstPercentage = parseFloat(bookingSettings?.sgst || '9') / 100;

    const basePrice = parseFloat(listing.price_per_hour ?? '0');
    const extraHourPrice = parseFloat(listing.extra_hour_price ?? '0');

    // Calculate fully loaded hourly rate
    const calculateLoadedPrice = (price: number) => {
        const platformFee = price * guestPlatformFeePercentage;
        const subtotal = price + platformFee;
        const tax = subtotal * (cgstPercentage + sgstPercentage);
        return subtotal + tax;
    };

    const loadedHourlyRate = calculateLoadedPrice(basePrice);
    const loadedExtraHourPrice = calculateLoadedPrice(extraHourPrice);

    return (
        <Card className="p-2 sm:p-8 flex flex-col gap-6">
            <h2 className="text-gray-900 text-2xl font-semibold">Space Rates</h2>
            <p className="text-gray-500 text-base font-medium">
                Prices may increase on weekends or holidays
            </p>
            <div className="w-16 " />

            <div className="flex flex-col w-full gap-6">
                {/* Hourly Rate */}
                <div className="flex justify-between border w-full p-4 rounded-lg bg-gray-50 items-start">
                    <div className="flex flex-col">
                        <span className="text-gray-600 text-base font-medium">Hourly Rate</span>
                        <span className="text-[10px] text-gray-500 font-medium">incl. of all taxes</span>
                    </div>

                    <span className="text-gray-600 text-base font-medium">
                        ₹{formatCurrency(loadedHourlyRate)}
                    </span>
                </div>

                {/* Other rates */}
                <div className="flex flex-col w-full rounded-lg border bg-gray-50">
                    <div className="flex p-4 w-full items-center justify-between">
                        <span className="text-gray-600 text-base font-medium">
                            Max Booking Hours
                        </span>
                        <span className="text-gray-600 text-base font-medium">12 Hours</span>
                    </div>
                    <div className="flex p-4 w-full items-center justify-between ">
                        <span className="text-gray-600 text-base font-medium">
                            Min Booking Hours
                        </span>
                        <span className="text-gray-600 text-base font-medium">
                            {listing.min_booking_hours ?? '-'} Hours
                        </span>
                    </div>
                    <div className="flex p-4 w-full items-start justify-between ">
                            <span className="text-gray-600 text-base font-medium">
                                Extra Hour Price
                            </span>

                        <span className="text-gray-600 text-base font-medium">
                            ₹{formatCurrency(extraHourPrice)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
