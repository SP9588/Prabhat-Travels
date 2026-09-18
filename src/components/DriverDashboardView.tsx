import React, { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  CheckCircle2,
  Navigation,
  Phone,
  IndianRupee,
  Clock,
  Shield,
  Star,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { Booking, Driver } from '../types';

interface DriverDashboardViewProps {
  lang: Language;
  onOpenTrip: (booking: Booking) => void;
}

export const DriverDashboardView: React.FC<DriverDashboardViewProps> = ({ lang, onOpenTrip }) => {
  const t = translations[lang];

  const [driver, setDriver] = useState<Driver | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDriverData = async () => {
    setLoading(true);
    try {
      const [drvRes, bkRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/bookings')
      ]);

      if (drvRes.ok) {
        const driversList = await drvRes.json();
        setDriver(driversList[0] || null);
      }

      if (bkRes.ok) {
        const bookingsList = await bkRes.json();
        const ongoing = bookingsList.find(
          (b: Booking) => b.status !== 'TRIP_COMPLETED' && b.status !== 'CANCELLED'
        );
        setActiveBooking(ongoing || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Driver Header & Online Toggle */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-950 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
              {isOnline ? 'ड्यूटी पर सक्रिय (Online)' : 'ड्यूटी बंद (Offline)'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif">
            {driver?.name || 'राजेश कुमार (ड्राइवर साथी)'}
          </h1>
          <p className="text-xs text-neutral-300 font-mono">
            गाड़ी: {driver?.vehicleRegNumber || 'CG 04 PB 4421'} | {driver?.vehicleModel || 'Dzire'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnline(!isOnline)}
            id="btn-toggle-driver-duty"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isOnline
                ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                : 'bg-neutral-700 text-white'
            }`}
          >
            {isOnline ? 'ड्यूटी बंद करें' : 'ड्यूटी चालू करें'}
          </button>

          <button
            onClick={fetchDriverData}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Driver Earnings & Stats Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-neutral-200 p-3.5 shadow-2xs">
          <div className="text-[11px] text-neutral-500 font-medium">कुल कमाई</div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">
            ₹{driver?.totalEarnings ?? 0}
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3.5 shadow-2xs">
          <div className="text-[11px] text-emerald-800 font-medium">बकाया पेआउट राशि</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
            ₹{driver?.pendingPayout ?? 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-3.5 shadow-2xs">
          <div className="text-[11px] text-neutral-500 font-medium">सफल यात्राएं</div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">
            {driver?.totalTrips ?? 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-3.5 shadow-2xs">
          <div className="text-[11px] text-neutral-500 font-medium">ड्राइवर रेटिंग</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-0.5 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{driver?.rating ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Active Trip Operations Widget */}
      {activeBooking ? (
        <div className="bg-white rounded-2xl border-2 border-amber-500/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-900">
                सक्रिय यात्रा असाइनमेंट ({activeBooking.bookingNumber})
              </h2>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
              {activeBooking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block">पिकअप पता:</span>
                  <span className="text-neutral-600">{activeBooking.pickupAddress}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block">गंतव्य पता:</span>
                  <span className="text-neutral-600">{activeBooking.dropAddress}</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
              <div className="font-bold text-neutral-900">ग्राहक: {activeBooking.customerName}</div>
              <div className="font-mono text-neutral-600">मो: {activeBooking.customerPhone}</div>
              <div className="text-[11px] text-neutral-500">
                यात्री संख्या: {activeBooking.passengerCount} | दूरी: {activeBooking.distanceKm} किमी
              </div>
              <div className="pt-1 font-bold text-emerald-700 font-mono">
                शुद्ध चालक कमाई: ₹{activeBooking.fareBreakdown.driverPayout}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onOpenTrip(activeBooking)}
              id="btn-open-driver-trip-view"
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>ट्रैकिंग व OTP सत्यापन स्क्रीन खोलें</span>
            </button>

            <a
              href={`tel:${activeBooking.customerPhone}`}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold text-xs transition flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>ग्राहक को कॉल करें</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-2">
          <Car className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-sm text-neutral-800">वर्तमान में कोई नई यात्रा असाइन नहीं है</h3>
          <p className="text-xs text-neutral-500">
            जैसे ही कोई ग्राहक सवारी बुक करेगा, आपको तुरंत यहाँ विवरण दिखेगा।
          </p>
        </div>
      )}
    </div>
  );
};
