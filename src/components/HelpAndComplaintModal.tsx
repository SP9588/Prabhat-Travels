import React, { useState } from 'react';
import { AlertCircle, Phone, Mail, X, CheckCircle2, Shield } from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface HelpAndComplaintModalProps {
  lang: Language;
  onClose: () => void;
}

export const HelpAndComplaintModal: React.FC<HelpAndComplaintModalProps> = ({
  lang,
  onClose
}) => {
  const t = translations[lang];

  const [category, setCategory] = useState<'DRIVER_BEHAVIOR' | 'OVERCHARGING' | 'SAFETY' | 'DELAY' | 'OTHER'>('DRIVER_BEHAVIOR');
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          complainantName,
          complainantPhone,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'शिकायत दर्ज करने में विफल।');
      setSuccessMsg(data.message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base text-neutral-900 font-serif">
              {t.complaintTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Contact Santosh Prasad Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 text-xs space-y-2">
          <div className="font-bold text-amber-950 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-700" />
            <span>संचालक सीधा संपर्क (Direct Owner Desk)</span>
          </div>
          <p className="text-neutral-700 leading-snug">
            बुकिंग, वाहन किराया अथवा किसी भी असुविधा के लिए प्रबंधक <strong>संतोष प्रसाद</strong> से सीधे संपर्क करें:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-mono font-bold text-neutral-900">
            <a
              href="tel:9279120271"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              <span>9279120271</span>
            </a>
            <a
              href="tel:9297120291"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              <span>9297120291</span>
            </a>
          </div>
        </div>

        {successMsg ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <p className="text-[11px] text-emerald-800">{t.ownerAssurance}</p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs"
            >
              {t.closeBtn}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  आपका नाम <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="नाम"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  मोबाइल नंबर <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                  placeholder="10 अंक"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                {t.complaintCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold"
              >
                <option value="DRIVER_BEHAVIOR">चालक का व्यवहार (Driver Behavior)</option>
                <option value="OVERCHARGING">किराया संबंधित विवाद (Fare Issue)</option>
                <option value="SAFETY">सुरक्षा संबंधी चिंता (Safety Concern)</option>
                <option value="DELAY">पिकअप में देरी (Arrival Delay)</option>
                <option value="OTHER">अन्य पूछताछ या शिकायत (Other)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                {t.complaintDesc} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="यहाँ अपनी समस्या विस्तार से लिखें..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              id="btn-submit-complaint"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {loading ? 'दर्ज हो रहा है...' : t.submitComplaintBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
