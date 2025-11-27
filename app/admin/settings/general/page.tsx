'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MOCK_SITE_SETTINGS } from '@/lib/mock-data';

export default function GeneralSettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    supportEmail: '',
    primaryColor: '#00ff41',
    secondaryColor: '#000000',
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

  useEffect(() => {
    // Load current settings
    const siteNameSetting = MOCK_SITE_SETTINGS.find((s) => s.key === 'site_name');
    const siteDescSetting = MOCK_SITE_SETTINGS.find((s) => s.key === 'site_description');
    const supportEmailSetting = MOCK_SITE_SETTINGS.find((s) => s.key === 'support_email');

    setFormData({
      siteName: siteNameSetting?.value || 'AlphaGrit',
      siteDescription: siteDescSetting?.value || '',
      supportEmail: supportEmailSetting?.value || '',
      primaryColor: '#00ff41',
      secondaryColor: '#000000',
    });
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving general settings:', formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

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
            className="block py-2 px-3 bg-neutral-800 text-[#00ff41] rounded mb-2"
          >
            General
          </Link>
          <Link
            href="/admin/settings/features"
            className="block py-2 px-3 text-neutral-400 hover:bg-neutral-800 rounded"
          >
            Features
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">General Settings</h1>
            <p className="text-neutral-400">Configure your site&apos;s basic information and appearance</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-neutral-900 border-neutral-800 mb-6">
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Site Name */}
                <div>
                  <Label htmlFor="siteName" className="text-white">Site Name</Label>
                  <Input
                    id="siteName"
                    type="text"
                    required
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="AlphaGrit"
                  />
                </div>

                {/* Site Description */}
                <div>
                  <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    required
                    value={formData.siteDescription}
                    onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Premium programming courses and resources for developers"
                    rows={3}
                  />
                </div>

                {/* Support Email */}
                <div>
                  <Label htmlFor="supportEmail" className="text-white">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    required
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="support@alphagrit.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 mb-6">
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Color */}
                <div>
                  <Label htmlFor="primaryColor" className="text-white">Primary Color</Label>
                  <div className="flex gap-4 items-center mt-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-20 h-12 bg-neutral-800 border-neutral-700 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                      placeholder="#00ff41"
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">
                    Used for buttons, links, and accent elements
                  </p>
                </div>

                {/* Secondary Color */}
                <div>
                  <Label htmlFor="secondaryColor" className="text-white">Secondary Color</Label>
                  <div className="flex gap-4 items-center mt-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-20 h-12 bg-neutral-800 border-neutral-700 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">
                    Used for backgrounds and secondary elements
                  </p>
                </div>

                {/* Preview */}
                <div>
                  <Label className="text-white">Color Preview</Label>
                  <div className="mt-2 p-6 bg-neutral-800 rounded-lg">
                    <div className="flex gap-4 items-center">
                      <div
                        className="w-16 h-16 rounded"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                      <div>
                        <p className="font-medium">Primary Color</p>
                        <p className="text-sm text-neutral-400">{formData.primaryColor}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center mt-4">
                      <div
                        className="w-16 h-16 rounded border border-neutral-600"
                        style={{ backgroundColor: formData.secondaryColor }}
                      />
                      <div>
                        <p className="font-medium">Secondary Color</p>
                        <p className="text-sm text-neutral-400">{formData.secondaryColor}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 items-center">
              <Button
                type="submit"
                variant="filled"
                className="bg-[#00ff41] hover:bg-[#00cc33] text-black"
              >
                Save Changes
              </Button>
              {isSaved && (
                <p className="text-[#00ff41] flex items-center gap-2">
                  <span>✓</span> Settings saved successfully!
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
