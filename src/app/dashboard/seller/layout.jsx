'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, MessageSquare, User, LogOut, Menu, X, Package } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import DonationFooter from '@/components/DonationFooter';

export default function SellerLayout({ children }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard/seller')}>
                            <img src="/logo.png" alt="Pustaklinu" loading="eager" className="h-24 object-contain" />
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/dashboard/seller" className="flex flex-col items-center gap-1 text-gray-600 hover:text-amber-600 transition">
                                <BookOpen className="w-5 h-5" />
                                <span className="text-xs font-medium">My Listings</span>
                            </Link>

                            <Link href="/dashboard/seller/orders" className="flex flex-col items-center gap-1 text-gray-600 hover:text-amber-600 transition-all duration-150">
                                <Package className="w-5 h-5" />
                                <span className="text-xs font-medium">Orders</span>
                            </Link>

                            <Link href="/dashboard/seller/messages" className="flex flex-col items-center gap-1 text-gray-600 hover:text-amber-600 transition">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-xs font-medium">Messages</span>
                            </Link>

                            {/* Profile Dropdown */}
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                                    className="flex items-center gap-2 p-1 rounded-full border border-gray-200 hover:border-amber-400 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                                        {session?.user?.name?.[0]?.toUpperCase() || 'S'}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 border-b border-gray-50">
                                            <p className="text-sm font-bold text-gray-800">{session?.user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                                        </div>
                                        <Link
                                            href="/dashboard/seller/profile" // Assuming we might want a profile page later or reuse buyer's
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User className="w-4 h-4" /> Profile
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
                        <div className="flex flex-col gap-2">
                            <Link href="/dashboard/seller" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                                <BookOpen className="w-5 h-5 text-gray-400" /> My Listings
                            </Link>
                            <Link href="/dashboard/seller/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                                <MessageSquare className="w-5 h-5 text-gray-400" /> Messages
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 font-medium w-full text-left">
                                <LogOut className="w-5 h-5" /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {children}
            <DonationFooter role="seller" />
        </div>
    );
}
