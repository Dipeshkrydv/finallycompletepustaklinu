'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Filter, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;
        if (filter !== 'all') {
            if (filter === 'pending') result = result.filter(o => o.status === 'pending');
            else result = result.filter(o => o.status !== 'pending'); // broad 'completed'
        }
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(o =>
                o.id.toString().includes(lower) ||
                o.book?.title?.toLowerCase().includes(lower) ||
                o.buyer?.name?.toLowerCase().includes(lower)
            );
        }
        setFilteredOrders(result);
    }, [filter, search, orders]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
                setFilteredOrders(data);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
                    <p className="text-gray-500 text-sm">Track and manage all book orders.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none w-full sm:w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed / Finalized</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">Loading orders...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Order ID</th>
                                    <th className="px-6 py-4 font-bold w-1/3">Book & Buyer</th>
                                    <th className="px-6 py-4 font-bold">Date</th>
                                    <th className="px-6 py-4 font-bold">Amount</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">No orders found matching your filters.</td></tr>
                                ) : filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 line-clamp-1">{order.book?.title}</span>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">Buyer: {order.buyer?.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-amber-600">Rs. {order.totalAmount || order.book?.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                }`}>
                                                {order.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/dashboard/admin/messages?userId=${order.buyerId}`}
                                                className="text-gray-400 hover:text-amber-600 inline-flex items-center gap-1 text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <MessageSquare className="w-3 h-3" /> Chat
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination placeholder */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
                        <span>Showing {filteredOrders.length} orders</span>
                        {/* Could add pagination here */}
                    </div>
                </div>
            )}
        </div>
    );
}
