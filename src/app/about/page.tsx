import React from 'react';
import Typography from '@/components/ui/typoGraphy';
import {Header} from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-16">
                <Typography variant="h1" weight="bold" className="mb-8">
                    About Spare Space
                </Typography>

                <div className="space-y-6">
                    <Typography
                        variant="body"
                        color="text-gray-600"
                        className="text-lg leading-relaxed"
                    >
                        Welcome to Spare Space, your trusted platform for discovering and booking
                        unique spaces. We connect space owners with people looking for the perfect
                        venue for their events, meetings, workshops, and special occasions.
                    </Typography>

                    <Typography
                        variant="body"
                        color="text-gray-600"
                        className="text-lg leading-relaxed"
                    >
                        Founded with the vision of making space sharing simple and accessible, we
                        believe that every space has the potential to create memorable experiences.
                        Whether you&apos;re hosting a birthday party, corporate meeting, or creative
                        workshop, we help you find the ideal space that fits your needs and budget.
                    </Typography>

                    <Typography
                        variant="body"
                        color="text-gray-600"
                        className="text-lg leading-relaxed"
                    >
                        Our platform ensures safe, secure, and seamless transactions while building
                        a community of trusted hosts and guests. We&apos;re committed to providing
                        exceptional service and supporting both space owners and renters throughout
                        their journey with us.
                    </Typography>
                </div>
            </div>
            <Footer />
        </div>
    );
}
