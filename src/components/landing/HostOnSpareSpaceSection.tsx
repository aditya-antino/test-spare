'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
    CheckCircle2,
    ArrowRight,
    Zap,
    Users,
    ShieldCheck,
    Wallet,
    Clock,
    Building2,
    User,
    HelpCircle,
    Info,
    Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

import { PATHS } from '@/constants/path';
import { RootState } from '@/store/store';
import { useUpdateGuestToHost } from '@/services';
import { handleApiError } from '@/hooks/handleApiError';
import ConfirmHostModal from '@/components/layout/confirmHostModal';
import { Button } from '@/components/ui/button';
import { listSpacePageIcon } from '@/assets';

const HostOnSpareSpaceSection = () => {
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    // Selectors
    const authState = useSelector((state: RootState) => state?.auth);
    const userRole = Array.isArray(authState?.userRole) ? authState.userRole : [];
    const isLoggedIn = !!authState?.accessToken;

    const [isHostChangeModal, setIsHostChangeModal] = useState<boolean>(false);

    const { mutate: updateGuestRole } = useUpdateGuestToHost({
        onSuccess: (res) => {
            toast.success(res.message);
            setIsHostChangeModal(false);
            queryClient.invalidateQueries({ queryKey: ['get-profile'] });
            router.replace(PATHS.YOUR_LISTING);
        },
        onError: (err) => {
            handleApiError(err);
            setIsHostChangeModal(false);
        },
    });

    const onListSpaceClick = () => {
        if (!isLoggedIn) {
            router.push(PATHS.LOGIN);
            return;
        }

        if (userRole.includes('host')) {
            router.push(PATHS.YOUR_LISTING);
        } else {
            setIsHostChangeModal(true);
        }
    };

    const onWhatsAppClick = () => {
        window.open('https://wa.me/918076533100', '_blank');
    };

    const benefits = [
        {
            title: 'Earn From Idle Hours',
            description:
                'Monetise unused time slots without longterm commitments. Your space earns even when it would otherwise sit idle.',
            icon: Clock,
        },
        {
            title: 'Get Discovered',
            description:
                'Get visibility among photographers, filmmakers, brands, agencies, startups, podcasters, and creators actively searching for spaces across India.',
            icon: Users,
        },
        {
            title: 'Seamless Online Bookings',
            description:
                'Manage availability, pricing, booking requests, and confirmations through a single dashboard.',
            icon: Zap,
        },
        {
            title: 'Payments Handled by Us',
            description:
                'Spare Space collects the full booking amount upfront from guests, so you never have to chase payments.',
            icon: Wallet,
        },
    ];

    const steps = [
        {
            title: 'Create Your Account & List Your Space',
            description:
                'Sign up and click “List Your Space” to add your space details, amenities, and images.',
        },
        {
            title: 'Set Up Your Host Profile',
            description: 'Add a display picture, write a short description, and verify your ID.',
        },
        {
            title: 'Link Your Payout Details',
            description: 'Link your bank account under the Payouts section to receive earnings.',
        },
    ];

    const spaceTypes = [
        'Photo & Video studios',
        'Podcast & Recording spaces',
        'Workshop & Meetup venues',
        'Meeting & Brainstorming rooms',
        'Art, Lifestyle & Concept spaces',
        'Small Event & Private Gathering spaces',
    ];

    return (
        <div className="w-full bg-white font-['Figtree'] selection:bg-primary-p1/30">
            {/* Hero Section */}
            <section className="relative pt-16 pb-12 md:pt-20 md:pb-20 overflow-hidden text-gray-900 leading-normal">
                {/* Refined Mesh Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_0%,#FEFBEF_0%,transparent_50%)]">
                    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-tint4 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-primary-tint3 rounded-full blur-[80px] opacity-30"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-tint4 text-primary-p2 font-semibold text-[10px] md:text-xs mb-6 border border-primary-p1/20 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary-p1 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-p1"></span>
                        </span>
                        <span>Host on Spare Space</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-8">
                        Turn Your <span className="text-primary-p1">Space</span> <br />
                        Into a Booking Engine
                    </h1>
                    <p className="max-w-xl mx-auto text-base md:text-lg text-gray-600 leading-relaxed mb-10 font-medium">
                        Spare Space helps space owners get booked by the hour by taking discovery,
                        bookings, and payments online.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={onListSpaceClick}
                            className="w-full sm:w-auto px-10 py-4 bg-primary-p1 hover:bg-primary-p2 text-black font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2.5 group"
                        >
                            LIST YOUR SPACE
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onWhatsAppClick}
                            className="w-full sm:w-auto px-10 py-4 border-2 border-primary-p1 text-black font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2.5"
                        >
                            TALK TO US ON WHATSAPP
                        </Button>
                    </div>
                </div>
            </section>

            {/* What is Spare Space */}
            <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
                        <div className="w-full lg:w-1/2 relative">
                            <div className="absolute -inset-6 bg-gradient-to-tr from-primary-p1/10 via-transparent to-primary-p2/5 blur-[60px] rounded-full opacity-50"></div>
                            <div className="relative group">
                                <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden shadow-lg transition-all duration-700">
                                    <Image
                                        src={listSpacePageIcon}
                                        alt="Modern Creative Studio"
                                        fill
                                        className="object-cover transition-transform duration-1000 hover:scale-105"
                                    />
                                </div>

                                <div className="absolute bottom-6 -right-6 w-36 h-36 bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white/50 hidden xl:block animate-float">
                                    <div className="w-full h-full bg-gradient-to-br from-primary-tint5 to-primary-tint4 rounded-[1.5rem] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                        <div className="relative w-16 h-16 mb-2">
                                            <Image
                                                src="/favicon.svg"
                                                alt="Spare Space Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-6 h-6 relative shrink-0">
                                    <Image
                                        src="/favicon.svg"
                                        alt="SS"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-primary-p1 font-bold uppercase tracking-[0.2em] text-[10px] block">
                                    Our Identity
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 leading-tight">
                                What Is <span className="text-primary-p1">Spare Space?</span>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed mb-5 font-medium">
                                Spare Space is India’s fastest-growing online platform for booking
                                creative spaces by the hour from photo studios and podcast rooms to
                                workshop venues and unique locations.
                            </p>
                            <p className="text-base text-gray-600 leading-relaxed border-l-4 border-primary-p1 pl-5 py-1 font-medium">
                                We help hosts take their bookings online, endtoend from listing and
                                discovery to confirmation, payments, and payouts so you spend less
                                time coordinating and more time earning.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Host */}
            <section className="py-20 bg-white relative">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Why Host on Spare Space?
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-primary-p1 to-primary-p2 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {benefits.map((benefit, idx) => (
                            <div
                                key={idx}
                                className="group p-7 bg-white border border-gray-100 rounded-[2rem] hover:border-primary-p1/30 hover:shadow-lg transition-all duration-500"
                            >
                                <div className="w-14 h-14 bg-primary-tint4 rounded-[1rem] flex items-center justify-center mb-5 group-hover:bg-primary-p1 group-hover:text-white transition-all duration-500">
                                    <benefit.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-sm text-gray-600 font-medium">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rules and Support */}
            <section className="py-20 bg-gradient-to-br from-primary-tint5 via-primary-tint4 to-white text-gray-900 overflow-hidden relative border-y border-primary-tint3">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary-tint3 to-transparent skew-x-12 translate-x-20 opacity-50"></div>
                <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
                        <div>
                            <span className="text-primary-p2 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">
                                Freedom to Operate
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 leading-tight">
                                Your Rules, <br /> Your Policies
                            </h2>
                            <div className="space-y-4 md:space-y-6">
                                {[
                                    'Hourly pricing',
                                    'Minimum booking duration',
                                    'Cancellation policy',
                                    'Availability control',
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className="w-8 h-8 rounded-full bg-primary-p1 flex items-center justify-center shrink-0 border border-white">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-lg font-semibold tracking-tight text-gray-800">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-primary-tint2 shadow-lg">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-4 text-gray-900">
                                <div className="p-2 bg-primary-p1 rounded-lg">
                                    <HelpCircle className="w-5 h-5 text-white" />
                                </div>
                                Dedicated Host Support
                            </h2>
                            <p className="text-gray-600 mb-6 text-base font-medium">
                                Our team actively supports you with:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    'Guest coordination',
                                    'Listing optimisation',
                                    'Booking queries',
                                    'Onboarding & setup',
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-primary-p1"></div>
                                        <span className="text-sm font-bold text-gray-800">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 p-5 bg-gradient-to-br from-primary-tint4 to-white rounded-xl border border-primary-tint2 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary-p1/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                <h4 className="text-lg font-bold text-primary-p2 mb-1.5 relative">
                                    No Listing Fees
                                </h4>
                                <p className="text-sm text-gray-700 font-bold relative">
                                    Listing your space is completely free. We only earn when you
                                    receive bookings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Space Types */}
            <section className="py-20 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-12">
                        <span className="text-primary-p1 font-bold uppercase tracking-[0.2em] text-[10px] mb-3 block">
                            Versatility
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 leading-tight">
                            What Kind of Spaces <br /> Can You List?
                        </h2>
                        <p className="text-base text-gray-500 max-w-lg mx-auto font-medium">
                            If your space can be booked by the hour, it belongs on Spare Space.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {spaceTypes.map((type, idx) => (
                            <div
                                key={idx}
                                className="group p-5 bg-gray-50 rounded-[1.5rem] border border-transparent hover:border-primary-p1 hover:bg-white hover:shadow-md transition-all duration-500"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:bg-primary-tint4 transition-colors">
                                        <CheckCircle2 className="w-5 h-5 text-primary-p1 transition-transform group-hover:scale-110" />
                                    </div>
                                    <span className="text-base font-bold text-gray-800 tracking-tight">
                                        {type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 bg-gradient-to-b from-primary-tint4/30 via-white to-white relative">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                            How Hosting Works
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 relative">
                        <div className="hidden md:block absolute top-[2.75rem] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-primary-p1/20 to-transparent -z-10"></div>
                        {steps.map((step, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="w-16 h-16 bg-primary-p1 text-black text-xl font-bold rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:-translate-y-1 transition-transform duration-500">
                                    0{idx + 1}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 px-4">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-600 max-w-[240px] mx-auto font-medium">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Account Types */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Account Types
                        </h2>
                        <div className="w-16 h-1 bg-primary-p1 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                        {/* Individual */}
                        <div className="group p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-700">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                    <User className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold leading-tight">
                                    Registering as an <br />
                                    <span className="text-blue-600 text-lg">Individual</span>
                                </h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="font-bold text-gray-400 uppercase text-[9px] tracking-[0.2em] mb-3">
                                        Requirements
                                    </p>
                                    <ul className="space-y-2.5">
                                        <li className="flex items-center gap-2.5 text-gray-700 text-sm font-bold">
                                            <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            Personal bank account
                                        </li>
                                        <li className="flex items-center gap-2.5 text-gray-700 text-sm font-bold">
                                            <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            Personal PAN number
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <p className="font-bold text-blue-600 uppercase text-[9px] tracking-[0.1em] mb-2 flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5" /> Tax handling
                                    </p>
                                    <p className="text-gray-800 text-sm font-bold">
                                        0.1% TDS deducted. <br />
                                        <span className="text-blue-600">
                                            TDS certificate issued quarterly.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Company */}
                        <div className="group p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-700">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold leading-tight">
                                    Registering as a <br />
                                    <span className="text-purple-600 text-lg">Company</span>
                                </h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="font-bold text-gray-400 uppercase text-[9px] tracking-[0.2em] mb-3">
                                        Requirements
                                    </p>
                                    <ul className="space-y-2.5 text-gray-700 text-sm font-bold">
                                        <li className="flex items-center gap-2.5">
                                            <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>{' '}
                                            Company PAN & GST
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>{' '}
                                            Company bank account
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-5 bg-purple-50/50 rounded-xl border border-purple-100">
                                    <p className="font-bold text-purple-600 uppercase text-[9px] tracking-[0.1em] mb-2 flex items-center gap-1">
                                        <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center">
                                            <Info className="w-2.5 h-2.5" />
                                        </div>{' '}
                                        Tax handling
                                    </p>
                                    <p className="text-gray-800 text-sm font-bold leading-relaxed">
                                        GST collected is included in payout. <br />
                                        <span className="text-purple-600 text-xs">
                                            0.1% TDS and 0.5% TCS applicable.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Payouts */}
            <section className="py-20 bg-gradient-to-tr from-white via-primary-tint5 to-white relative border-y border-primary-tint3">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 md:gap-20 items-center">
                        <div className="w-full lg:w-1/2">
                            <span className="text-primary-p2 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">
                                Transparent Records
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                                Payments & <br />
                                <span className="text-primary-p1">Payouts</span>
                            </h2>
                            <div className="space-y-6 md:space-y-8">
                                {[
                                    {
                                        title: 'Full Upfront Collection',
                                        desc: 'Collect 100% upfront from guest',
                                    },
                                    {
                                        title: 'Transparent Fees',
                                        desc: '10% platform fee retained',
                                    },
                                    {
                                        title: 'Host Earnings',
                                        desc: 'Remaining amount transferred',
                                    },
                                    {
                                        title: 'Next-Day Payouts',
                                        desc: 'Processed next working day after completion',
                                    },
                                    {
                                        title: 'Automated & Secure',
                                        desc: 'All payouts are automated via payment partner Razorpay',
                                    },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-10 h-10 shrink-0 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-lg text-primary-p2 border border-primary-tint3 group-hover:bg-primary-p1 group-hover:text-white transition-all duration-300">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 mb-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 font-medium">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="bg-gradient-to-br from-primary-tint5 via-white to-primary-tint4 p-10 md:p-12 rounded-[2.5rem] text-gray-900 shadow-sm relative overflow-hidden group border border-primary-tint3">
                                <ShieldCheck className="absolute -top-6 -right-6 w-52 h-52 text-primary-p1 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(247,205,41,0.06),transparent_50%)]"></div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-6 relative leading-tight text-gray-900">
                                    Zero Payment <br />{' '}
                                    <span className="text-primary-p1">Followups</span>
                                </h3>
                                <p className="text-lg leading-relaxed mb-8 text-gray-600 font-medium relative">
                                    Our system ensures transparency, reliability, and zero payment
                                    followups. You focus on hosting, we handle the money.
                                </p>
                                <Button
                                    onClick={onListSpaceClick}
                                    className="px-8 py-4 bg-primary-p1 hover:bg-primary-p2 text-black font-bold text-base rounded-full shadow-md hover:-translate-y-1 transition-all active:scale-95 relative"
                                >
                                    GET STARTED NOW
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-tint4/20 rounded-full blur-[100px] -z-10"></div>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        Ready to <br />
                        <span className="text-primary-p1">Monetize</span> your space?
                    </h2>
                    <p className="text-lg text-gray-600 mb-10 font-medium">
                        Join thousands of hosts earning with Spare Space across India.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <Button
                            onClick={onListSpaceClick}
                            className="w-full sm:w-auto px-10 py-4 bg-primary-p1 hover:bg-primary-p2 text-black font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            LIST YOUR SPACE
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onWhatsAppClick}
                            className="w-full sm:w-auto px-10 py-4 border-2 border-primary-p1 text-black font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            NEED HELP? CHAT NOW
                        </Button>
                    </div>
                </div>
            </section>

            {ConfirmHostModal && (
                <ConfirmHostModal
                    onConfirm={() => {
                        if (updateGuestRole && typeof updateGuestRole === 'function') {
                            updateGuestRole();
                        }
                    }}
                    onClose={() => setIsHostChangeModal(false)}
                    open={isHostChangeModal}
                />
            )}
        </div>
    );
};

export default HostOnSpareSpaceSection;
