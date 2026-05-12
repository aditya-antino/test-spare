'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Search, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-tint5 to-primary-tint3 flex flex-col items-center justify-center p-6 font-poppins">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>
            <div className="absolute top-1/4 right-20 w-20 h-20 bg-yellow-400 rounded-full opacity-5 blur-lg"></div>

            {/* Main content */}
            <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
                {/* Animated 404 */}
                <div className="relative">
                    <div className="text-[180px] md:text-[240px] font-bold tracking-tighter leading-none">
                        <span className="text-yellow-400 drop-shadow-lg">4</span>
                        <span className="text-primary-p2 drop-shadow-lg">0</span>
                        <span className="text-yellow-400 drop-shadow-lg">4</span>
                    </div>

                    {/* Floating icons */}
                    {/* Floating icons */}
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-float">
                        <Search className="w-8 h-8 text-primary-p3" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-float delay-200">
                        <Calendar className="w-8 h-8 text-primary-p3" />
                    </div>
                    <div className="absolute -bottom-4 left-1/4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-float delay-300">
                        <MapPin className="w-8 h-8 text-primary-p3" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-tertiary-t1">
                        Oops! Page Not Found
                    </h1>
                    <p className="text-xl text-tertiary-t2 max-w-md mx-auto">
                        The page you&apos;re looking for seems to have taken a vacation. Don&apos;t
                        worry, we&apos;ll help you find your way back!
                    </p>
                </div>

                {/* Redirect timer */}
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative w-64 h-2 bg-secondary-s2 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-primary-p1 via-primary-p2 to-primary-p3 animate-progress"></div>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-8">
                    <Button onClick={() => router.push('/')} variant="outline">
                        <Home className="w-6 h-6 text-primary-p2 group-hover:text-primary-p3" />
                        <span className="text-lg font-semibold text-tertiary-t1 group-hover:text-tertiary-t2">
                            Go Home
                        </span>
                    </Button>

                    <Button onClick={() => router.back()} variant="default">
                        <span className="text-lg font-semibold">Go Back</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
