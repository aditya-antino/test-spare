// components/forms/BankDetailsForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BankDetailsData {
    type?: 'current' | 'savings';
    accountNumber?: string;
    confirmAccountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    accountHolderName?: string;
    // lastName?: string;
}

interface BankDetailsFormProps {
    data: BankDetailsData;
    onChange: (values: BankDetailsData) => void;
    isEdit?: boolean;
}

export default function BankDetailsForm({ data, onChange, isEdit = true }: BankDetailsFormProps) {
    const values: Required<BankDetailsData> = {
        type: data.type ?? 'current',
        accountNumber: data.accountNumber ?? '',
        confirmAccountNumber: data.confirmAccountNumber ?? '',
        bankName: data.bankName ?? '',
        ifscCode: data.ifscCode ?? '',
        accountHolderName: data.accountHolderName ?? '',
    };
    return (
        <div className="space-y-4 pt-4">
            {/* Account Type */}
            <div>
                <Label className="block mb-2">Account Type</Label>
                <RadioGroup
                    value={values.type}
                    onValueChange={(val) =>
                        onChange({ ...values, type: val as 'current' | 'savings' })
                    }
                    className="flex gap-6"
                    disabled={!isEdit}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="current" id="current" disabled={!isEdit} />
                        <Label htmlFor="current">Current</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="savings" id="savings" disabled={!isEdit} />
                        <Label htmlFor="savings">Savings</Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Account Number */}
            <Input
                label="Account Number"
                placeholder="Enter your bank account number"
                maxLength={18}
                value={values.accountNumber}
                onChange={(e) => onChange({ ...values, accountNumber: e.target.value })}
                disabled={!isEdit}
            />

            {/* Confirm Account Number */}
            <Input
                label="Confirm Account Number"
                placeholder="Re-enter your bank account number"
                maxLength={18}
                value={values.confirmAccountNumber}
                onChange={(e) => onChange({ ...values, confirmAccountNumber: e.target.value })}
                disabled={!isEdit}
            />

            {/* Bank Name */}
            <Input
                label="Bank Name"
                placeholder="Enter your bank name"
                value={values.bankName}
                onChange={(e) => onChange({ ...values, bankName: e.target.value })}
                disabled={!isEdit}
            />

            {/* IFSC */}
            <Input
                label="IFSC"
                placeholder="Enter your IFSC code"
                maxLength={11}
                value={values.ifscCode}
                onChange={(e) => onChange({ ...values, ifscCode: e.target.value })}
                disabled={!isEdit}
            />

            {/* Account Holder First Name */}
            <Input
                label="Account Holder Name"
                placeholder="Enter account holder's name"
                value={values.accountHolderName}
                onChange={(e) => onChange({ ...values, accountHolderName: e.target.value })}
                disabled={!isEdit}
            />
        </div>
    );
}
