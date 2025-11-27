'use client';

import React, { useEffect, useState } from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Download, CheckCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  price: number;
  downloadToken: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderSuccessTemplateProps {
  content: Record<string, any>;
  lang: string;
  order: any;
  downloadLinks: any[];
}

export default function OrderSuccessTemplate({
  content,
  lang,
  order: serverOrder,
  downloadLinks: serverDownloadLinks,
}: OrderSuccessTemplateProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Extract orderId from URL (this is a hack since we don't have access to params in template)
    const pathParts = window.location.pathname.split('/');
    const orderId = pathParts[pathParts.length - 1];

    // Try to get order from localStorage
    const ordersKey = 'alphagrit_orders';
    const storedOrders = localStorage.getItem(ordersKey);

    if (storedOrders) {
      try {
        const orders: Order[] = JSON.parse(storedOrders);
        const foundOrder = orders.find((o) => o.id === orderId);

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to parse orders:', error);
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }

    setLoading(false);
  }, []);

  const handleDownload = (downloadToken: string, productName: string) => {
    // In a real application, this would hit a secure API endpoint
    // For this demo, we'll just show an alert
    alert(`Download started for: ${productName}\nToken: ${downloadToken}`);
    console.log(`Mock download: ${productName} with token ${downloadToken}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-body antialiased">
        <AlphaGritNavigation content={content.navigation} currentLang={lang} />
        <main className="container mx-auto px-6 py-12 md:py-24">
          <p className="text-center text-primary">Loading order...</p>
        </main>
        <AlphaGritFooter content={content.footer} />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-black text-white font-body antialiased">
        <AlphaGritNavigation content={content.navigation} currentLang={lang} />
        <main className="container mx-auto px-6 py-12 md:py-24 text-center">
          <h1 className="text-4xl font-heading font-black mb-4 text-red-500">
            {content.orderSuccess?.notFound || 'Order Not Found'}
          </h1>
          <p className="text-neutral-400 mb-6">
            {content.orderSuccess?.notFoundMessage || 'We could not find the order you are looking for.'}
          </p>
          <Link href={`/${lang}/products`}>
            <Button variant="default" size="lg">
              {content.orderSuccess?.continueShopping || 'Continue Shopping'}
            </Button>
          </Link>
        </main>
        <AlphaGritFooter content={content.footer} />
      </div>
    );
  }

  const currencySymbol = order.currency === 'BRL' ? 'R$' : '$';

  return (
    <div className="min-h-screen bg-black text-white font-body antialiased">
      <AlphaGritNavigation content={content.navigation} currentLang={lang} />

      <main className="container mx-auto px-6 py-12 md:py-24">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-4 text-green-500">
            {content.orderSuccess?.title || 'Order Placed Successfully!'}
          </h1>
          <p className="text-neutral-400 text-lg">
            {content.orderSuccess?.thankYou || 'Thank you for your purchase.'}
          </p>
          <p className="text-neutral-500 text-sm mt-2">
            {content.orderSuccess?.confirmationSent || 'A confirmation email has been sent to'}{' '}
            <span className="text-white font-semibold">{order.customerEmail}</span>
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Order Summary Card */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {content.orderSuccess?.orderSummary || 'Order Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-400">{content.orderSuccess?.orderNumber || 'Order Number'}</p>
                  <p className="font-semibold text-lg">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-neutral-400">{content.orderSuccess?.orderDate || 'Order Date'}</p>
                  <p className="font-semibold text-lg">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400">{content.orderSuccess?.customerName || 'Customer Name'}</p>
                  <p className="font-semibold text-lg">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-neutral-400">{content.orderSuccess?.paymentMethod || 'Payment Method'}</p>
                  <p className="font-semibold text-lg capitalize">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="border-t border-neutral-700 pt-4 mt-4">
                <h4 className="font-semibold mb-3 text-lg">
                  {content.orderSuccess?.items || 'Items'} ({order.items.length})
                </h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                      <div>
                        <Link
                          href={`/${lang}/products/${item.productSlug}`}
                          className="hover:underline hover:text-primary"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-sm text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        {currencySymbol}
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-700 pt-4 flex justify-between items-center">
                <span className="text-xl font-bold">{content.orderSuccess?.total || 'Total'}:</span>
                <span className="text-2xl font-bold text-green-500">
                  {currencySymbol}
                  {order.total.toFixed(2)} {order.currency}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Download Links Card */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {content.orderSuccess?.yourDownloads || 'Your Downloads'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-400 text-sm mb-4">
                {content.orderSuccess?.downloadInstructions ||
                  'Click the download button below to access your purchased ebooks. Download links are valid for 7 days.'}
              </p>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-neutral-800 p-4 rounded-md hover:bg-neutral-750 transition-colors"
                >
                  <div className="flex-grow">
                    <p className="font-semibold text-lg">{item.productName}</p>
                    <p className="text-sm text-neutral-400">
                      {content.orderSuccess?.downloadToken || 'Token'}: {item.downloadToken}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {content.orderSuccess?.expiresIn || 'Expires in'}: 7 days
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownload(item.downloadToken, item.productName)}
                    className="ml-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {content.orderSuccess?.download || 'Download'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Email Confirmation Template */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {content.orderSuccess?.emailConfirmation || 'Email Confirmation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-neutral-400">
                {content.orderSuccess?.emailSentTo || 'An email confirmation would be sent to'}:{' '}
                <span className="text-white font-semibold">{order.customerEmail}</span>
              </p>
              <div className="bg-neutral-800 p-4 rounded-md border border-neutral-700">
                <p className="font-semibold mb-2">Subject: Your Order Confirmation - {order.orderNumber}</p>
                <p className="text-neutral-400 leading-relaxed">
                  Dear {order.customerName},<br />
                  <br />
                  Thank you for your purchase! Your order has been successfully processed.
                  <br />
                  <br />
                  Order Number: {order.orderNumber}
                  <br />
                  Total Amount: {currencySymbol}
                  {order.total.toFixed(2)} {order.currency}
                  <br />
                  <br />
                  You can download your purchased ebooks using the links provided in your account dashboard.
                  <br />
                  <br />
                  Best regards,
                  <br />
                  The AlphaGrit Team
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href={`/${lang}/dashboard`}>
              <Button variant="default" size="lg" className="w-full sm:w-auto">
                {content.orderSuccess?.viewLibrary || 'View My Library'}
              </Button>
            </Link>
            <Link href={`/${lang}/products`}>
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                {content.orderSuccess?.continueShopping || 'Continue Shopping'}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <AlphaGritFooter content={content.footer} />
    </div>
  );
}
