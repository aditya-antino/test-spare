// components/forms/BusinessAddressForm.tsx
'use client';

import { Input } from '@/components/ui/input';

interface BusinessAddressData {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}

interface BusinessAddressFormProps {
    data: BusinessAddressData;
    onChange: (values: BusinessAddressData) => void;
    isEdit?: boolean;
}

export default function BusinessAddressForm({
    data,
    onChange,
    isEdit = true,
}: BusinessAddressFormProps) {
    const values: Required<BusinessAddressData> = {
        line1: data.line1 ?? '',
        line2: data.line2 ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        pincode: data.pincode ?? '',
        country: data.country ?? '',
    };

    return (
        <div className="space-y-4 pt-4">
            <Input
                label="Street 1"
                placeholder="Enter street address line 1"
                value={values.line1}
                onChange={(e) => onChange({ ...values, line1: e.target.value })}
                disabled={!isEdit}
            />
            <Input
                label="Street 2"
                placeholder="Enter street address line 2 (optional)"
                value={values.line2}
                onChange={(e) => onChange({ ...values, line2: e.target.value })}
                disabled={!isEdit}
            />
            <Input
                label="City"
                placeholder="Enter your city"
                value={values.city}
                onChange={(e) => onChange({ ...values, city: e.target.value })}
                disabled={!isEdit}
            />
            <Input
                label="State"
                placeholder="Enter your state"
                value={values.state}
                onChange={(e) => onChange({ ...values, state: e.target.value })}
                disabled={!isEdit}
            />
            <Input
                label="Postal Code"
                placeholder="Enter postal/zip code"
                value={values.pincode}
                onChange={(e) => onChange({ ...values, pincode: e.target.value })}
                disabled={!isEdit}
            />
            <Input
                label="Country"
                placeholder="Enter your country"
                value={values.country}
                onChange={(e) => onChange({ ...values, country: e.target.value })}
                disabled={!isEdit}
            />
        </div>
    );
}
