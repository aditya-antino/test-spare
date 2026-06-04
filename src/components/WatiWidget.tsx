'use client';

import { useEffect } from 'react';

const WatiWidget = () => {
    useEffect(() => {
        const scriptId = 'wati-chat-widget-script';
        if (typeof window === 'undefined' || document.getElementById(scriptId)) return;

        // WATI script URL from environment variables
        const url = process.env.NEXT_PUBLIC_WATI_URL;
        if (!url) return;

        const s = document.createElement('script');
        s.id = scriptId;
        s.type = 'text/javascript';
        s.async = true;
        s.src = url;

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

        s.onload = () => {
            // @ts-ignore
            if (window.CreateWhatsappChatWidget) {
                // @ts-ignore
                window.CreateWhatsappChatWidget(options);
            }
        };

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

        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(s, firstScript);
        } else {
            document.head.appendChild(s);
        }

        document.addEventListener('click', handleGlobalClick);

        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };
    }, []);

    return null;
};

export default WatiWidget;
