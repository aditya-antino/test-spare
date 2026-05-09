'use client';
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useUploadImage, useUploadImageWithWatermark } from '@/services';
import { toast } from 'react-toastify';
import { handleApiError } from '@/hooks/handleApiError';

interface FileUploadAreaProps {
    fieldName: string;
    title?: string;
    subtitle?: string;
    fileTypes?: string;
    isOptional?: boolean;
    multiple?: boolean;
    addWatermark?: boolean;
    allowedExtensions?: string[];
    onUploadSuccess: (fieldName: string, urls: string[]) => void;
}

const MAX_FILE_SIZE = 11 * 1024 * 1024;

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    fieldName,
    title = 'Upload a file',
    subtitle = '',
    fileTypes = 'PNG, JPG, GIF, HEIC, PDF up to 10MB',
    isOptional = false,
    multiple = false,
    addWatermark = false,
    allowedExtensions,
    onUploadSuccess,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    const uploadImageMutation = useUploadImage({
        onError: () => {
            console.error('Upload failed');
            setIsUploading(false);
        },
    });

    const uploadImageWithWatermarkMutation = useUploadImageWithWatermark({
        onError: () => {
            console.error('Upload failed');
            setIsUploading(false);
        },
    });

    const uploadMutation = addWatermark ? uploadImageWithWatermarkMutation : uploadImageMutation;

    const convertHeicToJpeg = async (file: File): Promise<File> => {
        try {
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9,
            });

            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

            const convertedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg',
            });

            return convertedFile;
        } catch (error) {
            console.error('HEIC conversion error:', error);
            throw new Error(`Failed to convert ${file.name}`);
        }
    };

    const processFiles = async (files: File[]): Promise<File[]> => {
        const processedFiles: File[] = [];

        for (const file of files) {
            const isHeic =
                file.name.toLowerCase().endsWith('.heic') ||
                file.name.toLowerCase().endsWith('.heif') ||
                file.type === 'image/heic' ||
                file.type === 'image/heif';

            if (isHeic) {
                try {
                    const convertedFile = await convertHeicToJpeg(file);
                    processedFiles.push(convertedFile);
                } catch (error) {
                    toast.error(`Failed to convert ${file.name}`);
                    console.error(error);
                }
            } else {
                processedFiles.push(file);
            }
        }

        return processedFiles;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (!files.length) return;

        if (allowedExtensions && allowedExtensions.length > 0) {
            const invalidFile = files.find((file) => {
                const fileName = file.name.toLowerCase();
                const ext = fileName.substring(fileName.lastIndexOf('.') + 1);
                return !allowedExtensions.map((e) => e.toLowerCase()).includes(ext);
            });

            if (invalidFile) {
                if (allowedExtensions && allowedExtensions.length > 0) {
                    toast.error(`Invalid file type. Allowed formats: ${allowedExtensions.join(', ').toUpperCase()}`);
                } else {
                    toast.error('Image type not allowed');
                }
                e.target.value = '';
                return;
            }
        }

        const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            toast.error(
                `Each file must be less than 10MB. "${oversizedFiles[0].name}" is too large.`,
            );
            e.target.value = '';
            return;
        }

        setIsConverting(true);
        setIsUploading(true);

        try {
            const processedFiles = await processFiles(files);
            setIsConverting(false);

            if (processedFiles.length === 0) {
                toast.error('No valid files to upload');
                setIsUploading(false);
                e.target.value = '';
                return;
            }

            const formData = new FormData();
            processedFiles.forEach((file) => formData.append('files', file));
            const res = await uploadMutation.mutateAsync(formData);
            const uploadedUrls =
                res.data && Array.isArray(res.data) ? res.data.map((f: any) => f.url) : [];

            onUploadSuccess(fieldName, uploadedUrls);

            e.target.value = '';
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsUploading(false);
            setIsConverting(false);
        }
    };

    const isProcessing = isUploading || isConverting;

    return (
        <div className="space-y-4">
            <div className="border-2 h-60 overflow-hidden w-80 border-dashed border-gray-300 rounded-lg items-center justify-center flex flex-col text-center hover:border-gray-400 transition-colors relative">
                <input
                    type="file"
                    accept={
                        allowedExtensions
                            ? allowedExtensions.map((ext) => `.${ext}`).join(',')
                            : 'image/*,.pdf,.heic,.heif'
                    }
                    onChange={handleFileUpload}
                    className="hidden"
                    id={`file-upload-${fieldName}`}
                    multiple={multiple}
                    disabled={isProcessing}
                />

                <label
                    htmlFor={`file-upload-${fieldName}`}
                    className={`cursor-pointer flex flex-col items-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 flex-wrap justify-center">
                            <span className="text-[#F6CD28] font-bold">
                                {isUploading ? 'Uploading...' : title}
                            </span>
                            <span className="text-gray-600">{subtitle}</span>
                            {isOptional && <span className="text-gray-400">({isOptional})</span>}
                        </div>
                        <div className="text-gray-400 text-sm">{fileTypes}</div>
                    </div>
                </label>
            </div>

            {isUploading && !isConverting && (
                <div className="text-center text-sm text-gray-600 font-extrabold">
                    Uploading {multiple ? 'files' : 'file'}...
                </div>
            )}
        </div>
    );
};

export default FileUploadArea;
