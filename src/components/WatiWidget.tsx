'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const WatiWidget = () => {
    const url = process.env.NEXT_PUBLIC_WATI_URL;

    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.closest('.wa-chat-btn-root') ||
                target.closest('[id*="wati"]') ||
                target.closest('[href*="whatsapp.com"]') ||
                target.closest('[href*="wa.me"]')
            ) {
            }
        };

        document.addEventListener('click', handleGlobalClick);

        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };
    }, []);

    if (!url) return null;

    const options = {
        enabled: true,
        chatButtonSetting: {
            backgroundColor: '#f7cd29',
            ctaText: 'Chat with us',
            borderRadius: '25',
            marginLeft: '0',
            marginRight: '20',
            marginBottom: '20',
            ctaIconWATI: false,
            position: 'right',
        },
        brandSetting: {
            brandName: 'Spare Space',
            brandSubTitle: 'undefined',
            brandImg:
                'https://sparespace-fe-objects.s3.ap-south-1.amazonaws.com/auth-uploads/API_KEY_AUTH/1768412208446-fuwfmrlxx9i.png',
            welcomeText: 'Got a question?\nWe’re here to help 👋',
            messageText: '',
            backgroundColor: '#ffffff',
            ctaText: 'Chat with us',
            borderRadius: '25',
            autoShow: false,
            phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        },
    };

    return (
        <Script
            id="wati-chat-widget-script"
            src={url}
            strategy="lazyOnload"
            onLoad={() => {
                // @ts-ignore
                if (window.CreateWhatsappChatWidget) {
                    // @ts-ignore
                    window.CreateWhatsappChatWidget(options);
                }
            }}
        />
    );
};

export default WatiWidget;
