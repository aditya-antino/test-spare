// Razorpay utility functions
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    purpose: string;
    order_id?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

export const openRazorpayPayment = (options: RazorpayPaymentOptions) => {
  if (typeof window !== 'undefined' && window.Razorpay) {
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } else {
    console.error('Razorpay SDK not loaded');
  }
};

export const formatRazorpayAmount = (amount: number): number => {
  // Razorpay expects amount in paise (smallest currency unit)
  return Math.round(amount * 100);
};

export const generateReceipt = (bookingId: number): string => {
  return `booking_${bookingId}_${Date.now()}`;
};
