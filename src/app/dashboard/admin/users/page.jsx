'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Trash2, Mail, Phone, MapPin, Shield, ShieldAlert, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('buyer'); // buyer, seller
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let result = users.filter(u => u.role === roleFilter);
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower)
            );
        }
        setFilteredUsers(result);
    }, [roleFilter, search, users]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`PERMANENTLY DELETE user "${userName}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('User deleted');
                fetchUsers();
            } else {
                toast.error('Failed to delete');
            }
        } catch (e) { toast.error('Error deleting'); }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-gray-500 text-sm">Manage buyers and sellers accounts.</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setRoleFilter('buyer')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${roleFilter === 'buyer' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Buyers
                    </button>
                    <div className="w-px bg-gray-200 my-2"></div>
                    <button
                        onClick={() => setRoleFilter('seller')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${roleFilter === 'seller' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Sellers
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={`Search ${roleFilter}s by name or email...`}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none shadow-sm text-gray-900 placeholder:text-gray-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredUsers.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-400">No users found.</div>
                    ) : filteredUsers.map(user => (
                        <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${roleFilter === 'buyer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{user.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {user.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                    className="text-gray-300 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                    title="Delete User"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" /> {user.phone || 'No phone'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" /> {user.city || 'No location'}
                                </div>
                            </div>

                            <div className="mt-auto pt-2">
                                <Link
                                    href={roleFilter === 'buyer' ? `/dashboard/admin/buyers/${user.id}` : `/dashboard/admin/sellers/${user.id}`}
                                    className="block w-full py-2 text-center border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition"
                                >
                                    View Details & Activity
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
