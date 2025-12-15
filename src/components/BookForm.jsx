'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Loader2, Info as InfoIcon } from 'lucide-react';
import { toast } from 'react-toastify';

export default function BookForm({ type, book, onClose, onSuccess }) {
    const [actionLoading, setActionLoading] = useState(false);
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
    const [imageList, setImageList] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (type === 'edit' && book) {
            setFormData({
                title: book.title,
                pages: book.pages,
                price: book.price,
                description: book.description,
                category: book.category,
                keywords: book.keywords || '',
                discount: book.discount || '',
                images: [],
            });

            // Parse existing images
            let imgs = book.images;
            if (typeof imgs === 'string') {
                try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
            }
            imgs = Array.isArray(imgs) ? imgs : [];
            setImageList(imgs.map((url, idx) => ({ id: `existing-${idx}`, url, isNew: false })));

            if (book.keywords) {
                setTags(book.keywords.split(',').map(k => k.trim()).filter(Boolean));
            }
        }
    }, [type, book]);

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
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const removeImage = (id) => {
        setImageList(prev => prev.filter(item => item.id !== id));
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

        let finalTags = [...tags];
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            finalTags.push(tagInput.trim());
        }

        if (Number(formData.price) < 0 || Number(formData.pages) < 0) {
            toast.error("Price and Pages must be positive numbers");
            setActionLoading(false);
            return;
        }

        const data = new FormData();
        for (const key in formData) {
            if (key !== 'images' && key !== 'keywords') {
                data.append(key, formData[key]);
            }
        }
        data.append('keywords', finalTags.join(', '));

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
        data.append('imageOrder', JSON.stringify(imageOrder));
        newFiles.forEach(file => data.append('images', file));

        try {
            let url = '/api/books';
            let method = 'POST';

            if (type === 'edit') {
                url = `/api/books/${book.id}`;
                method = 'PUT';
            }

            const res = await fetch(url, { method, body: data });

            if (res.ok) {
                toast.success(`Book ${type === 'add' ? 'added' : 'updated'} successfully`);
                onSuccess();
                onClose();
            } else {
                const errData = await res.json();
                toast.error(errData.error || `Failed to ${type} book`);
            }
        } catch (error) {
            toast.error("An error occurred while communicating with the server.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-3 pb-4 border-b border-gray-100">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Add Photos</label>
                <div className="flex flex-col md:flex-row gap-4 h-32">
                    <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-amber-50/30 hover:border-amber-400 transition-all relative flex flex-col items-center justify-center cursor-pointer group">
                        <input
                            type="file"
                            name="images"
                            onChange={handleChange}
                            accept="image/*"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="relative z-20 flex flex-col items-center pointer-events-none">
                            <div className="w-8 h-8 bg-white text-gray-400 rounded-full flex items-center justify-center shadow-sm mb-2">
                                <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium text-gray-600 bg-white/80 px-2 py-1 rounded">
                                Click or Drop Images
                            </span>
                        </div>
                    </div>
                    {imageList.length > 0 && (
                        <div className="w-full md:w-1/3 flex gap-2 overflow-x-auto p-1 border border-gray-100 rounded-xl bg-white items-center">
                            {imageList.map((item) => (
                                <div key={item.id} className="relative w-20 h-full flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={item.url} className="w-full h-full object-cover" />
                                    <button onClick={(e) => { e.preventDefault(); removeImage(item.id) }} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Book Title"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm font-semibold text-gray-900"
                            required
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-gray-900"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6</option>
                            <option value="Class 7">Class 7</option>
                            <option value="Class 8">Class 8</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                            <option value="Class 11 Science">Class 11 Science</option>
                            <option value="Class 11 Commerce">Class 11 Commerce</option>
                            <option value="Class 12 Science">Class 12 Science</option>
                            <option value="Class 12 Commerce">Class 12 Commerce</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Price (Rs.)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm font-bold text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Pages</label>
                        <input
                            type="number"
                            name="pages"
                            value={formData.pages}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Discount %</label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            placeholder="0"
                            max="99"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm text-rose-500 font-medium"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm resize-none"
                        required
                    ></textarea>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Tags</label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[40px] focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
                        {tags.map((tag, i) => (
                            <span key={i} className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded textxs flex items-center gap-1 shadow-sm text-xs font-medium">
                                {tag} <button type="button" onClick={() => removeTag(i)}><X className="w-3 h-3 hover:text-red-500" /></button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            className="flex-1 bg-transparent outline-none min-w-[60px] px-1 text-sm h-full"
                            placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex-shrink-0">
                    <InfoIcon className="w-3 h-3 text-blue-500" />
                    <span><span className="font-bold text-gray-600">5% Donation Fee</span> applies.</span>
                </div>

                <div className="flex-1 flex gap-3 justify-end">
                    <button onClick={onClose} type="button" className="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="bg-black text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md flex items-center gap-2"
                    >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (type === 'add' ? 'Publish Listing' : 'Save Changes')}
                    </button>
                </div>
            </div>
        </form>
    );
}
