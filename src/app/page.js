import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { Book } from '@/models/index';
import Link from 'next/link';
import Testimonials from '@/components/Testimonials';

function TestimonialsWrapper() {
  return <Testimonials />;
}

async function getFeaturedBooks() {
  try {
    const books = await Book.findAll({
      limit: 6,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'price', 'images', 'category'],
    });
    return books;
  } catch (error) {
    console.error("Error fetching featured books:", error);
    return [];
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = session.user?.role;
    if (role === 'admin') redirect('/dashboard/admin');
    if (role === 'seller') redirect('/dashboard/seller');
    if (role === 'buyer') redirect('/dashboard/buyer');
  }

  const featuredBooks = await getFeaturedBooks();

  return (
    <div className="min-h-screen bg-amber-50">

      {/* Hero Section - Ultra Professional Redesign */}
      <div className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          {/* High-res Premium Library Board Background */}
          <div
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524578271613-d550eacf6090?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center filter blur-sm scale-105"
            aria-hidden="true"
          />
          {/* Professional Gradient Overlay: Lighter/Subtle for clarity */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-amber-900/60" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center animate-fade-in">
          {/* Brand Label */}
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-sm">
            Pustaklinu
          </span>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-lg">
            Give Old Books a <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              New Life
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-200/90 font-medium max-w-2xl mx-auto mb-10 leading-relaxed tracking-wide">
            The smartest way to buy, sell, and exchange books in your community.
            <br className="hidden md:block" /> Join thousands of students and readers today.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <a
              href="/register"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-bold text-base transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-1"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-base transition-all duration-300 hover:border-white/30"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>

      {/* Featured Books Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Fresh Arrivals</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-4">Check out the latest books listed by our community</p>
        </div>

        {featuredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredBooks.map((book) => {
              // Parse images safely
              let imgUrl = '/placeholder-book.png';
              if (book.images) {
                try {
                  const parsed = typeof book.images === 'string' ? JSON.parse(book.images) : book.images;
                  if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                } catch (e) { }
              }

              return (
                <Link href="/login" key={book.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-amber-100 overflow-hidden flex flex-col cursor-pointer">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <img
                      src={imgUrl}
                      alt={book.title || "Book Image"}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition duration-300">
                      <p className="text-white text-sm font-medium">Login to view details</p>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-amber-600 transition">{book.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{book.category}</p>
                    <p className="text-amber-600 font-bold">Rs. {book.price}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">More books coming soon!</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/register" className="inline-flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 hover:underline text-lg">
            View All Books <span className="text-xl">→</span>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-20 border-t border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Pustaklinu?</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-amber-50 rounded-2xl hover:bg-amber-100 transition duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Huge Collection</h3>
              <p className="text-gray-600">Find academic books, novels, and rare gems at a fraction of the cost.</p>
            </div>
            <div className="p-8 bg-amber-50 rounded-2xl hover:bg-amber-100 transition duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">🌍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">Reduce paper waste by passing on books to those who need them next.</p>
            </div>
            <div className="p-8 bg-amber-50 rounded-2xl hover:bg-amber-100 transition duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">⚡</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Quick & Easy</h3>
              <p className="text-gray-600">List a book in seconds. Connect with buyers vertically instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">What Our Community Says</h2>
            <p className="text-gray-500 mt-2">Real feedback from book lovers like you</p>
          </div>
          {/* We import client component here */}
          <TestimonialsWrapper />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-6">Pustaklinu</h2>
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="hover:text-white transition">About Us</a>
            <a href="#" className="hover:text-white transition">Contact</a>
            <a href="/login" className="hover:text-white transition">Seller Login</a>
            <a href="#" className="hover:text-white transition">Terms</a>
          </div>
          <p>&copy; {new Date().getFullYear()} Pustaklinu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
