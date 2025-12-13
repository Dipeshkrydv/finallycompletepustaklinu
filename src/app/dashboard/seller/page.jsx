'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Plus, Edit, Trash2, Eye, Loader2, Upload, BookOpen, DollarSign, FileText, Tag, X, ArrowLeft, ArrowRight, LogOut, Info as InfoIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '@/components/Modal';

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedBook, setSelectedBook] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    pages: '',
    price: '',
    description: '',
    category: '',
    keywords: '',
    discount: '',
    images: [],
  });
  // State to track all images (existing URLs and new Files)
  // Each item: { id: string (unique), url: string, file?: File, isNew: boolean }
  const [imageList, setImageList] = useState([]);

  // Tag State
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
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
    setModalType(type);
    setSelectedBook(book);

    if (type === 'add') {
      setFormData({ title: '', pages: '', price: '', description: '', category: '', keywords: '', discount: '', images: [] });
      setImageList([]);
      setTags([]);
      setTagInput('');
    } else if (type === 'edit' && book) {
      setFormData({
        title: book.title,
        pages: book.pages,
        price: book.price,
        description: book.description,
        category: book.category,
        keywords: book.keywords || '',
        discount: book.discount || '',
        images: [], // Keep empty, only update if new files selected
      });
      // Set preview from existing images
      let imgs = book.images;
      if (typeof imgs === 'string') {
        try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
      }
      imgs = Array.isArray(imgs) ? imgs : [];
      setImageList(imgs.map((url, idx) => ({ id: `existing-${idx}`, url, isNew: false })));

      // Parse keywords into tags
      if (book.keywords) {
        setTags(book.keywords.split(',').map(k => k.trim()).filter(Boolean));
      } else {
        setTags([]);
      }
      setTagInput('');
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    setImageList([]);
  };

  const handleChange = (e) => {
    if (e.target.name === 'images') {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        const newItems = files.map((file, idx) => ({
          id: `new-${Date.now()}-${idx}`,
          url: URL.createObjectURL(file),
          file,
          isNew: true
        }));
        setImageList(prev => [...prev, ...newItems]);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const removeImage = (id) => {
    setImageList(prev => prev.filter(item => item.id !== id));
  };

  const moveImage = (index, direction) => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= imageList.length) return;

    const newList = [...imageList];
    const [movedItem] = newList.splice(index, 1);
    newList.splice(newIndex, 0, movedItem);
    setImageList(newList);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const data = new FormData();
    // Add text fields
    for (const key in formData) {
      if (key !== 'images' && key !== 'keywords') {
        data.append(key, formData[key]);
      }
    }
    // Append keywords as comma separated string
    data.append('keywords', tags.join(', '));

    // Prepare image order and new files
    const imageOrder = [];
    const newFiles = [];

    imageList.forEach(item => {
      if (item.isNew) {
        imageOrder.push('new-image-placeholder');
        newFiles.push(item.file);
      } else {
        imageOrder.push(item.url);
      }
    });

    // Append image order as JSON string
    data.append('imageOrder', JSON.stringify(imageOrder));

    // Append new files
    newFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      let url = '/api/books';
      let method = 'POST';

      if (modalType === 'edit') {
        url = `/api/books/${selectedBook.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        body: data,
      });

      if (res.ok) {
        toast.success(`Book ${modalType === 'add' ? 'added' : 'updated'} successfully`);
        fetchBooks();
        closeModal();
      } else {
        const errData = await res.json();
        toast.error(errData.error || `Failed to ${modalType} book`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    // We can't easily show loading on the specific delete button without more state,
    // but we can show a toast.
    const toastId = toast.loading("Deleting book...");

    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.update(toastId, { render: "Book deleted", type: "success", isLoading: false, autoClose: 3000 });
        fetchBooks();
      } else {
        toast.update(toastId, { render: "Failed to delete", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.update(toastId, { render: "Error deleting book", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  // Helper to parse images for display
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
    return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : '/placeholder-book.png'; // Fallback
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
            <p className="text-gray-500 mt-1">Manage your books for sale</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => openModal('add')}
              className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" /> Add New Book
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">No books listed yet</h3>
            <p className="text-gray-500 mt-2 mb-6">Start selling by adding your first book!</p>
            <button
              onClick={() => openModal('add')}
              className="text-amber-600 font-medium hover:text-amber-700 hover:underline"
            >
              Add a book now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={getBookImage(book)}
                    alt={book.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => openModal('view', book)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 transition"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openModal('edit', book)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white text-blue-600 transition"
                      title="Edit Book"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white text-red-600 transition"
                      title="Delete Book"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-amber-700 shadow-sm">
                    Rs. {book.price}
                  </div>
                  {/* Status Badge - Ensuring visibility */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${book.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {book.status}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{book.category}</p>
                    <p className="text-gray-600 text-sm line-clamp-2">{book.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {book.pages} pages</span>
                    {/* <span>{new Date(book.createdAt).toLocaleDateString()}</span> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalType === 'add' ? 'Add New Book' : modalType === 'edit' ? 'Edit Book' : 'Book Details'}
      >
        {modalType === 'view' && selectedBook ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              {(() => {
                let imgs = selectedBook.images;
                if (typeof imgs === 'string') {
                  try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
                }
                imgs = Array.isArray(imgs) ? imgs : [];
                return imgs.length > 0 ? (
                  imgs.map((img, idx) => (
                    <div key={idx} className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-gray-100">
                      <img src={img} alt={`${selectedBook.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                    No Images
                  </div>
                );
              })()}
            </div>
            <div>
              <h2 className="2xl font-bold text-gray-800">{selectedBook.title}</h2>
              <div className="flex items-center gap-4 mt-2 mb-4">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">{selectedBook.category}</span>
                <span className="text-xl font-bold text-amber-600">Rs. {selectedBook.price}</span>
                {selectedBook.discount > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-md">-{selectedBook.discount}% OFF</span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{selectedBook.description}</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block font-medium text-gray-700">Pages</span>
                  {selectedBook.pages}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block font-medium text-gray-700">Listed On</span>
                  {new Date(selectedBook.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload with Preview */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Book Images</label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition relative overflow-hidden">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Click to upload images</p>
                      <p className="text-xs text-gray-400">PNG, JPG or GIF (Max 5)</p>
                    </div>
                    <input type="file" name="images" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} accept="image/*" multiple />
                  </label>
                </div>
                {imageList.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imageList.map((item, idx) => (
                      <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {idx > 0 && (
                            <button type="button" onClick={() => moveImage(idx, 'left')} className="p-1 bg-white rounded-full text-gray-700 hover:text-black">
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                          )}
                          {idx < imageList.length - 1 && (
                            <button type="button" onClick={() => moveImage(idx, 'right')} className="p-1 bg-white rounded-full text-gray-700 hover:text-black">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          <button type="button" onClick={() => removeImage(item.id)} className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded shadow">Cover</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                    placeholder="Book Title"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                    placeholder="Fiction, Sci-Fi..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Keywords <span className="text-gray-400 font-normal">(Type and press Enter)</span></label>
              <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-amber-500 bg-white">
                <Tag className="w-5 h-5 text-gray-400 flex-shrink-0 mr-1" />
                {tags.map((tag, index) => (
                  <span key={index} className="bg-amber-100 text-amber-800 text-sm px-2 py-1 rounded-full flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-amber-600 hover:text-amber-800 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder={tags.length === 0 ? "e.g. vintage, rare..." : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pages</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                    placeholder="Number of pages"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                placeholder="Describe the condition and content of the book..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (modalType === 'add' ? 'Add Book' : 'Update Book')}
            </button>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex flex-col gap-1 mt-4">
              <span className="font-bold flex items-center gap-1"><InfoIcon className="w-4 h-4" /> Important:</span>
              <p>Please ensure to pay <span className="font-bold">10% donation fee</span> to the admin after your book is sold.</p>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
