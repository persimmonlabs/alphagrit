'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

interface CartItem {
  productId: string;
  quantity: number;
}

interface ShoppingCartTemplateProps {
  content: Record<string, any>;
  lang: string;
  initialCartItems: any[];
  userId: string;
}

export default function ShoppingCartTemplate({
  content,
  lang,
  initialCartItems,
  userId,
}: ShoppingCartTemplateProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const cartKey = 'alphagrit_cart';
    const storedCart = localStorage.getItem(cartKey);
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart:', error);
        setCart([]);
      }
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('alphagrit_cart', JSON.stringify(cart));
    }
  }, [cart, loading]);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  const handleIncrement = useCallback((productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const handleDecrement = useCallback((productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  }, []);

  // Get product details and calculate totals
  const cartWithDetails = useMemo(() => {
    return cart.map((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      return {
        ...item,
        product,
      };
    });
  }, [cart]);

  const subtotal = useMemo(() => {
    return cartWithDetails.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = lang === 'pt' ? item.product.price_brl : item.product.price_usd;
      return sum + price * item.quantity;
    }, 0);
  }, [cartWithDetails, lang]);

  const currency = lang === 'pt' ? 'BRL' : 'USD';
  const currencySymbol = lang === 'pt' ? 'R$' : '$';

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-body antialiased">
        <AlphaGritNavigation content={content.navigation} currentLang={lang} />
        <main className="container mx-auto px-6 py-12 md:py-24">
          <p className="text-center text-primary">Loading cart...</p>
        </main>
        <AlphaGritFooter content={content.footer} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-body antialiased">
      <AlphaGritNavigation content={content.navigation} currentLang={lang} />

      <main className="container mx-auto px-6 py-12 md:py-24">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-center mb-12">
          {content.cart?.title || 'Your Shopping Cart'}
        </h1>

        {cart.length === 0 ? (
          <div className="text-center text-neutral-400 text-lg">
            <p className="mb-4">{content.cart?.emptyCart || 'Your cart is empty.'}</p>
            <Link href={`/${lang}/products`} className="text-primary hover:underline">
              {content.cart?.shopNow || 'Shop Now'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <section className="lg:col-span-2 space-y-6">
              {cartWithDetails.map((item) => {
                if (!item.product) return null;
                const price = lang === 'pt' ? item.product.price_brl : item.product.price_usd;

                return (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row items-start sm:items-center bg-neutral-900 p-4 rounded-lg shadow-lg gap-4"
                  >
                    <div className="relative w-24 h-32 shrink-0">
                      {item.product.cover_image_url ? (
                        <Image
                          src={item.product.cover_image_url}
                          alt={item.product.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-md"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-neutral-800 rounded-md text-neutral-600 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <Link
                        href={`/${lang}/products/${item.product.slug}`}
                        className="text-lg font-semibold hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-neutral-400 text-sm mt-1">
                        {item.product.description_short}
                      </p>
                      <p className="text-white font-bold mt-2">
                        {currencySymbol}
                        {price.toFixed(2)} {currency}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="flex items-center gap-2 bg-neutral-800 rounded-md p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDecrement(item.productId)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleIncrement(item.productId)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <Trash2 className="h-5 w-5 text-neutral-400 hover:text-red-500 transition-colors" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Order Summary */}
            <aside className="lg:col-span-1">
              <div className="bg-neutral-900 p-6 rounded-lg shadow-lg space-y-4 sticky top-6">
                <h3 className="font-heading font-bold text-xl mb-2">
                  {content.cart?.orderSummary || 'Order Summary'}
                </h3>
                <div className="flex justify-between text-neutral-300">
                  <span>{content.cart?.subtotal || 'Subtotal'}:</span>
                  <span>
                    {currencySymbol}
                    {subtotal.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>{content.cart?.tax || 'Tax'}:</span>
                  <span>{content.cart?.calculated || 'Calculated at checkout'}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-neutral-700 pt-4">
                  <span>{content.cart?.total || 'Total'}:</span>
                  <span>
                    {currencySymbol}
                    {subtotal.toFixed(2)} {currency}
                  </span>
                </div>
                <Link href={`/${lang}/checkout`}>
                  <Button variant="default" size="lg" className="w-full mt-4">
                    {content.cart?.proceedToCheckout || 'Proceed to Checkout'}
                  </Button>
                </Link>
                <Link href={`/${lang}/products`}>
                  <Button variant="ghost" size="lg" className="w-full">
                    {content.cart?.continueShopping || 'Continue Shopping'}
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>

      <AlphaGritFooter content={content.footer} />
    </div>
  );
}
