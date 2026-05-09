'use client';

import { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import BusinessAddressForm from './BusinessAddressForm';
import BusinessIdentityForm from './BusinessIdentityForm';
import BankDetailsForm from './BankDetailsForm';
import { PayoutDetailsForm } from './PayoutDetailsForm';
import { useGetPayoutDetails, usePayoutDetails } from '@/services';
import { toast } from 'react-toastify';
import Loader from '@/components/ui/loader';
import { handleApiError } from '@/hooks/handleApiError';
import { Pencil, Save, X } from 'lucide-react';
import { handleVerifyApiError } from '@/hooks/handleVerifyApiError';
import Link from 'next/link';

interface FormData {
    payoutDetails: {
        accountType?: 'personal' | 'business';
        businessName?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        dob?: string;
        countryOfBirth?: string;
        citizenship?: string;
        phoneNumber?: string;
        countryCode?: string;
        contactName?: string;
    };
    businessAddress: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    };
    businessIdentity: {
        pan: string;
        gstin?: string;
    };
    bankDetails: {
        type?: 'current' | 'savings';
        accountNumber?: string;
        confirmAccountNumber?: string;
        bankName?: string;
        ifscCode?: string;
        accountHolderName?: string;
    };
}

interface ApiPayload {
    isBusinessType: boolean;
    businessName?: string | null;
    pan: string;
    gstNumber?: string | null;
    payout: {
        firstName: string;
        lastName: string;
        email: string;
        dob: string;
        countryOfBirth: string;
        citizenship: string;
        countryCode: string;
        phoneNumber: string;
        contactName: string;
    };
    address: {
        line1: string;
        line2: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };
    bank: {
        bankName: string;
        ifscCode: string;
        accountNumber: string;
        accountHolderName: string;
        type: 'current' | 'savings';
        isPrimary: boolean;
    };
}

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const FIELD_DISPLAY_NAMES: Record<string, string> = {
    accountType: 'Account Type',
    businessName: 'Business Name',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    dob: 'Date of Birth',
    phoneNumber: 'Phone Number',
    contactName: 'Contact Name',
    line1: 'Address Line 1',
    line2: 'Address Line 2',
    city: 'City',
    state: 'State',
    country: 'Country',
    pincode: 'PIN Code',
    type: 'Account Type',
    accountNumber: 'Account Number',
    confirmAccountNumber: 'Confirm Account Number',
    bankName: 'Bank Name',
    ifscCode: 'IFSC Code',
    accountHolderName: 'Account Holder Name',
    pan: 'PAN Number',
    gstin: 'GSTIN',
};

