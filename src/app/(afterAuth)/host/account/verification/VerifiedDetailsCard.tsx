import { BadgeCheck, FileText } from 'lucide-react';
import Image from 'next/image';

interface KycDocItem {
    created_at: string;
    docLink: string;
    docNumber: string;
    id: number;
    idName: string | null;
    isVerified: boolean;
    nameVerified: boolean;
    type: string;
    userName: string;
    verificationId: string;
    [key: string]: any;
}

interface VerifiedDetailsProps {
    docs: KycDocItem[];
}

export default function VerifiedDetails({ docs }: VerifiedDetailsProps) {
    if (!docs || docs.length === 0) return null;

    const data = docs[0];

    const isImage = data.docLink?.match(/\.(jpeg|jpg|png)$/i);
    const isPDF = data.docLink?.match(/\.pdf$/i);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
            <div
                key={data.id}
                className="flex flex-col sm:flex-row gap-6 sm:items-start rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6"
            >
                {data.docLink && (
                    <div className="w-full sm:w-56 h-56 relative rounded-lg overflow-hidden mx-auto sm:mx-0 flex items-center justify-center bg-gray-50">
                        {isImage ? (
                            <Image
                                src={data.docLink}
                                alt={`${data.type} Document`}
                                fill
                                className="object-contain"
                            />
                        ) : isPDF ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <FileText className="h-16 w-16 text-gray-400" />
                                <span className="text-sm text-gray-500 text-center">
                                    PDF Document
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-500">Unsupported file</span>
                        )}
                    </div>
                )}

                <div className="flex flex-col flex-1 gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {data.isVerified && <BadgeCheck className="h-6 w-6 text-green-500" />}
                        <p className="text-lg font-semibold text-gray-800">
                            {data.isVerified ? 'Verified' : 'Pending'}
                        </p>
                        <span className="text-sm text-gray-500 uppercase">{data.type}</span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-700">
                        <p>
                            <span className="font-medium text-gray-600">User Name:</span>{' '}
                            {data.userName}
                        </p>
                        <p>
                            <span className="font-medium text-gray-600">Doc Number:</span>{' '}
                            {data.docNumber}
                        </p>
                        <p>
                            <span className="font-medium text-gray-600">Verification ID:</span>{' '}
                            {data.verificationId}
                        </p>
                        <p>
                            <span className="font-medium text-gray-600">Created At:</span>{' '}
                            {new Date(data.created_at).toLocaleString()}
                        </p>
                    </div>

                    {data.docLink && (
                        <a
                            href={data.docLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            Download
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
