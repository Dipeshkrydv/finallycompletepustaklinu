'use client';

import { CheckCircle, ShoppingBag, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

import DonationFooter from '@/components/DonationFooter';

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ConfirmationContent />
        </Suspense>
    )
}

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmationContent() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100 relative overflow-hidden mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <Clock className="w-10 h-10 text-blue-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
                    <h2 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                        <span className="text-xl">ℹ️</span> Next Step: Admin Confirmation
                    </h2>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        Please wait a few hours. The Admin needs to confirm the availability of the book with the seller.
                    </p>
                    <div className="mt-4 text-xs text-blue-700/80 bg-blue-100/50 p-3 rounded-lg">
                        <strong>What happens next?</strong><br />
                        Once the Admin confirms your order, you will find the <strong>Seller&apos;s Contact Details</strong> in your Order History (Notification Box).
                        <br /><br />
                        <strong>Donation Reminder:</strong> Please remember to pay the donation fee after you have received your book.
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/dashboard/buyer/orders"
                        className="block w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-5 h-5" /> Go to Order Notification Box
                    </Link>

                    <Link
                        href="/dashboard/buyer"
                        className="block w-full py-3.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                        Continue Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <DonationFooter role="buyer" />
            </div>
        </div>
    );
}
