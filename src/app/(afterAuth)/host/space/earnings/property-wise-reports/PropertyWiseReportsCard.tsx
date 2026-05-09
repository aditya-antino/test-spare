import React from 'react';
import { Card } from '@/components/ui/card';
import Typography from '@/components/ui/typoGraphy';
import ImageCarousel from '@/components/common/imageCarousel/imageCarousel';

interface Image {
    id: number;
    imageUrl: string;
}

interface PropertyWiseReportsCardProps {
    images: Image[];
    title: string;
    id: number;
    onClick: (id: number) => void;
}

export const PropertyWiseReportsCard = ({
    images,
    title,
    id,
    onClick,
}: PropertyWiseReportsCardProps) => {
    return (
        <Card
            onClick={() => onClick(id)}
            className="w-full sm:w-[48%] md:w-[31%] lg:w-[23%] p-0 rounded-3xl overflow-hidden shadow-none border border-neutral-300 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
            <div className="w-full h-44 sm:h-48 md:h-56 relative">
                <ImageCarousel images={images.map((item) => item.imageUrl)} />
            </div>
            <Typography className="p-4 pb-6" size="lg" weight="medium" color="text-gray-800">
                {title}
            </Typography>
        </Card>
    );
};
