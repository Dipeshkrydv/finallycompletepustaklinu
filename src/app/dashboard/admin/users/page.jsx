'use client';

import { useState, useEffect, Suspense } from 'react';
import { Users, Search, Trash2, Mail, Phone, MapPin, Shield, ShieldAlert, Check, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const AdminUsersContent = () => {
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null, loading: false });

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');
    const [roleFilter, setRoleFilter] = useState(roleParam || 'buyer');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

    useEffect(() => {
        if (roleParam) {
            setRoleFilter(roleParam);
        }
    }, [roleParam]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [roleFilter, search]);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, roleFilter]);

    useEffect(() => {
        if (search === '') {
            setFilteredUsers(users);
        } else {
            const lower = search.toLowerCase();
            setFilteredUsers(users.filter(u =>
                u.name.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower)
            ));
        }
    }, [search, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/users?page=${pagination.page}&limit=${pagination.limit}&role=${roleFilter}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const promptDeleteUser = (user) => {
        setDeleteModal({ isOpen: true, user, loading: false });
    };

    const confirmDeleteUser = async () => {
        if (!deleteModal.user) return;

        const userId = deleteModal.user.id;
        setDeleteModal(prev => ({ ...prev, loading: true }));

        const previousUsers = [...users];
        // Optimistic update
        setUsers(users.filter(u => u.id !== userId));

        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('User deleted successfully');
                setDeleteModal({ isOpen: false, user: null, loading: false });
                fetchUsers(); // Refresh to be sure
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed');
            }
        } catch (e) {
            console.error(e);
            setUsers(previousUsers); // Revert
            toast.error(e.message || 'Error deleting user');
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{roleFilter === 'buyer' ? 'Buyers' : 'Sellers'}</h2>
                    <p className="text-gray-500 text-sm">Manage {roleFilter} accounts.</p>
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
                        <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition group relative overflow-hidden">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${user.role === 'buyer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate pr-2" title={user.name}>{user.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <p className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-full">
                                                <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{user.email}</span>
                                            </p>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 uppercase shrink-0">{user.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => promptDeleteUser(user)}
                                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                                    title="Delete User"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400 shrink-0" /> {user.phone || 'No phone'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" /> {user.city || 'No location'}
                                </div>
                            </div>

                            <div className="mt-auto pt-2 flex gap-2">
                                <Link
                                    href={user.role === 'buyer' ? `/dashboard/admin/buyers/${user.id}` : `/dashboard/admin/sellers/${user.id}`}
                                    className="flex-1 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition"
                                >
                                    Details
                                </Link>
                                {user.role === 'seller' && (
                                    <Link
                                        href={`/dashboard/admin/messages/${user.role}s?userId=${user.id}`}
                                        className="flex-1 h-10 flex items-center justify-center bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition gap-2"
                                    >
                                        <Mail className="w-4 h-4" /> Message
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                    }
                </div>
            )
            }

            {/* Pagination Controls */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Delete User?</h3>
                                <p className="text-gray-500 mt-2">
                                    Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteModal.user?.name}"</span>?
                                    <br />
                                    This action is <span className="text-red-600 font-medium">irreversible</span> and will remove all their data.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, user: null, loading: false })}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                                    disabled={deleteModal.loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteUser}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                                    disabled={deleteModal.loading}
                                >
                                    {deleteModal.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default function AdminUsers() {
    return (
        <Suspense fallback={<div className="p-8">Loading users...</div>}>
            <AdminUsersContent />
        </Suspense>
    );
}
