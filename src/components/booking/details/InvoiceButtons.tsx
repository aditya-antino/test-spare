
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface InvoiceButtonProps {
    onClick: () => void;
    text: string;
}

const InvoiceButton = ({ onClick, text }: InvoiceButtonProps) => (
    <Button
        className="w-full flex items-center justify-center gap-2 text-xs h-10"
        onClick={onClick}
    >
        <Download className="w-3.5 h-3.5" />
        {text}
    </Button>
);

interface InvoiceButtonsProps {
    handleDownloadGuestInvoice: (type: string) => Promise<void>;
    showGstInvoiceOptions?: boolean;
}

export const InvoiceButtons = ({
    handleDownloadGuestInvoice,
    showGstInvoiceOptions,
}: InvoiceButtonsProps) => (
    <div className="grid grid-cols-2 gap-3">
        <InvoiceButton
            onClick={() => handleDownloadGuestInvoice('guest_booking')}
            text="Booking Invoice"
        />
        <InvoiceButton
            onClick={() => handleDownloadGuestInvoice('guest_platform')}
            text="Platform Invoice"
        />
        {showGstInvoiceOptions && (
            <>
                <InvoiceButton
                    onClick={() => handleDownloadGuestInvoice('guest_booking_gst')}
                    text="GST Booking"
                />
                <InvoiceButton
                    onClick={() => handleDownloadGuestInvoice('guest_platform_gst')}
                    text="GST Platform"
                />
            </>
        )}
    </div>
);
