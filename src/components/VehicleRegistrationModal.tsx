import React, { useState } from 'react';
import { Car, X, CheckCircle2, Building2 } from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { VehicleCategory } from '../types';
import { CHHATTISGARH_DISTRICTS } from '../lib/chhattisgarhLocations';

interface VehicleRegistrationModalProps {
  lang: Language;
  onClose: () => void;
  onSuccess: () => void;
}

export const VehicleRegistrationModal: React.FC<VehicleRegistrationModalProps> = ({
  lang,
  onClose,
  onSuccess
}) => {
  const t = translations[lang];

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [category, setCategory] = useState<VehicleCategory>('SEDAN');
  const [brand, setBrand] = useState('Maruti Suzuki');
  const [model, setModel] = useState('Dzire');
  const [year, setYear] = useState<number>(0);
  const [seatingCapacity, setSeatingCapacity] = useState<number>(0);
  const [fuelType, setFuelType] = useState('CNG');
  const [isAc, setIsAc] = useState(true);
  const [rentalPriceDaily, setRentalPriceDaily] = useState<number>(0);
  const [baseDistrict, setBaseDistrict] = useState('raipur');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dist = CHHATTISGARH_DISTRICTS.find((d) => d.id === baseDistrict);
      const districtName = dist ? `${dist.nameHi}, छत्तीसगढ़` : 'रायपुर, छत्तीसगढ़';

      const res = await fetch('/api/vehicles/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          ownerPhone,
          regNumber,
          category,
          brand,
          model,
          year: year || 2024,
          seatingCapacity: seatingCapacity || 4,
          fuelType,
          isAc,
          rentalPriceDaily: rentalPriceDaily || 0,
          currentLocation: districtName
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'पंजीकरण में त्रुटि।');
      setSubmitted(true);
      onSuccess();
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
            <Car className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base text-neutral-900 font-serif">
              {t.navRegisterVehicle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">वाहन पंजीकरण जमा हुआ</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              आपके वाहन का विवरण एडमिन संतोष प्रसाद के पास सत्यापन हेतु भेज दिया गया है। आरसी
              जांच के बाद यह किराए पर प्रदर्शित होगा।
            </p>
            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  मालिक का नाम <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="नाम"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  मोबाइल नंबर <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="10 अंक"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  गाड़ी नंबर (RC Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="CG 04 EA 1234"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono uppercase font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">वाहन श्रेणी</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VehicleCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold"
                >
                  <option value="HATCHBACK">Hatchback (हैचबैक)</option>
                  <option value="SEDAN">Sedan (सेडान)</option>
                  <option value="SUV">SUV (एसयूवी)</option>
                  <option value="PREMIUM_SUV">Premium SUV</option>
                  <option value="COMMERCIAL_VAN">Commercial Van</option>
                </select>
              </div>
            </div>

            {/* Chhattisgarh Base District */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                वाहन का गृह जिला (Base District - Chhattisgarh) <span className="text-red-500">*</span>
              </label>
              <select
                value={baseDistrict}
                onChange={(e) => setBaseDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-xs font-medium"
              >
                {CHHATTISGARH_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameHi} ({d.rtoCode}) - {d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">ब्रांड व मॉडल</label>
                <input
                  type="text"
                  value={`${brand} ${model}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setBrand(parts[0] || '');
                    setModel(parts.slice(1).join(' ') || '');
                  }}
                  placeholder="जैसे: Maruti Dzire"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">सीट क्षमता</label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={seatingCapacity}
                  onChange={(e) => setSeatingCapacity(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">दैनिक किराया दर (₹/दिन)</label>
                <input
                  type="number"
                  value={rentalPriceDaily}
                  onChange={(e) => setRentalPriceDaily(parseInt(e.target.value) || 2000)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">ईंधन प्रकार</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                >
                  <option value="PETROL">पेट्रोल (Petrol)</option>
                  <option value="DIESEL">डीजल (Diesel)</option>
                  <option value="CNG">सीएनजी (CNG)</option>
                  <option value="ELECTRIC">इलेक्ट्रिक (EV)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="btn-submit-vehicle-reg"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {loading ? 'जमा हो रहा है...' : 'वाहन अनुमोदन हेतु सबमिट करें'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
