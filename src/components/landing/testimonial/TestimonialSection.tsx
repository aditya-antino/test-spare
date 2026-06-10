import React from 'react';
import TestimonialCarousel from './TestimonialCarousel';
import { TESTIMONIALS } from '@/constants';

const TestimonialSection = React.memo(function TestimonialSection() {
    return (
        <section className="py-18 px-8 bg-[#fefaee]">
            <div className="flex flex-col justify-center items-center  mb-2">
                <h2 className=" text-4xl font-bold text-center text-[#1F2937]">
                    Our Users Feedback
                </h2>
                <p className="text-[#6B7280] text-base text-center ">
                    What Our Users Love About Us
                </p>
            </div>

            <TestimonialCarousel testimonials={TESTIMONIALS} loading={false} />
        </section>
    );
});

export default TestimonialSection;
