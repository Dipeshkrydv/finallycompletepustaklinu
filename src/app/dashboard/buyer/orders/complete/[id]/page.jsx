'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function OrderCompletionPage({ params }) {
    const { id } = params; // Next.js 15+ needs await, but 14 is sync mostly. Checking env...
    // In strict Next.js 15, params is a Promise. Let's assume params is standard object for now or handle appropriately. 
    // To be safe with async params in client components:
    const [orderId, setOrderId] = useState(null);

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Handle params extraction safely if it's a promise (future proofing)
        const unwrapParams = async () => {
            const resolvedParams = await params;
            setOrderId(resolvedParams.id);
        };
        unwrapParams();
    }, [params]);

    const handleConfirm = async () => {
        if (!orderId) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/orders/${orderId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmation: true }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(true);
            toast.success('Thank you! Order completed.');

            // Redirect after delay
            setTimeout(() => {
                router.push('/dashboard/buyer/orders');
            }, 3000);

        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    if (!orderId) return <div className="p-8"><Loader2 className="animate-spin w-6 h-6" /></div>;

    if (success) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Completed!</h1>
                    <p className="text-gray-600">Thank you for confirming receipt. The book has been removed from the listings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Confirm Order Receipt</h1>
                    <p className="text-gray-500 mt-2">Did you receive your book for Order #{orderId}?</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        Yes, I have received it
                    </button>

                    <button
                        onClick={() => router.push('/dashboard/buyer/locations')} // Or contact support
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                        No, not yet
                    </button>
                </div>

                <p className="text-xs text-center text-gray-400 mt-6">
                    Confirming will mark the order as complete and remove the listing.
                </p>
            </div>
        </div>
    );
}
