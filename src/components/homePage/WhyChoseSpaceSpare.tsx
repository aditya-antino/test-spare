import Image from 'next/image';
import Typography from '@/components/ui/typoGraphy';
import { aboutUsImage } from '@/assets';
import React from 'react';

const WhyChoseSpaceSpare = React.memo(function WhyChoseSpaceSpare() {
    return (
        <section className="md:py-4 py-8 px-4 md:px-16 h-full flex flex-col lg:flex-row items-center gap-10">
            {/* Left - Image */}
            <div className="h-full hidden sm:flex justify-center">
                <div className="relative w-screen md:w-[500px] h-[500px] ">
                    <Image
                        src={aboutUsImage}
                        alt="Spare Space Illustration"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Right - Content */}
            <div className="flex-1 space-y-6">
                <Typography
                    size="sm"
                    weight="font-medium"
                    className="uppercase tracking-wide text-gray-500"
                >
                    Benefits
                </Typography>

                <Typography size="3xl" weight="font-bold">
                    Why Choose <span className="text-[#F6CD28]">Spare Space</span>?
                </Typography>

                {/* Feature 1 */}
                <div className="flex flex-col justify-start items-start gap-5">
                    <div className="px-2.5 py-0.5 bg-emerald-100 rounded-[10.02px] inline-flex justify-center items-center">
                        <Typography
                            variant="caption"
                            weight="medium"
                            color="text-emerald-800"
                            className="leading-none"
                        >
                            Instant Reservations
                        </Typography>
                    </div>
                    <Typography
                        variant="h4"
                        weight="semibold"
                        color="text-gray-800"
                        className="leading-tight"
                    >
                        Effortless Booking
                    </Typography>
                    <Typography variant="body" weight="normal" color="text-gray-500">
                        Browse, compare, and book spaces in just a few clicks. No lengthy contracts,
                        no hidden fees—just seamless access to the perfect space when you need it.
                    </Typography>
                </div>

                {/* Feature 2 */}
                <div className="inline-flex flex-col justify-start items-start gap-5">
                    <div className="px-2.5 py-0.5 bg-blue-100 rounded-[10.02px] inline-flex justify-center items-center">
                        <Typography
                            variant="caption"
                            weight="medium"
                            color="text-blue-800"
                            className="leading-none"
                        >
                            Spaces for Every Occasion
                        </Typography>
                    </div>
                    <Typography
                        variant="h4"
                        weight="semibold"
                        color="text-gray-800"
                        className="leading-tight"
                    >
                        Wide Variety of Spaces
                    </Typography>
                    <Typography variant="body" weight="normal" color="text-gray-500">
                        Whether you need a coworking desk, a private studio, or an event venue, find
                        spaces tailored to work, creativity, and social gatherings—all in one
                        platform.
                    </Typography>
                </div>

                {/* Feature 3 */}
                <div className="inline-flex flex-col justify-start items-start gap-5">
                    <div className="px-2.5 py-0.5 bg-pink-100 rounded-[10.02px] inline-flex justify-center items-center">
                        <Typography
                            variant="caption"
                            weight="medium"
                            color="text-pink-800"
                            className="leading-none"
                        >
                            No Surprises, No Hassles
                        </Typography>
                    </div>
                    <Typography
                        variant="h4"
                        weight="semibold"
                        color="text-gray-800"
                        className="leading-tight"
                    >
                        Transparent Pricing
                    </Typography>
                    <Typography variant="body" weight="normal" color="text-gray-500">
                        View real-time pricing, amenities, and availability upfront. Pay only for
                        the time you use, with secure transactions and clear cancellation policies.
                    </Typography>
                </div>
            </div>
        </section>
    );
});

export default WhyChoseSpaceSpare;
