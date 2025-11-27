'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CheckoutTemplateProps {
  content: Record<string, any>;
  lang: string;
  cartItems: any[];
  currentUser: any;
}

export default function CheckoutTemplate({
  content,
  lang,
  cartItems,
  currentUser,
}: CheckoutTemplateProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [currency, setCurrency] = useState<'USD' | 'BRL'>(lang === 'pt' ? 'BRL' : 'USD');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const price = currency === 'BRL' ? item.product.price_brl : item.product.price_usd;
      return sum + price * item.quantity;
    }, 0);
  }, [cartWithDetails, currency]);

  const currencySymbol = currency === 'BRL' ? 'R$' : '$';

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError(content.checkout?.emptyCartError || 'Your cart is empty.');
      return;
    }

    if (!customerName.trim()) {
      setError(content.checkout?.nameRequired || 'Please enter your full name.');
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError(content.checkout?.emailInvalid || 'Please enter a valid email address.');
      return;
    }

    if (!acceptedTerms) {
      setError(content.checkout?.termsRequired || 'Please accept the Terms of Service.');
      return;
    }

    setProcessing(true);

    // Generate mock order
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const orderDate = new Date().toISOString();

    // Create order object
    const order = {
      id: orderId,
      orderNumber: orderId,
      customerEmail,
      customerName,
      total: subtotal,
      currency,
      paymentMethod,
      status: 'paid',
      createdAt: orderDate,
      items: cartWithDetails
        .filter((item) => item.product)
        .map((item) => ({
          id: `item_${Math.random().toString(36).substring(2, 9)}`,
          productId: item.productId,
          productName: item.product!.name,
          productSlug: item.product!.slug,
          quantity: item.quantity,
          price: currency === 'BRL' ? item.product!.price_brl : item.product!.price_usd,
          downloadToken: `DL_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        })),
    };

    // Store order in localStorage
    const ordersKey = 'alphagrit_orders';
    const existingOrders = localStorage.getItem(ordersKey);
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    orders.push(order);
    localStorage.setItem(ordersKey, JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem('alphagrit_cart');

    // Simulate payment processing delay
    setTimeout(() => {
      setProcessing(false);
      router.push(`/${lang}/order-success/${orderId}`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-body antialiased">
        <AlphaGritNavigation content={content.navigation} currentLang={lang} />
        <main className="container mx-auto px-6 py-12 md:py-24">
          <p className="text-center text-primary">Loading...</p>
        </main>
        <AlphaGritFooter content={content.footer} />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white font-body antialiased">
        <AlphaGritNavigation content={content.navigation} currentLang={lang} />
        <main className="container mx-auto px-6 py-12 md:py-24 text-center">
          <h1 className="text-4xl font-heading font-black mb-4">
            {content.checkout?.title || 'Checkout'}
          </h1>
          <p className="text-neutral-400 mb-6">
            {content.checkout?.emptyCartMessage || 'Your cart is empty. Please add items to your cart before checking out.'}
          </p>
          <Link href={`/${lang}/products`} className="text-primary hover:underline">
            {content.checkout?.shopNow || 'Continue Shopping'}
          </Link>
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
          {content.checkout?.title || 'Checkout'}
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Customer Information */}
            <section className="bg-neutral-900 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-heading font-bold mb-6">
                {content.checkout?.customerInfo || 'Customer Information'}
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName" className="mb-2 block">
                    {content.checkout?.yourName || 'Full Name'} *
                  </Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail" className="mb-2 block">
                    {content.checkout?.yourEmail || 'Email Address'} *
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Currency Selection */}
                <div>
                  <Label htmlFor="currency" className="mb-2 block">
                    {content.checkout?.currency || 'Currency'}
                  </Label>
                  <Select value={currency} onValueChange={(value: 'USD' | 'BRL') => setCurrency(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-xl font-heading font-bold mb-3">
                    {content.checkout?.paymentMethod || 'Payment Method'}
                  </h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value: 'card' | 'paypal') => setPaymentMethod(value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="cursor-pointer">
                        {content.checkout?.creditCard || 'Credit Card'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="cursor-pointer">
                        PayPal
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Terms Acceptance */}
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    {content.checkout?.termsLabel || 'I accept the'}{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      {content.checkout?.termsOfService || 'Terms of Service'}
                    </Link>
                  </Label>
                </div>
              </div>
            </section>

            {/* Order Summary & Payment */}
            <section className="bg-neutral-900 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-heading font-bold mb-6">
                {content.checkout?.orderSummary || 'Order Summary'}
              </h2>
              <div className="space-y-3 mb-6">
                {cartWithDetails.map((item) => {
                  if (!item.product) return null;
                  const price = currency === 'BRL' ? item.product.price_brl : item.product.price_usd;

                  return (
                    <div key={item.productId} className="flex justify-between items-center text-neutral-300">
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>
                        {currencySymbol}
                        {(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-neutral-700 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-neutral-300">
                  <span>{content.checkout?.subtotal || 'Subtotal'}:</span>
                  <span>
                    {currencySymbol}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>{content.checkout?.tax || 'Tax'}:</span>
                  <span>{content.checkout?.included || 'Included'}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold border-t border-neutral-700 pt-4">
                  <span>{content.checkout?.total || 'Total'}:</span>
                  <span>
                    {currencySymbol}
                    {subtotal.toFixed(2)} {currency}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md mb-4">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full"
                disabled={processing}
              >
                {processing
                  ? (content.checkout?.processing || 'Processing...')
                  : paymentMethod === 'card'
                  ? (content.checkout?.payWithCard || 'Pay with Card')
                  : (content.checkout?.payWithPayPal || 'Pay with PayPal')}
              </Button>

              <p className="text-neutral-400 text-xs text-center mt-4">
                {content.checkout?.secureCheckout || 'Your payment information is secure and encrypted.'}
              </p>
            </section>
          </div>
        </form>
      </main>

      <AlphaGritFooter content={content.footer} />
    </div>
  );
}
