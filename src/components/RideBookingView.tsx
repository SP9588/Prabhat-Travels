import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Users,
  Car,
  Clock,
  Shield,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { AdminCommercialSettings, Booking, VehicleCategory } from '../types';
import { calculateFare, validatePassengerCapacity } from '../lib/fareEngine';
import {
  CHHATTISGARH_DISTRICTS,
  CHHATTISGARH_PRESET_ROUTES
} from '../lib/chhattisgarhLocations';

interface RideBookingViewProps {
  lang: Language;
  settings: AdminCommercialSettings;
  onBookingCreated: (booking: Booking) => void;
  onQuickRentClick: () => void;
}

export const RideBookingView: React.FC<RideBookingViewProps> = ({
  lang,
  settings,
  onBookingCreated,
  onQuickRentClick
}) => {
  const t = translations[lang];

  // Fresh initial variables set to 0 and empty/Chhattisgarh defaults
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('SEDAN');
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [durationMin, setDurationMin] = useState<number>(0);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);

  // Selected district filters for easy quick selection
  const [pickupDistrict, setPickupDistrict] = useState('raipur');
  const [dropDistrict, setDropDistrict] = useState('bilaspur');

  // Validate passenger capacity against selected category (0 is fresh default)
  const capacityCheck = useMemo(() => {
    if (passengerCount === 0) {
      return {
        valid: true,
        maxAllowed: 4,
        messageHi: 'कृपया यात्री संख्या दर्ज करें (कम से कम 1)',
        messageEn: 'Please enter passenger count (at least 1)'
      };
    }
    return validatePassengerCapacity(selectedCategory, passengerCount);
  }, [selectedCategory, passengerCount]);

  // Dynamic upfront fare calculation based on Admin Santosh's rates
  const fareBreakdown = useMemo(() => {
    return calculateFare(settings, selectedCategory, distanceKm, durationMin);
  }, [settings, selectedCategory, distanceKm, durationMin]);

  const handleSelectPreset = (route: (typeof CHHATTISGARH_PRESET_ROUTES)[0]) => {
    setPickupAddress(route.pickup);
    setDropAddress(route.drop);
    setDistanceKm(route.distanceKm);
    setDurationMin(route.durationMin);
    if (passengerCount === 0) setPassengerCount(1);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passengerCount < 1) {
      setError(lang === 'hi' ? 'कृपया कम से कम 1 यात्री चुनें।' : 'Please specify at least 1 passenger.');
      return;
    }

    if (!capacityCheck.valid) {
      setError(lang === 'hi' ? capacityCheck.messageHi : capacityCheck.messageEn);
      return;
    }

    if (!pickupAddress.trim() || !dropAddress.trim() || !customerPhone.trim()) {
      setError(t.errorMsg);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'RIDE',
          customerName: customerName.trim() || 'यात्री (Chhattisgarh)',
          customerPhone,
          vehicleCategory: selectedCategory,
          pickupAddress,
          dropAddress,
          passengerCount,
          distanceKm: distanceKm || 0,
          durationMinutes: durationMin || 0,
          specialInstructions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'बुकिंग बनाने में विफल।');
      }

      onBookingCreated(data.booking);
    } catch (err: any) {
      setError(err.message || 'त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const categories: {
    key: VehicleCategory;
    nameHi: string;
    nameEn: string;
    seats: number;
    desc: string;
    rateHint: string;
  }[] = [
    {
      key: 'HATCHBACK',
      nameHi: 'हैचबैक (WagonR / Tiago)',
      nameEn: 'Hatchback (WagonR / Tiago)',
      seats: 4,
      desc: 'किफायती व त्वरित दैनिक यात्रा',
      rateHint: `₹${settings.baseFare.HATCHBACK} बेस + ₹${settings.perKmRate.HATCHBACK}/किमी`
    },
    {
      key: 'SEDAN',
      nameHi: 'सेडान (Dzire / Etios)',
      nameEn: 'Sedan (Dzire / Etios)',
      seats: 4,
      desc: 'अधिक बूट स्पेस व आरामदायक एसी',
      rateHint: `₹${settings.baseFare.SEDAN} बेस + ₹${settings.perKmRate.SEDAN}/किमी`
    },
    {
      key: 'SUV',
      nameHi: 'एसयूवी (Ertiga / Bolero)',
      nameEn: 'SUV (Ertiga / Bolero)',
      seats: 7,
      desc: 'बड़ा परिवार व सामूहिक सफर',
      rateHint: `₹${settings.baseFare.SUV} बेस + ₹${settings.perKmRate.SUV}/किमी`
    },
    {
      key: 'PREMIUM_SUV',
      nameHi: 'प्रीमियम (Innova Crysta / Fortuner)',
      nameEn: 'Premium SUV (Innova / Fortuner)',
      seats: 7,
      desc: 'वीआईपी, बारात व विशेष आयोजन',
      rateHint: `₹${settings.baseFare.PREMIUM_SUV} बेस + ₹${settings.perKmRate.PREMIUM_SUV}/किमी`
    },
    {
      key: 'AUTO_RICKSHAW',
      nameHi: 'ऑटो रिक्शा (City Auto)',
      nameEn: 'Auto Rickshaw (City Auto)',
      seats: 3,
      desc: 'गली-मोहल्ले व स्थानीय त्वरित आवागमन',
      rateHint: `₹${settings.baseFare.AUTO_RICKSHAW} बेस + ₹${settings.perKmRate.AUTO_RICKSHAW}/किमी`
    },
    {
      key: 'COMMERCIAL_VAN',
      nameHi: 'कमर्शियल वैन / ट्रैवलर',
      nameEn: 'Commercial Van / Traveler',
      seats: 12,
      desc: 'टूर, तीर्थ यात्रा व बड़ा दल',
      rateHint: `₹${settings.baseFare.COMMERCIAL_VAN} बेस + ₹${settings.perKmRate.COMMERCIAL_VAN}/किमी`
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Value Banner */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span>छत्तीसगढ़ राज्य के सभी 33 जिलों में 100% सत्यापित कैब व वाहन सेवा</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-serif">
            {t.rideBookingTitle} (State: Chhattisgarh)
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl">
            रायपुर, बिलासपुर, दुर्ग-भिलाई, कोरबा, रायगढ़, बस्तर-जगदलपुर, सरगुजा-अंबिकापुर सहित छत्तीसगढ़ के सभी 33 जिलों में विश्वसनीय यात्रा।
          </p>
        </div>

        <button
          onClick={onQuickRentClick}
          id="btn-switch-to-rental"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <span>गाड़ी दिन के हिसाब से चाहिए?</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Booking Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Chhattisgarh State Districts Quick Select */}
          <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                छत्तीसगढ़ के 33 जिलों में से त्वरित स्थान चुनें:
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                State: Chhattisgarh Only
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-0.5">
                  पिकअप जिला (Pickup District):
                </label>
                <select
                  value={pickupDistrict}
                  onChange={(e) => {
                    const distId = e.target.value;
                    setPickupDistrict(distId);
                    const dist = CHHATTISGARH_DISTRICTS.find((d) => d.id === distId);
                    if (dist) {
                      setPickupAddress(dist.famousPlaces[0] || `${dist.nameHi}, छत्तीसगढ़`);
                    }
                  }}
                  className="w-full text-xs font-medium bg-white border border-amber-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                >
                  {CHHATTISGARH_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameHi} ({d.rtoCode}) - {d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-0.5">
                  ड्रॉप जिला (Drop District):
                </label>
                <select
                  value={dropDistrict}
                  onChange={(e) => {
                    const distId = e.target.value;
                    setDropDistrict(distId);
                    const dist = CHHATTISGARH_DISTRICTS.find((d) => d.id === distId);
                    if (dist) {
                      setDropAddress(dist.famousPlaces[0] || `${dist.nameHi}, छत्तीसगढ़`);
                    }
                  }}
                  className="w-full text-xs font-medium bg-white border border-amber-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                >
                  {CHHATTISGARH_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameHi} ({d.rtoCode}) - {d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Preset Routes of Chhattisgarh */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2">
              छत्तीसगढ़ के प्रमुख लोकप्रिय मार्ग (CG Popular Routes):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CHHATTISGARH_PRESET_ROUTES.map((route, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(route)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-amber-100/70 border border-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer"
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {/* Pickup Location */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {t.pickupLocation} (छत्तीसगढ़) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="input-pickup-location"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="उदा. स्वामी विवेकानंद विमानतल (माना), रायपुर या रेलवे स्टेशन, बिलासपुर"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-sm font-medium text-neutral-900 transition"
                />
              </div>
            </div>

            {/* Drop Location */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-orange-600" />
                {t.dropLocation} (छत्तीसगढ़) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="input-drop-location"
                  value={dropAddress}
                  onChange={(e) => setDropAddress(e.target.value)}
                  placeholder="उदा. उच्च न्यायालय (High Court), बिलासपुर या नेहरू नगर, भिलाई"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-sm font-medium text-neutral-900 transition"
                />
              </div>
            </div>

            {/* Distance & Duration Inputs (Default fresh 0) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>अनुमानित दूरी (किलोमीटर):</span>
                  <span className="text-[10px] text-neutral-500">शुरुआती मान: 0</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    id="input-distance-km"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono text-sm font-bold text-neutral-900 bg-white"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400 font-medium">किमी</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>अनुमानित समय (मिनट):</span>
                  <span className="text-[10px] text-neutral-500">शुरुआती मान: 0</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="input-duration-min"
                    value={durationMin}
                    onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono text-sm font-bold text-neutral-900 bg-white"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400 font-medium">मिनट</span>
                </div>
              </div>
            </div>

            {/* Vehicle Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2 flex items-center justify-between">
                <span>{t.selectVehicleCategory}</span>
                <span className="text-neutral-500 font-normal text-[11px]">
                  (सीट व बूट स्पेस अनुसार चुनें)
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <div
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/50 shadow-2xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-neutral-900">
                            {lang === 'hi' ? cat.nameHi : cat.nameEn}
                          </div>
                          <div className="text-[11px] text-neutral-500">{cat.desc}</div>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {cat.seats} सीट
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                        <span className="text-amber-800 font-semibold">{cat.rateHint}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Passenger Count & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-600" />
                    {t.passengerCount} (शुरुआती मान 0)
                  </span>
                  <span className="text-[11px] font-medium text-neutral-500">
                    अधिकतम: {capacityCheck.maxAllowed}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="15"
                    id="input-passenger-count"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value) || 0)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                      !capacityCheck.valid
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>
                {!capacityCheck.valid && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {lang === 'hi' ? capacityCheck.messageHi : capacityCheck.messageEn}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  यात्री मोबाइल नंबर <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  id="input-customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-अंकीय मोबाइल नंबर"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-sm font-medium text-neutral-900 transition"
                />
              </div>
            </div>

            {/* Passenger Name & Special Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  यात्री का नाम
                </label>
                <input
                  type="text"
                  id="input-customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="पूरा नाम"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-600 text-sm font-medium text-neutral-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.specialInstructions}
                </label>
                <input
                  type="text"
                  id="input-special-instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t.specialInstructionsPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-600 text-sm font-medium text-neutral-900 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !capacityCheck.valid}
              id="btn-submit-booking"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>छत्तीसगढ़ में ड्राइवर खोजा जा रहा है...</span>
              ) : (
                <>
                  <span>{t.confirmBookingBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Upfront Fare Summary & Admin Control Transparency */}
        <div className="lg:col-span-5 space-y-4">
          {/* Fare Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                किराया पूर्वावलोकन (Upfront Fare)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                पारदर्शी दरें
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-neutral-900 font-mono">
                  ₹{fareBreakdown.totalAmount}
                </span>
                <span className="text-xs text-neutral-500 ml-1.5">(कर सहित)</span>
              </div>
              <div className="text-right text-xs text-neutral-500">
                <div>दूरी: ~{distanceKm} किमी</div>
                <div>समय: ~{durationMin} मिनट</div>
              </div>
            </div>

            {/* Fare Breakdown toggler */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t.baseFare}</span>
                <span className="font-mono font-medium">₹{fareBreakdown.baseFare}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>
                  {t.distanceCharge} ({distanceKm} किमी)
                </span>
                <span className="font-mono font-medium">₹{fareBreakdown.distanceCharge}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t.fuelSurcharge}</span>
                <span className="font-mono font-medium">₹{fareBreakdown.fuelSurcharge}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>{t.taxGst} (5%)</span>
                <span className="font-mono font-medium">₹{fareBreakdown.tax}</span>
              </div>

              {/* Platform Commission info (Admin governed) */}
              <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-amber-800 bg-amber-100/40 -mx-3 -mb-3 p-2.5 rounded-b-xl">
                <span className="flex items-center gap-1 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  मंच कमीशन व चालक भुगतान:
                </span>
                <span className="font-mono font-bold">
                  ड्राइवर: ₹{fareBreakdown.driverPayout} | मंच: ₹{fareBreakdown.platformCommission}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <span>
                किराया और कमीशन दरें एडमिन <strong>संतोष प्रसाद</strong> द्वारा नियंत्रित हैं। कोई
                छिपा हुआ शुल्क नहीं।
              </span>
            </div>
          </div>

          {/* Safety & Policy Highlights */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-sm">लक्ष्मी ट्रैवल्स सुरक्षा गारंटी</h2>
            </div>
            <ul className="text-xs text-neutral-300 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>यात्रा शुरू करने से पूर्व 4-अंकीय OTP सुरक्षा सत्यापन अनिवार्य।</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ड्राइवर के स्थान पर पहुँचने के बाद ही यात्रा आरंभ।</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>अधिकृत रेज़रपे खाते में सुरक्षित डिजिटल भुगतान।</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-neutral-700/60 text-[11px] text-neutral-400">
              सहायता के लिए सीधे संचालक संतोष प्रसाद से संपर्क करें: <strong>9279120271</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
