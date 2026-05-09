import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Clock, Users } from 'lucide-react';
import { Reservation } from '@/services';
import dayjs from 'dayjs';
import { usePathname } from 'next/navigation';
import { HOST_PLATFORM_FEE_PER, HOST_TDS_PER } from '@/constants';

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    spaceData?: Reservation;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    isReason?: boolean;
}

const AcceptReservationModal = ({
    isVisible,
    onClose,
    spaceData,
    title,
    description,
    icon,
    isReason = false,
}: ModalProps) => {
    const pathname = usePathname();
    const isInHost = pathname.startsWith('/host');

    const hostPlatformFee =
        (Number(spaceData?.amount) * Number(spaceData?.hostPlatformFeePer)) / 100;
    const hostGST = spaceData?.Financial?.hostGst;
    const hostTDSFee = (Number(spaceData?.amount) * Number(spaceData?.hostTDSPer)) / 100;

    const totalHostAmount = Number(spaceData?.amount) - hostPlatformFee - hostTDSFee || 0;
    return (
        <Modal
            className="max-w-[343px]"
            open={isVisible}
            showClose={!isReason}
            onClose={() => {
                onClose?.();
            }}
            title={title}
            description={description}
            icon={icon}
        >
            <>
                <div className="bg-gray-100 p-4 sm:p-5 rounded-xl space-y-3 text-[#333333]">
                    {/* <p className="font-medium text-sm sm:text-base text-[#333333]">
                        {spaceData?.User?.phone_number || ''}
                    </p> */}
                    <p className="font-semibold text-base sm:text-lg text-[#333333] truncate">
                        {spaceData?.Space?.title || ''}
                    </p>

                    <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                        {spaceData?.Space?.address || ''}
                    </p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                        <Clock className="w-4 h-4" />
                        <span>
                            {spaceData?.start_datetime && spaceData?.end_datetime
                                ? `${dayjs(spaceData.start_datetime).format('hh:mm A')} → ${dayjs(spaceData.end_datetime).format('hh:mm A')}`
                                : '00:00 AM → 00:00 PM'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>
                            {spaceData?.User
                                ? `${spaceData.User.first_name || ''} ${
                                      spaceData.User.last_name
                                          ? spaceData.User.last_name[0] + '.'
                                          : ''
                                  }`.trim()
                                : '-'}
                        </span>
                    </div>
                    <p className="text-base sm:text-lg font-bold">
                        {isInHost
                            ? Number(totalHostAmount).toFixed(2)
                            : Number(spaceData?.totalAmount).toFixed(2) || '-'}
                    </p>
                    {spaceData?.guest_message && (
                        <p className="text-xs sm:text-sm text-gray-700 leading-snug">
                            &quot{spaceData?.guest_message || ''}&quot;
                        </p>
                    )}
                </div>
            </>
        </Modal>
    );
};

export default AcceptReservationModal;
