'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ConfirmationModal } from '@/components';
import { useGuestGSTForm } from './useGuestGSTForm';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export const GstClient = () => {
    const {
        register,
        errors,
        handleSubmit,
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
        isDeleting,
    } = useGuestGSTForm();

    const renderSidebar = () => (
        <div className="sticky top-8">
            <h1 className="text-3xl font-semibold text-tertiary-t1 mb-4 font-poppins">
                GST Information
            </h1>
            <p className="text-tertiary-t3 text-lg leading-relaxed font-figtree">
                {hasExistingData
                    ? 'Manage your company GST details for invoicing and tax compliance.'
                    : 'Add your company details for GST invoicing and tax purposes.'}
            </p>
            <div className="mt-8 p-6 bg-primary-tint5 rounded-lg border border-primary-tint3">
                <h3 className="font-semibold text-tertiary-t1 mb-2 font-poppins">
                    Required Fields
                </h3>
                <ul className="text-sm text-tertiary-t3 space-y-1 font-figtree">
                    <li>• Company Name</li>
                    <li>• Company Address</li>
                    <li>• Phone Number</li>
                    <li>• PAN Number</li>
                    <li>• GST Number</li>
                </ul>
            </div>

            {!error && (
                <>


                    {hasExistingData && gstResponse?.data?.isVerified && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-green-800 font-medium text-sm">
                                    GST Verified
                                </span>
                            </div>
                        </div>
                    )}


                    {hasExistingData && (
                        <div className="mt-6 p-6 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-600 mb-4">
                                Removing GST details will delete all your company information.
                                This action cannot be undone.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={openRemoveModal}
                                disabled={isEditing || isDeleting}
                                className="w-full"
                            >
                                Remove GST Details
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    if (detailsLoading) {
        return (
            <div className="flex w-full flex-col lg:flex-row gap-8 py-8">
                <div className="lg:w-1/3">
                    <div className="sticky top-8 space-y-4">
                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="lg:w-2/3">
                    <div className="rounded-lg border-2 border-gray-200 p-8 space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error && (error as any)?.message !== 'No GST details found for this user') {
        return (
            <div className="flex w-full flex-col lg:flex-row gap-8 py-8">
                <div className="lg:w-1/3">{renderSidebar()}</div>
                <div className="lg:w-2/3">
                    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8">
                        <EmptyState
                            title="Failed to load GST details"
                            description={(error as Error).message}
                            icon={<AlertCircle className="w-12 h-12 text-red-600" />}
                            actionLabel="Try Again"
                            onAction={() => refetch()}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex w-full flex-col lg:flex-row gap-8 py-8">
                <div className="lg:w-1/3">
                    {renderSidebar()}
                </div>

                <div className="lg:w-2/3">
                    <div className="rounded-lg border-2 border-[#F7CD29] shadow-sm p-8">
                        {hasExistingData && !isEditing && (
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-tertiary-t1">
                                        Your GST Details
                                    </h3>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleEdit}
                                    disabled={isDeleting}
                                >
                                    Edit Details
                                </Button>
                            </div>
                        )}

                        {!hasExistingData && !isEditing && (
                            <div className="text-center py-8 flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                    No GST Details Added
                                </h3>
                                <Button
                                    variant="outline"
                                    onClick={handleEdit}
                                    disabled={isDeleting}
                                >
                                    Add GST Details
                                </Button>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Company Name Field */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-tertiary-t1">
                                    Company Name *
                                </Label>
                                <Input
                                    placeholder="Enter your company legal name"
                                    disabled={!isEditing || isDeleting}
                                    {...register('companyName')}
                                    className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}
                                />
                                {errors.companyName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
                                )}
                            </div>

                            {/* Company Address Field */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-tertiary-t1">
                                    Company Address *
                                </Label>
                                <Textarea
                                    placeholder="Enter complete registered office address"
                                    disabled={!isEditing || isDeleting}
                                    {...register('companyAddress')}
                                    className={`
                                        w-full min-h-[100px] px-3 py-2 text-base bg-white rounded-3xl 
                                        placeholder:text-base shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
                                        border border-gray-300
                                        focus:outline-none focus:ring-0 focus:border-gray-300
                                        overflow-hidden text-black
                                        ${!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}
                                    `}
                                />
                                {errors.companyAddress && (
                                    <p className="text-red-500 text-xs mt-1">{errors.companyAddress.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone Number Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-tertiary-t1">
                                        Phone Number *
                                    </Label>
                                    <Input
                                        placeholder="Company phone number"
                                        disabled={!isEditing || isDeleting}
                                        {...register('phoneNumber')}
                                        maxLength={10}
                                        className={!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}
                                    />
                                    {errors.phoneNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                                    )}
                                </div>

                                {/* PAN Number Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-tertiary-t1">
                                        PAN Number *
                                    </Label>
                                    <Input
                                        placeholder="AAAAA1234A"
                                        disabled={!isEditing || isDeleting}
                                        {...register('panNumber')}
                                        maxLength={10}
                                        className={`uppercase ${!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}`}
                                    />
                                    {errors.panNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* GST Number Field */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-tertiary-t1">
                                    GST Number *
                                </Label>
                                <Input
                                    placeholder="22AAAAA0000A1Z5"
                                    disabled={!isEditing || isDeleting}
                                    {...register('gstNumber')}
                                    maxLength={15}
                                    className={`uppercase ${!isEditing ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''}`}
                                />
                                <p className="text-xs text-tertiary-t3">
                                    Format: 22AAAAA0000A1Z5 (15 characters)
                                </p>
                                {errors.gstNumber && (
                                    <p className="text-red-500 text-xs mt-1">{errors.gstNumber.message}</p>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex gap-4 pt-6 border-t">
                                    <Button
                                        variant="default"
                                        onClick={handleSubmit}
                                        disabled={isUpdating || isDeleting}
                                        className="flex-1"
                                    >
                                        {isUpdating
                                            ? 'Saving...'
                                            : hasExistingData
                                                ? 'Update'
                                                : 'Save'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isUpdating || isDeleting}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isRemoveModalOpen}
                onClose={closeRemoveModal}
                onConfirm={handleRemoveGST}
                title="Remove GST Details"
                description="Are you sure you want to remove your GST details? This action will permanently delete all your company information and cannot be undone."
                confirmText="Remove GST Details"
                cancelText="Cancel"
                variant="destructive"
                isLoading={isDeleting}
                disableCancel={isDeleting}
            />
        </>
    );
};
