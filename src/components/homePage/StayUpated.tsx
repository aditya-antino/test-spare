'use client';
import { StayConnectedIllustration } from '@/assets';
import { handleApiError } from '@/hooks/handleApiError';
import { subscribeMail } from '@/services/subscribeMail.services';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const StayUpdated = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email.');

        try {
            setIsLoading(true);
            const response = await subscribeMail(email);
            if (response.status === 200) {
                toast.success('You have successfully subscribed!');
                setEmail('');
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row justify-between items-center py-0 px-4 md:px-16 w-full bg-white relative overflow-hidden">
            <div className="w-full lg:w-[45%] inline-flex flex-col justify-start items-start gap-8 relative z-10">
                <div className="self-stretch justify-start">
                    <h2 className="text-slate-900 text-4xl md:text-5xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight">
                        Stay updated with <span className="text-[#F7CD29]">Spare Space</span>
                    </h2>
                </div>

                <div className="self-stretch text-slate-500 text-lg font-medium leading-relaxed max-w-md">
                    Get the latest space listings, exclusive offers, and industry insights delivered
                    securely right to your inbox.
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <label className="flex items-center gap-4 group cursor-default">
                        <div className="w-8 h-8 rounded-full border border-[#F7CD29]/30 flex items-center justify-center bg-[#F7CD29]/10 text-slate-600 font-bold text-sm transition-colors group-hover:bg-[#F7CD29]/20">
                            01
                        </div>
                        <span className="text-slate-700 font-semibold text-lg hover:text-slate-900 transition-colors">
                            🎉 Exclusive Deals & Offers
                        </span>
                    </label>

                    <label className="flex items-center gap-4 group cursor-default">
                        <div className="w-8 h-8 rounded-full border border-[#F7CD29]/30 flex items-center justify-center bg-[#F7CD29]/10 text-slate-600 font-bold text-sm transition-colors group-hover:bg-[#F7CD29]/20">
                            02
                        </div>
                        <span className="text-slate-700 font-semibold text-lg hover:text-slate-900 transition-colors">
                            📍 New Space Alerts
                        </span>
                    </label>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex w-full gap-2 p-2 mt-4 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 max-w-md focus-within:ring-2 focus-within:ring-[#F7CD29]/50 transition-all"
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 px-4 py-3 bg-transparent rounded-full focus:outline-none text-slate-700 placeholder-slate-400 font-medium"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#f7cd29] hover:shadow-lg hover:-translate-y-0.5 text-white px-6 py-3 flex items-center justify-center transition-all duration-300 rounded-full font-bold"
                    >
                        {isLoading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Subscribe</span>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </div>
                        )}
                    </button>
                </form>
            </div>

            <div className="w-full lg:w-[50%] flex justify-center mt-12 lg:mt-0 relative z-10 transition-transform duration-700 hover:scale-[1.02]">
                <Image
                    src={StayConnectedIllustration}
                    alt="Host illustration"
                    width={550}
                    height={550}
                />
            </div>
        </div>
    );
};

export default StayUpdated;
