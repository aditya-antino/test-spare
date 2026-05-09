'use client';
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Typography from '@/components/ui/typoGraphy';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/ui/loader';
import { useGetTimeWiseReportDetails } from '@/services';
import { formatIndianCurrencyZero } from '@/utils/IndianCurrencyFormatter';
import { SpaceDropDown } from '@/components';

const TimeWiseReportDetails = () => {
    const params = useParams();
    const router = useRouter();
    const year = Array.isArray(params?.year) ? params.year[0] : params?.year;
    const month = Array.isArray(params?.month) ? params.month[0] : params?.month;
    const [selectedSpace, setSelectedSpace] = useState<number | null>(null);

    const { data, isLoading, error } = useGetTimeWiseReportDetails(year!, month!, selectedSpace);

    const handleGoBack = () => router.back();

    const { summary, listingWiseEarnings, taxDetails } = data?.data ?? {};

    const totalRemittedTax =
        taxDetails?.reduce(
            (acc: number, item: any) => acc + parseFloat(item.spareSpaceRemittedTax || '0'),
            0,
        ) || 0;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader size={40} />
                </div>
            );
        }

        if (error) {
            return (
                <Typography variant="body" color="text-red-500">
                    {error.message || 'Something went wrong!!'}
                </Typography>
            );
        }

        return (
            <>
                {totalRemittedTax > 0 && (
                    <div className="mb-8 rounded-lg">
                        <Typography variant="body" className="text-gray-700">
                            <span className="font-medium">Spacespace-remitted taxes:</span>{' '}
                            <span className="font-semibold">
                                ₹{formatIndianCurrencyZero(totalRemittedTax)}
                            </span>{' '}
                            was collected from your guest and remitted to tax authorities
                        </Typography>
                    </div>
                )}

                <div className="mb-10">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Summary</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                                        Summary
                                    </th>
                                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                        Gross Earning
                                    </th>
                                    {/* <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                        CGST
                                    </th>
                                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                        SGST
                                    </th> */}
                                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                        Service Fee (incl. Taxes)
                                    </th>
                                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                        Tax withheld
                                    </th>
                                    {/* <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                        TCS Amounts
                                    </th> */}

                                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                        Total (INR)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4 px-2 text-sm text-gray-900">Earnings</td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(summary?.grossEarning || 0)}
                                    </td>

                                    {/* <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(summary?.totalCgstAmount || 0)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(summary?.totalSgstAmount || 0)}
                                    </td> */}
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(summary?.serviceFee || 0)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(summary?.taxWithheld || 0)}
                                    </td>
                                    {/* <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(summary?.totalTcsAmount)}
                                    </td> */}

                                    <td className="py-4 px-2 text-right text-sm font-semibold text-gray-900">
                                        ₹{formatIndianCurrencyZero(summary?.totalPayout || 0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {listingWiseEarnings && listingWiseEarnings.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                            Listings
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                                            Listing
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            Gross Earning
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            Service Fee (incl. Taxes)
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            Tax withheld
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            Total (INR)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listingWiseEarnings.map((item: any, index: number) => (
                                        <tr
                                            key={`${item.spaceId}-${index}`}
                                            className="border-b border-gray-200"
                                        >
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-3">
                                                    {item['Booking.Space.SpaceImages.imageUrl'] && (
                                                        <Image
                                                            src={
                                                                item[
                                                                    'Booking.Space.SpaceImages.imageUrl'
                                                                ]
                                                            }
                                                            alt={item.spaceName || 'Space image'}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <span className="text-sm text-gray-900">
                                                        {item.spaceName || 'Unnamed Space'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹{formatIndianCurrencyZero(item.grossEarning || 0)}
                                            </td>
                                            <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹{formatIndianCurrencyZero(item.serviceFee || 0)}
                                            </td>
                                            <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹{formatIndianCurrencyZero(item.taxWithheld || 0)}
                                            </td>
                                            <td className="py-4 px-2 text-right text-sm font-semibold text-gray-900">
                                                ₹{formatIndianCurrencyZero(item.totalPayout || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {taxDetails && taxDetails.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                            Taxes
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                                            Listing
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            Tax Withheld
                                        </th>
                                        {/* <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            CGST
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            SGST
                                        </th> */}
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            Host Remitted Tax
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            TCS Amount
                                        </th>
                                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                            Spare Space Remitted Tax
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taxDetails.map((item: any, index: number) => (
                                        <tr
                                            key={`${item.spaceId}-${index}`}
                                            className="border-b border-gray-200"
                                        >
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-3">
                                                    {item['Booking.Space.SpaceImages.imageUrl'] && (
                                                        <Image
                                                            src={
                                                                item[
                                                                    'Booking.Space.SpaceImages.imageUrl'
                                                                ]
                                                            }
                                                            alt={item.spaceName || 'Space image'}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <span className="text-sm text-gray-900">
                                                        {item.spaceName || 'Unnamed Space'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹{formatIndianCurrencyZero(item.taxWithheld || 0)}
                                            </td>
                                            {/* <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹{formatIndianCurrencyZero(item.cgstAmount || 0)}
                                            </td>
                                            <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹{formatIndianCurrencyZero(item.sgstAmount || 0)}
                                            </td> */}
                                            <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹
                                                {formatIndianCurrencyZero(
                                                    item.hostRemittedTax || 0,
                                                )}
                                            </td>
                                            <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹{formatIndianCurrencyZero(item.tcsAmount || 0)}
                                            </td>
                                            <td className="py-4 px-2 text-right text-sm text-gray-900">
                                                ₹
                                                {formatIndianCurrencyZero(
                                                    item.spareSpaceRemittedTax || 0,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* <div className="pb-10">
                    <Button
                        variant="outline"
                        size="default"
                        className="gap-2 border-gray-300 hover:bg-gray-50"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M8 2v8m0 0l3-3m-3 3L5 7m8 7H3" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Export</span>
                    </Button>
                </div> */}
            </>
        );
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 w-full py-6">
                <div className="mb-6">
                    <button
                        onClick={handleGoBack}
                        className="hover:cursor-pointer transition-colors duration-200 hover:bg-gray-100 p-2 rounded-full"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-800" />
                    </button>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                            {month && year
                                ? `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`
                                : 'Earnings Summary'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-sm md:text-base text-gray-600">You earned</span>
                            <span className="text-base md:text-lg font-medium text-yellow-600">
                                ₹{formatIndianCurrencyZero(summary?.totalPayout || 0)}
                            </span>
                        </div>
                    </div>
                    <SpaceDropDown selectedSpace={selectedSpace} onSpaceChange={setSelectedSpace} />
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default TimeWiseReportDetails;
