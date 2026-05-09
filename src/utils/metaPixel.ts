export const PIXEL_IDS = {
    LANDING_PAGE: '931500319426827',
    SPACE_LISTING: '26205317115767871',
    BOOK_NOW: '1488641416224446',
    PAYMENT_COMPLETED: '1227685289536472',
    WHATSAPP_CLICK: '938010465360814',
};

export const trackEvent = (pixelId: string, eventName: string = 'PageView') => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('trackSingle', pixelId, eventName);
    } else if (typeof window !== 'undefined') {
        // If fbq isn't initialized yet, we can try to queue it, but since pixels usually load early, this shouldn't be common.
        // fbq queue usually handled by the snippet itself.
        console.warn(
            `Meta Pixel (fbq) not initialized when trying to track event: ${eventName} for ${pixelId}`,
        );
    }
};
