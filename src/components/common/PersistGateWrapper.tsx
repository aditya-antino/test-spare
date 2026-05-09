'use client';

import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '@/store/store';

export default function PersistGateWrapper({ children }: { children: React.ReactNode }) {
    return (
        <PersistGate loading={null} persistor={persistor}>
            {children}
        </PersistGate>
    );
}
