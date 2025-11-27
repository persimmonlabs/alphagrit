'use client';

import React, { useState, useEffect } from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import { LandingPageContent, mergeLandingContent } from '@/config/landing-content'; // Assuming content structure
import { Input } from '@/components/ui/input'; // Atomic Input component
import { Button } from '@/components/ui/button'; // Atomic Button component
import { Label } from '@/components/ui/label'; // Added Label component
import { cn } from '@/lib/utils'; // Added cn utility
import Link from 'next/link';
import Image from 'next/image';

// Define interfaces for API data (mirroring what's in page.tsx)
interface Product {
  id: string;
  name: string;
  slug: string;
  description_short?: string;
  description_pt?: string;
  description_en?: string;
  cover_image_url?: string;
  price_brl: number;
  price_usd: number;
  rating: number;
  total_reviews: number;
  category_id?: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
  name_pt?: string;
  name_en?: string;
  slug: string;
}

interface ProductCatalogTemplateProps {
  content: Record<string, any>;
  lang: string;
  products: Product[];
  categories: Category[];
}

export default function ProductCatalogTemplate({
  content,
  lang,
  products,
  categories,
}: ProductCatalogTemplateProps) {
  // Build navigation content structure using the landing content config
  const landingContent = mergeLandingContent(content, lang);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    let currentProducts = products;

    if (selectedCategory) {
      currentProducts = currentProducts.filter(
        (product) => product.category_id === selectedCategory
      );
    }

    if (searchTerm) {
      currentProducts = currentProducts.filter(
        (product) => {
          const searchableName = product.name.toLowerCase();
          const searchableDesc = (
            lang === 'pt' ? product.description_pt : product.description_en
          )?.toLowerCase() || product.description_short?.toLowerCase() || '';

          return (
            searchableName.includes(searchTerm.toLowerCase()) ||
            searchableDesc.includes(searchTerm.toLowerCase())
          );
        }
      );
    }

    setFilteredProducts(currentProducts);
  }, [products, selectedCategory, searchTerm, lang]);

  return (
    <div className="min-h-screen bg-black text-white font-body antialiased">
      <AlphaGritNavigation content={landingContent.navigation} currentLang={lang} />

      <main className="container mx-auto px-6 py-12 md:py-24">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-center mb-12">
          {content.catalog?.title || 'Digital Product Catalog'}
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="md:w-1/4">
            <div className="bg-neutral-900 p-6 rounded-lg shadow-lg">
              <h3 className="font-heading font-bold text-xl mb-4">
                {content.catalog?.filters || 'Filters'}
              </h3>

              {/* Search */}
              <div className="mb-6">
                <Label htmlFor="search" className="mb-2 block">
                  {content.catalog?.search || 'Search Products'}
                </Label>
                <Input
                  id="search"
                  type="text"
                  placeholder={content.catalog?.searchPlaceholder || 'e.g., Next.js, FastAPI'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-heading font-semibold text-lg mb-3">
                  {content.catalog?.categories || 'Categories'}
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className={cn('w-full justify-start', {
                      'bg-primary text-black hover:bg-primary-foreground': selectedCategory === null,
                    })}
                    onClick={() => setSelectedCategory(null)}
                  >
                    {content.catalog?.allCategories || 'All Categories'}
                  </Button>
                  {categories.map((category) => {
                    const categoryName = lang === 'pt'
                      ? (category.name_pt || category.name)
                      : (category.name_en || category.name);

                    return (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className={cn('w-full justify-start', {
                          'bg-primary text-black hover:bg-primary-foreground': selectedCategory === category.id,
                        })}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {categoryName}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Sorting (Placeholder for future implementation) */}
              <div className="mb-6">
                <h4 className="font-heading font-semibold text-lg mb-3">
                  {content.catalog?.sortBy || 'Sort By'}
                </h4>
                <p className="text-neutral-400 text-sm">
                  {content.catalog?.sortingComingSoon || 'Sorting options coming soon.'}
                </p>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="md:w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                // Bilingual description support
                const productDescription = lang === 'pt'
                  ? (product.description_pt || product.description_short)
                  : (product.description_en || product.description_short);

                // Bilingual price display
                const priceDisplay = lang === 'pt'
                  ? `R$ ${product.price_brl.toFixed(2)}`
                  : `$${product.price_usd.toFixed(2)} USD`;

                return (
                  <Link href={`/products/${product.slug}`} key={product.id}>
                    <div className="bg-neutral-900 rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 group">
                      {product.cover_image_url && (
                        <div className="relative w-full h-48">
                          <Image
                            src={product.cover_image_url}
                            alt={product.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col justify-between flex-grow">
                        <div>
                          <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-primary transition-colors duration-300">
                            {product.name}
                          </h3>
                          {productDescription && (
                            <p className="text-neutral-400 text-sm mb-4">
                              {productDescription}
                            </p>
                          )}
                        </div>
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-sm text-neutral-300 mb-2">
                            <span className="font-semibold">
                              {priceDisplay}
                            </span>
                            <span className="flex items-center gap-1">
                              {/* Star Icon for Rating - Placeholder */}
                              ⭐ {product.rating.toFixed(1)} ({product.total_reviews})
                            </span>
                          </div>
                          <Button variant="default" className="w-full">
                            {content.catalog?.viewDetails || 'View Details'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-neutral-400 col-span-full text-center">
                {content.catalog?.noProductsFound || 'No products found matching your criteria.'}
              </p>
            )}
          </section>
        </div>
      </main>

      <AlphaGritFooter content={content.footer} />
    </div>
  );
}
