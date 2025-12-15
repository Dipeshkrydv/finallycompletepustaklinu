'use client';

import { useState, useEffect } from 'react';
import { Quote, Star, User, MessageSquarePlus, X, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

export default function Testimonials() {
    const { data: session } = useSession();
    const [testimonials, setTestimonials] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    useEffect(() => {
        if (testimonials.length > 0) {
            const interval = setInterval(() => {
                setActiveIndex((current) => (current + 1) % testimonials.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [testimonials]);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch('/api/feedback');
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data);
            }
        } catch (error) {
            console.error("Failed to fetch feedback", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment }),
            });

            if (res.ok) {
                const newFeedback = await res.json();
                setTestimonials([newFeedback, ...testimonials]);
                toast.success('Thank you for your feedback!');
                setIsModalOpen(false);
                setComment('');
                setRating(5);
            } else {
                toast.error('Failed to submit feedback');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-48 flex items-center justify-center bg-amber-50 rounded-2xl border border-amber-100">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
    );

    if (testimonials.length === 0) {
        return (
            <div className="bg-amber-50 rounded-2xl p-8 text-center border border-amber-100">
                <Quote className="w-12 h-12 text-amber-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Be the first to review!</h3>
                <p className="text-gray-500 mb-6">Share your experience with the community.</p>
                {session ? (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition shadow-lg flex items-center gap-2 mx-auto"
                    >
                        <MessageSquarePlus className="w-5 h-5" /> Write a Review
                    </button>
                ) : (
                    <p className="text-sm text-amber-600">Login to write a review</p>
                )}
                {/* Modal Logic (Duplicated below, ideally componentize given complexities, but keeping inline for single file edit) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Write a Review</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`p-1 transition ${star <= rating ? 'text-amber-400 transform scale-110' : 'text-gray-300 hover:text-amber-200'}`}
                                            >
                                                <Star className="w-8 h-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none h-32 text-gray-900" // Ensure text color is dark
                                        placeholder="Tell us about your experience..."
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-sm border border-amber-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 text-amber-100 transform rotate-12 transition-transform duration-700 group-hover:rotate-45">
                <Quote className="w-32 h-32" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider">Community Reviews</h3>
                    {session && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs bg-white px-3 py-1.5 rounded-full shadow-sm text-gray-600 hover:text-amber-600 font-medium border border-gray-100 flex items-center gap-1 transition"
                        >
                            <MessageSquarePlus className="w-3 h-3" /> Add Review
                        </button>
                    )}
                </div>

                <div className="min-h-[160px]">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.id}
                            className={`transition-all duration-500 absolute w-full ${index === activeIndex
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-8 pointer-events-none'
                                }`}
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-700 text-lg font-medium leading-relaxed mb-6 italic line-clamp-3">
                                &quot;{testimonial.comment}&quot;
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 shadow-sm uppercase">
                                    <span className="font-bold text-sm">{testimonial.user?.name?.[0] || 'U'}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{testimonial.user?.name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-500 capitalize">{testimonial.user?.role || 'User'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Indicators */}
                <div className="flex gap-2 mt-8">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-6 bg-amber-500' : 'w-2 bg-amber-200 hover:bg-amber-300'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Submission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Write a Review</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`p-1 transition ${star <= rating ? 'text-amber-400 transform scale-110' : 'text-gray-300 hover:text-amber-200'}`}
                                        >
                                            <Star className="w-8 h-8 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none h-32 text-gray-900"
                                    placeholder="Tell us about your experience..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
