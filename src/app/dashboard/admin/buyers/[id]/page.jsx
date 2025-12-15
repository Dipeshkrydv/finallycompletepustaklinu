'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Phone, MapPin, Mail, Calendar, MessageSquare, ShoppingBag, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BuyerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [params.id]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/admin/users?id=${params.id}`);
            if (res.ok) {
                setUser(await res.json());
            } else {
                router.push('/dashboard/admin');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading buyer profile...</div>;
    if (!user) return <div className="p-10 text-center">User not found</div>;

    const purchaseHistory = user.orders || [];

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50">
            <button onClick={() => router.back()} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2">
                &larr; Back to Dashboard
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                    <User className="w-10 h-10" />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
                                    Buyer
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/admin/messages/buyers?userId=${user.id}`}
                            className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition flex items-center gap-2 shadow-sm"
                        >
                            <MessageSquare className="w-4 h-4" /> Message Buyer
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 gap-y-4 gap-x-8 text-gray-600 mt-4">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" /> {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" /> {user.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {user.address ? `${user.address}, ${user.city}, ${user.state || ''} ${user.pincode || ''}` : 'No address provided'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Order History ({purchaseHistory.length})</h2>
                </div>
                <div className="p-6">
                    {purchaseHistory.length === 0 ? <p className="text-gray-400 text-center py-8">No past orders.</p> : (
                        <div className="space-y-4">
                            {purchaseHistory.map(order => (
                                <div key={order.id} className="border border-gray-100 rounded-lg p-4 flex gap-4 items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Order #{order.id}</p>
                                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">Rs. {order.totalAmount}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
