'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Package, Users, BookOpen, LogOut, Menu, X, Settings, MessageSquare, RefreshCw } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // "Cron" Job Simulation: Check for order follow-ups every 60 seconds
    useEffect(() => {
        const checkOrders = async () => {
            try {
                await fetch('/api/cron/check-orders');
            } catch (error) {
                console.error('Cron check failed', error);
            }
        };

        // Run immediately on mount, then interval
        checkOrders();
        const interval = setInterval(checkOrders, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard/admin' },
        { name: 'Orders', icon: Package, path: '/dashboard/admin/orders' },

        { name: 'Buyers', icon: Users, path: '/dashboard/admin/users?role=buyer' },
        { name: 'Sellers', icon: Users, path: '/dashboard/admin/users?role=seller' },
        { name: 'Books Inventory', icon: BookOpen, path: '/dashboard/admin/books' },
        // { name: 'Buyer Chats', icon: MessageSquare, path: '/dashboard/admin/messages/buyers' }, // Removed
        { name: 'Seller Chats', icon: MessageSquare, path: '/dashboard/admin/messages/sellers' },
        { name: 'Automation', icon: RefreshCw, path: '/dashboard/admin/automation' }, // New Controller
    ];

    const isActive = (path) => {
        if (path === '/dashboard/admin' && pathname === '/dashboard/admin') return true;
        if (path !== '/dashboard/admin' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar - Desktop */}
            <aside className={`bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0 lg:static lg:block shadow-sm`}>
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <Link href="/dashboard/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800 leading-none">Admin</h1>
                            <span className="text-xs text-amber-600 font-medium tracking-wide">PANEL</span>
                        </div>
                    </Link>
                </div>

                <div className="p-4 py-6 flex flex-col h-[calc(100vh-80px)] justify-between">
                    <nav className="space-y-1">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Main Menu</p>
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                    ? 'bg-amber-50 text-amber-700 font-bold shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-gray-100 pt-6 space-y-2">
                        <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 mb-2">
                            <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{session?.user?.email}</p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition font-medium"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <span className="font-bold text-gray-800">Admin Section</span>
                    </div>
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
                        {session?.user?.name?.[0] || 'A'}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
