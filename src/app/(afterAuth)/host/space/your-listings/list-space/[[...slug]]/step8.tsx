'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Toggle } from '@/components/ui/toggle';
import { Modal } from '@/components/ui/modal';
import { PencilIcon } from 'lucide-react';
import {
    SpaceDetailsInterface,
    useUpdateSpaceListStep8,
    Step8Payload,
} from '@/services';
import { useRouter, useSearchParams } from 'next/navigation';
import { PATHS } from '@/constants/path';
import { toast } from 'react-toastify';
import { CONTACT } from '@/constants/contact';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step8Schema, Step8FormValues } from './schemas';

interface Step8Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
}

interface CancellationPolicy {
    id: string;
    name: string;
    description: string;
}

const cancellationPolicies: CancellationPolicy[] = [
    {
        id: 'super-flexible',
        name: 'Super Flexible',
        description:
            'Cancel up to 24 hours before the start time for a full refund. Cancel between 24 hours and 2 hours before for a 50% refund. Less than 2 hours before or after the booking starts is non-refundable. Includes a 2-hour grace period if the start time is at least 48 hours away.',
    },
    {
        id: 'flexible',
        name: 'Flexible',
        description:
            'Cancel up to 72 hours before the start time for a full refund. Cancel between 72 hours and 24 hours before for a 50% refund. Less than 24 hours before or after the booking starts is non-refundable. This is the default policy for all new listings.',
    },
    {
        id: 'moderate',
        name: 'Moderate',
        description:
            'Cancel up to 7 days before the start time for a full refund. Cancel between 7 days and 72 hours before for a 50% refund. Less than 72 hours before or after the booking starts is non-refundable.',
    },
    {
        id: 'firm',
        name: 'Firm',
        description:
            'No full refunds except during the grace period. Cancel 14 days or more before the start time for a 50% refund. Within 14 days or after the booking starts is non-refundable.',
    },
    {
        id: 'strict',
        name: 'Strict',
        description:
            'All bookings are non-refundable. A grace period is available if the booking start time is at least 48 hours away.',
    },
];