export default function LinkPayout() {
    const [formData, setFormData] = useState<FormData>({
        payoutDetails: {},
        businessAddress: {},
        businessIdentity: { pan: '', gstin: '' },
        bankDetails: {},
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { data: payoutData, refetch: refetchPayoutDetails } = useGetPayoutDetails();
    const payOutDetails = payoutData?.data;

    const { mutate: payoutDetailsAPI, isPending: isSubmitting } = usePayoutDetails({
        onSuccess: (data) => {
            toast.success(data?.message || 'Payout details saved successfully');
            setIsEditMode(false);
            refetchPayoutDetails();
        },
        onError: (err) => handleApiError(err),
    });

    useEffect(() => {
        if (!payOutDetails) {
            setIsLoading(false);
            return;
        }



        const accountType: 'personal' | 'business' = payOutDetails.businessName
            ? 'business'
            : 'personal';

        const payload = {
            payoutDetails: {
                accountType: accountType,
                businessName: payOutDetails.businessName || '',
                firstName: payOutDetails.payout?.firstName ?? '',
                lastName: payOutDetails.payout?.lastName ?? '',
                email: payOutDetails.payout?.email ?? '',
                dob: payOutDetails.payout?.dob ?? '',
                countryOfBirth: payOutDetails.payout?.countryOfBirth ?? '',
                citizenship: payOutDetails.payout?.citizenship ?? '',
                phoneNumber: payOutDetails.payout?.phoneNumber ?? '',
                countryCode: payOutDetails.payout?.countryCode
                    ? payOutDetails.payout.countryCode
                    : '91',
                contactName: payOutDetails.payout?.contactName ?? '',
            },
            businessAddress: {
                line1: payOutDetails.address?.line1 ?? '',
                line2: payOutDetails.address?.line2 ?? '',
                city: payOutDetails.address?.city ?? '',
                state: payOutDetails.address?.state ?? '',
                country: payOutDetails.address?.country ?? '',
                pincode: payOutDetails.address?.pincode ?? '',
            },
            businessIdentity: {
                pan: payOutDetails.businessPan ?? '',
                gstin: payOutDetails.gstNumber ?? null,
            },
            bankDetails: {
                type: (payOutDetails.bankAccount?.[0]?.type as 'current' | 'savings') ?? 'savings',
                accountNumber: payOutDetails.bankAccount?.[0]?.accountNumber ?? '',
                confirmAccountNumber: payOutDetails.bankAccount?.[0]?.accountNumber ?? '',
                bankName: payOutDetails.bankAccount?.[0]?.bankName ?? '',
                ifscCode: payOutDetails.bankAccount?.[0]?.ifscCode ?? '',
                accountHolderName: payOutDetails.bankAccount?.[0]?.accountHolderName ?? '',
            },
        };

        setFormData(payload);
        setIsLoading(false);

        if (payOutDetails.payout?.firstName) {
            setIsEditMode(false);
        } else {
            setIsEditMode(true);
        }
    }, [payOutDetails]);

    const updateSection = (section: keyof FormData, values: any) => {
        setFormData((prev) => ({
            ...prev,
            [section]: section === 'businessIdentity' ? { ...values } : values,
        }));
    };

    const getMissingFields = (obj: Record<string, any>, requiredFields: string[]): string[] => {
        return requiredFields.filter((key) => !obj[key] || obj[key].toString().trim() === '');
    };

    const getDisplayFieldNames = (fields: string[]): string => {
        return fields.map((field) => FIELD_DISPLAY_NAMES[field] || field).join(', ');
    };

    const validateForm = (): boolean => {
        if (!termsAccepted) {
            toast.error('Please accept Terms & Conditions');
            return false;
        }

        const payoutRequiredFields = [
            'firstName',
            'lastName',
            'email',
            'dob',
            'phoneNumber',
            'contactName',
        ];

        if (formData.payoutDetails.accountType === 'business') {
            payoutRequiredFields.push('businessName');
        }

        const missingPayoutFields = getMissingFields(formData.payoutDetails, payoutRequiredFields);
        if (missingPayoutFields.length > 0) {
            toast.error(
                `Please fill in the following payout details: ${getDisplayFieldNames(missingPayoutFields)}`,
            );
            return false;
        }

        const addressRequiredFields = ['line1', 'city', 'state', 'pincode', 'country'];
        const missingAddressFields = getMissingFields(
            formData.businessAddress,
            addressRequiredFields,
        );
        if (missingAddressFields.length > 0) {
            toast.error(
                `Please fill in the following address fields: ${getDisplayFieldNames(missingAddressFields)}`,
            );
            return false;
        }

        const identityRequiredFields = ['pan'];
        const missingIdentityFields = getMissingFields(
            formData.businessIdentity,
            identityRequiredFields,
        );
        if (missingIdentityFields.length > 0) {
            toast.error(
                `Please fill in the following business identity fields: ${getDisplayFieldNames(missingIdentityFields)}`,
            );
            return false;
        }

        if (formData.businessIdentity.pan && !panRegex.test(formData.businessIdentity.pan)) {
            toast.error('Please enter a valid PAN number (format: ABCDE1234F)');
            return false;
        }

        // GSTIN is optional for business accounts
        // if (!gstinRegex.test(formData.businessIdentity.gstin)) {
        //     toast.error('Please enter a valid GSTIN number');
        //     return false;
        // }

        const bankRequiredFields = [
            'type',
            'accountNumber',
            'confirmAccountNumber',
            'bankName',
            'ifscCode',
            'accountHolderName',
        ];
        const missingBankFields = getMissingFields(formData.bankDetails, bankRequiredFields);
        if (missingBankFields.length > 0) {
            toast.error(
                `Please fill in the following bank details: ${getDisplayFieldNames(missingBankFields)}`,
            );
            return false;
        }

        if (formData.bankDetails.accountNumber !== formData.bankDetails.confirmAccountNumber) {
            toast.error(
                'Account numbers do not match. Please check your account number and confirmation.',
            );
            return false;
        }

        if (formData.bankDetails.ifscCode && !ifscRegex.test(formData.bankDetails.ifscCode)) {
            toast.error('Please enter a valid IFSC code');
            return false;
        }

        return true;
    };

    const buildPayload = (): ApiPayload => {
        const { confirmAccountNumber, ...bankDetails } = formData.bankDetails;

        const isBusinessType = formData.payoutDetails.accountType === 'business';

        const businessName = isBusinessType ? formData.payoutDetails.businessName : null;

        const pan = formData.businessIdentity.pan || '';
        const gstin = formData.businessIdentity.gstin?.trim() || null;

        return {
            isBusinessType: isBusinessType,
            businessName: businessName,
            pan: pan,
            gstNumber: gstin,
            payout: {
                firstName: formData.payoutDetails.firstName || '',
                lastName: formData.payoutDetails.lastName || '',
                email: formData.payoutDetails.email || '',
                dob: formData.payoutDetails.dob || '',
                countryOfBirth: 'India',
                citizenship: 'India',
                countryCode: formData.payoutDetails.countryCode || '91',
                phoneNumber: formData.payoutDetails.phoneNumber || '',
                contactName: formData.payoutDetails.contactName || '',
            },
            address: {
                line1: formData.businessAddress.line1 || '',
                line2: formData.businessAddress.line2 || '',
                city: formData.businessAddress.city || '',
                state: formData.businessAddress.state || '',
                country: formData.businessAddress.country || '',
                pincode: formData.businessAddress.pincode || '',
            },
            bank: {
                ...bankDetails,
                isPrimary: true,
            } as ApiPayload['bank'],
        };
    };

    const handleSave = () => {
        if (!validateForm()) return;

        try {
            const payload = buildPayload();
            payoutDetailsAPI(payload);
        } catch (error) {
            handleVerifyApiError(error);
        }
    };

    const handleCancel = () => {
        if (payOutDetails) {
            const payload = {
                payoutDetails: {
                    accountType: payOutDetails.accountType || 'personal',
                    businessName: payOutDetails.businessName || '',
                    firstName: payOutDetails.payout?.firstName ?? '',
                    lastName: payOutDetails.payout?.lastName ?? '',
                    email: payOutDetails.payout?.email ?? '',
                    dob: payOutDetails.payout?.dob ?? '',
                    countryOfBirth: payOutDetails.payout?.countryOfBirth ?? '',
                    citizenship: payOutDetails.payout?.citizenship ?? '',
                    phoneNumber: payOutDetails.payout?.phoneNumber ?? '',
                    countryCode: payOutDetails.payout?.countryCode
                        ? payOutDetails.payout.countryCode
                        : '91',
                    contactName: payOutDetails.payout?.contactName ?? '',
                },
                businessAddress: {
                    line1: payOutDetails.address?.line1 ?? '',
                    line2: payOutDetails.address?.line2 ?? '',
                    city: payOutDetails.address?.city ?? '',
                    state: payOutDetails.address?.state ?? '',
                    country: payOutDetails.address?.country ?? '',
                    pincode: payOutDetails.address?.pincode ?? '',
                },
                businessIdentity: {
                    pan: payOutDetails.businessPan ?? '',
                    gstin: payOutDetails.gstNumber ?? null,
                },
                bankDetails: {
                    type:
                        (payOutDetails.bankAccount?.[0]?.type as 'current' | 'savings') ??
                        'savings',
                    accountNumber: payOutDetails.bankAccount?.[0]?.accountNumber ?? '',
                    confirmAccountNumber: payOutDetails.bankAccount?.[0]?.accountNumber ?? '',
                    bankName: payOutDetails.bankAccount?.[0]?.bankName ?? '',
                    ifscCode: payOutDetails.bankAccount?.[0]?.ifscCode ?? '',
                    accountHolderName: payOutDetails.bankAccount?.[0]?.accountHolderName ?? '',
                },
            };
            setFormData(payload);
        }
        setIsEditMode(false);
    };

    const accordionSections = [
        {
            value: 'payout',
            title: 'Payout Details',
            component: (
                <PayoutDetailsForm
                    data={formData.payoutDetails}
                    onChange={(values) => updateSection('payoutDetails', values)}
                    isEdit={isEditMode}
                />
            ),
        },
        {
            value: 'address',
            title: 'Address',
            component: (
                <BusinessAddressForm
                    data={formData.businessAddress}
                    onChange={(values) => updateSection('businessAddress', values)}
                    isEdit={isEditMode}
                />
            ),
        },
        {
            value: 'identity',
            title: 'Business Identity',
            component: (
                <BusinessIdentityForm
                    isAccountTypePersonal={formData?.payoutDetails?.accountType === 'personal'}
                    data={formData.businessIdentity}
                    onChange={(values) => updateSection('businessIdentity', values)}
                    isEdit={isEditMode}
                    refetch={refetchPayoutDetails}
                />
            ),
        },
        {
            value: 'bank',
            title: 'Bank Details',
            component: (
                <BankDetailsForm
                    data={formData.bankDetails}
                    onChange={(values) => updateSection('bankDetails', values)}
                    isEdit={isEditMode}
                />
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto py-10">
                <div className="flex justify-center items-center h-64">
                    <Loader size={40} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Payout Setup</h1>
                {!isEditMode && (
                    <Button
                        onClick={() => setIsEditMode(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit Details
                    </Button>
                )}
            </div>

            <p className="text-zinc-600 text-base">
                Securely link your account to ensure smooth and hassle-free payouts. Please provide
                your business and bank details to complete the setup. PAN is mandatory, while GSTIN
                is optional.
            </p>

            <Accordion
                type="multiple"
                className="border-none flex flex-col gap-6 w-full"
                defaultValue={['payout', 'address', 'identity', 'bank']}
            >
                {accordionSections.map((section) => (
                    <AccordionItem
                        key={section.value}
                        value={section.value}
                        className="border-none"
                    >
                        <AccordionTrigger className="text-zinc-800 border-b pb-3 border-gray-200 text-xl font-semibold">
                            {section.title}
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 ">{section.component}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {isEditMode ? (
                <div className="space-y-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                        />
                        <Label htmlFor="terms" className="text-sm">
                            I accept the{' '}
                            <a
                                href="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary cursor-pointer underline"
                            >
                                Terms & Conditions
                            </a>
                            .
                        </Label>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader size={16} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                !payOutDetails?.payout?.firstName && (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="terms-view"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                        />

                        <Label htmlFor="terms-view" className="text-sm">
                            I accept the
                        </Label>

                        <Link
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline cursor-pointer text-sm"
                        >
                            Terms & Conditions
                        </Link>
                    </div>

                )
            )}
        </div>
    );
}
