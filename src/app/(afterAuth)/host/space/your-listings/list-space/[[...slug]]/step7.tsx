'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';
import { useUpdateSpaceListStep7, SpaceDetailsInterface } from '@/services';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step7Schema, Step7FormValues } from './schemas';

interface LabelLineProps {
    value: boolean;
    label: string;
    onChange: (checked: boolean) => void;
    id: string;
    hasError?: boolean;
}

const LabelLine = ({ value, label, onChange, id, hasError }: LabelLineProps) => {
    return (
        <div className="flex items-center gap-2">
            <Checkbox
                id={id}
                checked={value}
                onCheckedChange={(checked) => onChange(checked as boolean)}
                className={`border-gray-300 cursor-pointer data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28] ${hasError ? 'border-red-500' : ''
                    }`}
            />
            <label htmlFor={id} className="cursor-pointer select-none">
                <Typography weight="medium" size="sm" color="text-gray-700">
                    {label}
                </Typography>
            </label>
        </div>
    );
};

interface Step7Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
}

const Step7 = ({ editData, isEdit }: Step7Props) => {
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(isEdit === 'true');
    const isInitializedRef = useRef(false);
    const [newRule, setNewRule] = useState('');

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<Step7FormValues>({
        resolver: zodResolver(step7Schema),
        defaultValues: {
            keepConversations: false,
            processPayments: false,
            payoutDeposit: false,
            followPolicies: false,
            noConflictingContracts: false,
            localRegulations: false,
            customRules: [],
        },
    });

    const customRules = watch('customRules') || [];

    const { mutate: submitStep7, isPending } = useUpdateSpaceListStep7({
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit === 'true' ? '&isEdit=true' : '';
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=8${editParam}`);
        },
        onError: (error: any) => {
            console.error(error.message || 'Something went wrong');
        },
    });

    useEffect(() => {
        if (isEdit === 'true' && editData && editData.SpaceListing && !isInitializedRef.current) {
            const policies = editData.SpaceListing.policies?.[0];

            reset({
                keepConversations: policies?.platform_communication?.keep_conversations_on_platform || false,
                processPayments: policies?.payment_processing?.process_payments_on_platform || false,
                payoutDeposit: policies?.payment_processing?.understand_service_fee || false,
                followPolicies: policies?.booking_policies?.follow_booking_policies || false,
                noConflictingContracts: policies?.booking_policies?.understand_no_external_contracts || false,
                localRegulations: policies?.regulations?.space_meets_regulations || false,
                customRules: editData.SpaceListing.custom_rules || [],
            });
            setIsLoading(false);
            isInitializedRef.current = true;
        }
    }, [editData, spaceId, isEdit, reset]);

    const addRule = () => {
        if (newRule.trim()) {
            const currentRules = [...customRules];
            currentRules.push(newRule.trim());
            setValue('customRules', currentRules);
            setNewRule('');
        }
    };

    const removeRule = (index: number) => {
        const currentRules = customRules.filter((_, i) => i !== index);
        setValue('customRules', currentRules);
    };

    const onSubmit = (data: Step7FormValues) => {
        const payload = {
            space_id: Number(spaceId),
            policies: [
                {
                    platform_communication: {
                        keep_conversations_on_platform: data.keepConversations,
                    },
                    payment_processing: {
                        process_payments_on_platform: data.processPayments,
                        understand_service_fee: data.payoutDeposit,
                    },
                    booking_policies: {
                        follow_booking_policies: data.followPolicies,
                        understand_no_external_contracts: data.noConflictingContracts,
                    },
                    regulations: {
                        space_meets_regulations: data.localRegulations,
                    },
                },
            ],
            custom_rules: data.customRules || [],
            is_edit: isEdit === 'true',
        };

        submitStep7(payload);
    };

    const handleGoBack = () => {
        router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=6&isEdit=true`);
    };

    if (isLoading) {
        return (
            <div className="space-y-8 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-200 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6CD28]"></div>
                    <Typography weight="medium" color="text-gray-600" size="lg">
                        Loading policies...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-200">
                <Typography weight="semibold" color="text-gray-900" size="2xl">
                    Space Policies & Agreements
                </Typography>
                <div className="w-20 border-t"></div>

                {/* Platform communication */}
                <div className="space-y-4">
                    <Label className="text-zinc-800 text-base font-semibold">
                        Keep conversations on Spare Space
                    </Label>
                    <Controller
                        control={control}
                        name="keepConversations"
                        render={({ field }) => (
                            <LabelLine
                                id="keepConversations"
                                value={field.value}
                                label="I agree to keep all conversations with guests on the platform so everyone knows the terms agreed upon."
                                onChange={field.onChange}
                                hasError={!!errors.keepConversations}
                            />
                        )}
                    />
                </div>

                {/* Payment processing */}
                <div className="space-y-4">
                    <Label className="text-zinc-800 text-base font-semibold">
                        Use Spare Space to process payments
                    </Label>
                    <Controller
                        control={control}
                        name="processPayments"
                        render={({ field }) => (
                            <LabelLine
                                id="processPayments"
                                value={field.value}
                                label="I understand that all payments must be processed on the Spare Space platform."
                                onChange={field.onChange}
                                hasError={!!errors.processPayments}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="payoutDeposit"
                        render={({ field }) => (
                            <LabelLine
                                id="payoutDeposit"
                                value={field.value}
                                label="I acknowledge that payouts will be made via direct deposit to my bank account."
                                onChange={field.onChange}
                                hasError={!!errors.payoutDeposit}
                            />
                        )}
                    />
                </div>

                {/* Booking policies */}
                <div className="space-y-4">
                    <Label className="text-zinc-800 text-base font-semibold">
                        Follow booking and cancellation policies
                    </Label>
                    <Controller
                        control={control}
                        name="followPolicies"
                        render={({ field }) => (
                            <LabelLine
                                id="followPolicies"
                                value={field.value}
                                label="I agree to abide by the booking, cancellation, and overtime policies."
                                onChange={field.onChange}
                                hasError={!!errors.followPolicies}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="noConflictingContracts"
                        render={({ field }) => (
                            <LabelLine
                                id="noConflictingContracts"
                                value={field.value}
                                label="I understand that contracts conflicting with these policies are not allowed."
                                onChange={field.onChange}
                                hasError={!!errors.noConflictingContracts}
                            />
                        )}
                    />
                </div>

                {/* Local regulations */}
                <div className="space-y-4">
                    <Label className="text-zinc-800 text-base font-semibold">
                        Make sure your space meets local regulations
                    </Label>
                    <Controller
                        control={control}
                        name="localRegulations"
                        render={({ field }) => (
                            <LabelLine
                                id="localRegulations"
                                value={field.value}
                                label="I confirm that my space complies with all local regulations to ensure the safety of guests."
                                onChange={field.onChange}
                                hasError={!!errors.localRegulations}
                            />
                        )}
                    />
                </div>

                {/* Custom rules */}
                <div className="space-y-2">
                    <Label className="text-zinc-800 text-base font-semibold">
                        Custom Space Rules
                    </Label>
                    {customRules.map((rule, index) => (
                        <div key={index} className="flex items-start leading-tight">
                            <span className="text-gray-700 text-sm font-medium margin-0 flex-1">
                                {rule}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeRule(index)}
                                className="p-0 px-0 flex items-center justify-center cursor-pointer hover:bg-gray-200 text-gray-400 border-gray-400 border rounded-full w-6 h-6"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-5 w-full">
                        <Input
                            placeholder="Add a rule"
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addRule();
                                }
                            }}
                            className="rounded-md w-full"
                        />
                        <Button
                            type="button"
                            variant={'default'}
                            onClick={addRule}
                            className="bg-[#F6CD28] text-nowrap text-black"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Rule
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full flex justify-end gap-4 items-end h-20">
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

export default Step7;
