'use client';

import React, { useState } from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { Rating } from '@/components/ui/rating'; // Assuming a Rating component is available
import { apiClient } from '@/lib/api-client'; // Client-side API client

// Define interfaces for API data (mirroring what's in page.tsx)
interface Product {
  id: string;
  name: string;
  slug: string;
  description_short?: string;
  description_full?: string;
  cover_image_url?: string;
  file_url?: string;
  file_size_bytes?: number;
  file_format?: string;
  author?: string;
  pages?: number;
  price_brl: number;
  price_usd: number;
  rating: number;
  total_reviews: number;
  category_id?: string;
  status: string;
}

interface Review {
  id: string;
  user_id?: string;
  product_id?: string;
  title?: string;
  content: string;
  rating: number;
  reviewer_name?: string;
  reviewer_avatar_url?: string;
  is_approved: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

interface ProductDetailPageTemplateProps {
  content: Record<string, any>;
  lang: string;
  product: Product;
  reviews: Review[];
  currentUser: UserProfile | null;
}

export default function ProductDetailPageTemplate({
  content,
  lang,
  product,
  reviews,
  currentUser,
}: ProductDetailPageTemplateProps) {
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const handleAddToCart = () => {
    setAddingToCart(true);
    setCartSuccess(false);

    try {
      // Get existing cart from localStorage
      const cartKey = 'alphagrit_cart';
      const existingCart = localStorage.getItem(cartKey);
      let cart: Array<{ productId: string; quantity: number }> = existingCart
        ? JSON.parse(existingCart)
        : [];

      // Check if product already in cart
      const existingItemIndex = cart.findIndex((item) => item.productId === product.id);

      if (existingItemIndex >= 0) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new item
        cart.push({ productId: product.id, quantity: 1 });
      }

      // Save to localStorage
      localStorage.setItem(cartKey, JSON.stringify(cart));
      setCartSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    if (reviewRating === 0) {
      setReviewError('Please provide a rating.');
      setSubmittingReview(false);
      return;
    }

    if (!reviewContent.trim()) {
      setReviewError('Please provide review content.');
      setSubmittingReview(false);
      return;
    }

    // This assumes currentUser is available and has an ID
    const userId = currentUser?.id || 'anonymous'; // Fallback for anonymous reviews if API supports

    try {
      const newReview = await apiClient.post<Review>(`/reviews/reviews/`, {
        product_id: product.id,
        user_id: userId,
        content: reviewContent,
        rating: reviewRating,
        // Assuming reviewer_name and reviewer_avatar_url can be derived or are optional
        reviewer_name: currentUser?.full_name || 'Anonymous User',
        is_approved: false, // Reviews should typically be unapproved by default
      });

      // Optimistically update UI or re-fetch reviews
      // For simplicity, we'll just show success message
      setReviewSuccess(true);
      setReviewContent('');
      setReviewRating(0);
    } catch (error: any) {
      setReviewError(error.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formattedPrice = product.price_usd ? `$${product.price_usd.toFixed(2)} USD` : '';
  const fileSizeMB = product.file_size_bytes ? (product.file_size_bytes / (1024 * 1024)).toFixed(2) : 'N/A';

  return (
    <div className="min-h-screen bg-black text-white font-body antialiased">
      <AlphaGritNavigation content={content.navigation} currentLang={lang} />

      <main className="container mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-lg bg-neutral-900 rounded-lg overflow-hidden aspect-video">
              {product.cover_image_url ? (
                <Image src={product.cover_image_url} alt={product.name} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-600">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-start space-y-6">
            <h1 className="text-4xl md:text-5xl font-heading font-black">
              {product.name}
            </h1>
            {product.description_full && (
              <p className="text-neutral-300 text-lg leading-relaxed">
                {product.description_full}
              </p>
            )}

            <div className="flex items-center gap-4 text-neutral-400">
              <span className="text-xl font-bold">{formattedPrice}</span>
              {product.total_reviews > 0 && (
                <span className="flex items-center gap-1">
                  <Rating value={product.rating} max={5} readOnly={true} />
                  ({product.total_reviews} reviews)
                </span>
              )}
            </div>

            {/* Product Metadata */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-400">
              {product.author && (
                <>
                  <span className="font-semibold">Author:</span>
                  <span>{product.author}</span>
                </>
              )}
              {product.pages && (
                <>
                  <span className="font-semibold">Pages:</span>
                  <span>{product.pages}</span>
                </>
              )}
              {product.file_format && (
                <>
                  <span className="font-semibold">Format:</span>
                  <span>{product.file_format.toUpperCase()}</span>
                </>
              )}
              {product.file_size_bytes && (
                <>
                  <span className="font-semibold">File Size:</span>
                  <span>{fileSizeMB} MB</span>
                </>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-2">
              <Button
                variant="default"
                size="lg"
                className="w-full md:w-auto"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : (content.productDetail?.addToCart || 'Add to Cart')}
              </Button>
              {cartSuccess && (
                <p className="text-green-500 text-sm">
                  {content.productDetail?.addedToCart || 'Added to cart successfully!'}
                </p>
              )}
              {/* If product has a file_url and is active, maybe show a "Preview" button or similar */}
              {product.file_url && product.status === 'active' && (
                <Button variant="ghost" size="lg" className="w-full md:w-auto mt-2">
                  {content.productDetail?.preview || 'Preview Digital Product'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-24">
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-8">
            {content.productDetail?.customerReviews || 'Customer Reviews'} ({reviews.length})
          </h2>

          {/* Submit Review Form */}
          <div className="bg-neutral-900 p-8 rounded-lg shadow-lg mb-12">
            <h3 className="text-2xl font-heading font-bold mb-6">
              {content.productDetail?.submitReview || 'Submit Your Review'}
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <Label htmlFor="review-rating" className="mb-2 block">
                  {content.productDetail?.yourRating || 'Your Rating'}
                </Label>
                <Rating value={reviewRating} onChange={setReviewRating} max={5} />
              </div>
              <div>
                <Label htmlFor="review-content" className="mb-2 block">
                  {content.productDetail?.yourReview || 'Your Review'}
                </Label>
                <Textarea
                  id="review-content"
                  placeholder={content.productDetail?.reviewPlaceholder || 'Share your thoughts on this product...'}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows={5}
                />
              </div>
              {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
              {reviewSuccess && <p className="text-green-500 text-sm">Review submitted successfully! It will appear after moderation.</p>}
              <Button type="submit" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : (content.productDetail?.submit || 'Submit Review')}
              </Button>
            </form>
          </div>

          {/* List of Reviews */}
          <div className="space-y-8">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-neutral-900 p-6 rounded-lg shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Rating value={review.rating} max={5} readOnly={true} />
                    <span className="text-neutral-400 text-sm">
                      {review.reviewer_name || 'Anonymous'} on {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-neutral-400">
                {content.productDetail?.noReviews || 'No reviews yet. Be the first to review this product!'}
              </p>
            )}
          </div>
        </section>
      </main>

      <AlphaGritFooter content={content.footer} />
    </div>
  );
}
