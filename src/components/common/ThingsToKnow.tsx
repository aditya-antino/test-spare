import { Card } from '@/components/ui/card';

interface OperatingHours {
    [day: string]: {
        is_open: boolean;
        sessions?: {
            from: string;
            to: string;
        }[];
    };
}

interface ThingsToKnowProps {
    listing: {
        cancellation_policy?:
        | {
            key: string;
            message: string;
        }
        | string
        | null;
        cancellationPolicy?: {
            key: string;
            message: string;
        };
        rules?: Array<{
            rule_id?: string;
            rule_name?: string;
            rule_type?: string;
        }>;
        custom_rules?: string[];
        operating_hours?: OperatingHours;
        operatingHours?: OperatingHours;
        parkingOptions?: {
            free_onsite?: boolean;
            paid_onsite?: boolean;
            nearby_parking_lot?: boolean;
        };
        arrivalInstructions?: string;
        isRefundable?: boolean;
    };
}

export default function ThingsToKnow({ listing }: ThingsToKnowProps) {
    const operatingHours = listing?.operating_hours || listing?.operatingHours;

    if (!listing) return null;

    // Generate parking options text
    const getParkingOptions = (): string[] => {
        const p = listing.parkingOptions;
        if (!p) return [];

        return [
            p.paid_onsite ? 'Parking: Paid' : p.free_onsite ? 'Parking: Free' : null,
            p.nearby_parking_lot === true
                ? 'Nearby parking: Available'
                : p.nearby_parking_lot === false
                    ? 'Nearby parking: Not available'
                    : null,
        ].filter(Boolean) as string[];
    };

    const rules = [
        ...(listing.rules?.map((rule) => {
            const ruleText = rule.rule_name || rule.rule_type || '';
            const typeText = rule.rule_type === 'allow' ? 'Allowed' : 'Not allowed';
            return `${ruleText}: ${typeText}`;
        }) || []),
        ...(listing.custom_rules || []),
        ...getParkingOptions(),
    ];

    return (
        <Card className="p-2 sm:p-8 flex flex-col gap-6">
            <h3 className="text-gray-900 text-2xl font-semibold">Things to Know</h3>

            {/* Cancellation Policy */}
            <section className="flex flex-col w-full gap-2">
                <div className="flex flex-col">
                    <h4 className="text-gray-800 text-lg font-semibold">Cancellation policy</h4>

                    {!listing?.isRefundable ? (
                        <p className="text-gray-800 text-base font-semibold">
                            {(() => {
                                const key =
                                    listing?.cancellationPolicy?.key ||
                                    (typeof listing?.cancellation_policy === 'string'
                                        ? listing?.cancellation_policy
                                        : listing?.cancellation_policy?.key);
                                return key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
                            })()}
                        </p>
                    ) : (
                        <p className="text-gray-800 text-base">Non-Refundable</p>
                    )}
                </div>

                {!listing?.isRefundable ? (
                    <p className="text-gray-500 text-base font-medium">
                        {listing.cancellationPolicy?.message ||
                            (typeof listing.cancellation_policy === 'object'
                                ? listing.cancellation_policy?.message
                                : null) ||
                            'No cancellation policy provided.'}
                    </p>
                ) : (
                    <p className="text-gray-500 text-base font-medium">
                        Bookings are offered at a 10% discounted price and are always
                        non-refundable. No grace period applies.
                    </p>
                )}
            </section>

            <div className="w-16 border-t" />

            {/* Space Rules */}
            <section className="flex flex-col w-full gap-2.5">
                <h4 className="text-gray-800 text-lg font-semibold">Space Rules</h4>
                <ul className="text-gray-500 list-disc pl-4 text-base font-medium">
                    {rules.length > 0 ? (
                        rules.map((rule, idx) => <li key={idx}>{rule}</li>)
                    ) : (
                        <li>No rules provided.</li>
                    )}
                </ul>
            </section>

            <div className="w-16 border-t" />

            {/* Arrival Instructions */}
            {listing.arrivalInstructions && (
                <>
                    <section className="flex flex-col w-full gap-2.5">
                        <h4 className="text-gray-800 text-lg font-semibold">
                            Arrival Instructions
                        </h4>
                        <p className="text-gray-500 text-base font-medium break-words">
                            {listing.arrivalInstructions}
                        </p>
                    </section>
                    <div className="w-16 border-t" />
                </>
            )}

            {/* Operating Hours */}
            <section className="flex flex-col max-w-md w-full gap-2.5">
                <h4 className="text-gray-800 text-lg font-semibold">Operating Hours</h4>
                <div className="flex flex-col gap-3 text-gray-500 text-base font-medium">
                    {operatingHours ? (
                        (() => {
                            const dayOrder = [
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                                'Sunday',
                            ];
                            return dayOrder
                                .filter((day) => operatingHours[day])
                                .map((day) => {
                                    const hours = operatingHours[day];
                                    return (
                                        <div key={day} className="flex justify-between">
                                            <span className="font-medium text-gray-700 w-28">
                                                {day}
                                            </span>
                                            <div className="flex flex-col items-end gap-0.5 flex-1">
                                                {hours.is_open ? (
                                                    hours.sessions && hours.sessions.length > 0 ? (
                                                        hours.sessions.map((session, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-gray-600 text-sm"
                                                            >
                                                                {session.from} - {session.to}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-600">
                                                            Open 24 hours
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-red-500">Closed</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                        })()
                    ) : (
                        <div>No operating hours provided.</div>
                    )}
                </div>
            </section>
        </Card>
    );
}
