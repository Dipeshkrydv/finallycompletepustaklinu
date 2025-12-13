'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Phone, MapPin, Mail, Calendar, MessageSquare, Book, Map } from 'lucide-react';
import Link from 'next/link';

export default function SellerDetailPage() {
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

    if (loading) return <div className="p-10 text-center">Loading seller profile...</div>;
    if (!user) return <div className="p-10 text-center">User not found</div>;

    const sellingHistory = user.books || [];

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50">
            <button onClick={() => router.back()} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2">
                &larr; Back to Dashboard
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-10 h-10" />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                                    Seller
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/admin/messages?userId=${user.id}`}
                            className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition flex items-center gap-2 shadow-sm"
                        >
                            <MessageSquare className="w-4 h-4" /> Message Seller
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

                        {/* Location Link */}
                        {(user.latitude && user.longitude) && (
                            <div className="md:col-span-2">
                                <a
                                    href={`https://www.google.com/maps?q=${user.latitude},${user.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                                >
                                    <Map className="w-4 h-4" /> View Exact Location on Map
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Seller Listings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Active Listings ({sellingHistory.length})</h2>
                </div>
                <div className="p-6">
                    {sellingHistory.length === 0 ? <p className="text-gray-400 text-center py-8">No active listings.</p> : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {sellingHistory.map(book => (
                                <div key={book.id} className="border border-gray-100 rounded-lg p-4 flex gap-4 hover:bg-gray-50">
                                    <div className="w-16 h-20 bg-gray-200 rounded-md shrink-0 flex items-center justify-center">
                                        <Book className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{book.title}</h3>
                                        <p className="text-sm text-amber-600 font-semibold mb-2">Rs. {book.price}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full border ${book.status === 'available' ? 'border-green-200 text-green-700 bg-green-50' : 'border-gray-200 text-gray-500'}`}>
                                            {book.status}
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
