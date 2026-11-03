import React from 'react';
import { Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { CustomerReview } from '../types';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const displayReviews = reviews.filter((r) => r.isApproved);

  return (
    <section id="avaliacoes" className="py-20 bg-[#F3F4F6] border-t border-gray-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#b8860b] font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Avaliações Reais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-luxury text-zinc-900">
            O Que Dizem Nossos Clientes
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            Depoimentos verificados publicados no Google Maps.
          </p>
        </div>

        {/* 3 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="card-luxury rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                {/* 5 Golden Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#b8860b] text-[#b8860b]"
                    />
                  ))}
                  <span className="text-xs font-bold text-[#b8860b] ml-1">5.0</span>
                </div>

                {/* Comment Text */}
                <p className="text-sm text-zinc-700 italic leading-relaxed mb-6 font-normal">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Verification */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 font-luxury">
                    {rev.authorName}
                  </h4>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Google Maps
                  </span>
                </div>

                {rev.originalUrl && (
                  <a
                    href={rev.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#b8860b] hover:underline font-semibold"
                  >
                    <span>Ver no Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
