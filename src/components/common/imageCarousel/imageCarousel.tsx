'use client';

import * as React from 'react';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
    images: string[] | Array<{ image_url: string; [key: string]: any }>;
    isBookingCard?: boolean;
}

export default function ImageCarousel({ images, isBookingCard = false }: ImageCarouselProps) {
    const [current, setCurrent] = React.useState(0);
    const [api, setApi] = React.useState<CarouselApi | null>(null);
    const [isHovered, setIsHovered] = React.useState(false);

    // Transform images to handle both string arrays and object arrays
    const processedImages = React.useMemo(() => {
        return images
            .map((img) => {
                if (typeof img === 'string') {
                    return img;
                } else if (img && typeof img === 'object' && 'image_url' in img) {
                    return img.image_url;
                }
                return '';
            })
            .filter((src) => src && src.trim() !== '');
    }, [images]);

    React.useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        api.on('select', onSelect);

        return () => {
            api.off('select', onSelect);
        };
    }, [api]);

    React.useEffect(() => {
        if (!api) return;

        const shouldAutoplay = isBookingCard ? isHovered : true;

        if (!shouldAutoplay) return;

        const autoplay = setInterval(() => {
            api.scrollNext();
        }, 3000);

        return () => clearInterval(autoplay);
    }, [api, isHovered, isBookingCard]);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (isBookingCard && api) {
            api.scrollTo(0);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (isBookingCard && api) {
            api.scrollTo(0);
        }
    };

    const getDotsStartIndex = () => {
        if (processedImages.length <= 5) return 0;

        let start = current - 2;
        if (start < 0) start = 0;
        if (start + 5 > processedImages.length) start = processedImages.length - 5;

        return start;
    };

    const dotsStartIndex = getDotsStartIndex();
    const visibleDots = processedImages.slice(dotsStartIndex, dotsStartIndex + 5);

    const handleDotClick = (e: React.MouseEvent, dotIndex: number) => {
        e.stopPropagation();
        if (!api) return;
        const actualImageIndex = dotsStartIndex + dotIndex;
        api.scrollTo(actualImageIndex);
    };

    return (
        <div
            className="relative w-full select-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Carousel opts={{ align: 'start', loop: true }} setApi={setApi}>
                <CarouselContent>
                    {processedImages.map((src, index) => (
                        <CarouselItem key={index} className="basis-full">
                            <div className="w-full h-48 relative">
                                <Image
                                    src={src}
                                    alt={`Slide ${index + 1}`}
                                    fill
                                    priority={index === 0}
                                    quality={80}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover"
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <CarouselPrevious className="z-20" onClick={(e) => e.stopPropagation()} />
                <CarouselNext className="z-20" onClick={(e) => e.stopPropagation()} />
            </Carousel>

            <div className="flex justify-center items-center gap-1.5 absolute left-1/2 -translate-x-1/2 bottom-2.5 z-20">
                {visibleDots.map((_, i) => {
                    const actualImageIndex = dotsStartIndex + i;
                    return (
                        <button
                            key={actualImageIndex}
                            onClick={(e) => handleDotClick(e, i)}
                            className={cn(
                                'rounded-full transition-all',
                                current === actualImageIndex
                                    ? 'w-2 h-2 bg-white'
                                    : 'w-[5px] h-[5px] bg-gray-200',
                            )}
                        />
                    );
                })}
            </div>
        </div>
    );
}
