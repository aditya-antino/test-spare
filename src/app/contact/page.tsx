import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Typography from '@/components/ui/typoGraphy';
import { CONTACT, ADDRESS } from '@/constants/contact';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <Typography variant="h1" weight="bold" className="mb-8">
                    Contact Us
                </Typography>
                
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <Typography variant="body" color="text-gray-600" className="text-lg leading-relaxed">
                            Have questions or need assistance? We&apos;re here to help! Reach out to us through 
                            any of the following channels and we&apos;ll get back to you as soon as possible.
                        </Typography>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-blue-600" />
                                <div>
                                    <Typography variant="caption" weight="semibold" color="text-gray-900">
                                        Email
                                    </Typography>
                                    <Typography variant="body" color="text-gray-600">
                                        {CONTACT.EMAIL}
                                    </Typography>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <Phone className="w-6 h-6 text-blue-600" />
                                <div>
                                    <Typography variant="caption" weight="semibold" color="text-gray-900">
                                        Phone
                                    </Typography>
                                    <Typography variant="body" color="text-gray-600">
                                        {CONTACT.PHONE}
                                    </Typography>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                <div>
                                    <Typography variant="caption" weight="semibold" color="text-gray-900">
                                        Address
                                    </Typography>
                                    <Typography variant="body" color="text-gray-600">
                                        {ADDRESS.ADDRESS}<br />
                                        {ADDRESS.CITY}, {ADDRESS.STATE} {ADDRESS.ZIP}<br />
                                        {ADDRESS.COUNTRY}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-8 rounded-lg">
                        <Typography variant="h3" weight="semibold" className="mb-6">
                            Send us a message
                        </Typography>
                        
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your@email.com"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="How can we help you?"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 