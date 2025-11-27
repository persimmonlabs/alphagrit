'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client'; // Client-side API client
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast'; // Assuming a toast notification system

// Define interface for API data (mirroring what's in page.tsx)
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferred_language?: string;
  preferred_currency?: string;
}

interface UserProfileTemplateProps {
  content: Record<string, any>;
  lang: string;
  userProfile: UserProfile;
}

export default function UserProfileTemplate({
  content,
  lang,
  userProfile: initialUserProfile,
}: UserProfileTemplateProps) {
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile((prevProfile) => ({ ...prevProfile, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setUserProfile((prevProfile) => ({ ...prevProfile, [id]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = await apiClient.patch<UserProfile>(
        `/users/${userProfile.id}`,
        {
          full_name: userProfile.full_name,
          email: userProfile.email,
          avatar_url: userProfile.avatar_url,
          preferred_language: userProfile.preferred_language,
          preferred_currency: userProfile.preferred_currency,
        }
      );
      setUserProfile(updatedProfile); // Update state with the response from the API
      toast({
        title: content.profile?.updateSuccess || "Profile updated successfully!",
        description: content.profile?.updateSuccessDesc || "Your profile information has been saved.",
      });
    } catch (err: any) {
      setError(err.message || content.profile?.updateError || 'Failed to update profile.');
      toast({
        title: content.profile?.updateErrorTitle || "Profile Update Failed",
        description: error,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-heading font-black mb-6">
        {content.profile?.title || 'My Profile'}
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            {userProfile.avatar_url ? (
              <Image src={userProfile.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-neutral-800 text-neutral-500 text-lg">
                {userProfile.full_name ? userProfile.full_name[0] : 'U'}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="avatar_url" className="mb-1 block">
              {content.profile?.avatarUrl || 'Avatar URL'}
            </Label>
            <Input
              id="avatar_url"
              type="text"
              value={userProfile.avatar_url || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="full_name" className="mb-1 block">
            {content.profile?.fullName || 'Full Name'}
          </Label>
          <Input
            id="full_name"
            type="text"
            value={userProfile.full_name || ''}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="email" className="mb-1 block">
            {content.profile?.email || 'Email'}
          </Label>
          <Input
            id="email"
            type="email"
            value={userProfile.email}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>

        <div>
          <Label htmlFor="preferred_language" className="mb-1 block">
            {content.profile?.preferredLanguage || 'Preferred Language'}
          </Label>
          <Select
            value={userProfile.preferred_language || lang}
            onValueChange={(value) => handleSelectChange('preferred_language', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={content.profile?.selectLanguage || 'Select a language'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preferred_currency" className="mb-1 block">
            {content.profile?.preferredCurrency || 'Preferred Currency'}
          </Label>
          <Select
            value={userProfile.preferred_currency || 'USD'}
            onValueChange={(value: string) => handleSelectChange('preferred_currency', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={content.profile?.selectCurrency || 'Select a currency'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="BRL">BRL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (content.profile?.saving || 'Saving...') : (content.profile?.saveChanges || 'Save Changes')}
        </Button>
      </form>
    </div>
  );
}
