'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneInputComponent from '@/components/ui/phoneInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface PayoutDetailsData {
    payoutBusiness?: any;
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
}

export interface PayoutDetailsFormProps {
    data: PayoutDetailsData;
    isEdit?: boolean;
    onChange: (values: PayoutDetailsData) => void;
}

export const PayoutDetailsForm: React.FC<PayoutDetailsFormProps> = ({
    data,
    isEdit = true,
    onChange,
}) => {
    const values: PayoutDetailsData = {
        accountType: data?.accountType ||  'personal',
        businessName: data.businessName ?? '',
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        email: data.email ?? '',
        dob: data.dob ?? '',
        countryOfBirth: data.countryOfBirth ?? '',
        citizenship: data.citizenship ?? '',
        phoneNumber: data.phoneNumber ?? '',
        countryCode: data.countryCode ?? '91',
        contactName: data.contactName ?? '',
    };

    const handleAccountTypeChange = (type: 'personal' | 'business') => {
        onChange({ ...data, accountType: type });
    };

    return (
        <div className="space-y-6 rounded-lg pt-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Payout Details</h2>
            </div>

            <div className="space-y-3">
                <Label className="text-gray-700 text-base font-semibold">Account Type</Label>
                <RadioGroup
                    value={values.accountType}
                    onValueChange={handleAccountTypeChange}
                    className="flex gap-6"
                    disabled={!isEdit}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="personal" id="personal" disabled={!isEdit} />
                        <Label htmlFor="personal">Personal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business" id="business" disabled={!isEdit} />
                        <Label htmlFor="business">Business</Label>
                    </div>
                </RadioGroup>

                {values.accountType === 'business' && (
                    <div className="mt-4 transition-all duration-300 ease-in-out">
                        <Input
                            label="Registered Company Name"
                            placeholder="Enter your business legal name"
                            value={values.businessName}
                            onChange={(e) => onChange({ ...data, businessName: e.target.value })}
                            disabled={!isEdit}
                            className="rounded-full"
                            required={values.accountType === 'business'}
                        />
                        <p className="text-xs text-gray-500 mt-1 ml-1">
                            Please enter the registered business name as per official documents
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Input
                        label="First Name"
                        placeholder="Enter your first name"
                        value={values.firstName}
                        onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                        disabled={!isEdit}
                        className="rounded-full"
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={values.lastName}
                        onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                        disabled={!isEdit}
                        className="rounded-full"
                        required
                    />
                </div>
            </div>

            <div>
                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email address"
                    value={values.email}
                    onChange={(e) => onChange({ ...data, email: e.target.value })}
                    disabled={!isEdit}
                    className="rounded-full"
                    required
                />
            </div>

            <div>
                <Input
                    label="Date of Birth"
                    placeholder="DD/MM/YYYY"
                    value={values.dob}
                    type="date"
                    onChange={(e) => onChange({ ...data, dob: e.target.value })}
                    disabled={!isEdit}
                    className="rounded-full"
                    required
                />
            </div>


            <div>
                <PhoneInputComponent
                    label="Phone Number"
                    phone={values.phoneNumber}
                    code={values.countryCode}
                    onChange={(phone: string, code: string) => {
                        onChange({
                            ...data,
                            phoneNumber: phone,
                            countryCode: code,
                        });
                    }}
                />
            </div>

            <div>
                <Input
                    label="Contact Name"
                    placeholder="Enter contact person name"
                    value={values.contactName}
                    onChange={(e) => onChange({ ...data, contactName: e.target.value })}
                    disabled={!isEdit}
                    className="rounded-full"
                />
            </div>
        </div>
    );
};
