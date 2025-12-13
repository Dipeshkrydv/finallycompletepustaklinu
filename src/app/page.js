'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { BookOpen, ShoppingBag, Users, Search, ArrowRight, LogIn, UserPlus, LogOut, Star } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    // Fetch a few featured books
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/books?limit=4');
        if (res.ok) {
          const data = await res.json();
          setFeaturedBooks(data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch featured books", error);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/buyer?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Helper to parse images safely
  const getBookImage = (book) => {
    let imgs = book.images;
    if (typeof imgs === 'string') {
      try {
        imgs = JSON.parse(imgs);
      } catch (e) {
        // If parse fails, checks if it looks like a path
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
    <div className="min-h-screen bg-amber-50 text-gray-800 font-sans">
      {/* Navbar */}
      {/* Sticky Professional Header */}
      <header className="sticky top-0 z-50 bg-amber-50/95 backdrop-blur-md border-b border-amber-100 transition-all duration-300">
        <nav className="flex justify-between items-center px-6 py-1 max-w-7xl mx-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo.png" alt="Pustaklinu" loading="eager" className="h-24 object-contain hover:scale-105 transition duration-300" />
          </div>

          {/* Center Navigation - Clean & Professional */}
          {/* Center Navigation - Conditional based on Role */}
          <div className="hidden md:flex items-center gap-10">
            {session?.user?.role === 'seller' ? (
              <>
                <Link href="/dashboard/seller" className="text-gray-600 hover:text-amber-700 font-medium text-[15px] transition-colors relative group">
                  My Listings
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
                <Link href="/dashboard/seller/messages" className="text-gray-600 hover:text-amber-700 font-medium text-[15px] transition-colors relative group">
                  Messages
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-gray-600 hover:text-amber-700 font-medium text-[15px] transition-colors relative group">
                  Home
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>

                <Link href="/dashboard/buyer" className="text-gray-600 hover:text-amber-700 font-medium text-[15px] transition-colors relative group">
                  Categories
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>

                <Link href="/dashboard/buyer/orders" className="text-gray-600 hover:text-amber-700 font-medium text-[15px] transition-colors relative group">
                  Orders
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>

                <Link href="/dashboard/buyer/messages" className="text-gray-600 hover:text-amber-700 font-medium text-[15px] transition-colors relative group">
                  Chat
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex gap-4 items-center">
            {status === 'loading' ? (
              <div className="flex gap-4 animate-pulse">
                <div className="w-20 h-9 bg-gray-100 rounded-full"></div>
                <div className="w-24 h-9 bg-gray-100 rounded-full"></div>
              </div>
            ) : !session ? (
              <>
                <Link href="/login" className="flex items-center gap-2 px-5 py-2 text-gray-700 hover:text-amber-700 font-medium transition hover:bg-gray-50 rounded-full">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 px-6 py-2.5 bg-amber-700 text-white font-medium rounded-full hover:bg-amber-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <UserPlus className="w-4 h-4" /> Register
                </Link>
              </>
            ) : (
              <>
                <Link href={`/dashboard/${session.user.role}`} className="flex items-center gap-2 text-gray-600 hover:text-amber-700 font-medium transition mr-2">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2 border border-amber-200 text-amber-700 font-medium rounded-full hover:bg-amber-50 transition"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-amber-900 leading-tight">
            Give Old Books <br /> <span className="text-amber-600">A New Story</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-lg">
            Connect with book lovers in your neighborhood. Buy, sell, and exchange pre-loved books effortlessly. Join our community today.
          </p>

          {/* Search Bar in Hero */}
          <form onSubmit={handleSearch} className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search for books by title or author..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none shadow-sm text-gray-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <button type="submit" className="absolute right-2 top-2 bg-amber-700 text-white p-1.5 rounded-full hover:bg-amber-800 transition">
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex gap-4 pt-4">
            <Link href="/dashboard/buyer" className="px-8 py-4 bg-amber-700 text-white text-lg font-semibold rounded-full hover:bg-amber-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Browse Books
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-amber-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
          <img
            src="/landing_hero.png" // We will move the generated image here
            alt="Books Illustration"
            loading="eager"
            className="relative z-10 w-full h-auto drop-shadow-2xl rounded-2xl transform rotate-2 hover:rotate-0 transition duration-500"
          />
        </div>
      </main>

      {/* Featured Books Section */}
      <section className="bg-amber-50/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-amber-900">Recently Listed</h2>
            <Link href="/dashboard/buyer" className="text-amber-700 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingBooks ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm p-4">
                  <div className="bg-gray-200 w-full h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 w-3/4 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 w-1/2 h-4 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.length > 0 ? featuredBooks.map(book => (
                <Link key={book.id} href={`/dashboard/buyer?q=${encodeURIComponent(book.title)}`} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-amber-100 hover:-translate-y-1">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={getBookImage(book)}
                      alt={book.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                      {Number(book.discount) > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {book.discount}% OFF
                        </span>
                      )}
                      <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-amber-700 shadow-sm flex flex-col items-end leading-tight">
                        {Number(book.discount) > 0 ? (
                          <>
                            <span className="text-red-500 line-through text-[10px]">Rs. {book.price}</span>
                            <span>Rs. {calculateDiscountedPrice(book.price, book.discount)}</span>
                          </>
                        ) : (
                          <span>Rs. {book.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-amber-700 transition">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md">{book.category || 'General'}</span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-4 text-center py-10 text-gray-500">
                  <p>No featured books available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-amber-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-amber-50 transition duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Sell Your Books</h3>
              <p className="text-gray-600">List your old books with ease. Add photos, set a price, and find a buyer nearby.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-amber-50 transition duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Find Nearby Gems</h3>
              <p className="text-gray-600">Use geolocation to discover books available in your neighborhood. No shipping hassles.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl hover:bg-amber-50 transition duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Connect & Exchange</h3>
              <p className="text-gray-600">Chat with sellers/buyers (via Admin) and arrange a meetup to exchange the books.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-100">Pustaklinu</span>
            </div>
            <p className="text-sm opacity-75">&copy; 2025 Pustaklinu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
