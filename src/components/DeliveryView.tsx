import React, { useState } from 'react';
import {
  Package,
  MapPin,
  Navigation,
  Phone,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { DeliveryOrder } from '../types';
import { CHHATTISGARH_DISTRICTS } from '../lib/chhattisgarhLocations';

interface DeliveryViewProps {
  lang: Language;
  onDeliveryCreated: (order: DeliveryOrder) => void;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({ lang, onDeliveryCreated }) => {
  const t = translations[lang];

  // Fresh initial values set to 0 and empty
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageWeightKg, setPackageWeightKg] = useState<number>(0);
  const [packageSize, setPackageSize] = useState<'SMALL' | 'MEDIUM' | 'LARGE'>('SMALL');

  const [pickupDistrict, setPickupDistrict] = useState('raipur');
  const [dropDistrict, setDropDistrict] = useState('durg');

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<DeliveryOrder | null>(null);

  // Fresh initial fee calculation starting from 0
  const estimatedFee = packageWeightKg > 0 ? 60 + packageWeightKg * 20 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim() || 'प्रेषक (Chhattisgarh)',
          senderPhone,
          recipientName: recipientName.trim() || 'प्राप्तकर्ता (Chhattisgarh)',
          recipientPhone,
          pickupAddress,
          dropAddress,
          packageDescription,
          packageWeightKg,
          packageSize
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ऑर्डर दर्ज करने में विफल।');
      setSuccessOrder(data.order);
      onDeliveryCreated(data.order);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-950 text-white rounded-2xl p-6 shadow-md">
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          सुरक्षित पार्सल व माल ढुलाई - State Chhattisgarh
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-serif mt-1">{t.deliveryTitle}</h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
          छत्तीसगढ़ के सभी 33 जिलों (रायपुर, बिलासपुर, दुर्ग, भिलाई, कोरबा, रायगढ़, जगदलपुर, अंबिकापुर आदि) में तीव्र पार्सल वितरण।
        </p>
      </div>

      {/* Chhattisgarh Quick District Pick for Parcel */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            छत्तीसगढ़ जिला चयन (Chhattisgarh Districts):
          </span>
          <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded">
            All 33 Districts Supported
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-0.5">
              पिकअप जिला (Pickup District):
            </label>
            <select
              value={pickupDistrict}
              onChange={(e) => {
                const id = e.target.value;
                setPickupDistrict(id);
                const d = CHHATTISGARH_DISTRICTS.find((x) => x.id === id);
                if (d) setPickupAddress(d.famousPlaces[0] || `${d.nameHi}, छत्तीसगढ़`);
              }}
              className="w-full text-xs font-medium bg-white border border-neutral-300 rounded-lg p-2"
            >
              {CHHATTISGARH_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameHi} ({d.rtoCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-0.5">
              डिलीवरी जिला (Drop District):
            </label>
            <select
              value={dropDistrict}
              onChange={(e) => {
                const id = e.target.value;
                setDropDistrict(id);
                const d = CHHATTISGARH_DISTRICTS.find((x) => x.id === id);
                if (d) setDropAddress(d.famousPlaces[0] || `${d.nameHi}, छत्तीसगढ़`);
              }}
              className="w-full text-xs font-medium bg-white border border-neutral-300 rounded-lg p-2"
            >
              {CHHATTISGARH_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameHi} ({d.rtoCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {successOrder ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                डिलीवरी ऑर्डर सफलतापूर्वक दर्ज हो गया!
              </h2>
              <p className="text-xs text-neutral-500">
                ऑर्डर नंबर: <strong className="font-mono">{successOrder.orderNumber}</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="font-bold flex items-center justify-between">
              <span>डिलीवरी सुरक्षा कोड (Delivery OTP):</span>
              <span className="text-2xl font-black font-mono tracking-widest text-neutral-900 bg-white px-3 py-1 rounded-lg border border-amber-300">
                {successOrder.deliveryOtp}
              </span>
            </div>
            <p className="text-[11px] text-amber-800">
              * यह कोड पार्सल प्राप्तकर्ता <strong>{successOrder.recipientName}</strong> को दें, ताकि
              डिलीवरी पार्टनर को सौंपते समय सत्यापन हो सके।
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setSuccessOrder(null)}
              id="btn-new-delivery"
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              नया डिलीवरी ऑर्डर बनाएं
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {t.senderDetails} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="भेजने वाले का नाम"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium"
                />
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="भेजने वाले का मोबाइल नंबर"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {t.recipientDetails} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="पाने वाले का नाम"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium"
                />
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="पाने वाले का मोबाइल नंबर"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                पिकअप का पता (Pickup Address - CG) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="दुकान/घर का पूरा पता (छत्तीसगढ़)"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                पहुंचाने का पता (Drop Address - CG) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                placeholder="डिलीवरी गंतव्य पता (छत्तीसगढ़)"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {t.packageDesc}
              </label>
              <input
                type="text"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder="जैसे: दस्तावेज, किराना, उपहार"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {t.packageWeight} (शुरुआती मान: 0)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={packageWeightKg}
                onChange={(e) => setPackageWeightKg(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {t.packageSize}
              </label>
              <select
                value={packageSize}
                onChange={(e) => setPackageSize(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold"
              >
                <option value="SMALL">छोटा पैकेट (Small up to 2kg)</option>
                <option value="MEDIUM">मध्यम पार्सल (Medium up to 10kg)</option>
                <option value="LARGE">भारी पार्सल (Large up to 50kg)</option>
              </select>
            </div>
          </div>

          {/* Fee estimate card */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500 font-medium">अनुमानित डिलीवरी शुल्क:</div>
              <div className="text-xl font-black text-neutral-900 font-mono">₹{estimatedFee}</div>
            </div>
            <div className="text-[11px] text-neutral-500 text-right">
              {packageWeightKg === 0 ? 'वजन 0 किग्रा (शुरुआती मान)' : `वजन: ${packageWeightKg} किग्रा`}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn-submit-delivery"
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'ऑर्डर दर्ज हो रहा है...' : 'पार्सल डिलीवरी बुक करें'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
