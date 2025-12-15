'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Clock, CheckCircle, Truck, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function MyOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const initiateCancel = (id) => {
    setSelectedOrderId(id);
    setShowCancelModal(true);
  };

  const initiateSuccess = (id) => {
    setSelectedOrderId(id);
    setShowSuccessModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedOrderId) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (res.ok) {
        fetchOrders();
        toast.success('Order cancelled');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to cancel order');
      }
    } catch (error) {
      toast.error('Error cancelling order');
    } finally {
      setShowCancelModal(false);
      setSelectedOrderId(null);
    }
  };

  const confirmOrderSuccess = async () => {
    if (!selectedOrderId) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      if (res.ok) {
        fetchOrders();
        toast.success('Order confirmed & Book removed!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to confirm order');
      }
    } catch (error) {
      toast.error('Error confirming order');
    } finally {
      setShowSuccessModal(false);
      setSelectedOrderId(null);
    }
  };

  const [deleteId, setDeleteId] = useState(null);

  const deleteOrder = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/orders/${deleteId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Order deleted from history');
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete order');
      }
    } catch (error) {
      toast.error('Error deleting order');
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard/buyer" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
            <Link href="/dashboard/buyer" className="text-amber-600 font-medium mt-2 inline-block hover:underline">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{order.book?.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Order ID: #{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Seller: {order.book?.seller?.name} ({order.book?.seller?.city})</p>
                  <p className="text-lg font-bold text-amber-700 mt-2">Rs. {order.totalAmount}</p>

                  {order.remarks && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">Admin Remarks:</span> {order.remarks}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center items-end gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => initiateCancel(order.id)}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'accepted' && (
                    <div className="flex flex-col gap-4 w-full">
                      {/* Seller Details Block */}
                      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Admin Confirmed!
                        </h4>
                        <p className="text-sm text-green-700 mb-2">You can now contact the seller directly:</p>
                        <div className="bg-white p-3 rounded-lg border border-green-100 text-sm space-y-1">
                          <p><span className="font-semibold text-gray-600">Seller Name:</span> {order.book?.seller?.name}</p>
                          <p><span className="font-semibold text-gray-600">Location:</span> {order.book?.seller?.city}</p>
                          <p><span className="font-semibold text-gray-600">Phone:</span> <span className="font-mono text-gray-800">{order.book?.seller?.phone || '98XXXXXXXX'}</span></p>
                        </div>
                      </div>

                      {/* Emotional Donation Block */}
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-200 text-amber-900 text-[9px] px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
                          A Humble Request
                        </div>
                        <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2 text-sm">
                          <span className="text-lg">🙏</span> Message from the Heart
                        </h4>
                        <p className="text-xs text-amber-900/80 mb-3 leading-relaxed">
                          &quot;We trust you explicitly to help us keep this platform alive for students.
                          Please donate <strong>10% (Rs. {Math.round(order.totalAmount * 0.10)})</strong> to the Admin.&quot;
                        </p>
                        <div className="bg-white/60 rounded-lg p-2 space-y-1 text-xs">
                          <div className="flex justify-between"><span className="font-semibold">eSewa/Khalti:</span> <span className="font-mono">9800000000</span></div>
                          <div className="flex justify-between"><span className="font-semibold">Ncell:</span> <span className="font-mono">9800000000</span></div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/buyer/messages?initialMessage=Reason for cancellation of Order #${order.id}: `}
                          className="flex-1 px-4 py-2 border border-amber-200 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition text-center"
                        >
                          Request Cancellation
                        </Link>
                        <button
                          onClick={() => initiateSuccess(order.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" /> Received Book?
                        </button>
                      </div>
                    </div>
                  )}
                  {['cancelled', 'rejected', 'delivered'].includes(order.status) && (
                    <button
                      onClick={() => setDeleteId(order.id)}
                      className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                      title="Delete from history"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  )}
                  {/* Add more actions if needed */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancel Order?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition shadow-lg shadow-red-200"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Successful?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Did you successfully receive this book? Confirming will mark the order as complete and remove the book from the website.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  No
                </button>
                <button
                  onClick={confirmOrderSuccess}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition shadow-lg shadow-green-200"
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete from History?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This will remove the order permanently from your view.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteOrder}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
