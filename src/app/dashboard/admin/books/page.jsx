'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '@/components/Modal';

export default function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingBook, setEditingBook] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, bookId: null, title: '' });

    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [search]);

    useEffect(() => {
        fetchBooks();
    }, [pagination.page]);

    useEffect(() => {
        let result = books;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(b => b.title.toLowerCase().includes(lower) || b.seller?.name?.toLowerCase().includes(lower));
        }
        setFilteredBooks(result);
    }, [search, books]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/books?page=${pagination.page}&limit=${pagination.limit}`);
            if (res.ok) {
                const data = await res.json();
                setBooks(data.books || []);
                setFilteredBooks(data.books || []); // Search is local on page for now
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleDeleteBook = (bookId, title) => {
        setDeleteModal({ isOpen: true, bookId, title });
    };

    const confirmDelete = async () => {
        const { bookId } = deleteModal;
        if (!bookId) return;

        // Optimistic Delete
        const prevBooks = [...books];
        const prevFiltered = [...filteredBooks];
        const newBooks = books.filter(b => b.id !== bookId);
        setBooks(newBooks);
        setFilteredBooks(newBooks);
        setDeleteModal({ isOpen: false, bookId: null, title: '' }); // Close immediately

        try {
            const res = await fetch(`/api/admin/books?id=${bookId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Book deleted');
                fetchBooks();
            } else {
                throw new Error('Failed');
            }
        } catch (e) {
            setBooks(prevBooks);
            setFilteredBooks(prevFiltered);
            toast.error('Delete failed');
        }
    };


    return (
        <div className="space-y-6">
            {/* ... (Header, Search, Table) ... */}

            {loading ? (
                <div className="py-20 text-center text-gray-400">Loading inventory...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-bold">Book Details</th>
                                <th className="px-6 py-4 font-bold">Seller</th>
                                <th className="px-6 py-4 font-bold">Price</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBooks.map(book => (
                                <tr key={book.id} className="hover:bg-gray-50 group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 line-clamp-1">{book.title}</div>
                                        <div className="text-xs text-gray-400 mt-1">{book.category} • {book.condition}</div>
                                    </td>
                                    <td className="px-6 py-4">{book.seller?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 font-medium">Rs. {book.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${book.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {book.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setEditingBook({ ...book })} className="text-blue-500 hover:bg-blue-50 p-2 rounded mr-1"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteBook(book.id, book.title)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination ... */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} books
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

            {/* Edit Modal */}
            {editingBook && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Edit Book</h3>
                            <button onClick={() => setEditingBook(null)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSaveBook} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input type="text" value={editingBook.title} onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })} className="w-full border p-2 rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price</label>
                                    <input type="number" value={editingBook.price} onChange={(e) => setEditingBook({ ...editingBook, price: e.target.value })} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select value={editingBook.status} onChange={(e) => setEditingBook({ ...editingBook, status: e.target.value })} className="w-full border p-2 rounded">
                                        <option value="available">Available</option>
                                        <option value="sold">Sold</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setEditingBook(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                title="Delete Book"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">Are you sure you want to delete <span className="font-bold">"{deleteModal.title}"</span>? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete Book
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );

}
