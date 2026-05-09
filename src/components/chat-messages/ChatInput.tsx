'use client';
import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { checkRestrictedContent } from '@/utils/validators';
import { BOOKING_PAYMENT_STATUS_MAP } from '@/utils/paymentStatusMap';
import { toast } from 'react-toastify';
import { containsPII } from '@/utils/piiValidation';

type Props = {
  message: string;
  setMessage: (val: string) => void;
  sendMessage: () => void;
  bookingDetails?: {
    paymentStatus?: any;
    hostName?: string;
    hostAvatar?: string;
    spaceName?: string;
    address?: string;
    dates?: string;
    guests?: string;
    price?: string | number;
    status?: string;
  };
};


type BookingDetails = {
  paymentStatus: string;
  hostName: string;
  hostAvatar: string;
  spaceName: string;
  address: string;
  dates: string;
  guests: string;
  price: string;
  status: string;
  endDate: string;
};


enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

enum PaymentStatus {
  NOT = 'NOT',
  PENDING = 'PENDING',
  CAPTURED = 'CAPTURED',
}


export default function ChatInput({ message, setMessage, sendMessage, bookingDetails }: Props) {

  const bookingStatus = bookingDetails?.status?.toUpperCase() as BookingStatus;
  const paymentStatus = bookingDetails?.paymentStatus?.toUpperCase() as PaymentStatus;

  const statusKey =
    bookingStatus === 'PENDING' && paymentStatus === 'NOT'
      ? 'PENDING_NOT'
      : bookingStatus === 'CONFIRMED' && paymentStatus === 'PENDING'
        ? 'CONFIRMED_PENDING'
        : bookingStatus === 'CONFIRMED' && paymentStatus === 'CAPTURED'
          ? 'CONFIRMED_CAPTURED'
          : bookingStatus || 'DEFAULT';

  const { label, textColor, bgColor, apiValue } =
    BOOKING_PAYMENT_STATUS_MAP[statusKey] || BOOKING_PAYMENT_STATUS_MAP.DEFAULT;




  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    try {

      if (!message.trim()) {
        setError('Message cannot be empty.');
        return;
      }

      // Check for restricted content (including digits)
      const restriction = checkRestrictedContent(message);
      if (restriction) {
        setError(restriction);
        toast.error(restriction);
        return;
      }

      setError(null);
      sendMessage();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error sending message:', err);
    }
  };

  const handleInputChange = (value: string) => {
    if (error) {
      setError(null);
    }

    const restriction = checkRestrictedContent(value);

    if (restriction) {
      setError(restriction);
      toast.warning(restriction, { toastId: 'chat-restriction' });
    }

    setMessage(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (/\d/.test(e.key)) {
      e.preventDefault();
      const errorMsg = 'Numbers are not allowed in messages.';
      setError(errorMsg);
      toast.warning(errorMsg);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const restriction = checkRestrictedContent(pastedText);
    if (restriction) {
      e.preventDefault();
      setError(restriction);
      toast.warning(restriction);
    }
  };


  const shouldShowConform =
    bookingStatus === 'CONFIRMED' &&
    paymentStatus === 'CAPTURED'

  return (
    <div className="p-4 bg-white">
      {/* {shouldShowConform ? (
        <p className="text-center text-gray-500 text-sm font-medium">
          You cannot send messages because booking has been completed.
        </p>
      ) : ( */}
      <div className="flex items-center space-x-2 w-full">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            className="pr-10"
            placeholder="Type a message (numbers and links not allowed)..."
          />
          {error && (
            <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{error}</p>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className="bg-[#F6CD28] w-13 h-10 hover:bg-yellow-500 text-black"
        >
          <SendHorizontal />
        </Button>
      </div>
      {/* )} */}
    </div>
  );
}
