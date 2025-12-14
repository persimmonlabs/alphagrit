'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Crown,
  Search,
  UserPlus,
  Trash2,
  Check,
  X,
  Gift,
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan_type: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  profiles?: Profile | null;
}

interface UserWithSubscription {
  profile: Profile;
  subscription: Subscription | null;
}

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [grantPlanType, setGrantPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin/login');
        return;
      }

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
      await loadUsers();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadUsers() {
    // Get all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Get all subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*');

    if (profiles) {
      const usersWithSubs: UserWithSubscription[] = profiles.map((profile: Profile) => {
        const subscription = subscriptions?.find(
          (s: Subscription) => s.user_id === profile.id && s.status === 'active'
        ) || subscriptions?.find((s: Subscription) => s.user_id === profile.id) || null;

        return { profile, subscription };
      });
      setUsers(usersWithSubs);
    }
  }

  async function grantSubscription(userId: string, planType: 'monthly' | 'yearly') {
    setIsProcessing(true);
    setMessage(null);

    try {
      // Check if user already has a subscription
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existing) {
        setMessage({ type: 'error', text: 'User already has an active subscription' });
        setIsProcessing(false);
        return;
      }

      // Calculate period end (1 month or 1 year from now)
      const periodEnd = new Date();
      if (planType === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Insert manual subscription (use 'manual_grant_' prefix for stripe_subscription_id)
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_subscription_id: `manual_grant_${Date.now()}`,
          plan_type: planType,
          status: 'active',
          current_period_end: periodEnd.toISOString(),
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Subscription granted successfully!' });
      await loadUsers();
      setShowGrantModal(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error('Error granting subscription:', error);
      setMessage({ type: 'error', text: 'Failed to grant subscription' });
    } finally {
      setIsProcessing(false);
    }
  }

  async function revokeSubscription(subscriptionId: string) {
    if (!confirm('Are you sure you want to revoke this subscription?')) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('id', subscriptionId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Subscription revoked successfully!' });
      await loadUsers();
    } catch (error) {
      console.error('Error revoking subscription:', error);
      setMessage({ type: 'error', text: 'Failed to revoke subscription' });
    } finally {
      setIsProcessing(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const name = u.profile.full_name?.toLowerCase() || '';
    const id = u.profile.id.toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || id.includes(search);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 p-4">
        <div className="container mx-auto">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            <Crown className="w-6 h-6" />
            Subscription Management
          </h1>
          <p className="text-neutral-400 mt-1">
            Grant or revoke user subscriptions manually
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500 text-green-500'
                : 'bg-red-500/10 border border-red-500 text-red-500'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              type="text"
              placeholder="Search by name or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-900 border-neutral-700"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <p className="text-sm text-neutral-400">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <p className="text-sm text-neutral-400">Active Subscriptions</p>
              <p className="text-2xl font-bold text-green-500">
                {users.filter((u) => u.subscription?.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <p className="text-sm text-neutral-400">Manual Grants</p>
              <p className="text-2xl font-bold text-purple-500">
                {users.filter((u) =>
                  u.subscription?.stripe_subscription_id?.startsWith('manual_grant_')
                ).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <p className="text-sm text-neutral-400">No Subscription</p>
              <p className="text-2xl font-bold text-neutral-500">
                {users.filter((u) => !u.subscription || u.subscription.status !== 'active').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">User</th>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Plan</th>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Expires</th>
                    <th className="text-left p-3 text-sm font-medium text-neutral-400">Type</th>
                    <th className="text-right p-3 text-sm font-medium text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isActive = u.subscription?.status === 'active';
                    const isManual = u.subscription?.stripe_subscription_id?.startsWith('manual_grant_');

                    return (
                      <tr key={u.profile.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="p-3">
                          <p className="font-medium">{u.profile.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-neutral-500 font-mono">{u.profile.id.slice(0, 8)}...</p>
                        </td>
                        <td className="p-3">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
                              <Check className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-neutral-700 text-neutral-400">
                              <X className="w-3 h-3" />
                              None
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {u.subscription?.plan_type || '-'}
                        </td>
                        <td className="p-3 text-sm text-neutral-400">
                          {u.subscription?.current_period_end
                            ? new Date(u.subscription.current_period_end).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="p-3">
                          {isManual ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                              <Gift className="w-3 h-3" />
                              Manual
                            </span>
                          ) : isActive ? (
                            <span className="text-xs text-neutral-400">Stripe</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revokeSubscription(u.subscription!.id)}
                              disabled={isProcessing}
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Revoke
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(u.profile.id);
                                setShowGrantModal(true);
                              }}
                              disabled={isProcessing}
                              className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Grant
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Grant Modal */}
        {showGrantModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="bg-neutral-900 border-neutral-700 w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  Grant Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-400">
                  This will manually grant access without requiring Stripe payment.
                </p>

                <div>
                  <Label>Plan Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="planType"
                        value="monthly"
                        checked={grantPlanType === 'monthly'}
                        onChange={() => setGrantPlanType('monthly')}
                        className="accent-orange-500"
                      />
                      <span>Monthly (1 month)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="planType"
                        value="yearly"
                        checked={grantPlanType === 'yearly'}
                        onChange={() => setGrantPlanType('yearly')}
                        className="accent-orange-500"
                      />
                      <span>Yearly (1 year)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowGrantModal(false);
                      setSelectedUserId(null);
                    }}
                    disabled={isProcessing}
                    className="flex-1 border border-neutral-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedUserId && grantSubscription(selectedUserId, grantPlanType)}
                    disabled={isProcessing}
                    className="flex-1 bg-purple-500 hover:bg-purple-600"
                  >
                    {isProcessing ? 'Granting...' : 'Grant Access'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
