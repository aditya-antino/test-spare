'use client';

import { useEffect } from 'react';
import { trackEvent, PIXEL_IDS } from '@/utils/metaPixel';

export default function LandingPageTracker() {
    useEffect(() => {
        trackEvent(PIXEL_IDS.LANDING_PAGE, 'PageView');
    }, []);

    return null;
}
