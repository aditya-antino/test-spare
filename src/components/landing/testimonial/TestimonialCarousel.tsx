'use client';

import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow, EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-creative';
import TestimonialCard from './TestimonialCard';
import { TestimonialCarouselProps } from '@/types';

const TestimonialCarousel = ({ testimonials = [], loading = false }: TestimonialCarouselProps) => {
    const [_, setActiveIndex] = useState(0);
    const navigationPrevRef = useRef<HTMLButtonElement>(null);
    const navigationNextRef = useRef<HTMLButtonElement>(null);
    const paginationRef = useRef<HTMLDivElement>(null);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!testimonials.length) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                No testimonials available
            </div>
        );
    }

    return (
        <div className="relative w-full py-8 px-4 md:px-0">
            {testimonials.length > 1 && (
                <div
                    ref={paginationRef}
                    className="swiper-pagination flex justify-center mt-8 md:hidden"
                />
            )}

            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectCoverflow, EffectCreative]}
                slidesPerView={1}
                spaceBetween={30}
                speed={800}
                grabCursor={true}
                centeredSlides={true}
                autoHeight={false}
                autoplay={{
                    delay: 2000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: false,
                    el: '.swiper-pagination',
                }}
                navigation={{
                    prevEl: navigationPrevRef.current,
                    nextEl: navigationNextRef.current,
                }}
                breakpoints={{
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 20,
                        effect: 'slide' as const,
                    },
                    640: {
                        slidesPerView: 1,
                        spaceBetween: 25,
                        effect: 'creative' as const,
                        creativeEffect: {
                            prev: {
                                translate: ['-120%', 0, -500],
                                rotate: [0, 0, -90],
                                opacity: 0,
                            },
                            next: {
                                translate: ['120%', 0, -500],
                                rotate: [0, 0, 90],
                                opacity: 0,
                            },
                        },
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                        effect: 'coverflow' as const,
                        coverflowEffect: {
                            rotate: 5,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: false,
                        },
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                        effect: 'coverflow' as const,
                        coverflowEffect: {
                            rotate: 5,
                            stretch: -20,
                            depth: 100,
                            modifier: 1,
                            slideShadows: false,
                        },
                    },
                }}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                onBeforeInit={(swiper) => {
                    // @ts-ignore
                    swiper.params.navigation.prevEl = navigationPrevRef.current;
                    // @ts-ignore
                    swiper.params.navigation.nextEl = navigationNextRef.current;
                }}
                className="testimonial-swiper"
            >
                {testimonials.map((testimonial, index) => (
                    <SwiperSlide key={index}>
                        <div className="flex justify-center p-4 h-full">
                            <div className="w-full max-w-sm h-full">
                                <TestimonialCard {...testimonial} />
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <button
                ref={navigationPrevRef}
                className="testimonial-nav testimonial-prev hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-amber-600 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 items-center justify-center"
                aria-label="Previous testimonial"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            <button
                ref={navigationNextRef}
                className="testimonial-nav testimonial-next hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-amber-600 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 items-center justify-center"
                aria-label="Next testimonial"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>

            <style jsx global>{`
                .testimonial-swiper {
                    width: 100%;
                    padding: 20px 0;
                }

                .testimonial-swiper .swiper-wrapper {
                    align-items: stretch !important;
                }

                .testimonial-swiper .swiper-slide {
                    height: auto !important;
                    display: flex !important;
                    transition: all 0.6s ease-in-out;
                    transform: scale(0.9);
                    opacity: 0.7;
                }

                .testimonial-swiper .swiper-slide > div {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .testimonial-swiper .swiper-slide-active {
                    transform: scale(1);
                    opacity: 1;
                    z-index: 1;
                }

                .testimonial-swiper .swiper-slide-prev,
                .testimonial-swiper .swiper-slide-next {
                    transform: scale(0.95);
                    opacity: 0.9;
                }

                .swiper-pagination-bullet {
                    background: #cbd5e1;
                    opacity: 0.7;
                    width: 12px;
                    height: 12px;
                    transition: all 0.3s ease;
                }

                .swiper-pagination-bullet-active {
                    background: #f59e0b;
                    opacity: 1;
                    transform: scale(1.2);
                }

                @media (max-width: 767px) {
                    .testimonial-swiper {
                        padding: 10px 0 40px 0;
                    }

                    .swiper-pagination-bullet {
                        width: 10px;
                        height: 10px;
                    }

                    .testimonial-swiper .swiper-slide {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @media (min-width: 768px) {
                    .swiper-pagination {
                        display: none !important;
                    }
                }

                .testimonial-nav.swiper-button-disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .swiper-creative .swiper-slide {
                    transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                .swiper-coverflow .swiper-slide {
                    transition: all 0.6s ease;
                }
            `}</style>
        </div>
    );
};

export default TestimonialCarousel;
