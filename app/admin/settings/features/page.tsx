'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FeatureFlags {
  enableBlog: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableAffiliateProgram: boolean;
  enableNewsletter: boolean;
  enableLiveChat: boolean;
  enableSocialLogin: boolean;
  enableCourseRecommendations: boolean;
}

export default function FeaturesSettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [features, setFeatures] = useState<FeatureFlags>({
    enableBlog: true,
    enableReviews: true,
    enableWishlist: true,
    enableAffiliateProgram: false,
    enableNewsletter: true,
    enableLiveChat: false,
    enableSocialLogin: true,
    enableCourseRecommendations: true,
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
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

  const handleToggle = (feature: keyof FeatureFlags) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const handleSave = () => {
    console.log('Saving feature flags:', features);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const featuresList = [
    {
      key: 'enableBlog' as keyof FeatureFlags,
      title: 'Blog',
      description: 'Enable blog posts and articles section',
      icon: '✍️',
    },
    {
      key: 'enableReviews' as keyof FeatureFlags,
      title: 'Product Reviews',
      description: 'Allow customers to leave product reviews and ratings',
      icon: '⭐',
    },
    {
      key: 'enableWishlist' as keyof FeatureFlags,
      title: 'Wishlist',
      description: 'Let users save products to their wishlist',
      icon: '❤️',
    },
    {
      key: 'enableAffiliateProgram' as keyof FeatureFlags,
      title: 'Affiliate Program',
      description: 'Enable affiliate marketing and referral system',
      icon: '🤝',
    },
    {
      key: 'enableNewsletter' as keyof FeatureFlags,
      title: 'Newsletter',
      description: 'Email newsletter subscription and campaigns',
      icon: '📧',
    },
    {
      key: 'enableLiveChat' as keyof FeatureFlags,
      title: 'Live Chat',
      description: 'Real-time customer support chat widget',
      icon: '💬',
    },
    {
      key: 'enableSocialLogin' as keyof FeatureFlags,
      title: 'Social Login',
      description: 'Allow login with Google, Facebook, and GitHub',
      icon: '🔐',
    },
    {
      key: 'enableCourseRecommendations' as keyof FeatureFlags,
      title: 'Course Recommendations',
      description: 'AI-powered product recommendations based on user behavior',
      icon: '🎯',
    },
  ];

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#00ff41]">AlphaGrit</h1>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors">
            <span className="text-xl">📊</span>
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors">
            <span className="text-xl">📚</span>
            <span className="ml-3">Products</span>
          </Link>
          <Link href="/admin/blog" className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors">
            <span className="text-xl">✍️</span>
            <span className="ml-3">Blog</span>
          </Link>
          <Link
            href="/admin/settings/general"
            className="flex items-center px-6 py-3 bg-neutral-800 text-[#00ff41] border-l-4 border-[#00ff41]"
          >
            <span className="text-xl">⚙️</span>
            <span className="ml-3">Settings</span>
          </Link>
        </nav>
        <div className="mt-6 px-6">
          <p className="text-xs text-neutral-500 uppercase mb-2">Settings</p>
          <Link
            href="/admin/settings/general"
            className="block py-2 px-3 text-neutral-400 hover:bg-neutral-800 rounded mb-2"
          >
            General
          </Link>
          <Link
            href="/admin/settings/features"
            className="block py-2 px-3 bg-neutral-800 text-[#00ff41] rounded"
          >
            Features
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Feature Flags</h1>
            <p className="text-neutral-400">Enable or disable platform features</p>
          </div>

          <Card className="bg-neutral-900 border-neutral-800 mb-6">
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription className="text-neutral-400">
                Toggle features on or off to customize your platform&apos;s functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuresList.map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-800/80 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-3xl">{feature.icon}</span>
                    <div className="flex-1">
                      <Label htmlFor={feature.key} className="text-white font-medium cursor-pointer">
                        {feature.title}
                      </Label>
                      <p className="text-sm text-neutral-400 mt-1">{feature.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={feature.key}
                    checked={features[feature.key]}
                    onCheckedChange={() => handleToggle(feature.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Features Summary */}
          <Card className="bg-neutral-900 border-neutral-800 mb-6">
            <CardHeader>
              <CardTitle>Active Features Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {featuresList
                  .filter((f) => features[f.key])
                  .map((feature) => (
                    <span
                      key={feature.key}
                      className="px-3 py-1 bg-[#00ff41]/20 text-[#00ff41] rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{feature.icon}</span>
                      {feature.title}
                    </span>
                  ))}
              </div>
              {featuresList.filter((f) => features[f.key]).length === 0 && (
                <p className="text-neutral-400">No features enabled</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 items-center">
            <Button
              onClick={handleSave}
              variant="filled"
              className="bg-[#00ff41] hover:bg-[#00cc33] text-black"
            >
              Save Changes
            </Button>
            {isSaved && (
              <p className="text-[#00ff41] flex items-center gap-2">
                <span>✓</span> Feature flags saved successfully!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
