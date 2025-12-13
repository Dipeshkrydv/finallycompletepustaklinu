'use client';

import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed!</h1>
                <p className="text-gray-500 mb-8">
                    Thank you for your purchase. Your order has been securely placed and sent to the seller for confirmation.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/dashboard/buyer/orders"
                        className="block w-full py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition shadow-lg flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-5 h-5" /> View My Orders
                    </Link>

                    <Link
                        href="/dashboard/buyer"
                        className="block w-full py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-gray-200 transition flex items-center justify-center gap-2"
                    >
                        Continue Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <p className="text-xs text-gray-400 mt-8">
                    You will receive a notification once the seller accepts your order.
                </p>
            </div>
        </div>
    );
}
