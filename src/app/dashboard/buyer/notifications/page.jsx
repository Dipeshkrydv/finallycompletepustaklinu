'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch orders and convert them into "notifications"
        // In a real app, you might have a dedicated notifications table, 
        // but for now, we derive state from Order Status.
        async function fetchNotifications() {
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const orders = await res.json();

                    // Filter for relevant statuses
                    const alerts = orders
                        .filter(o => ['accepted', 'cancelled', 'rejected'].includes(o.status))
                        .map(order => ({
                            id: order.id,
                            type: order.status, // accepted, cancelled, rejected
                            date: order.updatedAt,
                            order: order
                        }))
                        .sort((a, b) => new Date(b.date) - new Date(a.date));

                    setNotifications(alerts);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    const NotificationCard = ({ note }) => {
        const { order } = note;
        const [showDonation, setShowDonation] = useState(false);
        const [isUpdating, setIsUpdating] = useState(false);
        const isAccepted = note.type === 'accepted';
        const isCancelled = note.type === 'cancelled' || note.type === 'rejected';

        const handleConfirm = async () => {
            setIsUpdating(true);
            try {
                const res = await fetch(`/api/orders/${order.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'delivered' })
                });

                if (res.ok) {
                    setShowDonation(true);
                } else {
                    alert("Failed to confirm order. Please try again.");
                }
            } catch (e) {
                console.error(e);
                alert("Error confirming order");
            } finally {
                setIsUpdating(false);
            }
        };

        return (
            <div className={`p-5 rounded-2xl border mb-4 shadow-sm transition-all hover:shadow-md ${isAccepted ? 'bg-white border-green-100' : 'bg-gray-50 border-gray-100'
                }`}>
                <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isAccepted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {isAccepted ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">
                            {isAccepted ? 'Order Accepted & Ready!' : `Order #${order.id} Update`}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                            {new Date(note.date).toLocaleDateString()} • {order.book?.title}
                        </p>

                        {isAccepted && (
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Great news! The Admin has confirmed your order.
                                    Here are the seller&apos;s details for you to contact.
                                </p>

                                {/* Seller Details Box */}
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h5 className="font-bold text-green-900 mb-3 text-sm border-b border-green-200 pb-2">
                                        Seller Contact Information
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                        <p><span className="font-semibold text-gray-600">Name:</span> {order.book?.seller?.name}</p>
                                        <p><span className="font-semibold text-gray-600">Phone:</span> <span className="font-mono text-gray-900 font-bold">{order.book?.seller?.phone || 'N/A'}</span></p>
                                        <p><span className="font-semibold text-gray-600">Email:</span> {order.book?.seller?.email}</p>
                                        <p><span className="font-semibold text-gray-600">City:</span> {order.book?.seller?.city || 'N/A'}</p>
                                        <p><span className="font-semibold text-gray-600">Address/Path:</span> {order.book?.seller?.address || 'N/A'}</p>
                                        <p><span className="font-semibold text-gray-600">Province:</span> {order.book?.seller?.province || order.book?.seller?.state || 'N/A'}</p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-green-200 text-xs text-green-700 italic">
                                        * Please contact the seller to arrange the handover.
                                    </div>
                                </div>

                                {/* Final Confirmation Trigger */}
                                {!showDonation ? (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                                        <h4 className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-2">
                                            ℹ️ Final Step: Did you receive the book?
                                        </h4>
                                        <p className="text-blue-800 text-xs mb-3">
                                            Please confirm only after you have met the seller and received the book successfully.
                                        </p>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={isUpdating}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-bold transition shadow-sm flex items-center justify-center gap-2"
                                        >
                                            {isUpdating ? 'Confirming...' : 'Yes, I received the order successfully'}
                                        </button>
                                    </div>
                                ) : (
                                    /* Donation Request - Revealed after Confirmation */
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 relative overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="absolute top-0 right-0 bg-amber-200 text-amber-900 text-[9px] px-2 py-0.5 rounded-bl-lg font-bold uppercase">
                                            Required
                                        </div>
                                        <div className="mb-3">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                                                ✓ Order Confirmed
                                            </span>
                                        </div>
                                        <p className="text-amber-900 font-medium text-sm mb-2 leading-relaxed">
                                            Thank you for your honesty! 🙏 <br />
                                            To keep this platform running, please complete your <strong>10% Donation (Rs. {Math.round(order.totalAmount * 0.10)})</strong>.
                                        </p>
                                        <div className="flex flex-col gap-2 text-xs font-mono text-amber-800 bg-white/60 p-3 rounded-lg border border-amber-100">
                                            <div className="flex justify-between">
                                                <span>eSewa / Khalti:</span>
                                                <span className="font-bold">9800000000</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ncell:</span>
                                                <span className="font-bold">9800000000</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-amber-700/70 mt-2 text-center">
                                            Your support helps students like you save money! ❤️
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isCancelled && (
                            <p className="text-gray-600">
                                This order was cancelled. {order.remarks && `Reason: ${order.remarks}`}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="w-7 h-7 text-amber-600" /> Notifications
                </h1>
                <p className="text-gray-500">Updates on your orders and requests.</p>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Bell className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">No notifications yet</h3>
                    <p className="text-gray-500 text-sm">When your orders are accepted, they will appear here.</p>
                </div>
            ) : (
                notifications.map(note => (
                    <NotificationCard key={note.id} note={note} />
                ))
            )}
        </div>
    );
}
