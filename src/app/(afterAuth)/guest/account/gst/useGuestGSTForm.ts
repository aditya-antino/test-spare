import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { handleApiError } from '@/hooks/handleApiError';
import { useGetGSTDetails, usePostGSTDetails, useDeleteGSTDetails } from '@/services';
import { gstSchema, GSTFormValues } from '@/lib/schemas/gst.schema';

export const useGuestGSTForm = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [hasExistingData, setHasExistingData] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    const { data: gstResponse, isLoading: detailsLoading, error, refetch } = useGetGSTDetails({});

    const form = useForm<GSTFormValues>({
        resolver: zodResolver(gstSchema),
        defaultValues: {
            companyName: '',
            companyAddress: '',
            phoneNumber: '',
            gstNumber: '',
            panNumber: '',
        },
        mode: 'onChange'
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isValid },
    } = form;

    const { mutate: handleUpdateGST, isPending: isUpdating } = usePostGSTDetails();
    const { mutate: handleDeleteGST, isPending: isDeleting } = useDeleteGSTDetails();

    useEffect(() => {
        if (gstResponse?.data) {
            reset({
                companyName: gstResponse.data.companyName || '',
                companyAddress: gstResponse.data.companyAddress || '',
                phoneNumber: gstResponse.data.phoneNumber || '',
                gstNumber: gstResponse.data.gstNumber || '',
                panNumber: gstResponse.data.panNumber || '',
            });
            setIsEditing(false);
            setHasExistingData(true);
        }
    }, [gstResponse, reset]);

    const onSubmit = (data: GSTFormValues) => {
        const payload = {
            panNumber: data.panNumber.trim().toUpperCase(),
            gstNumber: data.gstNumber.trim().toUpperCase(),
            companyName: data.companyName.trim(),
            companyAddress: data.companyAddress.trim(),
            phoneNumber: data.phoneNumber.trim(),
        };

        handleUpdateGST(payload, {
            onSuccess: (response) => {
                toast.success(response?.message || 'GST details saved successfully!');
                setIsEditing(false);
                setHasExistingData(true);
                refetch();
            },
            onError: (err) => {
                handleApiError(err);
            },
        });
    };

    const handleCancel = () => {
        if (hasExistingData && gstResponse?.data) {
            reset({
                companyName: gstResponse.data.companyName || '',
                companyAddress: gstResponse.data.companyAddress || '',
                phoneNumber: gstResponse.data.phoneNumber || '',
                gstNumber: gstResponse.data.gstNumber || '',
                panNumber: gstResponse.data.panNumber || '',
            });
        } else {
            reset({
                companyName: '',
                companyAddress: '',
                phoneNumber: '',
                gstNumber: '',
                panNumber: '',
            });
        }
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const openRemoveModal = () => {
        setIsRemoveModalOpen(true);
    };

    const closeRemoveModal = () => {
        if (!isDeleting) {
            setIsRemoveModalOpen(false);
        }
    };

    const handleRemoveGST = () => {
        handleDeleteGST(undefined, {
            onSuccess: (response) => {
                toast.success(response?.message || 'GST details removed successfully');
                setHasExistingData(false);
                setIsEditing(false);
                reset({
                    companyName: '',
                    companyAddress: '',
                    phoneNumber: '',
                    gstNumber: '',
                    panNumber: '',
                });
                setIsRemoveModalOpen(false);
            },
            onError: (err) => {
                handleApiError(err);
            },
        });
    };

    return {
        form,
        register,
        control,
        errors,
        isValid,
        handleSubmit: handleSubmit(onSubmit),
        gstResponse,
        isEditing,
        hasExistingData,
        detailsLoading,
        error,
        refetch,
        handleCancel,
        handleEdit,
        openRemoveModal,
        closeRemoveModal,
        handleRemoveGST,
        isRemoveModalOpen,
        isUpdating,
        isDeleting
    };
};

