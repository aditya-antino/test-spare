'use client';

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
import { KYCDoc } from '@/constants/enums';
import { DateInput } from '@/components/ui/date-input';
import VerifiedDetails from '@/app/(afterAuth)/host/account/verification/VerifiedDetailsCard';
import Typography from '@/components/ui/typoGraphy';
import { Input } from '@/components/ui/input';
import { ID_LABELS } from '@/constants/contact';
import { useGuestVerificationForm } from './useGuestVerificationForm';

export default function VerificationClient() {
    const {
        file,
        idType,
        docLink,
        otp,
        setOtp,
        timer,
        isOTPSent,
        verifyAadharLoader,
        ddlIds,
        kycDocData,
        isKYCDOCsLoading,
        isUploading,
        isVerifying,
        register,
        handleSubmit,
        errors,
        setValue,
        handleFileChange,
        handleCancel,
        handleVerifyAadhar,
        handleResendOTP,
        watch,
    } = useGuestVerificationForm();

    const dobValue = watch('dob');

    if (!isKYCDOCsLoading && kycDocData.length > 0) {
        return <VerifiedDetails docs={kycDocData} />;
    }

    const isProcessing = isUploading || isVerifying;

    return (
        <div className="flex flex-col items-center justify-center gap-6 py-6 w-full max-w-md mx-auto">
            {file ? (
                file.type.startsWith('image/') && docLink ? (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden">
                        <Image alt="preview" src={docLink} fill className="object-cover" />
                        <button
                            onClick={handleCancel}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full border border-dashed border-gray-300 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <FileText size={40} />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                    {file.name}
                                </span>
                                {isUploading && (
                                    <span className="text-xs text-gray-500">Uploading...</span>
                                )}
                            </div>
                        </div>
                        <button onClick={handleCancel} className="text-red-500 cursor-pointer p-1">
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
                        <p className="text-sm text-gray-400 text-center">
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
                        className="cursor-pointer flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 w-full hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-sm text-gray-400">Click to choose file</span>
                    </label>
                    {errors.docLink && (
                        <p className="text-red-500 text-xs">{errors.docLink.message as string}</p>
                    )}
                </div>
            )}

            <div className="w-full space-y-1">
                <label className="block text-sm font-medium text-gray-700">ID Type</label>
                <Select
                    disabled={!ddlIds?.length || isOTPSent}
                    onValueChange={(val) => setValue('idType', val as KYCDoc)}
                    value={idType}
                >
                    <SelectTrigger className="w-full">
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
                <div className="w-full space-y-4">
                    <div className="space-y-1">
                        <Input
                            type="text"
                            placeholder="Enter Aadhar Number"
                            disabled={isOTPSent}
                            {...register('aadhar' as any)}
                        />
                        {(errors as any).aadhar && (
                            <p className="text-red-500 text-xs">{(errors as any).aadhar.message}</p>
                        )}
                    </div>

                    {isOTPSent && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm text-gray-600">
                                    Didn’t receive the OTP?{' '}
                                    {timer > 0 ? (
                                        <span className="text-gray-400">Resend in {timer}s</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            className="text-[#F6CD28] hover:underline font-medium"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(idType === KYCDoc.PASSPORT || idType === KYCDoc.DL) && (
                <div className="w-full space-y-4">
                    <div className="space-y-1">
                        <Input
                            type="text"
                            placeholder={
                                idType === KYCDoc.PASSPORT
                                    ? 'Enter Passport File No.'
                                    : 'Enter DL Number'
                            }
                            {...register(
                                idType === KYCDoc.PASSPORT ? ('fileNumber' as any) : ('dlNumber' as any),
                            )}
                        />
                        {(errors as any)[idType === KYCDoc.PASSPORT ? 'fileNumber' : 'dlNumber'] && (
                            <p className="text-red-500 text-xs">
                                {(errors as any)[idType === KYCDoc.PASSPORT ? 'fileNumber' : 'dlNumber']
                                    .message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <DateInput
                            label="Date of Birth"
                            value={dobValue}
                            onChange={(date) => setValue('dob', date)}
                            className="w-full"
                        />
                        {(errors as any).dob && (
                            <p className="text-red-500 text-xs">{(errors as any).dob.message}</p>
                        )}
                    </div>
                </div>
            )}

            <Button
                onClick={idType === KYCDoc.AADHAR && isOTPSent ? handleVerifyAadhar : handleSubmit}
                disabled={isProcessing || (isOTPSent && verifyAadharLoader)}
                className={`w-full rounded-full transition-all ${isProcessing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#F6CD28] hover:bg-yellow-500 text-black shadow-sm'
                    }`}
            >
                {isProcessing
                    ? 'Processing...'
                    : isOTPSent
                        ? verifyAadharLoader
                            ? 'Verifying...'
                            : 'Verify OTP'
                        : 'Verify ID'}
            </Button>
        </div>
    );
}