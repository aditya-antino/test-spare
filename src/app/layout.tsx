import type { Metadata, Viewport } from 'next';
import { Figtree, Poppins } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import RootProvider from './root-provider';
import { GoogleAnalytics } from '@/components';
import { Suspense } from 'react';
import WatiWidget from '@/components/WatiWidget';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const MAP_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const metadata: Metadata = {
    title: 'Spare Space | Book and Manage Your Perfect Space',
    description:
        'Spare Space helps you find and book the perfect space for work, meetings, and events. Book and manage spaces easily on our platform.',
    manifest: '/manifest.json',
    openGraph: {
        title: 'Spare Space | Book and Manage Your Perfect Space',
        description:
            'Spare Space helps you find and book the perfect space for work, meetings, and events. Book and manage spaces easily on our platform.',
        url: SITE_URL,
        siteName: 'Spare Space',
        images: [
            {
                url: '/og-image.webp',
                width: 1200,
                height: 630,
                alt: 'Spare Space - Book your perfect space',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Spare Space | Book and Manage Your Perfect Space',
        description:
            'Spare Space helps you find and book the perfect space for work, meetings, and events. Book and manage spaces easily on our platform.',
        images: ['/og-image.webp'],
    },
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon.ico' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
        apple: [
            {
                url: '/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Spare Space',
    },
};

export const viewport: Viewport = {
    themeColor: '#F6CD28',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    minimumScale: 1,
    userScalable: true,
};

const figtree = Figtree({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-figtree',
});

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-poppins',
});

const PIXEL_IDS = [
    '931500319426827',
    '26205317115767871',
    '1488641416224446',
    '1227685289536472',
    '938010465360814',
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            className={`${figtree.variable} ${poppins.variable}`}
            suppressHydrationWarning
        >
            <body className="h-screen">
                <RootProvider>{children}</RootProvider>

                {/* Base Meta Pixel Setup */}
                <Script id="meta-pixel-base" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        
                        ${PIXEL_IDS.map((id) => `fbq('init', '${id}');`).join('\n                        ')}
                    `}
                </Script>
                {PIXEL_IDS.map((id) => (
                    <noscript key={id}>
                        <img
                            height="1"
                            width="1"
                            style={{ display: 'none' }}
                            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
                            alt=""
                        />
                    </noscript>
                ))}

                {GA_MEASUREMENT_ID && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${GA_MEASUREMENT_ID}');
                            `}
                        </Script>
                    </>
                )}

                {MAP_API_KEY && (
                    <Script
                        src={`https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&libraries=places`}
                        strategy="beforeInteractive"
                    />
                )}

                <Script
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    strategy="afterInteractive"
                />

                <WatiWidget />
            </body>
        </html>
    );
}
