'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetKYCDoc, useUploadImage, useVerifyKYC } from '@/services';
import { KYCDoc } from '@/constants/enums';
import { DateInput } from '@/components/ui/date-input';
import VerifiedDetails from '@/app/(afterAuth)/host/account/verification/VerifiedDetailsCard';
import { handleVerifyApiError } from '@/hooks/handleVerifyApiError';
import Typography from '@/components/ui/typoGraphy';
import { resendAadharOTP, verifyAadhar } from '@/services/aadhar.services';
import { Input } from '@/components/ui/input';
import { handleApiError } from '@/hooks/handleApiError';
import { ID_LABELS } from '@/constants/contact';

const DDL_IDS = [
    { value: KYCDoc.AADHAR, label: 'Aadhar Card (OTP required)' },
    { value: KYCDoc.DL, label: 'Driving License' },
    { value: KYCDoc.PASSPORT, label: 'Passport' },
];

export default function Verification() {
    const [file, setFile] = useState<File | null>(null);
    const [idType, setIdType] = useState<KYCDoc | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [ddlIds, setDdlIds] = useState(DDL_IDS);

    const [aadharNumber, setAadharNumber] = useState('');
    const [passportFileNo, setPassportFileNo] = useState('');
    const [dlNumber, setDlNumber] = useState('');
    const [dob, setDob] = useState<Date | null>(null);
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(30);
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [verifyAadharLoader, setVerifyAadharLoader] = useState(false);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const { data: kycDoc = { data: [] }, isLoading: isKYCDOCsLoading, refetch } = useGetKYCDoc();

    const kycDocData = useMemo(
        () =>
            Array.isArray(kycDoc?.data)
                ? kycDoc.data.filter((item) => item.type !== 'gstin' && item.type !== 'pan')
                : [],
        [kycDoc?.data],
    );

    useEffect(() => {
        if (kycDocData.length > 0) {
            const existingTypes = kycDocData.map((item: any) => item.type);
            setDdlIds(DDL_IDS.filter((ddl) => !existingTypes.includes(ddl.value)));
        }
    }, [kycDocData]);

    const { mutate: uploadImage, isPending: isUploading } = useUploadImage({
        onSuccess: (data) => {
            setPreview(data.data?.[0]?.url ?? null);
        },
        onError: (err) => {
            toast.error('Failed to upload file.');
        },
    });

    const { mutate: verifyKycAPI, isPending: isVerifying } = useVerifyKYC({
        onSuccess: (data) => {
            toast.success(data.message);
            if (idType === KYCDoc.AADHAR) {
                setIsOTPSent(true);
                setOtp('');
                return;
            }
            setAadharNumber('');
            refetch();
            resetForm();
        },
        onError: (err) => {
            handleVerifyApiError(err);
        },
    });

    const resetForm = () => {
        setFile(null);
        setPreview(null);
        setIdType(KYCDoc.AADHAR);
        setAadharNumber('');
        setPassportFileNo('');
        setDlNumber('');
        setDob(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const maxSize = 5 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            toast.error('File size should be less than 5 MB');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error('Invalid file type. Please upload JPG, PNG, or PDF.');
            return;
        }

        setFile(selectedFile);

        const formData = new FormData();
        formData.append('files', selectedFile);
        uploadImage(formData);
    };

    const handleRemoveFile = () => resetForm();

    const handleVerify = async () => {
        if (!file || !idType || !preview) {
            toast.error('Please select ID type and upload a file.');
            return;
        }

        const payload: any = {
            type: idType.toLowerCase(),
            docLink: preview,
        };

        const formattedDob =
            dob &&
            `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(
                dob.getDate(),
            ).padStart(2, '0')}`;

        switch (idType) {
            case KYCDoc.AADHAR:
                payload.aadhar = aadharNumber;
                break;
            case KYCDoc.PASSPORT:
                payload.fileNumber = passportFileNo;
                if (formattedDob) payload.dob = formattedDob;
                break;
            case KYCDoc.DL:
                payload.dlNumber = dlNumber;
                if (formattedDob) payload.dob = formattedDob;
                break;
        }

        verifyKycAPI(payload);
    };

    const handleVerifyAadhar = async () => {
        if (idType === KYCDoc.AADHAR) {
            if (!aadharNumber) {
                toast.error('Please enter Aadhar number.');
                return;
            }
            setVerifyAadharLoader(true);
            try {
                const response = await verifyAadhar(aadharNumber, otp);
                if (response.status === 200) {
                    toast.success(response.data.message);
                    refetch();
                    resetForm();
                }
            } catch (err) {
                handleVerifyApiError(err);
                return;
            } finally {
                setVerifyAadharLoader(false);
            }
        }
    };

    const handleResendOTP = async () => {
        try {
            if (aadharNumber) {
                setTimer(30);
                const respose = await resendAadharOTP(aadharNumber);
                if (respose.status === 200) {
                    toast.success(respose.data.message);
                }
            }
        } catch (err) {
            handleApiError(err);
        } finally {
        }
    };

    const handleChangeOTP = (e) => setOtp(e.target.value);

    if (!isKYCDOCsLoading && kycDocData.length > 0) {
        return <VerifiedDetails docs={kycDocData} />;
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 py-6 w-full max-w-md mx-auto">
            {file ? (
                file.type.startsWith('image/') && preview ? (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden">
                        <Image alt="preview" src={preview} fill className="object-cover" />
                        <button
                            onClick={handleRemoveFile}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full border border-dashed border-gray-300 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <FileText size={40} />
                            <span className="text-sm">{file.name}</span>
                        </div>
                        <button onClick={handleRemoveFile} className="text-red-500 cursor-pointer">
                            <X size={16} />
                        </button>
                    </div>
                )
            ) : (
                <div className="flex flex-col w-full gap-4 items-center">
                    <div className="w-16 h-16 flex items-center justify-center text-[#F6CD28]">
                        <Upload size={50} strokeWidth={1.5} />
                    </div>
                    <p className="font-semibold text-center">
                        {idType
                            ? `Upload your ${ID_LABELS[idType]}`
                            : 'ID Proof (Aadhar, Driving License, Passport)'}
                    </p>

                    {idType === KYCDoc.PASSPORT && (
                        <p className="text-sm  text-gray-400 text-center">
                            Upload passport photo and address pages as a single combined image
                        </p>
                    )}
                    <p className="text-sm text-gray-500 text-center">
                        File Upload (Max 5 MB, Formats: JPG, JPEG, PNG, PDF)
                    </p>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 w-full"
                    >
                        <span className="text-sm text-gray-400">Click to choose file</span>
                    </label>
                </div>
            )}

            <div className="w-full">
                <label className="block mb-1 text-sm font-medium">ID Type</label>
                <Select
                    disabled={!ddlIds?.length}
                    onValueChange={(val) => setIdType(val as KYCDoc)}
                    value={idType || undefined}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {ddlIds.map((ddl) => (
                            <SelectItem key={ddl.value} value={ddl.value}>
                                {ddl.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {idType === KYCDoc.AADHAR && (
                <>
                    <input
                        type="text"
                        placeholder="Enter Aadhar Number"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value)}
                    />
                    {isOTPSent && (
                        <>
                            <div className="w-full">
                                <Input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={handleChangeOTP}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2"
                                />
                            </div>
                            <p className="flex gap-1 text-no text-gray-600">
                                Didn’t receive the OTP?{' '}
                                {timer > 0 ? (
                                    <span className="text-gray-400 hover: cursor-pointer">
                                        Resend in {timer}s
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleResendOTP}
                                        className="text-[#F6CD28] hover:underline disabled:opacity-50 hover: cursor-pointer"
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text-[#F6CD28]"
                                            weight="medium"
                                        >
                                            Resend OTP
                                        </Typography>
                                    </button>
                                )}
                            </p>
                        </>
                    )}
                </>
            )}

            {(idType === KYCDoc.PASSPORT || idType === KYCDoc.DL) && (
                <>
                    <input
                        type="text"
                        placeholder={
                            idType === KYCDoc.PASSPORT
                                ? 'Enter Passport File No.'
                                : 'Enter DL Number'
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-2"
                        value={idType === KYCDoc.PASSPORT ? passportFileNo : dlNumber}
                        onChange={(e) =>
                            idType === KYCDoc.PASSPORT
                                ? setPassportFileNo(e.target.value)
                                : setDlNumber(e.target.value)
                        }
                    />
                    <DateInput
                        label="Date of Birth"
                        value={dob}
                        onChange={setDob}
                        className="w-full"
                    />
                </>
            )}

            <Button
                onClick={idType === KYCDoc.AADHAR && isOTPSent ? handleVerifyAadhar : handleVerify}
                disabled={isUploading || isVerifying}
                className={`w-full rounded-full ${isUploading || isVerifying
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#F6CD28] hover:bg-yellow-500 text-black'
                    }`}
            >
                {isUploading || isVerifying
                    ? 'Processing...'
                    : isOTPSent
                        ? verifyAadharLoader
                            ? 'Submitting...'
                            : 'Submit'
                        : 'Upload ID'}
            </Button>
        </div>
    );
}
