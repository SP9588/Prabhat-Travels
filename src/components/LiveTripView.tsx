import React, { useState, useEffect } from 'react';
import {
  Car,
  Phone,
  Shield,
  KeyRound,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  Star,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { Booking, UserRole } from '../types';

interface LiveTripViewProps {
  lang: Language;
  booking: Booking;
  userRole: UserRole;
  onTripUpdated: (updatedBooking: Booking) => void;
  onOpenInvoice: (invoiceId: string) => void;
  onOpenReview: (booking: Booking) => void;
  onBackToBooking: () => void;
}

export const LiveTripView: React.FC<LiveTripViewProps> = ({
  lang,
  booking,
  userRole,
  onTripUpdated,
  onOpenInvoice,
  onOpenReview,
  onBackToBooking
}) => {
  const t = translations[lang];

  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [progressPercent, setProgressPercent] = useState(
    booking.status === 'TRIP_STARTED' || booking.status === 'TRIP_IN_PROGRESS'
      ? 50
      : booking.status === 'TRIP_COMPLETED'
      ? 100
      : 20
  );

  // Simulated live progress animation while trip is active
  useEffect(() => {
    if (booking.status === 'TRIP_STARTED') {
      const interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 95) return 95;
          return prev + 5;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [booking.status]);

  // Action 1: Driver Arrival
  const handleDriverArrival = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/trips/${booking.id}/arrival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverLat: booking.pickupGps.lat,
          driverLng: booking.pickupGps.lng
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'आगमन दर्ज करने में विफल।');
      onTripUpdated(data.booking);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // Action 2: Server-side OTP Verification & Trip Start
  const handleVerifyOtpAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!inputOtp.trim()) {
      setOtpError('कृपया 4-अंकीय OTP दर्ज करें।');
      return;
    }

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/trips/${booking.id}/verify-otp-and-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: inputOtp.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.otpErrorInvalid);
      }

      onTripUpdated(data.booking);
      setInputOtp('');
    } catch (err: any) {
      setOtpError(err.message || t.otpErrorInvalid);
    } finally {
      setLoadingAction(false);
    }
  };

  // Action 3: Complete Trip
  const handleCompleteTrip = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/trips/${booking.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalDistanceKm: booking.distanceKm,
          finalDurationMinutes: booking.durationMinutes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'यात्रा पूर्ण करने में विफल।');
      onTripUpdated(data.booking);
      if (data.invoice) {
        onOpenInvoice(data.invoice.id);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'DRIVER_ASSIGNED':
      case 'DRIVER_EN_ROUTE':
        return {
          text: t.statusDriverAssigned,
          bg: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'DRIVER_ARRIVED':
        return {
          text: t.statusDriverArrived,
          bg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
        };
      case 'TRIP_STARTED':
      case 'TRIP_IN_PROGRESS':
        return {
          text: t.statusTripStarted,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
        };
      case 'TRIP_COMPLETED':
        return {
          text: t.statusTripCompleted,
          bg: 'bg-green-100 text-green-900 border-green-300 font-bold'
        };
      case 'CANCELLED':
        return {
          text: t.statusCancelled,
          bg: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          text: t.statusRequested,
          bg: 'bg-neutral-100 text-neutral-800 border-neutral-200'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-neutral-500 uppercase">
              {booking.bookingNumber}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badge.bg}`}
            >
              {badge.text}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 font-serif">
            {t.liveTrackingTitle}
          </h1>
          <p className="text-xs text-neutral-500">
            {booking.pickupAddress} ➔ {booking.dropAddress}
          </p>
        </div>

        <button
          onClick={onBackToBooking}
          id="btn-back-to-booking"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>नई बुकिंग / वापस</span>
        </button>
      </div>

      {/* Visual GPS Journey Map Canvas Simulator */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden space-y-6">
        {/* Top telemetry bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-neutral-700/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-emerald-300 font-semibold">
              अनुमानित लाइव स्थान: केवल सक्रिय यात्रा के दौरान
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-300 font-mono">
            <span>दूरी: {booking.distanceKm} किमी</span>
            <span>अनुमानित समय: ~{booking.durationMinutes} मिनट</span>
            <span>किराया: ₹{booking.fareBreakdown.totalAmount}</span>
          </div>
        </div>

        {/* Interactive Route Track */}
        <div className="py-6 space-y-4">
          <div className="relative flex items-center justify-between">
            {/* Pickup Node */}
            <div className="flex flex-col items-center z-10">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shadow-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-300 mt-1 max-w-[120px] text-center line-clamp-1">
                {booking.pickupAddress.split(',')[0]}
              </span>
            </div>

            {/* Moving Vehicle Node */}
            <div
              className="absolute top-0 bottom-0 flex flex-col items-center transition-all duration-700 z-20"
              style={{ left: `clamp(10%, ${progressPercent}%, 85%)` }}
            >
              <div className="w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-xl border-2 border-amber-500">
                <Car className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-neutral-900/90 px-1.5 py-0.5 rounded text-amber-400 mt-1 border border-neutral-700">
                {booking.vehicleNumber || 'CG 04 PB 4421'}
              </span>
            </div>

            {/* Track Line */}
            <div className="absolute left-6 right-6 top-4.5 h-1.5 bg-neutral-700 rounded-full -z-0">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Destination Node */}
            <div className="flex flex-col items-center z-10">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg">
                <Navigation className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-300 mt-1 max-w-[120px] text-center line-clamp-1">
                {booking.dropAddress.split(',')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Message Banner */}
        <div className="bg-neutral-800/80 rounded-xl p-3 border border-neutral-700 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{badge.text}</span>
          </div>

          {booking.status === 'TRIP_STARTED' && (
            <span className="font-mono text-emerald-400 font-bold">
              गति: ~42 किमी/घंटा | सुगम मार्ग
            </span>
          )}
        </div>
      </div>

      {/* Driver Arrived + OTP Security Card (Strict Security Mandate) */}
      {booking.status !== 'TRIP_COMPLETED' && booking.status !== 'CANCELLED' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Passenger's OTP Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-950" />
                {t.tripOtpTitle}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900 text-amber-100">
                सुरक्षा कोड
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 text-center shadow-inner border border-amber-300">
              <div className="text-3xl sm:text-4xl font-black tracking-widest font-mono text-neutral-900">
                {booking.startOtp}
              </div>
              <p className="text-[11px] text-neutral-600 mt-1.5 leading-snug">
                {t.tripOtpCustomerNotice}
              </p>
            </div>

            <div className="text-[11px] text-amber-950/80 font-medium">
              * जब तक ड्राइवर आपके पिकअप पते पर न आ जाए, तब तक यह कोड किसी से साझा न करें।
            </div>
          </div>

          {/* Driver Operations Card (Driver Arrive & OTP Verification) */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                चालक परिचालन नियंत्रण (Driver Actions)
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                सत्यापन आवश्यक
              </span>
            </div>

            {booking.status === 'DRIVER_ASSIGNED' || booking.status === 'DRIVER_EN_ROUTE' ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600">
                  ड्राइवर जैसे ही ग्राहक के पिकअप स्थान पर पहुँचे, नीचे दिए बटन पर क्लिक करें:
                </p>
                <button
                  onClick={handleDriverArrival}
                  disabled={loadingAction}
                  id="btn-driver-arrived"
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{t.driverArriveBtn}</span>
                </button>
              </div>
            ) : booking.status === 'DRIVER_ARRIVED' ? (
              <form onSubmit={handleVerifyOtpAndStart} className="space-y-3">
                <p className="text-xs text-neutral-700 font-semibold">
                  {t.enterOtpDriverTitle}:
                </p>
                {otpError && (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-1.5 border border-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    id="input-trip-otp"
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    placeholder="जैसे: 7482"
                    className="w-full px-3 py-2 text-center text-lg font-mono font-bold tracking-widest rounded-xl border border-neutral-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button
                    type="submit"
                    disabled={loadingAction}
                    id="btn-verify-otp-start"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>सत्यापित करें व शुरू करें</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500">
                  ग्राहक द्वारा पिकअप पर साझा किया गया सुरक्षा कोड दर्ज करें।
                </p>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>यात्रा प्रारंभ हो चुकी है। गंतव्य पर पहुँचने पर पूर्ण करें।</span>
                </div>
                <button
                  onClick={handleCompleteTrip}
                  disabled={loadingAction}
                  id="btn-complete-trip"
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.completeTripBtn}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Driver & Vehicle Details Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            चालक व वाहन विवरण (Driver & Vehicle Info)
          </h2>
          <span className="text-xs text-amber-700 font-semibold">
            लक्ष्मी ट्रैवल्स सत्यापित साथी
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Driver Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 font-black text-lg flex items-center justify-center border border-amber-200">
              {booking.driverName ? booking.driverName[0] : 'R'}
            </div>
            <div>
              <div className="font-bold text-sm text-neutral-900">
                {booking.driverName || 'राजेश कुमार'}
              </div>
              <div className="text-xs text-neutral-500 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>4.8 (142+ सफल यात्राएं)</span>
              </div>
              <div className="text-xs font-mono text-neutral-700 mt-0.5">
                मो: {booking.driverPhone || '9835012345'}
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="text-left sm:text-right">
              <div className="font-bold text-sm text-neutral-900">
                {booking.vehicleModel || 'Maruti Suzuki Dzire (Sedan)'}
              </div>
              <div className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                {booking.vehicleNumber || 'CG 04 PB 4421'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                वातानुकूलित (AC) | सीट क्षमता: 4
              </div>
            </div>

            <a
              href={`tel:${booking.driverPhone || '9835012345'}`}
              id="btn-call-driver"
              className="p-3 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
              title="कॉल करें"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Completion & Invoice Action Section */}
      {booking.status === 'TRIP_COMPLETED' && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950 font-serif">
                यात्रा सफलतापूर्वक संपन्न हुई!
              </h2>
              <p className="text-xs text-emerald-800">
                {t.paymentVerifiedNotice} कुल राशि: ₹{booking.fareBreakdown.totalAmount}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onOpenInvoice(booking.invoiceId || booking.id)}
              id="btn-view-invoice"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>{t.printInvoiceBtn}</span>
            </button>

            <button
              onClick={() => onOpenReview(booking)}
              id="btn-open-review"
              className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 text-xs font-bold transition cursor-pointer flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{t.reviewTitle}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
