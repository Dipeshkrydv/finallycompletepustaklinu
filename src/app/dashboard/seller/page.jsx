'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Loader2, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '@/components/Modal';
import BookForm from '@/components/BookForm';

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view', 'delete'
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.role === 'seller') {
      fetchBooks();
    } else {
      setLoading(false);
    }
  }, [session, status, router]);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (!res.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await res.json();
      if (session?.user?.id) {
        setBooks(data.filter(b => b.sellerId === session.user.id));
      }
    } catch (error) {
      console.error("Failed to fetch books", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, book = null) => {
    if (type === 'add') {
      if (!session?.user?.phone || !session?.user?.address) {
        toast.error("Action Required: Please complete your profile to list books.");
        router.push('/dashboard/seller/profile');
        return;
      }
    }
    setModalType(type);
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    setDeleteId(null);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const performDelete = async () => {
    if (!deleteId) return;

    // Optimistic UI update could be done here, but let's stick to safe server confirm
    const toastId = toast.loading("Deleting book...");

    try {
      const res = await fetch(`/api/books/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.update(toastId, { render: "Book deleted successfully", type: "success", isLoading: false, autoClose: 2000 });
        setBooks(books.filter(b => b.id !== deleteId));
        closeModal();
      } else {
        toast.update(toastId, { render: "Failed to delete book", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.update(toastId, { render: "Error deleting book", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const getBookImage = (book) => {
    let imgs = book.images;
    if (typeof imgs === 'string') {
      try {
        imgs = JSON.parse(imgs);
      } catch (e) {
        if (imgs.startsWith('/') || imgs.startsWith('http')) {
          return imgs;
        }
        imgs = [];
      }
    }
    return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : '/placeholder-book.png';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your inventory and track sales.</p>
          </div>
          <button
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> List New Book
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-gray-300" />
            <p className="text-sm">Loading your library...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 max-w-xl mx-auto mt-8">
            <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-xs mx-auto">
              Your shelf is empty. Start your selling journey by listing your first book today.
            </p>
            <button
              onClick={() => openModal('add')}
              className="text-amber-600 font-semibold hover:text-amber-700 hover:underline underline-offset-4 text-sm"
            >
              Create your first listing &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100"
              >
                {/* Artwork/Cover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={getBookImage(book)}
                    alt={book.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out"
                  />

                  {/* Overlay Actions - VISIBLE ON MOBILE, HOVER ON DESKTOP */}
                  <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px] md:backdrop-blur-none md:group-hover:backdrop-blur-sm">
                    <button onClick={() => openModal('view', book)} className="p-2.5 bg-white/10 text-white hover:bg-white hover:text-black rounded-full transition-all border border-white/20" title="View"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openModal('edit', book)} className="p-2.5 bg-white/10 text-white hover:bg-white hover:text-blue-600 rounded-full transition-all border border-white/20" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(book.id)} className="p-2.5 bg-white/10 text-white hover:bg-white hover:text-red-600 rounded-full transition-all border border-white/20" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-lg">
                    Rs. {book.price}
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm ${book.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                    {book.status}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors">{book.title}</h3>
                    <p className="text-xs font-medium text-amber-600 mb-2">{book.category}</p>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">{book.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Styled Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalType === 'add' ? 'List a New Book' :
            modalType === 'edit' ? 'Update Listing' :
              modalType === 'delete' ? 'Confirm Deletion' : 'Listing Details'
        }
        className="max-w-2xl"
      >
        {modalType === 'delete' ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              This action cannot be undone. This book will be permanently removed from your inventory.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={closeModal} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition">
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition"
              >
                Yes, Delete it
              </button>
            </div>
          </div>
        ) : modalType === 'view' && selectedBook ? (
          <div className="flex flex-col gap-6">
            {/* View Mode Content - Simplified */}
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video relative">
              <img src={getBookImage(selectedBook)} className="w-full h-full object-cover" alt="Cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h2>
              <p className="text-gray-500 mt-2">{selectedBook.description}</p>
            </div>
          </div>
        ) : (
          <BookForm
            type={modalType}
            book={modalType === 'edit' ? selectedBook : null}
            onClose={closeModal}
            onSuccess={fetchBooks}
          />
        )}
      </Modal>
    </div>
  );
}
