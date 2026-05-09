'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetKYCDoc, useVerifyKYC } from '@/services';
import { toast } from 'react-toastify';

enum KYC_TYPES {
    AADHAAR = 'AADHAAR',
    PAN = 'pan',
    DL = 'DL',
    PASSPORT = 'PASSPORT',
    GSTIN = 'gstin',
}

interface BusinessIdentityData {
    pan?: string;
    gstin?: string;
}

interface BusinessIdentityFormProps {
    isAccountTypePersonal: boolean;
    data: BusinessIdentityData;
    onChange: (values: BusinessIdentityData) => void;
    isEdit?: boolean;
    refetch?: () => void;
}

export default function BusinessIdentityForm({
    isAccountTypePersonal,
    data,
    onChange,
    isEdit = true,
    refetch,
}: BusinessIdentityFormProps) {

    const { mutate: verifyPAN } = useVerifyKYC({
        onSuccess: (res) => {
            toast.success(res.message || 'PAN verified successfully');
            refetch?.();
            refetchKYCDOCS();
        },
        onError: (err: any) => {
            toast.error(err.message || 'PAN verification failed');
        },
    });

    const { mutate: verifyGST } = useVerifyKYC({
        onSuccess: (res) => {
            toast.success(res.message || 'GSTIN verified successfully');
            refetch?.();
            refetchKYCDOCS();
        },
        onError: (err: any) => {
            toast.error(err.message || 'GST verification failed');
        },
    });

    const { data: kycDocRes = { data: [] }, refetch: refetchKYCDOCS } = useGetKYCDoc();

    /* -------------------- Derived data -------------------- */

    const panDoc = useMemo(
        () => kycDocRes.data.find((doc: any) => doc.type === KYC_TYPES.PAN),
        [kycDocRes.data],
    );

    const gstDoc = useMemo(
        () => kycDocRes.data.find((doc: any) => doc.type === KYC_TYPES.GSTIN),
        [kycDocRes.data],
    );


    const [panValue, setPanValue] = useState('');
    const [gstValue, setGstValue] = useState('');

    useEffect(() => {
        if (data.pan) setPanValue(data.pan);
        if (data.gstin) setGstValue(data.gstin);
    }, [data.pan, data.gstin]);

    useEffect(() => {
        if (panDoc?.docNumber && !panValue) {
            setPanValue(panDoc.docNumber);
        }
    }, [panDoc]);

    useEffect(() => {
        if (gstDoc?.docNumber && !gstValue) {
            setGstValue(gstDoc.docNumber);
        }
    }, [gstDoc]);

    useEffect(() => {
        onChange({
            pan: panValue || undefined,
            gstin: gstValue || undefined,
        });
    }, [panValue, gstValue]);


    return (
        <div className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-4">
                {/* PAN */}
                <div className="flex-1 min-w-[250px]">
                    <Label className="text-gray-700 text-base font-semibold">
                        PAN (Permanent Account Number)
                    </Label>
                    <Input
                        placeholder="Enter your PAN number"
                        maxLength={10}
                        value={panValue}
                        onChange={(e) => setPanValue(e.target.value.toUpperCase())}
                        disabled={!isEdit}
                        className="rounded-full mt-1"
                    />
                </div>

                {/* GST (Business only) */}
                {!isAccountTypePersonal && (
                    <div className="flex-1 min-w-[250px]">
                        <Label className="text-gray-700 text-base font-semibold">
                            GSTIN (Optional)
                        </Label>
                        <Input
                            placeholder="Enter your GSTIN number"
                            maxLength={15}
                            value={gstValue}
                            onChange={(e) => setGstValue(e.target.value.toUpperCase())}
                            disabled={!isEdit}
                            className="rounded-full mt-1"
                        />
                    </div>
                )}
            </div>

            {/* Info box */}
            <div className="rounded-md border border-[#F6CD28] bg-yellow-50 p-3 text-sm text-gray-700">
                Hosts whose annual commercial turnover exceeds INR 20 lakhs are required to
                register for GST and provide a valid GSTIN.{' '}
                <a
                    href="https://sparespace.co.in/articles"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-600 underline hover:text-yellow-800"
                >
                    More Info
                </a>
            </div>
        </div>
    );
}
