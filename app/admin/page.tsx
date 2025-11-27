'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

interface Order {
  id: string;
  customerName: string;
  product: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  date: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Alex Thompson',
    product: 'Python Basics for Beginners',
    amount: 19.99,
    status: 'completed',
    date: '2024-01-25',
  },
  {
    id: 'ORD-002',
    customerName: 'Jordan Martinez',
    product: 'Advanced React Patterns',
    amount: 29.99,
    status: 'completed',
    date: '2024-01-24',
  },
  {
    id: 'ORD-003',
    customerName: 'Casey Lee',
    product: 'Machine Learning Fundamentals',
    amount: 39.99,
    status: 'processing',
    date: '2024-01-24',
  },
  {
    id: 'ORD-004',
    customerName: 'Taylor Swift',
    product: 'Docker & Kubernetes Guide',
    amount: 34.99,
    status: 'pending',
    date: '2024-01-23',
  },
  {
    id: 'ORD-005',
    customerName: 'Morgan Lee',
    product: 'JavaScript Mastery',
    amount: 24.99,
    status: 'completed',
    date: '2024-01-23',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  const totalRevenue = MOCK_ORDERS.reduce((sum, order) => sum + order.amount, 0);
  const totalOrders = MOCK_ORDERS.length;
  const totalCustomers = new Set(MOCK_ORDERS.map(o => o.customerName)).size;
  const totalProducts = MOCK_PRODUCTS.length;

  const topProducts = MOCK_PRODUCTS.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-[#00ff41]';
      case 'processing':
        return 'text-yellow-400';
      case 'pending':
        return 'text-orange-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-neutral-900 border-r border-neutral-800 transition-all duration-300`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#00ff41]">
            {sidebarOpen ? 'AlphaGrit' : 'AG'}
          </h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/admin"
            className="flex items-center px-6 py-3 bg-neutral-800 text-[#00ff41] border-l-4 border-[#00ff41]"
          >
            <span className="text-xl">📊</span>
            {sidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">📚</span>
            {sidebarOpen && <span className="ml-3">Products</span>}
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">🛒</span>
            {sidebarOpen && <span className="ml-3">Orders</span>}
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">👥</span>
            {sidebarOpen && <span className="ml-3">Customers</span>}
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">✍️</span>
            {sidebarOpen && <span className="ml-3">Blog</span>}
          </Link>
          <Link
            href="/admin/settings/general"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">⚙️</span>
            {sidebarOpen && <span className="ml-3">Settings</span>}
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome, Wagner! 👋</h1>
            <p className="text-neutral-400">Here&apos;s what&apos;s happening with your ebook platform</p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#00ff41]">
                  ${totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-neutral-500 mt-2">USD</p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalOrders}</div>
                <p className="text-xs text-neutral-500 mt-2">All time</p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalCustomers}</div>
                <p className="text-xs text-neutral-500 mt-2">Unique customers</p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-400">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalProducts}</div>
                <p className="text-xs text-neutral-500 mt-2">Active ebooks</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Table */}
          <Card className="bg-neutral-900 border-neutral-800 mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                        <td className="py-3 px-4 font-mono">{order.id}</td>
                        <td className="py-3 px-4">{order.customerName}</td>
                        <td className="py-3 px-4 text-neutral-300">{order.product}</td>
                        <td className="py-3 px-4">${order.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-400">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="bg-neutral-900 border-neutral-800 mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#00ff41] text-black rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-neutral-400">{product.author}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#00ff41]">${product.price_usd}</p>
                      <p className="text-xs text-neutral-400">{product.total_reviews} reviews</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/products">
              <Button
                variant="filled"
                className="w-full h-24 text-lg bg-[#00ff41] hover:bg-[#00cc33] text-black"
              >
                📚 Manage Products
              </Button>
            </Link>
            <Link href="/admin/blog">
              <Button
                variant="filled"
                className="w-full h-24 text-lg bg-[#00ff41] hover:bg-[#00cc33] text-black"
              >
                ✍️ Manage Blog
              </Button>
            </Link>
            <Link href="/admin/settings/general">
              <Button
                variant="filled"
                className="w-full h-24 text-lg bg-[#00ff41] hover:bg-[#00cc33] text-black"
              >
                ⚙️ Settings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
