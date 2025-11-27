'use client';

import React, { useEffect, useState } from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_slug: string;
    cover_image_url?: string;
    download_url?: string;
  }>;
  total_amount: number;
  currency: string;
  created_at: string;
}

interface DashboardTemplateProps {
  content: Record<string, any>;
  lang: string;
}

export default function DashboardTemplate({ content, lang }: DashboardTemplateProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load orders from localStorage
    try {
      const storedOrders = localStorage.getItem('alphagrit_orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(Array.isArray(parsedOrders) ? parsedOrders : [parsedOrders]);
      }
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dashboardTitle = content.dashboard?.title || 'My Dashboard';
  const myPurchasesText = content.dashboard?.myPurchases || 'My Purchases';
  const myLibraryText = content.dashboard?.myLibrary || 'My Library';
  const noPurchasesText = content.dashboard?.noPurchases || 'No purchases yet. Browse our products to get started.';
  const downloadButtonText = content.dashboard?.downloadButton || 'Download';
  const purchaseDateText = content.dashboard?.purchaseDate || 'Purchased on';
  const orderNumberText = content.dashboard?.orderNumber || 'Order #';
  const viewProductsText = content.dashboard?.viewProducts || 'View Products';

  // Flatten all items from all orders
  const allPurchasedItems = orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      order_date: order.created_at,
      order_number: order.order_number,
    }))
  );

  return (
    <div className="min-h-screen bg-black text-white font-body antialiased">
      <AlphaGritNavigation content={content.navigation} currentLang={lang} />

      <main className="container mx-auto px-6 py-12 md:py-24">
        <h1 className="text-4xl md:text-5xl font-heading font-black mb-12">
          {dashboardTitle}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-neutral-900 border-none">
            <CardContent className="flex flex-col items-center justify-center py-24">
              <div className="text-center max-w-md">
                <svg
                  className="mx-auto h-24 w-24 text-neutral-700 mb-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-2xl font-heading font-bold text-neutral-300 mb-4">
                  {noPurchasesText}
                </h3>
                <Link href={`/${lang}/products`}>
                  <Button className="bg-primary hover:bg-primary/90 text-black font-bold">
                    {viewProductsText}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* My Purchases Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-heading font-bold mb-8">{myPurchasesText}</h2>
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-neutral-900 border-none">
                    <CardHeader>
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-xl font-bold mb-2">
                            {orderNumberText} {order.order_number}
                          </CardTitle>
                          <CardDescription className="text-neutral-400">
                            {purchaseDateText}{' '}
                            {new Date(order.created_at).toLocaleDateString(
                              lang === 'pt' ? 'pt-BR' : 'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {order.currency === 'BRL' ? 'R$' : '$'}{' '}
                            {order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items.map((item) => (
                          <div
                            key={item.product_id}
                            className="flex items-center gap-4 p-4 bg-neutral-800 rounded-lg"
                          >
                            {item.cover_image_url && (
                              <div className="relative w-16 h-20 flex-shrink-0">
                                <Image
                                  src={item.cover_image_url}
                                  alt={item.product_name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  className="rounded"
                                  sizes="64px"
                                />
                              </div>
                            )}
                            <div className="flex-grow min-w-0">
                              <h4 className="font-semibold text-sm truncate mb-2">
                                {item.product_name}
                              </h4>
                              {item.download_url && (
                                <a
                                  href={item.download_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block"
                                >
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs border border-primary text-primary hover:bg-primary hover:text-black"
                                  >
                                    {downloadButtonText}
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* My Library Section */}
            <section>
              <h2 className="text-3xl font-heading font-bold mb-8">{myLibraryText}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {allPurchasedItems.map((item, index) => (
                  <Card
                    key={`${item.product_id}-${index}`}
                    className="bg-neutral-900 border-none group hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="relative w-full aspect-[2/3] overflow-hidden rounded-t-lg">
                      {item.cover_image_url ? (
                        <Image
                          src={item.cover_image_url}
                          alt={item.product_name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                          <span className="text-neutral-600">No Image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-3 line-clamp-2">
                        {item.product_name}
                      </h3>
                      {item.download_url && (
                        <a
                          href={item.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                          >
                            {downloadButtonText}
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <AlphaGritFooter content={content.footer} />
    </div>
  );
}
