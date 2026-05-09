'use client';

import { AlertCircle, Shield, CreditCard, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useGetProfile, useGetKYCDoc, useGetPayoutDetails } from '@/services';
import React from 'react';

const TRACKED_TABS = [
    { label: 'Profile', value: 'profile' },
    { label: 'Verification', value: 'verification' },
    { label: 'Link Payout', value: 'link-payout' },
];

type TrackedTabValue = 'profile' | 'verification' | 'link-payout';

interface CompletionStatusProps {
    isInHost?: boolean;
    currentTab: string;
    setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
}

export default function CompletionStatus({
    isInHost = true,
    currentTab,
    setCurrentTab,
}: CompletionStatusProps) {
    const router = useRouter();
    const pathname = usePathname();

    const { data: profileData } = useGetProfile();
    const { data: kycData } = useGetKYCDoc();
    const { data: payoutData } = useGetPayoutDetails();

    const profile = profileData?.data;
    // Filter out PAN and GST documents
    const kycDocs = (kycData?.data || []).filter(
        (doc: any) => doc.type !== 'pan' && doc.type !== 'gst',
    );
    const payoutDetails = payoutData?.data;

    const isProfileComplete = Boolean(
        profile?.firstName && profile?.dob && profile?.gender && profile?.phoneNumber,
    );

    const isVerificationComplete = kycDocs.some(
        (doc: any) =>
            doc?.is_verified === true ||
            doc?.status === 'verified' ||
            (doc?.status === undefined && doc?.docLink),
    );

    const isPayoutCompleteStrict =
        payoutDetails &&
        payoutDetails.payout &&
        payoutDetails.address &&
        payoutDetails.bankAccount &&
        payoutDetails.bankAccount.length > 0 &&
        payoutDetails.payout.firstName &&
        payoutDetails.payout.lastName &&
        payoutDetails.payout.email &&
        payoutDetails.payout.phoneNumber &&
        payoutDetails.address.street &&
        payoutDetails.address.city &&
        payoutDetails.address.state &&
        payoutDetails.address.country &&
        payoutDetails.bankAccount?.[0]?.accountNumber &&
        payoutDetails.bankAccount?.[0]?.accountHolderName &&
        payoutDetails.bankAccount?.[0]?.ifscCode;

    const isPayoutCompleteAlt =
        payoutDetails &&
        (payoutDetails.payout || payoutDetails.businessPayout) &&
        (payoutDetails.address || payoutDetails.businessAddress) &&
        (payoutDetails.bankAccount || payoutDetails.bankDetails);

    const isPayoutComplete = Boolean(isPayoutCompleteStrict || isPayoutCompleteAlt);

    const completionBySection: Record<string, boolean> = {
        profile: isProfileComplete,
        verification: isVerificationComplete,
        ...(isInHost ? { 'link-payout': isPayoutComplete } : {}),
    };

    const incompleteSections = (Object.keys(completionBySection) as TrackedTabValue[]).filter(
        (key) => !completionBySection[key],
    );

    const isTrackedCurrentTab = TRACKED_TABS.map((t) => t.value).includes(currentTab);
    if (!isTrackedCurrentTab || incompleteSections.length === 0) return null;

    // helpers
    const iconFor = (tab: TrackedTabValue) =>
        tab === 'verification' ? (
            <Shield className="w-4 h-4" />
        ) : tab === 'link-payout' ? (
            <CreditCard className="w-4 h-4" />
        ) : (
            <User className="w-4 h-4" />
        );

    const labelFor = (tab: TrackedTabValue) =>
        TRACKED_TABS.find((t) => t.value === tab)?.label ?? tab;

    const handleGo = (to: TrackedTabValue) => {
        setCurrentTab(to);
        const base = pathname?.split('/').slice(0, -1).join('/') || '/host/account';
        router.push(`${base}/${to}`);
    };

    return (
        <div className="mb-6">
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
                <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-red-800 font-semibold">
                            Complete your account setup
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                            Please complete the following sections to finish your account setup:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {incompleteSections.map((section) => (
                                <button
                                    key={section}
                                    onClick={() => handleGo(section)}
                                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium
                  bg-white border border-red-200 text-red-700 hover:bg-red-100 transition"
                                >
                                    {iconFor(section)}
                                    Go to {labelFor(section)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
