import React from 'react';
import { Header } from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqData = {
    title: 'Frequently Asked Questions',
    description:
        'Got questions? We’ve got answers. Find everything you need to know about how our platform works, bookings, payments, and more.',
    items: [
        {
            question: 'What is SpaceShare and how does it work?',
            answer: 'SpaceShare helps you discover, book, and manage flexible workspaces on demand. You can browse spaces, check availability, and book instantly — all from one dashboard.',
        },
        {
            question: 'Can I cancel or reschedule my booking?',
            answer: 'Yes! You can cancel or reschedule bookings easily from your dashboard before the start time. Each space has its own cancellation policy, which will be shown at checkout.',
        },
        {
            question: 'Are payments secure?',
            answer: 'Absolutely. We use industry-standard encryption and trusted payment gateways to ensure all transactions are fully secure and private.',
        },
        {
            question: 'Do you offer team or corporate accounts?',
            answer: 'Yes, we offer team accounts that let you manage multiple users, centralize billing, and track workspace usage across your organization.',
        },
        {
            question: 'How can I list my space on SpaceShare?',
            answer: 'Simply head to our “List Your Space” page, fill in your details, upload photos, and our team will help you get started quickly!',
        },
    ],
};

export default function FAQPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FEFBEF] via-white to-[#FDF8E4] text-[#2D2D2D]">
            <Header />

            <section className="relative bg-gradient-to-br from-primary-p1 via-primary-p2 to-primary-p3 py-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <HelpCircle className="mx-auto w-12 h-12 text-[#f6cd28] mb-4" />
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#f6cd28] mb-4">
                        {faqData.title}
                    </h1>
                    <p className="text-lg text-black/80 max-w-2xl mx-auto leading-relaxed">
                        {faqData.description}
                    </p>
                </div>
            </section>

            <section className="relative flex-1 pb-16">
                <div className="max-w-3xl mx-auto px-6">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full bg-white/60 backdrop-blur-md shadow-lg rounded-2xl divide-y divide-gray-200 border border-gray-100"
                    >
                        {faqData.items.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg font-semibold text-[#2D2D2D] hover:text-[#D89D03] transition-colors">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-[#555] pb-4 text-base leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            <Footer />
        </div>
    );
}
