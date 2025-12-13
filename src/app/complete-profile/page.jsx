'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { User, Phone, CheckCircle, Loader2 } from 'lucide-react';

export default function CompleteProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: 'buyer',
        phone: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && !session?.user?.requiresProfileCompletion) {
            router.push(`/dashboard/${session.user.role}`);
        }
    }, [status, session, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Profile completed!');
                await update({ ...session, user: { ...session.user, ...formData, requiresProfileCompletion: false } });
                router.push(`/dashboard/${formData.role}`);
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || (status === 'authenticated' && !session?.user?.requiresProfileCompletion)) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-gray-500 text-sm">Just a few more details to get you started.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">I want to...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${formData.role === 'buyer'
                                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <User className="w-6 h-6" />
                                <span className="font-medium">Buy Books</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'seller' })}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${formData.role === 'seller'
                                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <User className="w-6 h-6" />
                                <span className="font-medium">Sell Books</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
                                placeholder="Enter your mobile number"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">We need this to connect you with other users.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-amber-700 text-white font-bold rounded-xl hover:bg-amber-800 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        Complete Setup
                    </button>
                </form>
            </div>
        </div>
    );
}
