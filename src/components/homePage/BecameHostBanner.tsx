'use client';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Typography from '@/components/ui/typoGraphy';
import logo from '@/assets/logo.svg';
import { hostIllustration } from '@/assets';
import { usePathname, useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useUpdateGuestToHost } from '@/services';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmHostModal from '../layout/confirmHostModal';
import { Button } from '../ui/button';
import { handleApiError } from '@/hooks/handleApiError';

interface BecameHostBannerProps {
    // Optional props for customization
    customImageSrc?: string;
    customImageAlt?: string;
    customButtonText?: string;
    customOnButtonClick?: () => void;
    customHeadline?: string;
    customDescription?: string;
    customButtonTextSize?: string; // Custom button text size
    showArrow?: boolean; // Show arrow after button text
    // Keep existing functionality intact
    useDefaultFlow?: boolean; // Default to true for backward compatibility
}

export default function BecameHostBanner({
    customImageSrc,
    customImageAlt = 'Custom illustration',
    customButtonText,
    customOnButtonClick,
    customHeadline,
    customDescription,
    customButtonTextSize,
    showArrow = false,
    useDefaultFlow = true,
}: BecameHostBannerProps = {}) {
    const router = useRouter();
    const pathname = usePathname();

    const isHostMode = pathname && typeof pathname === 'string' ? pathname.includes('host') : false;

    const queryClient = useQueryClient();

    // Safe selector with fallbacks
    const authState = useSelector((state: RootState) => state?.auth);
    const userRole = Array.isArray(authState?.userRole) ? authState.userRole : [];

    const [isHostChangeModal, setIsHostChangeModal] = useState<boolean>(false);

    const { mutate: updateGuestRole } = useUpdateGuestToHost({
        onSuccess: (res) => {
            toast.success(res.message);
            setIsHostChangeModal(false);
            queryClient.invalidateQueries({ queryKey: ['get-profile'] });
            router.replace(PATHS.YOUR_LISTING);
        },
        onError: (err) => {
            handleApiError(err);
            setIsHostChangeModal(false);
        },
    });

    const onSwitchClick = () => {
        // Use custom click handler if provided and not using default flow
        if (customOnButtonClick && !useDefaultFlow) {
            customOnButtonClick();
            return;
        }

        // Default flow logic (existing behavior)
        if (isHostMode) {
            router.replace(PATHS.HOME_PAGE);
        } else {
            if (Array.isArray(userRole) && userRole.includes('host')) {
                router.replace(PATHS.YOUR_LISTING);
            } else {
                setIsHostChangeModal(true);
            }
        }
    };

    const displayHeadline = customHeadline || 'List Your Space';
    const displayDescription = customDescription || 'Own a space? List it and start earning today!';

    const getButtonText = () => {
        if (customButtonText) return customButtonText;
        if (isHostMode) return 'Switch to Booking';
        if (Array.isArray(userRole) && userRole.includes('host')) return 'Switch to Hosting';
        return 'List your Space';
    };

    const displayButtonText = getButtonText();

    const displayImageAlt = 'Host illustration';

    const renderHeadline = () => {
        if (!displayHeadline || typeof displayHeadline !== 'string') {
            return displayHeadline || 'List Your Space & Earn!';
        }

        if (displayHeadline.includes('Space')) {
            const words = displayHeadline.split(' ');
            return words.map((word, index) => {
                const isSpaceWord = word.toLowerCase() === 'space';
                const showSpace = index < words.length - 1 ? ' ' : '';

                return (
                    <span key={index}>
                        {isSpaceWord ? <span className="text-yellow-400">{word}</span> : word}
                        {showSpace}
                    </span>
                );
            });
        }

        return displayHeadline;
    };

    return (
        <section className="flex w-full items-center justify-between bg-gray-50 ">
            <div className=" py-12 px-20  gap-8">
                {/* Left Content */}
                <div className="flex flex-col items-start max-w-md">
                    {/* Logo */}
                    <div className="mb-4">
                        <Image
                            src={logo || '/default-logo.svg'}
                            alt="Spare Space"
                            width={120}
                            height={40}
                        />
                    </div>

                    {/* Heading */}
                    <Typography size="4xl" weight="bold" color="gray-900">
                        {renderHeadline()}
                    </Typography>

                    {/* Subtext */}
                    <Typography size="base" color="gray-500" className="mt-2">
                        {displayDescription}
                    </Typography>

                    <div className="my-4">
                        <Button
                            variant="default"
                            onClick={onSwitchClick}
                            className={`select-none text-black rounded-full px-5 py-2 cursor-pointer font-semibold ${
                                customButtonTextSize || 'text-[1rem]'
                            }`}
                            disabled={!router}
                        >
                            {displayButtonText}
                            {showArrow && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Image  */}
            <div className="flex-1">
                <Image
                    src={hostIllustration}
                    alt={displayImageAlt}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover object-center"
                    unoptimized
                />
            </div>

            {ConfirmHostModal && (
                <ConfirmHostModal
                    onConfirm={() => {
                        if (updateGuestRole && typeof updateGuestRole === 'function') {
                            updateGuestRole();
                        }
                    }}
                    onClose={() => setIsHostChangeModal(false)}
                    open={isHostChangeModal}
                />
            )}
        </section>
    );
}
