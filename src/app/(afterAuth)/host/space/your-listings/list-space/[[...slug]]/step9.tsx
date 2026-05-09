'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Typography from '@/components/ui/typoGraphy';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import Image from 'next/image';
import FileUploadArea from '@/components/common/fileUploadArea/fileUploadArea';
import { useSearchParams, useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';
import {
    useUpdateSpaceListStep9,
    SpaceDetailsInterface,
} from '@/services';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step9Schema, Step9FormValues } from './schemas';

interface Step9Payload {
    space_id: string | number;
    verification_documents: {
        verification_doc_type: 'ownership_proof';
        image?: string;
    }[];
    is_edit: boolean;
}

interface Step9Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
}

const Step9 = ({ editData, isEdit }: Step9Props) => {
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId')!;
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(isEdit === 'true');
    const isInitializedRef = useRef(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { isSubmitting },
    } = useForm<Step9FormValues>({
        resolver: zodResolver(step9Schema),
        defaultValues: {
            ownershipProof: [],
        },
    });

    const ownershipProof = watch('ownershipProof') || [];

    const { mutate: submitStep9, isPending } = useUpdateSpaceListStep9({
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit === 'true' ? '&isEdit=true' : '';
            router.push(
                `${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=completed${editParam}`,
            );
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Something went wrong');
        },
    });

    useEffect(() => {
        if (isEdit === 'true' && editData && editData.SpaceListing && !isInitializedRef.current) {
            const documents = editData.SpaceListing.verification_documents;
            const ownershipDoc = documents?.find(
                (doc) => doc.verification_doc_type === 'ownership_proof',
            );

            reset({
                ownershipProof: ownershipDoc?.image ? [ownershipDoc.image] : [],
            });
            setIsLoading(false);
            isInitializedRef.current = true;
        }
    }, [editData, spaceId, isEdit, reset]);

    const handleUploadSuccess = (fieldName: 'ownershipProof', urls: string[]) => {
        setValue('ownershipProof', urls, { shouldValidate: true });
    };

    const removeDocument = (index: number) => {
        const currentDocs = [...ownershipProof];
        const newDocs = currentDocs.filter((_, i) => i !== index);
        setValue('ownershipProof', newDocs, { shouldValidate: true });
    };

    const onSubmit = (data: Step9FormValues) => {
        const payload: Step9Payload = {
            space_id: spaceId,
            verification_documents: [],
            is_edit: isEdit === 'true',
        };

        if (data.ownershipProof && data.ownershipProof[0]) {
            payload.verification_documents.push({
                verification_doc_type: 'ownership_proof',
                image: data.ownershipProof[0],
            });
        }

        submitStep9(payload);
    };

    const handleGoBack = () => {
        router.push(
            `${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=8&isEdit=true`,
        );
    };

    const DocumentPreview = ({
        urls,
    }: {
        urls: string[];
    }) => {
        if (!urls || !urls.length) return null;

        return (
            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                    Ownership Proof Uploaded:
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {urls.map((url, index) => (
                        <div
                            key={index}
                            className="relative border rounded-lg overflow-hidden group w-60 h-40"
                        >
                            <Image
                                src={url}
                                alt="Ownership Proof"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeDocument(index)}
                                    className="bg-red-500 text-white rounded-full p-2"
                                    title="Remove document"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-8 md:p-8 p-4 w-fit rounded-2xl outline outline-offset-[-1px] outline-gray-200 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6CD28]"></div>
                    <Typography weight="medium" color="text-gray-600" size="lg">
                        Loading documents...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 md:p-8 p-4 w-fit rounded-2xl outline outline-offset-[-1px] outline-gray-200">
                <Typography weight="semibold" color="text-gray-900" size="2xl">
                    Verification
                </Typography>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Label className="text-zinc-800 text-base font-semibold">
                            Ownership Proof
                        </Label>
                        <span className="text-gray-500 text-sm">(Optional)</span>
                    </div>

                    <DocumentPreview urls={ownershipProof} />

                    {ownershipProof.length === 0 && (
                        <FileUploadArea
                            fieldName="ownershipProof"
                            onUploadSuccess={handleUploadSuccess}
                            multiple={false}
                            isOptional
                        />
                    )}
                </div>
            </div>

            <div className="w-full flex justify-end gap-4 items-end h-20">
                <Button
                    type="button" // GoBack is type button, not submit
                    disabled={isPending || isSubmitting}
                    variant="outline"
                    onClick={handleGoBack}
                >
                    Go Back
                </Button>
                <Button
                    type="submit"
                    disabled={isPending || isSubmitting}
                    variant={isPending || isSubmitting ? 'disabled' : 'default'}
                >
                    {isPending || isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </form>
    );
};

export default Step9;
