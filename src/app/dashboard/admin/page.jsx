'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TrendingUp, Users, BookOpen, Clock, ArrowUpRight, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalSale: 0,
    totalUsers: 0,
    totalBooks: 0,
    activeOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initDashboard() {
      try {
        // Parallel fetch for dashboard data
        const [ordersRes, usersRes, booksRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/users'),
          fetch('/api/admin/books')
        ]);

        if (ordersRes.ok && usersRes.ok && booksRes.ok) {
          const orders = await ordersRes.json();
          const users = await usersRes.json();
          const books = await booksRes.json();

          // Calculate Stats
          // FIX: Total Sale should only include COMPLETED or ACCEPTED orders (Revenue), not cancelled or pending.
          const totalSale = orders
            .filter(o => o.status === 'delivered' || o.status === 'accepted')
            .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

          // Active Orders: Needs Action (Pending)
          const activeOrders = orders.filter(o => o.status === 'pending').length;

          setStats({
            totalSale,
            totalUsers: users.length,
            totalBooks: books.length,
            activeOrders
          });

          // Get recent 5 orders
          setRecentOrders(orders.slice(0, 5));
        }
      } catch (e) {
        console.error("Dashboard init error", e);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {trend && <p className="text-green-600 text-xs font-bold flex items-center gap-1 mt-2"><ArrowUpRight className="w-3 h-3" /> {trend}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform origin-bottom-right"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
          <p className="text-amber-100 max-w-xl">Here is your daily control center. You have <span className="font-bold text-white">{stats.activeOrders} pending orders</span> requiring your attention today.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* <StatCard title="Total Revenue" value={`Rs. ${stats.totalSale.toLocaleString()}`} icon={DollarSign} color="bg-green-500" trend="+12% this week" /> */}
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" trend="+5 new today" />
          <StatCard title="Books Inventory" value={stats.totalBooks} icon={BookOpen} color="bg-purple-500" />
          <StatCard title="Pending Orders" value={stats.activeOrders} icon={Clock} color="bg-amber-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Recent Orders</h3>
            <Link href="/dashboard/admin/orders" className="text-amber-600 text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-amber-50 transition border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-600 font-bold border border-gray-100">
                    #{order.id}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 line-clamp-1">{order.book?.title}</p>
                    <p className="text-xs text-gray-500">{order.buyer?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">Rs. {order.totalAmount || order.book?.price}</p>
                  <p className="text-xs text-amber-600 font-medium capitalize">{order.status}</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="text-gray-400 text-center py-4">No recent activity.</p>}
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-6">System Health</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Server Status</span>
              <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Database</span>
              <span className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-1 rounded">Connected</span>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-gray-800 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/admin/users" className="p-3 bg-gray-50 rounded-lg text-center text-xs font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition">Add User</Link>
                <Link href="/dashboard/admin/books" className="p-3 bg-gray-50 rounded-lg text-center text-xs font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition">Review Books</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
