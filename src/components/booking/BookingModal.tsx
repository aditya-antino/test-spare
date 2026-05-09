import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Clock, Users } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    isReason?: boolean;
    onReject?: () => void;
}

const reasons = [...new Array(10)].map((_, i) => ({
    id: i + 1,
    title: `This is reason number ${i + 1}`,
}));

const BookingModal = ({
    isVisible,
    onClose,
    title,
    description,
    icon,
    isReason = false,
    onReject,
}: ModalProps) => {
    const [selectedReason, setSelectedReason] = React.useState<string>('');

    const handleReasonChange = (value: string) => {
        setSelectedReason(value);
    };

    return (
        <Modal
            className="max-w-[343px]"
            open={isVisible}
            showClose={!isReason}
            onClose={() => {
                onClose?.();
                setSelectedReason('');
            }}
            title={title}
            description={description}
            icon={icon}
        >
            <>
                <div className="bg-gray-100 p-4 sm:p-5 rounded-xl space-y-3 text-[#333333]">
                    <p className="font-medium text-sm sm:text-base text-[#333333]">1234567890</p>
                    <p className="font-semibold text-base sm:text-lg text-[#333333]">
                        Conference Room
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                        ABC Conference Room, 123 Business Tower, Connaught Place, New Delhi, 110001,
                        India.
                    </p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                        <Clock className="w-4 h-4" />
                        <span>09:00 AM → 09:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>6 attendees</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold">₹5,000</p>
                    <p className="text-xs sm:text-sm text-gray-700 leading-snug">
                        “I have a special request: Could you arrange seating in a U-shape and
                        provide a projector? Please let me know if this is possible. Thanks!”
                    </p>
                </div>

                {isReason && (
                    <div className="mt-3 sm:mt-4">
                        <p className="text-xs sm:text-sm text-gray-500 mb-2">
                            Reason for Cancellation
                        </p>

                        <Select value={selectedReason} onValueChange={handleReasonChange}>
                            <SelectTrigger className="w-full text-sm sm:text-base">
                                <SelectValue placeholder={'Select a reason'} />
                            </SelectTrigger>
                            <SelectContent>
                                {reasons.map((reason) => (
                                    <SelectItem key={reason.id} value={reason.title}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm sm:text-base font-medium">
                                                    {reason.title}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <ol className="list-decimal pl-5 sm:pl-6 text-gray-500 text-xs sm:text-sm mt-2 space-y-1">
                            <li>Maintenance issues or unexpected repairs.</li>
                            <li>
                                Utility failures such as water, electricity, or internet outages.
                            </li>
                        </ol>

                        <div className="space-y-2 sm:space-y-3 pt-3">
                            <Button
                                variant="destructive"
                                className="w-full rounded-full py-2 sm:py-3 text-sm sm:text-base"
                                onClick={() => onReject?.()}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full py-2 sm:py-3 text-sm sm:text-base"
                                onClick={() => onClose?.()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </>
        </Modal>
    );
};

export default BookingModal;
