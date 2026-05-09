'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share as ShareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    spaceTitle?: string;
    location?: string;
    image?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    url,
    title = 'Share this space',
    spaceTitle,
    location,
    image,
}) => {
    const [copied, setCopied] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            setCanShare(true);
        }
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: spaceTitle || 'Spare Space',
                    text: `Check out this space: ${spaceTitle}\nLocation: ${location}`,
                    url: url,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Preview Card */}
                    {(image || spaceTitle) && (
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            {image && (
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                    <Image
                                        src={image}
                                        alt={spaceTitle || 'Space'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex flex-col justify-center overflow-hidden">
                                <h3 className="font-bold text-gray-900 truncate">
                                    {spaceTitle || 'Untitled Space'}
                                </h3>
                                {location && (
                                    <p className="text-sm text-gray-500 truncate">{location}</p>
                                )}
                                <p className="text-xs text-[#F6CD28] font-medium mt-1">
                                    sparespace.com
                                </p>
                            </div>
                        </div>
                    )}

                    {/* URL Display */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Link</label>
                        <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                            <input
                                type="text"
                                value={url}
                                readOnly
                                className="flex-1 bg-transparent text-sm text-gray-600 outline-none overflow-hidden text-ellipsis"
                            />
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        {canShare && (
                            <Button
                                onClick={handleNativeShare}
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                            >
                                <ShareIcon className="w-4 h-4 mr-2" /> Share via...
                            </Button>
                        )}
                        <Button
                            onClick={handleCopy}
                            className={`flex-1 h-12 rounded-xl font-bold transition-all ${
                                copied
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-[#F6CD28] hover:bg-yellow-500 text-black'
                            }`}
                        >
                            {copied ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" /> Copied!
                                </span>
                            ) : (
                                'Copy link'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
