import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import dummyImage from '@/assets/Login.png';
import Typography from '@/components/ui/typoGraphy';
import ArrowScrollWrapper from '@/components/ui/arrowScrollWrapper';

const categories = [
    {
        title: 'Residential Spaces',
        image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Event Spaces',
        image: 'https://images.unsplash.com/photo-1577647985315-5b7ab43f631d?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Work & Meeting Spaces',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Creative Spaces',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Fitness and Wellness Space',
        image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Work & Meeting Spaces',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Creative Spaces',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Fitness and Wellness Space',
        image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Work & Meeting Spaces',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Creative Spaces',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    },
    {
        title: 'Fitness and Wellness Space',
        image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=800&auto=format&fit=crop',
    },
];

const HappeningCities = () => {
    return (
        <section className="relative w-full bg-orange-50 py-8 md:py-16 px-4 md:px-16">
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold">Featured Categories</h2>
                <p className="text-gray-500 mt-2">Explore spaces tailored for different needs.</p>
            </div>

            <ArrowScrollWrapper>
                {categories.map((category, index) => (
                    <div
                        className="min-w-[287px] w-full text-center flex justify-center flex-col"
                        key={index}
                    >
                        <Card className="border-0 h-full p-0 bg-orange-50 cursor-pointer gap-2 shadow-none">
                            <div className="relative w-full min-h-[391px] overflow-hidden rounded-2xl">
                                <Image
                                    src={dummyImage}
                                    alt={category.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <CardContent className="pt-2 text-center bg-orange-50 justify-center flex">
                                <Typography align="center" size="lg" weight="font-medium">
                                    {category.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </ArrowScrollWrapper>
        </section>
    );
};

export default HappeningCities;
