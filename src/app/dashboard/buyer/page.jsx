'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, MapPin, Search, Filter, BookOpen, User, X, Trash2, CheckCircle, Star, TrendingUp, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';
import Testimonials from '@/components/Testimonials';
import DonationFooter from '@/components/DonationFooter';

export default function BuyerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';

  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });
  // Search is now driven by URL, but we keep local state for valid react effect dependency if needed, 
  // or just derive directly. Let's derive directly to avoid sync issues.
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
    // Load cart from local storage
    const savedCart = localStorage.getItem('book_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true); // Mark as loaded
    fetchCities();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [location, urlQuery, urlCategory, selectedCity]); // React to URL changes

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('book_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities');
      if (res.ok) {
        setCities(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch cities", error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `/api/books?q=${encodeURIComponent(urlQuery)}`;
      if (location.lat && location.lng) {
        url += `&lat=${location.lat}&lng=${location.lng}`;
      }
      if (selectedCity) {
        url += `&city=${selectedCity}`;
      }
      // Note: Backend might not support category filtering yet, but we will filter client side if needed or pass it
      // For now passing it as q or separate param if API supported it. 
      // Assuming API uses q for general search. If we want strict category, we'd need to update API.
      // For this demo, we'll filter client side if category is present and not part of text search.

      const res = await fetch(url);
      const data = await res.json();

      let filteredData = Array.isArray(data) ? data : [];
      if (selectedCity && Array.isArray(data)) {
        filteredData = data.filter(book => book.seller?.city?.toLowerCase() === selectedCity.toLowerCase());
      }
      if (urlCategory) {
        // Simple client-side category filter for demo purposes
        filteredData = filteredData.filter(book =>
          book.category?.toLowerCase().includes(urlCategory.toLowerCase()) ||
          book.genre?.toLowerCase().includes(urlCategory.toLowerCase())
        );
      }

      setBooks(filteredData);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (book) => {
    if (!session) {
      toast.info('Please login to add items to cart');
      router.push('/login');
      return;
    }
    if (cart.some(item => item.id === book.id)) {
      toast.info('Item already in cart');
      setIsCartOpen(true); // Open cart so user can see it
      return;
    }
    const basePrice = calculateDiscountedPrice(book.price, book.discount);
    // REMOVED: 10% platform fee calculation at cart level
    const finalPrice = basePrice;

    const newCart = [...cart, {
      ...book,
      bookId: book.id,
      price: finalPrice, // Now just the discounted price
      basePrice: basePrice,
      originalPrice: book.price
    }];
    setCart(newCart);
    toast.success('Added to cart');
    setIsCartOpen(true); // Open cart to show user
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const buyBooks = async () => {
    if (!session) {
      toast.info('Please login to proceed to checkout');
      router.push('/login');
      return;
    }
    if (isCheckingOut) return;
    setIsCheckingOut(true);

    // Calculate total for confirmation page
    const totalAmount = cart.reduce((sum, item) => sum + Number(item.price), 0);

    try {
      const res = await fetch('/api/orders/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart }),
      });

      if (res.ok) {
        toast.success('Order placed successfully!');
        setCart([]); // Clear cart
        setIsCartOpen(false);
        // Pass total amount to confirmation page for donation calculation
        router.push(`/dashboard/buyer/orders/confirmation?amount=${totalAmount}`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to place order');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsCheckingOut(false);
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

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price - (price * discount / 100));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">

      {/* Search & Filter - Subheader */}
      <div className="bg-white border-b border-gray-200 py-3 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-gray-600 text-sm">
            {urlQuery ? (
              <span>Results for <span className="font-bold text-gray-900">&quot;{urlQuery}&quot;</span></span>
            ) : urlCategory ? (
              <span>Category: <span className="font-bold text-gray-900">{urlCategory}</span></span>
            ) : (
              <span>Showing all books nearby</span>
            )}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="pl-9 pr-8 py-2 bg-gray-100 border-none rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 cursor-pointer hover:bg-gray-200 transition"
              >
                <option value="">All Locations</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            {/* Mobile Cart Trigger if needed, though Layout has it too. */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="md:hidden relative p-2 text-gray-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-amber-600 text-white rounded-full text-[10px] flex items-center justify-center">{cart.length}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section - Only show when no search/filter active */}
      {!urlQuery && !urlCategory && !selectedCity && (
        <>
          <div className="mb-8 bg-amber-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Favorite Book</h1>
              <p className="text-amber-100 text-lg max-w-2xl mx-auto mb-8">Buy, sell, and exchange pre-loved books within your community. Sustainable reading starts here.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => {
                  const el = document.getElementById('book-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }} className="px-8 py-3 bg-white text-amber-900 font-bold rounded-full hover:bg-amber-50 transition shadow-lg">
                  Start Browsing
                </button>
              </div>
            </div>
          </div>

        </>
      )}

      {/* Cart Drawer */}
      {/* Cart Box (Simple, Short & Sweet) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end items-start pt-20 px-4 sm:pr-8 pointer-events-none">
          {/* Backdrop (invisible but clickable to close) */}
          <div className="absolute inset-0 pointer-events-auto" onClick={() => setIsCartOpen(false)}></div>

          {/* The Sweet Box */}
          <div className="pointer-events-auto relative bg-white w-80 max-h-[75vh] rounded-3xl shadow-2xl flex flex-col font-sans border border-gray-100 transform transition-all animate-in slide-in-from-right-4 fade-in duration-200">

            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur rounded-t-3xl z-10">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-500" />
                <span>My Cart <span className="text-gray-400 font-normal">({cart.length})</span></span>
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-7 h-7 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="overflow-y-auto px-5 py-2 space-y-3 flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-6 h-6 text-amber-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Cart is empty</p>
                  <button onClick={() => setIsCartOpen(false)} className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700">
                    Add Books
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 group py-2 border-b border-gray-50 last:border-0 relative">
                    <div className="w-12 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                      <img
                        src={getBookImage(item)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-semibold text-xs text-gray-800 line-clamp-1 pr-5">{item.title}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{item.seller?.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">Rs. {Number(item.price)}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-[10px] text-gray-300 line-through">Rs. {item.originalPrice}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-1 right-0 text-gray-300 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 bg-gray-50/50 rounded-b-3xl border-t border-gray-50">
                <div className="flex justify-between items-end mb-3 px-1">
                  <span className="text-xs text-gray-500 font-medium">Subtotal</span>
                  <span className="text-base font-extrabold text-gray-900">
                    Rs. {cart.reduce((sum, item) => sum + Number(item.price), 0)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Clear Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={buyBooks}
                    disabled={isCheckingOut}
                    className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition shadow-lg hover:shadow-xl flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    ) : (
                      <>Checkout <ArrowRight className="w-3 h-3" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Book Grid */}
      <div id="book-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          {urlQuery || urlCategory ? 'Search Results' : 'Recommended For You'}
          {!urlQuery && !urlCategory && <Star className="w-5 h-5 text-yellow-400 fill-current" />}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[3/4] rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No books found</h3>
            <p className="text-gray-500">We couldn&apos;t find any books matching your criteria.</p>
            <button
              onClick={() => {
                window.history.replaceState(null, '', '/dashboard/buyer');
                window.location.reload();
                /* Simple reload to clear params as next/nav router can be tricky inside onClick here without router hook */
              }}
              className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="group bg-white rounded-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full relative hover:-translate-y-1">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={getBookImage(book)}
                    alt={book.title}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute top-0 right-0 p-3">
                    <button className="p-2 bg-white/80 backdrop-blur rounded-full text-gray-500 hover:text-red-500 transition shadow-sm">
                      <Heart className="w-4 h-4" />
                    </button>

                  </div>

                  {/* Discount Badge */}
                  {Number(book.discount) > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
                      {book.discount}% OFF
                    </div>
                  )}
                  {book.distance !== null && book.distance !== undefined && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {book.distance.toFixed(3)} km
                    </div>
                  )}
                  {/* Status Overlay */}
                  {book.status && book.status !== 'available' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                      <span className={`px-4 py-2 rounded-full text-white font-bold text-sm tracking-wider uppercase shadow-lg ${book.status === 'sold' ? 'bg-red-600' : 'bg-amber-600'
                        }`}>
                        {book.status === 'on-hold' ? 'Booked' : 'Sold Out'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-amber-700 transition" title={book.title}>{book.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                      <span className="text-amber-600">{book.category || 'General'}</span>
                      <span>•</span>
                      <span>{book.seller?.name}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">{book.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      {Number(book.discount) > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 line-through">Rs. {book.price}</span>
                          <span className="text-xl font-bold text-red-600">Rs. {calculateDiscountedPrice(book.price, book.discount)}</span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-900">Rs. {book.price}</span>
                      )}
                      {/* Rating placeholder */}
                      <div className="flex items-center gap-1 text-yellow-400 text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-gray-400">4.5</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(book)}
                    disabled={book.status && book.status !== 'available'}
                    className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 relative overflow-hidden active:scale-95 ${book.status && book.status !== 'available'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200'
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4" /> {book.status && book.status !== 'available' ? 'Unavailable' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials Section - Moved to Bottom */}
      <div className="max-w-7xl mx-auto px-6 pb-12 mt-12">
        <Testimonials />
        <div className="mt-12">
          <DonationFooter role="buyer" />
        </div>
      </div>

    </div>
  );
}
