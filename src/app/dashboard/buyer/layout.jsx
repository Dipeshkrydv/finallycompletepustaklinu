'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BookOpen, Search, ShoppingCart, User, LogOut, Menu, X, Heart, Home, Grid, MessageSquare, Bell } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import DonationFooter from '@/components/DonationFooter';

export default function BuyerLayout({ children }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [hasNotifications, setHasNotifications] = useState(false);

    useEffect(() => {
        if (session?.user) {
            // Check for notifications to show badge
            fetch('/api/orders')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        // Show dot if there are any completed/updated orders
                        const hasAlerts = data.some(o => ['accepted', 'rejected', 'cancelled', 'delivered'].includes(o.status));
                        setHasNotifications(hasAlerts);
                    }
                })
                .catch(err => console.error("Nav notification check failed", err));
        }
    }, [session]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/dashboard/buyer?q=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push('/dashboard/buyer');
        }
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20 gap-8">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard/buyer')}>
                            {/* <BookOpen className="h-9 w-9 text-amber-600" /> */}
                            <img src="/logo.png" alt="Pustaklinu" loading="eager" className="h-24 object-contain" />
                        </div>

                        {/* Search Bar - Hidden on mobile, shown on md+ */}
                        <div className="hidden md:flex flex-1 max-w-2xl">
                            <form onSubmit={handleSearch} className="w-full relative">
                                <input
                                    type="text"
                                    placeholder="Search for books, authors, or ISBNs..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all duration-200 text-gray-900"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <button type="submit" className="absolute right-2 top-2 bg-amber-600 text-white p-1.5 rounded-full hover:bg-amber-700 transition-all duration-150 active:scale-95">
                                    <Search className="w-4 h-4" />
                                </button>
                            </form>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-amber-600 transition">
                                <Home className="w-5 h-5" />
                                <span className="text-xs font-medium">Home</span>
                            </Link>
                            <div className="relative group cursor-pointer flex flex-col items-center gap-1 text-gray-600 hover:text-amber-600 transition">
                                <Grid className="w-5 h-5" />
                                <span className="text-xs font-medium">Categories</span>
                                {/* Simple Dropdown for Categories */}
                                <div className="absolute top-10 right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                    <div className="py-2 max-h-[80vh] overflow-y-auto">
                                        {[
                                            'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                                            'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                                            'Class 11 Science', 'Class 11 Commerce',
                                            'Class 12 Science', 'Class 12 Commerce',
                                            'Other'
                                        ].map((cat) => (
                                            <Link
                                                key={cat}
                                                href={`/dashboard/buyer?q=${encodeURIComponent(cat)}`} // Changing param to q to ensure search works with current logic
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                                            >
                                                {cat}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Link href="/dashboard/buyer/orders" className="flex flex-col items-center gap-1 text-gray-600 hover:text-amber-600 transition">
                                <ShoppingBagIcon />
                                <span className="text-xs font-medium">Orders</span>
                            </Link>

                            <Link href="/dashboard/buyer/notifications" className="relative flex flex-col items-center gap-1 text-gray-600 hover:text-amber-600 transition">
                                <div className="relative">
                                    <Bell className="w-5 h-5" />
                                    {hasNotifications && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                    )}
                                </div>
                                <span className="text-xs font-medium">Notices</span>
                            </Link>

                            {/* Profile Dropdown */}
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                                    className="flex items-center gap-2 p-1 rounded-full border border-gray-200 hover:border-amber-400 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 border-b border-gray-50">
                                            <p className="text-sm font-bold text-gray-800">{session?.user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                                        </div>
                                        <Link
                                            href="/dashboard/buyer/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User className="w-4 h-4" /> Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-4">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white px-4 py-6 space-y-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </form>
                        <div className="flex flex-col gap-2">
                            <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                                <Home className="w-5 h-5 text-gray-400" /> Home
                            </Link>
                            <Link href="/dashboard/buyer/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                                <ShoppingBagIcon className="w-5 h-5 text-gray-400" /> My Orders
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 font-medium w-full text-left">
                                <LogOut className="w-5 h-5" /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {children}
        </div>
    );
}

function ShoppingBagIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
