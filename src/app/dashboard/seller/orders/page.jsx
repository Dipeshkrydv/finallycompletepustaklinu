'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, Truck, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/seller/orders');
            if (res.ok) {
                setOrders(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        // Optimistic UI could be done here, but simple fetch is safer
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Order ${newStatus}`);
                fetchOrders(); // Refresh list
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to update order');
            }
        } catch (error) {
            toast.error('Error updating order');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200 flex items-center gap-1"><Clock className="w-3 h-3" /> PENDING CODE:PENDING-COLOR</span>;
            case 'accepted':
                return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ACCEPTED</span>;
            case 'delivered':
                return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1"><Truck className="w-3 h-3" /> DELIVERED</span>;
            case 'cancelled':
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> {status.toUpperCase()}</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold border border-gray-200">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                    <Package className="w-8 h-8 text-amber-600" /> Incoming Orders
                </h1>
                <p className="text-gray-500 mb-8">Manage orders from buyers.</p>

                {loading ? (
                    <div className="text-center py-20">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-lg">No orders received yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
                                {/* Book Info */}
                                <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                    {/* Provide fallback for image parsing if needed, assumed handled or passed basic string */}
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package className="w-8 h-8" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{order.book?.title}</h3>
                                            <p className="text-amber-600 font-bold">Rs. {order.totalAmount || order.book?.price}</p>
                                        </div>
                                        <div>{getStatusBadge(order.status)}</div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Buyer Details</p>
                                            <p className="font-semibold text-gray-800">{order.buyer?.name}</p>
                                            <p className="text-sm text-gray-600">{order.buyer?.email}</p>
                                            <p className="text-sm text-gray-600">{order.buyer?.phone || 'No phone'}</p>
                                            <p className="text-sm text-gray-600">{order.buyer?.city || 'No city'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Order Date</p>
                                            <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {order.status === 'pending' && (
                                        <div className="flex gap-3 mt-6 justify-end">
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'accepted')}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-lg shadow-green-200"
                                            >
                                                Confirm Order
                                            </button>
                                        </div>
                                    )}

                                    {order.status === 'accepted' && (
                                        <div className="mt-6 text-right">
                                            <p className="text-sm text-gray-500 italic">Waiting for buyer to confirm receipt.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
