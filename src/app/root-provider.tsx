'use client';

import { store } from '@/store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthGuard from '@/components/auth/AuthGuard';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';

export default function RootProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hasVisited = sessionStorage.getItem('hasVisited');
        if (hasVisited) {
            setLoading(false);
            return;
        }

        const handleLoad = () => {
            setLoading(false);
            sessionStorage.setItem('hasVisited', 'true');
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);

    return (
        <>
            {loading && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-white">
                    <Image
                        className="pulse-logo"
                        width={250}
                        height={250}
                        alt="logo"
                        src={logo}
                        unoptimized
                    />
                </div>
            )}
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                <Provider store={store}>
                    <ToastContainer />
                    <AuthGuard />
                    <QueryClientProvider client={queryClient}>
                        <AppErrorBoundary>{children}</AppErrorBoundary>
                    </QueryClientProvider>
                </Provider>
            </GoogleOAuthProvider>
        </>
    );
}
