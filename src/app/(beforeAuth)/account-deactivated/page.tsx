'use client';

import { ShieldX, Mail } from 'lucide-react';
import { CONTACT } from '@/constants/contact';

export default function AccountDeactivatedPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="max-w-md w-full space-y-12">
                {/* Icon & Title Section */}
                <div className="space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-50 rounded-full">
                        <ShieldX className="w-12 h-12 text-yellow-500" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                            Account Deactivated
                        </h1>
                        <p className="text-yellow-600 font-semibold tracking-widest uppercase text-xs">
                            Access Temporarily Suspended
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Your account has been temporarily deactivated. This typically happens due to security concerns, administrative actions, or a violation of our terms and conditions.
                        </p>
                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-left">Possible Reasons</h3>
                            <ul className="text-left space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                                    <span>Security concerns or suspicious activity detected on your account.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                                    <span>Terms and conditions violation or policy non-compliance.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                                    <span>Administrative review or account maintenance action.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Support Contact Section */}
                    <div className="flex flex-col items-center space-y-3 pt-8 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 text-xl">Need Assistance?</h3>
                        <p className="text-gray-500">
                            Our support team can help you resolve this and reactivate your account.
                        </p>
                        <a
                            href={`mailto:${CONTACT.SUPPORT_EMAIL}`}
                            className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-bold underline transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            {CONTACT.SUPPORT_EMAIL}
                        </a>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                    If you believe this deactivation is a mistake, please reach out to us immediately for review.
                </p>
            </div>
        </div>
    );
}
