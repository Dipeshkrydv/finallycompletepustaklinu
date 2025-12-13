'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingBook, setEditingBook] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

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
            const res = await fetch('/api/admin/books');
            if (res.ok) {
                const data = await res.json();
                setBooks(data);
                setFilteredBooks(data);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleDeleteBook = async (bookId, title) => {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            const res = await fetch(`/api/admin/books?id=${bookId}`, { method: 'DELETE' });
            if (res.ok) { toast.success('Book deleted'); fetchBooks(); }
            else toast.error('Failed');
        } catch (e) { toast.error('Error'); }
    };

    const handleSaveBook = async (e) => {
        e.preventDefault();
        try {
            const { seller, User, createdAt, updatedAt, ...bookData } = editingBook;
            const res = await fetch('/api/admin/books', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData),
            });

            if (res.ok) {
                toast.success('Book updated');
                setEditingBook(null);
                fetchBooks();
            } else {
                toast.error('Failed to update');
            }
        } catch (error) {
            toast.error('Error updating');
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Inventory Control</h2>
                    <p className="text-gray-500 text-sm">Manage all book listings.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search books or sellers..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

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

            {/* Edit Modal (reused from original) */}
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
        </div>
    );
}
