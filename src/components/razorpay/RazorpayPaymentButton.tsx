import React, { useState } from 'react';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';
import { toast } from 'react-toastify';

export default function RazorpayPaymentButton() {
    const { error, isLoading, Razorpay } = useRazorpay();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!isLoading) {
            toast.error('Razorpay SDK not loaded yet');
            return;
        }

        setLoading(true);

        try {
            // Create order from backend using your actual API
            const res = await fetch('https://space-be.antino.ca/api/v1/payment/rzp/order', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    Authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZXMiOlsyXSwiaWF0IjoxNzU4NjEwMzkzLCJleHAiOjE3NjEyMDIzOTN9.62ckq5cUNgD4oIV9EscTc373NMQZ9on9GGzdhZwHJUw',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId: 123,
                    amount: 10000, // ₹100.00 (in paise)
                    currency: 'INR',
                    receipt: `booking_123_${Date.now()}`,
                    notes: {
                        purpose: 'space booking',
                    },
                }),
            });

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to create order');
            }

            const order = result.data;

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'YOUR_KEY_ID', // Use environment variable
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Spare Space',
                description: 'Tansaction',
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // Verify payment on backend
                        const verifyRes = await fetch('http://localhost:5000/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyResult = await verifyRes.json();

                        if (verifyResult.success) {
                            alert(
                                `Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`,
                            );
                        } else {
                            alert('Payment verification failed!');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('Payment verification failed!');
                    }
                },
                prefill: {
                    name: 'Vishal Pandey',
                    email: 'vishal@example.com',
                    contact: '9999999999',
                },
                theme: {
                    color: '#3399cc',
                },
                modal: {
                    ondismiss: () => {
                        console.log('Payment modal dismissed');
                        setLoading(false);
                    },
                },
            };

            const rzp1 = new Razorpay(options);

            rzp1.on('payment.failed', (response) => {
                alert(`Payment Failed!\nError: ${response.error.description}`);
                setLoading(false);
            });

            rzp1.open();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={handlePayment}
                disabled={!isLoading || loading}
                className={`px-6 py-3 rounded-lg text-white font-medium ${
                    !isLoading || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                } transition-colors duration-200`}
            >
                {loading ? 'Processing...' : 'Pay ₹500'}
            </button>

            {!isLoading && <p className="mt-2 text-sm text-gray-500">Loading Razorpay...</p>}
        </div>
    );
}
