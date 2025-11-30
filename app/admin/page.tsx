'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, CreditCard, Crown, ExternalLink, LogOut } from 'lucide-react';

interface Purchase {
  id: string;
  user_id: string;
  sanity_ebook_id: string;
  amount_paid: number;
  currency: string;
  created_at: string;
  profiles?: { full_name: string | null; email?: string } | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string | null; email?: string } | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPurchases: 0,
    totalSubscriptions: 0,
    totalUsers: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  async function checkAdminAndLoadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/admin/login');
        return;
      }

      setIsAdmin(true);

      // Load purchases with user info
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load subscriptions with user info
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get counts
      const { count: purchaseCount } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true });

      const { count: subscriptionCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate total revenue
      const { data: revenueData } = await supabase
        .from('purchases')
        .select('amount_paid');

      const totalRevenue = (revenueData || []).reduce((sum: number, p: { amount_paid: number }) => sum + (p.amount_paid || 0), 0) / 100;

      setPurchases(purchasesData || []);
      setSubscriptions(subscriptionsData || []);
      setStats({
        totalRevenue,
        totalPurchases: purchaseCount || 0,
        totalSubscriptions: subscriptionCount || 0,
        totalUsers: userCount || 0,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-500">AlphaGrit Admin</h1>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-neutral-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                E-book Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalPurchases}</div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalSubscriptions}</div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Management */}
        <Card className="bg-neutral-900 border-neutral-800 mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              E-book Content Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-400 mb-4">
              E-books and chapters are managed through Sanity Studio, a dedicated content management system.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.sanity.io/manage"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Open Sanity Studio
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="text-sm text-neutral-500 flex items-center">
                Or run locally: <code className="ml-2 px-2 py-1 bg-neutral-800 rounded">npx sanity dev</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Purchases */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl">Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No purchases yet</p>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {purchase.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-500">
                          {purchase.currency === 'BRL' ? 'R$' : '$'}
                          {(purchase.amount_paid / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Subscriptions */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl">Recent Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No subscriptions yet</p>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {sub.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {sub.plan_type} plan
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            sub.status === 'active'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-neutral-700 text-neutral-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-500/50 transition-colors flex items-center gap-3"
          >
            <CreditCard className="w-6 h-6 text-orange-500" />
            <div>
              <p className="font-medium">Stripe Dashboard</p>
              <p className="text-sm text-neutral-400">Manage payments</p>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-neutral-500" />
          </a>

          <a
            href={process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '.supabase.com') || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-500/50 transition-colors flex items-center gap-3"
          >
            <Users className="w-6 h-6 text-orange-500" />
            <div>
              <p className="font-medium">Supabase Dashboard</p>
              <p className="text-sm text-neutral-400">Manage users & data</p>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-neutral-500" />
          </a>

          <Link
            href="/"
            className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-500/50 transition-colors flex items-center gap-3"
          >
            <BookOpen className="w-6 h-6 text-orange-500" />
            <div>
              <p className="font-medium">View Store</p>
              <p className="text-sm text-neutral-400">See public site</p>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-neutral-500" />
          </Link>
        </div>
      </main>
    </div>
  );
}
