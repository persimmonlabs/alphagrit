'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { mockAdminLogin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Admin Login Page
 * Provides authentication interface for Wagner's admin dashboard
 * Uses mock authentication for demo purposes
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mockAdminLogin(email, password)) {
        // Successful login - redirect to admin dashboard
        router.push('/admin');
      } else {
        setError('Invalid email or password. Try: admin@alphagrit.com / password123');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-neutral-900 p-8 rounded-lg shadow-2xl max-w-md w-full border border-neutral-800">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
            ADMIN LOGIN
          </h1>
          <p className="text-neutral-400 font-semibold tracking-wide">
            Wagner&apos;s Command Center
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-2 text-neutral-300">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@alphagrit.com"
              className="w-full bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-primary focus:ring-primary"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold mb-2 text-neutral-300">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-primary focus:ring-primary"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950 border border-red-800 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 transition-all duration-200"
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </Button>
        </form>

        {/* Demo Credentials Info */}
        <div className="mt-8 p-4 bg-black rounded border border-neutral-700">
          <p className="text-xs text-neutral-400 leading-relaxed">
            <strong className="text-primary block mb-2">Demo Credentials:</strong>
            <span className="block">Email: admin@alphagrit.com</span>
            <span className="block">Password: password123</span>
          </p>
          <p className="text-xs text-neutral-500 mt-3 italic">
            Note: This is a demo authentication system. Production version will use secure API endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}
