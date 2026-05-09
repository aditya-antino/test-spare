'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useGetKYCDoc, useUploadImage, useVerifyKYC } from '@/services';
import { KYCDoc } from '@/constants/enums';
import { verificationSchema, type VerificationFormData } from '@/lib/schemas/verification.schema';
import { handleVerifyApiError } from '@/hooks/handleVerifyApiError';
import { resendAadharOTP, verifyAadhar } from '@/services/aadhar.services';
import { handleApiError } from '@/hooks/handleApiError';
import dayjs from 'dayjs';

export type VerificationFormState = {
    idType: KYCDoc;
    docLink: string;
    aadhar?: string;
    fileNumber?: string;
    dlNumber?: string;
    dob?: Date;
};

const DDL_IDS = [
    { value: KYCDoc.AADHAR, label: 'Aadhar Card (OTP required)' },
    { value: KYCDoc.DL, label: 'Driving License' },
    { value: KYCDoc.PASSPORT, label: 'Passport' },
];

export const useGuestVerificationForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(0);
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [verifyAadharLoader, setVerifyAadharLoader] = useState(false);
    const [ddlIds, setDdlIds] = useState(DDL_IDS);

    const { data: kycDoc, isLoading: isKYCDOCsLoading, refetch } = useGetKYCDoc();

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

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(verificationSchema),
        defaultValues: {
            idType: KYCDoc.AADHAR,
            docLink: '',
            aadhar: '',
            fileNumber: '',
            dlNumber: '',
            dob: undefined,
        },
    });

    const watchedIdType = watch('idType');
    const watchedDocLink = watch('docLink');

    const { mutate: uploadImage, isPending: isUploading } = useUploadImage({
        onSuccess: (data) => {
            setValue('docLink', data.data?.[0]?.url ?? '');
            toast.success('Document uploaded successfully');
        },
        onError: () => {
            toast.error('Failed to upload file.');
        },
    });

    const { mutate: verifyKycAPI, isPending: isVerifying } = useVerifyKYC({
        onSuccess: (data) => {
            toast.success(data.message);
            if (watchedIdType === KYCDoc.AADHAR) {
                setIsOTPSent(true);
                setOtp('');
                setTimer(30);
                return;
            }
            refetch();
            handleCancel();
        },
        onError: (err) => {
            handleVerifyApiError(err);
        },
    });

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

    const handleCancel = () => {
        setFile(null);
        reset({
            idType: KYCDoc.AADHAR,
            docLink: '',
        });
        setIsOTPSent(false);
        setOtp('');
    };

    const onSubmit: SubmitHandler<any> = (data) => {
        const payload: any = {
            type: data.idType,
            docLink: data.docLink,
        };

        if (data.idType === KYCDoc.AADHAR) {
            payload.aadhar = data.aadhar;
        } else if (data.idType === KYCDoc.PASSPORT) {
            payload.fileNumber = data.fileNumber;
            payload.dob = data.dob ? dayjs(data.dob).format('YYYY-MM-DD') : '';
        } else if (data.idType === KYCDoc.DL) {
            payload.dlNumber = data.dlNumber;
            payload.dob = data.dob ? dayjs(data.dob).format('YYYY-MM-DD') : '';
        }

        verifyKycAPI(payload);
    };

    const handleVerifyAadhar = async () => {
        const aadharValue = watch('aadhar');
        if (!aadharValue) {
            toast.error('Please enter Aadhar number.');
            return;
        }
        if (!otp) {
            toast.error('Please enter OTP.');
            return;
        }

        setVerifyAadharLoader(true);
        try {
            const response = await verifyAadhar(aadharValue, otp);
            if (response.status === 200) {
                toast.success(response.data.message);
                refetch();
                handleCancel();
            }
        } catch (err) {
            handleVerifyApiError(err);
        } finally {
            setVerifyAadharLoader(false);
        }
    };

    const handleResendOTP = async () => {
        const aadharValue = watch('aadhar');
        try {
            if (aadharValue) {
                setTimer(30);
                const response = await resendAadharOTP(aadharValue);
                if (response.status === 200) {
                    toast.success(response.data.message);
                }
            }
        } catch (err) {
            handleApiError(err);
        }
    };

    return {
        file,
        idType: watchedIdType,
        docLink: watchedDocLink,
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
        handleSubmit: handleSubmit(onSubmit),
        errors,
        setValue,
        handleFileChange,
        handleCancel,
        handleVerifyAadhar,
        handleResendOTP,
        watch,
    };
};
