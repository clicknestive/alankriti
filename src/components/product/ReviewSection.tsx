'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface Review {
  id: string;
  rating: number;
  comment: string;
  imageUrl?: string | null;
  createdAt: string | Date;
  user: {
    name: string;
  };
}

interface ReviewSectionProps {
  productId: string;
  productName: string;
  reviews: Review[];
}

export default function ReviewSection({ productId, productName, reviews }: ReviewSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to your Alankriti customer account to write a review.', 'info');
      return;
    }

    if (!comment.trim()) {
      showToast('Please write a few words about your experience with this saree.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
          imageUrl: imageUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Your review has been submitted for verified curation approval. Thank you!', 'success');
        setComment('');
        setImageUrl('');
        setShowReviewForm(false);
      } else {
        showToast(data.error || 'Only verified purchasers of this saree can submit a review.', 'error');
      }
    } catch (err) {
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3DCCF] shadow-sm space-y-8">
      {/* Header & Rating Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#FAF6F0]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#826530]">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
            Verified Customer Impressions
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A3425] mt-1">
            Drape Stories & Reviews
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Exclusively penned by patrons who have adorned this bespoke creation.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#FAF6F0] p-4 rounded-2xl border border-[#BDCFB1]/60">
          <div className="text-center">
            <span className="font-serif text-3xl font-bold text-[#2A3425] block leading-none">
              {averageRating}
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider">Out of 5.0</span>
          </div>

          <div className="border-l border-stone-200 pl-4 space-y-1">
            <div className="flex items-center gap-1 text-[#C6A15B]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(averageRating))
                      ? 'fill-[#C6A15B] text-[#C6A15B]'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-stone-600 block">
              Based on {reviews.length} authentic {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      {/* Action to open review form */}
      <div className="flex justify-between items-center bg-[#E6EFE2]/50 p-4 rounded-2xl border border-[#BDCFB1]/40">
        <div className="flex items-center gap-2.5 text-xs text-[#43513B]">
          <ShieldCheck className="w-4 h-4 text-[#5E7052]" />
          <span>Have you draped this saree? Share your review with the Alankriti family.</span>
        </div>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-4 py-2 bg-[#5E7052] hover:bg-[#43513B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shrink-0 shadow-sm"
        >
          {showReviewForm ? 'Close Form' : 'Write a Review'}
        </button>
      </div>

      {/* Review Submission Form */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#C6A15B]/40 space-y-4 animate-fadeIn"
        >
          <h4 className="font-serif text-lg font-bold text-[#2A3425]">
            Pen Your Drape Review for "{productName}"
          </h4>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-[#C6A15B] hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-[#C6A15B] text-[#C6A15B]' : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-medium text-[#826530] ml-2">
                {rating === 5
                  ? '5 - Exquisite Heirloom'
                  : rating === 4
                  ? '4 - Beautiful Drape'
                  : rating === 3
                  ? '3 - Good'
                  : rating === 2
                  ? '2 - Fair'
                  : '1 - Needs Improvement'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1">
              Your Written Impressions *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              placeholder="Describe the texture, zari sheen, lightness of the silk, and the compliments you received..."
              className="w-full p-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1">
              Optional Image Link (Your Drape Photo)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/your-drape-photo.jpg"
              className="w-full p-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 border border-stone-300 rounded-xl text-xs text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#826530] hover:bg-[#684f23] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Curation'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            No public reviews yet for this saree. Be the first patron to share your drape story!
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-[#FAF6F0]/60 rounded-2xl border border-[#E3DCCF] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#BDCFB1] text-[#2A3425] flex items-center justify-center font-bold text-xs border border-[#A8B89A]">
                    {rev.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-[#2A3425] flex items-center gap-1.5">
                      {rev.user.name}
                      <span className="text-[10px] bg-[#E6EFE2] text-[#43513B] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#5E7052]" /> Verified Buyer
                      </span>
                    </h5>
                    <span className="text-[11px] text-stone-400">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#C6A15B]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-[#C6A15B] text-[#C6A15B]' : 'text-stone-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                "{rev.comment}"
              </p>

              {rev.imageUrl && (
                <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-[#BDCFB1] mt-2">
                  <Image
                    src={rev.imageUrl}
                    alt="Customer photo"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
