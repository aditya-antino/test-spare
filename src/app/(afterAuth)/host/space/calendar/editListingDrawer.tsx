'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import Typography from '@/components/ui/typoGraphy';
import { X } from 'lucide-react';
import { useEditListing, useSharePrices } from '@/services';
import { toast } from 'react-toastify';
import { handleApiError } from '@/hooks/handleApiError';
import { formatPriceInput, parsePriceInput } from '@/utils/currency';

export default function EditListingDrawer({
    open,
    onOpenChange,
    spaceId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    spaceId: number;
}) {
    const [basePrice, setBasePrice] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [minBookingHours, setMinBookingHours] = useState('');
    const [extraHoursPrice, setExtraHoursPrice] = useState('');
    const [advanceNotice, setAdvanceNotice] = useState('2');
    const [availableWindow, setAvailableWindow] = useState('6');

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { mutate: fetchPrices } = useSharePrices({
        onSuccess: (res: any) => {
            const data = res.data;

            setBasePrice(data.pricePerHour || '');
            setMinBookingHours(data.minBookingHours?.toString() || '');
            setExtraHoursPrice(data.extraHourPrice || '');
            setDiscountAmount(data.discountAmount?.toString() || '');
            setAdvanceNotice(data.advanceBookingDays ? data.advanceBookingDays.toString() : '2');

            if (data.availableWindowDate) {
                const today = new Date();
                const availableDate = new Date(data.availableWindowDate);

                const diffMonths =
                    (availableDate.getFullYear() - today.getFullYear()) * 12 +
                    (availableDate.getMonth() - today.getMonth());

                setAvailableWindow(diffMonths > 0 ? diffMonths.toString() : '6');
            } else {
                setAvailableWindow('6');
            }
        },
        onError: (err) => {
            handleApiError(err);
        },
    });

    useEffect(() => {
        if (open && spaceId) {
            fetchPrices(spaceId);
        }
    }, [open, spaceId]);

    const resetDefaults = () => {
        setBasePrice('');
        setDiscountAmount('');
        setMinBookingHours('');
        setExtraHoursPrice('');
        setAdvanceNotice('2');
        setAvailableWindow('6');
    };

    const { mutate: editListing, isPending } = useEditListing({
        onSuccess(res) {
            toast.success(res.message);
            resetDefaults();
            onOpenChange(false);
        },
        onError(err) {
            toast.error(err.message);
            resetDefaults();
            onOpenChange(false);
        },
    });

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!basePrice || parsePriceInput(basePrice) <= 0) {
            newErrors.basePrice = 'Base price is required';
        }
        if (parsePriceInput(discountAmount) < 0) {
            newErrors.discountAmount = 'Discount cannot be negative';
        }
        if (!minBookingHours || Number(minBookingHours) < 1) {
            newErrors.minBookingHours = 'Minimum booking hours must be at least 1';
        }
        if (parsePriceInput(extraHoursPrice) < 0) {
            newErrors.extraHoursPrice = 'Extra hourly price cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const payload = {
            spaceId,
            basePriceMonThurs: parsePriceInput(basePrice) || 0,
            basePriceFriSun: parsePriceInput(basePrice) || 0,
            discountAmount: parsePriceInput(discountAmount) || 0,
            minBookingHours: Number(minBookingHours) || 0,
            extraHoursPrice: parsePriceInput(extraHoursPrice) || 0,
            advanceBookingDays: Number(advanceNotice),
            availableWindowDate: getAvailableWindowDate(Number(availableWindow)),
        };

        editListing(payload);
    };

    const getAvailableWindowDate = (months: number) => {
        const today = new Date();
        today.setMonth(today.getMonth() + months);
        return today.toISOString();
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="lg:w-[35vw] md:min-w-[600px] md:w-[50vw] sm:w-[80vw] w-full sm:max-w-none p-4 sm:p-8 overflow-auto"
            >
                <SheetHeader>
                    <SheetTitle className="flex w-full justify-between items-center">
                        <Typography size="xl" weight="semibold" color="black">
                            Edit Listing
                        </Typography>
                        <X className="cursor-pointer" onClick={() => onOpenChange(false)} />
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 mt-4">
                    {/* Pricing */}
                    <div className="flex flex-col gap-6">
                        <Typography size="base" weight="semibold">
                            Price
                        </Typography>
                        <div>
                            <Input
                                label="Base price"
                                type="text"
                                placeholder="0.00"
                                value={formatPriceInput(basePrice)}
                                onChange={(e) =>
                                    setBasePrice(e.target.value)
                                }
                            />
                            {errors.basePrice && (
                                <p className="text-red-500 text-sm">{errors.basePrice}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Discount Value (%)"
                                type="text"
                                placeholder="10.00"
                                value={formatPriceInput(discountAmount)}
                                onChange={(e) =>
                                    setDiscountAmount(e.target.value)
                                }
                            />
                            {errors.discountAmount && (
                                <p className="text-red-500 text-sm">{errors.discountAmount}</p>
                            )}
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="flex flex-col gap-6">
                        <Typography size="base" weight="semibold">
                            Availability
                        </Typography>
                        <div>
                            <Input
                                label="Minimum booking hours (1–12)"
                                type="number"
                                placeholder="1"
                                value={minBookingHours}
                                onChange={(e) =>
                                    setMinBookingHours(e.target.value < '0' ? '0' : e.target.value)
                                }
                            />
                            {errors.minBookingHours && (
                                <p className="text-red-500 text-sm">{errors.minBookingHours}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Extra hourly price for overtime"
                                type="text"
                                placeholder="0.00"
                                value={formatPriceInput(extraHoursPrice)}
                                onChange={(e) =>
                                    setExtraHoursPrice(e.target.value)
                                }
                            />
                            {errors.extraHoursPrice && (
                                <p className="text-red-500 text-sm">{errors.extraHoursPrice}</p>
                            )}
                        </div>
                    </div>

                    {/* Advance Booking Notice */}
                    {/* <div className="flex flex-col gap-4">
                        <Typography size="base" weight="semibold">
                            Advance Booking Notice
                        </Typography>
                        <RadioGroup
                            value={advanceNotice || '2'}
                            onValueChange={setAdvanceNotice}
                            className="flex gap-6"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="1" id="notice-1" />
                                <Label htmlFor="notice-1">1 Day</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="2" id="notice-2" />
                                <Label htmlFor="notice-2">2 Days</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="7" id="notice-7" />
                                <Label htmlFor="notice-7">7 Days</Label>
                            </div>
                        </RadioGroup>
                    </div> */}

                    {/* Available Window
                    <div className="flex flex-col gap-4">
                        <Typography size="base" weight="semibold">
                            Available window
                        </Typography>
                        <RadioGroup
                            value={availableWindow}
                            onValueChange={setAvailableWindow}
                            className="grid grid-cols-4"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="1" id="window-1" />
                                <Label htmlFor="window-1">1 Month</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="3" id="window-3" />
                                <Label htmlFor="window-3">3 Months</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="6" id="window-6" />
                                <Label htmlFor="window-6">6 Months</Label>
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <RadioGroupItem value="12" id="window-12" />
                                <Label htmlFor="window-12">1 Year</Label>
                            </div> */}
                    {/* </RadioGroup>
            </div> */}

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
                            {isPending ? 'Updating...' : 'Update Property Details'}
                        </Button>
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </SheetContent >
        </Sheet >
    );
}
