'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Typography from '@/components/ui/typoGraphy';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { DateRangeDropdown } from '@/components';
import { useGetSpaceWiseReportDetails } from '@/services';
import { formatIndianCurrencyZero } from '@/utils/IndianCurrencyFormatter';

interface DateRange {
    startDate: string;
    endDate: string;
}

interface TableColumn {
    key: string;
    label: string;
    align?: 'left' | 'right';
    className?: string;
}

const convertToYYYYMMDD = (dateStr: string): string => {
    if (!dateStr) return '';

    const [month, day, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toISOString().split('T')[0];
};

const SpaceWiseReportDetails = () => {
    const params = useParams();
    const router = useRouter();
    const spaceId = Array.isArray(params?.spaceId) ? params.spaceId[0] : params?.spaceId;

    const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });

    const { data, isLoading, error } = useGetSpaceWiseReportDetails(spaceId!, dateRange);

    const handleGoBack = () => router.back();

    const handleDateChange = (range: { startDate: string; endDate: string }) => {
        setDateRange({
            startDate: convertToYYYYMMDD(range.startDate),
            endDate: convertToYYYYMMDD(range.endDate),
        });
    };

    const reportData = data?.data;
    const totalRemittedTax = useMemo(
        () =>
            reportData?.taxes?.reduce(
                (acc, item) => acc + parseFloat(item.spareSpaceRemittedTax || '0'),
                0,
            ) || 0,
        [reportData?.taxes],
    );

    const summaryColumns: TableColumn[] = [
        { key: 'summary', label: 'Summary', align: 'left' },
        { key: 'grossEarning', label: 'Gross Earning', align: 'right' },
        { key: 'serviceFee', label: 'Service Fee (incl. Taxes)', align: 'right' },
        { key: 'taxWithheld', label: 'Tax Withheld', align: 'right' },
        { key: 'totalTcsAmount', label: 'Total TCS Amount', align: 'right' },
        { key: 'totalPayout', label: 'Total (INR)', align: 'right' },
    ];

    const transactionColumns: TableColumn[] = [
        { key: 'trxBookingId', label: 'Booking Id', align: 'left' },
        { key: 'guest', label: 'Guest', align: 'left' },
        { key: 'grossEarning', label: 'Gross Earning', align: 'right' },
        { key: 'serviceFee', label: 'Service Fee (incl. Taxes)', align: 'right' },
        { key: 'taxWithheld', label: 'Tax Withheld', align: 'right' },
        { key: 'totalPayout', label: 'Total (INR)', align: 'right' },
    ];

    const taxColumns: TableColumn[] = [
        { key: 'taxBookingId', label: 'Booking Id', align: 'left' },
        { key: 'guest', label: 'Guest', align: 'left' },
        { key: 'taxWithheld', label: 'Tax Withheld', align: 'right' },
        { key: 'hostRemittedTax', label: 'Host Remitted Tax', align: 'right' },
        { key: 'tcsAmount', label: 'TCS Amount', align: 'right' },
        { key: 'spareSpaceRemittedTax', label: 'Spare Space Remitted Tax', align: 'right' },
    ];

    const Table = ({
        columns,
        data,
        renderRow,
    }: {
        columns: TableColumn[];
        data: any[];
        renderRow: (item: any, index: number) => React.ReactNode;
    }) => (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`py-3 px-2 text-sm font-medium text-gray-700 ${
                                    column.align === 'right' ? 'text-right' : 'text-left'
                                } ${column.className || ''}`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{data.map(renderRow)}</tbody>
            </table>
        </div>
    );

    const GuestInfo = ({
        firstName,
        lastName,
        attendees,
    }: {
        firstName: string;
        lastName: string;
        attendees: number;
    }) => (
        <div className="flex flex-col py-4 px-2">
            <span className="text-gray-900 font-semibold text-base">
                {firstName} {lastName}
            </span>
            <span className="text-gray-500 text-sm">
                {attendees} attendee{attendees !== 1 ? 's' : ''}
            </span>
        </div>
    );

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="mb-10">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">{title}</h2>
            {children}
        </div>
    );

    if (isLoading) {
        return (
            <div className="bg-white min-h-screen">
                <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 w-full py-6">
                    <div className="mb-6">
                        <button
                            onClick={handleGoBack}
                            className="hover:cursor-pointer transition-colors duration-200 hover:bg-gray-100 p-2 rounded-full"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-800" />
                        </button>
                    </div>

                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                            Earnings Details
                        </h1>

                        <DateRangeDropdown
                            title="Filter"
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div className="flex items-center justify-center w-full h-full">
                        <Loader size={40} />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !reportData) {
        return (
            <div className="bg-white min-h-screen">
                <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 w-full py-6">
                    <div className="mb-6">
                        <button
                            onClick={handleGoBack}
                            className="hover:cursor-pointer transition-colors duration-200 hover:bg-gray-100 p-2 rounded-full"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-800" />
                        </button>
                    </div>

                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                            Earnings Details
                        </h1>

                        <DateRangeDropdown
                            title="Filter"
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    <Typography variant="body" color="text-red-500">
                        {error?.message || 'Something went wrong!!'}
                    </Typography>
                </div>
            </div>
        );
    }

    const { summary, transactions, taxes } = reportData;

    return (
        <div className="bg-white min-h-screen">
            <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 w-full py-6">
                <div className="mb-6">
                    <button
                        onClick={handleGoBack}
                        className="hover:cursor-pointer transition-colors duration-200 hover:bg-gray-100 p-2 rounded-full"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                            {reportData?.spaceName || 'Earnings Details'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-sm md:text-base text-gray-600">You earned</span>
                            <span className="text-base md:text-lg font-medium text-yellow-600">
                                ₹{formatIndianCurrencyZero(summary?.totalPayout)}
                            </span>
                        </div>
                    </div>
                    <DateRangeDropdown
                        title="Choose Date"
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        onChange={handleDateChange}
                    />
                </div>

                {totalRemittedTax > 0 && (
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                        <Typography variant="body" className="text-gray-700">
                            <span className="font-medium">Spacespace-remitted taxes:</span>{' '}
                            <span className="font-semibold">
                                ₹{formatIndianCurrencyZero(totalRemittedTax)}
                            </span>{' '}
                            was collected from your guest and remitted to tax authorities
                        </Typography>
                    </div>
                )}

                <Section title="Summary">
                    <Table
                        columns={summaryColumns}
                        data={[summary]}
                        renderRow={(item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-4 px-2 text-sm text-gray-900">Earnings</td>
                                <td className="py-4 px-2 text-right text-sm text-gray-900">
                                    ₹{formatIndianCurrencyZero(item?.grossEarning)}
                                </td>
                                <td className="py-4 px-2 text-right text-sm text-gray-900">
                                    ₹{formatIndianCurrencyZero(item?.serviceFee)}
                                </td>
                                <td className="py-4 px-2 text-right text-sm text-gray-900">
                                    ₹{formatIndianCurrencyZero(item?.taxWithheld)}
                                </td>
                                <td className="py-4 px-2 text-right text-sm text-gray-900">
                                    ₹{formatIndianCurrencyZero(item?.totalTcsAmount)}
                                </td>
                                <td className="py-4 px-2 text-right text-sm font-semibold text-gray-900">
                                    ₹{formatIndianCurrencyZero(item?.totalPayout)}
                                </td>
                            </tr>
                        )}
                    />
                </Section>

                {transactions && transactions.length > 0 && (
                    <Section title="Transactions">
                        <Table
                            columns={transactionColumns}
                            data={transactions}
                            renderRow={(item, index) => (
                                <tr
                                    key={item.Booking?.id || index}
                                    className="border-b border-gray-200"
                                >
                                    <td className="py-4 px-2 text-left text-sm text-gray-900">
                                        {item?.Booking?.id}
                                    </td>
                                    <td>
                                        <GuestInfo
                                            firstName={item.Booking?.User?.firstName || 'N/A'}
                                            lastName={
                                                item.Booking?.User?.lastName
                                                    ? item.Booking.User.lastName[0] + '.'
                                                    : ''
                                            }
                                            attendees={item.Booking?.attendees || 0}
                                        />
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(item?.grossEarning)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(item?.serviceFee)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(item?.taxWithheld)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm font-semibold text-gray-900">
                                        ₹{formatIndianCurrencyZero(item?.totalPayout)}
                                    </td>
                                </tr>
                            )}
                        />
                    </Section>
                )}

                {taxes && taxes.length > 0 && (
                    <Section title="Taxes">
                        <Table
                            columns={taxColumns}
                            data={taxes}
                            renderRow={(item, index) => (
                                <tr
                                    key={item.Booking?.id || index}
                                    className="border-b border-gray-200"
                                >
                                    <td className="py-4 px-2 text-left text-sm text-gray-900">
                                        {item?.Booking?.id}
                                    </td>
                                    <td>
                                        <GuestInfo
                                            firstName={item.Booking?.User?.firstName || 'N/A'}
                                            lastName={
                                                item.Booking?.User?.lastName
                                                    ? item.Booking.User.lastName[0] + '.'
                                                    : ''
                                            }
                                            attendees={item.Booking?.attendees || 0}
                                        />
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(item.taxWithheld)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(item.hostRemittedTax)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(item.tcsAmount)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-gray-900">
                                        ₹{formatIndianCurrencyZero(item.spareSpaceRemittedTax)}
                                    </td>
                                </tr>
                            )}
                        />
                    </Section>
                )}

                <div className="pb-10 flex justify-start">
                    <Button
                        variant="outline"
                        size="default"
                        className="gap-2 border-gray-300 hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 text-gray-900" />
                        <span className="text-sm font-medium text-gray-900">Export</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SpaceWiseReportDetails;