const Step8 = ({ editData, isEdit }: Step8Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(isEdit === 'true');
    const isInitializedRef = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { isSubmitting },
    } = useForm<Step8FormValues>({
        resolver: zodResolver(step8Schema),
        defaultValues: {
            // @ts-ignore
            cancellationPolicy: 'flexible',
            isNonRefundable: false,
        },
    });

    const selectedPolicy = watch('cancellationPolicy');
    const isNonRefundable = watch('isNonRefundable');

    const { mutate: updateCancellationPolicy, isPending } = useUpdateSpaceListStep8({
        onSuccess: (response) => {
            toast.success(response.message || 'Cancellation policy updated successfully');
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit === 'true' ? '&isEdit=true' : '';
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=9${editParam}`);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update cancellation policy');
        },
    });

    useEffect(() => {
        if (isEdit === 'true' && editData && editData.SpaceListing && !isInitializedRef.current) {
            let policyKey = 'flexible';
            if (editData.SpaceListing.cancellationPolicy?.key) {
                policyKey = editData.SpaceListing.cancellationPolicy.key.toLowerCase();
            } else if (editData.SpaceListing.cancellation_policy) {
                policyKey = editData.SpaceListing.cancellation_policy.toLowerCase();
            }

            const validPolicies = ['super-flexible', 'flexible', 'moderate', 'firm', 'strict'];
            if (!validPolicies.includes(policyKey)) {
                policyKey = 'flexible';
            }

            reset({
                // @ts-ignore
                cancellationPolicy: policyKey,
                isNonRefundable: editData.SpaceListing.isRefundable || false,
            });
            setIsLoading(false);
            isInitializedRef.current = true;
        }
    }, [editData, spaceId, isEdit, reset]);

    const onSubmit = (data: Step8FormValues) => {
        const selectedPolicyData = cancellationPolicies.find(
            (policy) => policy.id === data.cancellationPolicy,
        );

        const payload: Step8Payload = {
            spaceId: Number(spaceId),
            isRefundable: data.isNonRefundable,
            cancellationPolicy: {
                message: selectedPolicyData?.description || '',
                key: data.cancellationPolicy,
            },
            is_edit: isEdit === 'true',
        };

        updateCancellationPolicy(payload);
    };

    const handleGoBack = () => {
        router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=7&isEdit=true`);
    };

    const selectedPolicyData = cancellationPolicies.find((policy) => policy.id === selectedPolicy);

    if (isLoading) {
        return (
            <div className="space-y-8 md:p-8 max-w-[900px] p-4 rounded-2xl border border-gray-200 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6CD28]"></div>
                    <Typography weight="medium" color="text-gray-600" size="lg">
                        Loading policy...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 md:p-8 max-w-[900px] p-4 rounded-2xl border border-gray-200">
                <Typography weight="semibold" color="text-gray-900" size="2xl">
                    Cancellation Policy
                </Typography>

                {/* Current Policy Display */}
                <div className="space-y-8">
                    {!isNonRefundable && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Typography weight="semibold" color="text-gray-900" size="base">
                                        {selectedPolicyData?.name}
                                    </Typography>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <PencilIcon className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>

                                    <Modal
                                        open={isModalOpen}
                                        onClose={() => setIsModalOpen(false)}
                                        title="Select Cancellation Policy"
                                        size="md"
                                        className="max-h-[80vh]"
                                    >
                                        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            <Controller
                                                control={control}
                                                name="cancellationPolicy"
                                                render={({ field }) => (
                                                    <RadioGroup
                                                        value={field.value}
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            setIsModalOpen(false);
                                                        }}
                                                        className="space-y-4 pr-2"
                                                    >
                                                        {cancellationPolicies.map((policy) => (
                                                            <label
                                                                key={policy.id}
                                                                htmlFor={`policy-${policy.id}`}
                                                                className={`border rounded-lg p-4 cursor-pointer transition-colors block ${field.value === policy.id
                                                                    ? 'border-gray-800 bg-gray-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-gray-900 font-semibold text-base cursor-pointer">
                                                                            {policy.name}
                                                                        </span>
                                                                        <RadioGroupItem
                                                                            value={policy.id}
                                                                            id={`policy-${policy.id}`}
                                                                        />
                                                                    </div>
                                                                    <p className="text-gray-600 text-sm">
                                                                        {policy.description}
                                                                    </p>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </RadioGroup>
                                                )}
                                            />
                                        </div>
                                    </Modal>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    {selectedPolicyData?.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Non-Refundable Option */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Typography weight="semibold" color="text-gray-900" size="base">
                                    Non- Refundable
                                </Typography>
                                <Controller
                                    control={control}
                                    name="isNonRefundable"
                                    render={({ field }) => (
                                        <Toggle
                                            pressed={field.value}
                                            onPressedChange={field.onChange}
                                            className="data-[state=on]:bg-[#F6CD28] data-[state=off]:bg-gray-300 cursor-pointer data-[state=on]:text-amber-900 rounded-full h-8 w-14"
                                        >
                                            <div
                                                className={`w-6 h-6 bg-white rounded-full transition-transform ${field.value ? 'translate-x-3' : '-translate-x-3'
                                                    }`}
                                            />
                                        </Toggle>
                                    )}
                                />
                            </div>
                            <p className="text-gray-600 text-sm">
                                Bookings are offered at a 10% discounted price and are always
                                non-refundable. No grace period applies.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Support Note */}
                <Typography
                    weight="semibold"
                    color="text-gray-800"
                    size="base"
                    className="text-center"
                >
                    Need Assistance?{' '}
                    <a
                        href={`mailto:${CONTACT.SUPPORT_EMAIL}`}
                        rel="noopener noreferrer"
                        className="text-amber-500 hover:underline"
                    >
                        contact at {CONTACT.SUPPORT_EMAIL}
                    </a>{' '}
                </Typography>
            </div>

            {/* Navigation Buttons */}
            <div className="w-full flex justify-end mt-auto gap-4 items-end h-20">
                <Button type="button" disabled={isPending || isSubmitting} variant="outline" onClick={handleGoBack}>
                    Go Back
                </Button>
                <Button
                    type="submit"
                    disabled={isPending || isSubmitting}
                    variant={isPending || isSubmitting ? 'disabled' : 'default'}
                >
                    {isPending || isSubmitting ? 'Submitting...' : 'Continue'}
                </Button>
            </div>
        </form>
    );
};

export default Step8;
