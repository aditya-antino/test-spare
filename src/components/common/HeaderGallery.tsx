'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Edit2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';
import React from 'react';
import { useDeactivateSpace } from '@/services';
import { toast } from 'react-toastify';
import { ActivateSpaceModal } from '../modals/ActivateSpaceModal';
import { toggleWishlistItem } from '@/services/guest/wishlist.services';
import { handleApiError } from '@/hooks/handleApiError';

interface ImageItem {
    id: number | string;
    image_url: string;
    is_featured?: boolean;
}

interface HeaderGalleryProps {
    id: number | string;
    images?: ImageItem[];
    isDeactivated?: boolean;
    onSuccess?: () => void;
    showHeader?: boolean;
    data: {
        id?: string | number;
        title: string;
        location: string;
    };
    isInWishlist?: boolean;
}

export default function HeaderGallery({
    id,
    images,
    isDeactivated = false,
    showHeader = true,
    data,
    onSuccess,
    isInWishlist = false,
}: HeaderGalleryProps) {
    const [showGridView, setShowGridView] = useState<boolean>(false);
    const [showCarousel, setShowCarousel] = useState<boolean>(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [api, setApi] = useState<CarouselApi>();
    const [showActivateModal, setShowActivateModal] = useState<boolean>(false);
    const [showIsInWishlist, setShowIsInWishlist] = useState<boolean>(isInWishlist);
    const [current, setCurrent] = useState(0);
    const router = useRouter();

    const { mutate: deactivateSpace, isPending: isDeactivateLoading } = useDeactivateSpace({
        onSuccess: (data) => {
            toast.success(data?.message);
            onSuccess();
            setShowActivateModal(false);
        },
        onError: (error) => {
            console.log(error);
        },
    });

    const handleDeactivateSpace = () => {
        deactivateSpace({ spaceIds: [Number(id)], deactivate: false });
    };

    // Update current slide when carousel changes
    React.useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap() + 1);

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    React.useEffect(() => {
        if (api && showCarousel) {
            api.scrollTo(selectedImageIndex);
            setCurrent(selectedImageIndex + 1);
        }
    }, [api, showCarousel, selectedImageIndex]);

    const scrollToPrevious = () => {
        api?.scrollPrev();
    };

    const scrollToNext = () => {
        api?.scrollNext();
    };

    const handleImageSelect = (index: number) => {
        setSelectedImageIndex(index);
        setShowGridView(false);
        setShowCarousel(true);
    };

    const closeModal = () => {
        setShowGridView(false);
        setShowCarousel(false);
    };

    if (!images || images.length === 0) return null;

    const featured = images.find((img) => img.is_featured) || images[0];
    const thumbnails = images.filter((img) => img.id !== featured?.id).slice(0, 4);

    const handleToggleWishlist = async () => {
        try {
            if (!data?.id) return toast.error('Something went wrong!!');
            const response = await toggleWishlistItem(id);
            if (response.status === 201) {
                setShowIsInWishlist((prev) => !prev);
                toast.success('wishlist updated successfully!');
            }
        } catch (err) {
            handleApiError(err);
        }
    };

    return (
        <div className="relative">
            {/* Header */}
            {showHeader && (
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-yellow-500">Listing Details</h1>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => {
                                router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${id}&isEdit=true`);
                            }}
                            variant="outline"
                            className="rounded-full px-6"
                        >
                            <Edit2 className="h-4 mr-2" /> Edit
                        </Button>

                        {isDeactivated && (
                            <Button onClick={() => setShowActivateModal(true)}>
                                Reactivate Listing
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Gallery */}
            <div className="flex h-[60vh] w-full gap-2 rounded-3xl overflow-hidden">
                <div
                    className="w-full relative cursor-pointer"
                    onClick={() => handleImageSelect(0)}
                >
                    <Image
                        src={featured?.image_url ?? '/placeholder.jpg'}
                        alt="main"
                        fill
                        priority
                        quality={80}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover rounded-xl hover:opacity-90 transition-opacity"
                    />
                </div>

                <div className="w-full hidden h-full md:grid gap-2 grid-cols-2 grid-rows-2">
                    {thumbnails.map((img, index) => (
                        <div
                            key={img.id ?? index}
                            className="h-full relative cursor-pointer"
                            onClick={() => handleImageSelect(index + 1)}
                        >
                            <Image
                                src={img.image_url ?? '/placeholder.jpg'}
                                alt={`gallery-${index}`}
                                fill
                                quality={80}
                                sizes="25vw"
                                className="object-cover rounded-xl hover:opacity-90 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Show all photos button */}
            <Button
                onClick={() => setShowGridView(true)}
                className="left-4 bottom-4 absolute bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
            >
                Show all photos ({images.length})
            </Button>

            {/* Grid View Modal */}
            {showGridView && (
                <div className="fixed inset-0 z-50 w-screen h-screen bg-white backdrop-blur-sm overflow-y-auto">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={closeModal}
                                className="flex items-center gap-2 rounded-full text-zinc-800 hover:bg-black/20 cursor-pointer p-2"
                            >
                                <ArrowLeftIcon className="w-6 h-6" /> Back
                            </button>
                            <h2 className="md:text-2xl text-xl font-semibold text-zinc-800">
                                All Photos ({images.length})
                            </h2>
                            <div className="w-16 hidden md:block"></div>{' '}
                            {/* Spacer for centering */}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4">
                            {images.map((img, idx) => (
                                <div
                                    key={img.id ?? idx}
                                    className="relative aspect-video cursor-pointer group overflow-hidden rounded-lg"
                                    onClick={() => handleImageSelect(idx)}
                                >
                                    <Image
                                        src={img.image_url ?? '/placeholder.jpg'}
                                        alt={`photo-${idx}`}
                                        fill
                                        quality={80}
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        className="object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Carousel Modal */}
            {showCarousel && (
                <div className="fixed inset-0 z-50 w-screen h-screen flex items-center justify-center p-0 m-0 bg-zinc-800 backdrop-blur-sm">
                    <Carousel
                        setApi={setApi}
                        className="w-full h-full flex items-center justify-center"
                        opts={{
                            align: 'center',
                            loop: true,
                        }}
                    >
                        <CarouselContent className="h-full">
                            {images.map((img, idx) => (
                                <CarouselItem key={img.id ?? idx} className="h-full">
                                    <div className="w-full h-full flex items-center justify-center p-4">
                                        <div className="relative max-h-[85vh] max-w-full">
                                            <Image
                                                src={img.image_url ?? '/placeholder.jpg'}
                                                alt={`photo-${idx}`}
                                                width={1200}
                                                height={800}
                                                quality={85}
                                                className="object-contain rounded-lg shadow-2xl max-h-[85vh] max-w-full h-auto w-auto"
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Navigation arrows */}
                        <Button
                            onClick={scrollToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-black hover:text-black bg-[#F6CD28] hover:bg-amber-500 border-amber-500 h-12 w-12 p-0"
                            size="icon"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            onClick={scrollToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-black bg-[#F6CD28] hover:bg-amber-500 border-amber-500 h-12 w-12 p-0"
                            size="icon"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>

                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full flex items-center justify-between px-4">
                            <button
                                onClick={() => {
                                    setShowGridView(true);
                                    setShowCarousel(false);
                                }}
                                className="text-white flex items-center gap-2 rounded-full hover:bg-black/20 cursor-pointer p-2"
                            >
                                <ArrowLeftIcon className="w-6 h-6" /> Back
                            </button>
                            <div className="text-xl font-semibold text-white">
                                {current} / {images.length}
                            </div>
                            <button
                                onClick={handleToggleWishlist}
                                className=" text-white flex items-center gap-2 rounded-full hover:bg-black/20 cursor-pointer p-2"
                            >
                                <Heart
                                    className={`w-6 h-6 ${
                                        showIsInWishlist
                                            ? 'text-rose-600 fill-current'
                                            : 'text-white'
                                    }`}
                                />{' '}
                                Wishlist
                            </button>
                        </div>
                    </Carousel>
                </div>
            )}

            <ActivateSpaceModal
                open={showActivateModal}
                onClose={() => setShowActivateModal(false)}
                isLoading={isDeactivateLoading}
                onSubmit={handleDeactivateSpace}
                image={featured?.image_url ?? '/placeholder.jpg'}
                title={data?.title ?? ''}
                location={data?.location ?? ''}
            />
        </div>
    );
}
