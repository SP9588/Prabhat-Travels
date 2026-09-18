import React, { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { Booking } from '../types';

interface ReviewModalProps {
  lang: Language;
  booking: Booking;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  lang,
  booking,
  onClose,
  onSubmitSuccess
}) => {
  const t = translations[lang];

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('गाड़ी साफ थी और ड्राइवर का व्यवहार बहुत अच्छा था।');
  const [punctuality, setPunctuality] = useState(5);
  const [behavior, setBehavior] = useState(5);
  const [vehicleCondition, setVehicleCondition] = useState(5);
  const [safety, setSafety] = useState(5);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          reviewerId: booking.customerId,
          reviewerName: booking.customerName,
          revieweeId: booking.driverId || 'drv-01',
          rating,
          feedback,
          categories: {
            punctuality,
            behavior,
            vehicleCondition,
            safety
          }
        })
      });

      if (res.ok) {
        setDone(true);
        onSubmitSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 className="font-bold text-base text-neutral-900 font-serif">{t.reviewTitle}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-4 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-neutral-700 font-bold">
              धन्यवाद! आपका बहुमूल्य फीडबैक दर्ज हो गया है।
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
            >
              {t.closeBtn}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="text-center space-y-2">
              <div className="text-neutral-600 font-semibold">{t.rateDriver}</div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300 fill-transparent'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-neutral-100 pt-3">
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t.punctuality}:</span>
                <span className="font-bold font-mono">{punctuality} / 5</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t.behavior}:</span>
                <span className="font-bold font-mono">{behavior} / 5</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t.vehicleCondition}:</span>
                <span className="font-bold font-mono">{vehicleCondition} / 5</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t.safety}:</span>
                <span className="font-bold font-mono">{safety} / 5</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {t.feedbackComment}
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              id="btn-submit-trip-review"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {loading ? 'जमा हो रहा है...' : t.submitReviewBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
