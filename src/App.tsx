import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RideBookingView } from './components/RideBookingView';
import { LiveTripView } from './components/LiveTripView';
import { VehicleRentalView } from './components/VehicleRentalView';
import { DeliveryView } from './components/DeliveryView';
import { AdminDashboard } from './components/AdminDashboard';
import { DriverDashboardView } from './components/DriverDashboardView';
import { InvoiceModal } from './components/InvoiceModal';
import { DriverRegistrationModal } from './components/DriverRegistrationModal';
import { VehicleRegistrationModal } from './components/VehicleRegistrationModal';
import { HelpAndComplaintModal } from './components/HelpAndComplaintModal';
import { ReviewModal } from './components/ReviewModal';
import { Language, translations } from './lib/i18n';
import { AdminCommercialSettings, Booking, UserRole, Vehicle } from './types';
import { Phone, Mail, ShieldCheck, MapPin, Heart } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lt_lang') as Language) || 'hi';
  });

  const [activeRole, setActiveRole] = useState<UserRole>('CUSTOMER');
  const [activeTab, setActiveTab] = useState<string>('book-ride');
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  // Modals state
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [showDriverReg, setShowDriverReg] = useState(false);
  const [showVehicleReg, setShowVehicleReg] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // Admin Commercial Settings fetched from server (fresh initial variables at 0)
  const [settings, setSettings] = useState<AdminCommercialSettings>({
    businessName: 'लक्ष्मी ट्रैवल्स (Laxmi Travels)',
    adminName: 'संतोष प्रसाद (Santosh Prasad)',
    adminPhone: '9279120271',
    developerPhone: '9297120291',
    adminEmail: 'santoshprasad8891@gmail.com',
    commissionType: 'PERCENTAGE',
    commissionPercent: 0,
    commissionFixed: 0,
    minCommission: 0,
    maxCommission: 0,
    baseFare: {
      DELIVERY_BIKE: 0,
      AUTO_RICKSHAW: 0,
      HATCHBACK: 0,
      SEDAN: 0,
      SUV: 0,
      PREMIUM_SUV: 0,
      COMMERCIAL_VAN: 0
    },
    perKmRate: {
      DELIVERY_BIKE: 0,
      AUTO_RICKSHAW: 0,
      HATCHBACK: 0,
      SEDAN: 0,
      SUV: 0,
      PREMIUM_SUV: 0,
      COMMERCIAL_VAN: 0
    },
    perMinuteRate: 0,
    waitingChargePerMinute: 0,
    cancellationFee: 0,
    gstRate: 0,
    fuelSurcharge: 0,
    driverArrivalRadiusMeters: 0,
    driverArrivalWindowMinutes: 0,
    isDevMode: true,
    razorpayAccountId: 'acc_santosh_9297120291',
    razorpayKeyId: 'rzp_test_santoshprasad',
    razorpayKeySecret: '',
    razorpayWebhookSecret: '',
    allowCashOnDelivery: true,
    contactVisibility: true
  });

  // Load live server settings & active booking
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.businessName) {
          setSettings(data);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/bookings')
      .then((res) => res.json())
      .then((bookings) => {
        if (Array.isArray(bookings) && bookings.length > 0) {
          setCurrentBooking(bookings[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleToggleLang = () => {
    const nextLang = lang === 'hi' ? 'en' : 'hi';
    setLang(nextLang);
    localStorage.setItem('lt_lang', nextLang);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (newRole === 'ADMIN') {
      setActiveTab('admin-dashboard');
    } else if (newRole === 'DRIVER') {
      setActiveTab('driver-dashboard');
    } else {
      setActiveTab('book-ride');
    }
  };

  const handleBookingCreated = (booking: Booking) => {
    setCurrentBooking(booking);
    setActiveTab('live-trip');
  };

  const handleBookRentalVehicle = (vehicle: Vehicle) => {
    setActiveTab('book-ride');
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDriverReg={() => setShowDriverReg(true)}
        onOpenVehicleReg={() => setShowVehicleReg(true)}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1 pb-12">
        {activeTab === 'book-ride' && (
          <RideBookingView
            lang={lang}
            settings={settings}
            onBookingCreated={handleBookingCreated}
            onQuickRentClick={() => setActiveTab('rent-vehicle')}
          />
        )}

        {activeTab === 'live-trip' && currentBooking && (
          <LiveTripView
            lang={lang}
            booking={currentBooking}
            userRole={activeRole}
            onTripUpdated={(updated) => setCurrentBooking(updated)}
            onOpenInvoice={(invId) => setActiveInvoiceId(invId)}
            onOpenReview={(b) => setReviewBooking(b)}
            onBackToBooking={() => setActiveTab('book-ride')}
          />
        )}

        {activeTab === 'rent-vehicle' && (
          <VehicleRentalView
            lang={lang}
            onBookRentalVehicle={handleBookRentalVehicle}
            onOpenVehicleReg={() => setShowVehicleReg(true)}
          />
        )}

        {activeTab === 'delivery' && (
          <DeliveryView
            lang={lang}
            onDeliveryCreated={(order) => {
              // Delivery order created
            }}
          />
        )}

        {activeTab === 'admin-dashboard' && (
          <AdminDashboard
            lang={lang}
            currentSettings={settings}
            onSettingsUpdated={(newSettings) => setSettings(newSettings)}
          />
        )}

        {activeTab === 'driver-dashboard' && (
          <DriverDashboardView
            lang={lang}
            onOpenTrip={(b) => {
              setCurrentBooking(b);
              setActiveTab('live-trip');
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      {activeInvoiceId && (
        <InvoiceModal
          lang={lang}
          invoiceId={activeInvoiceId}
          onClose={() => setActiveInvoiceId(null)}
        />
      )}

      {showDriverReg && (
        <DriverRegistrationModal
          lang={lang}
          onClose={() => setShowDriverReg(false)}
          onSuccess={() => {}}
        />
      )}

      {showVehicleReg && (
        <VehicleRegistrationModal
          lang={lang}
          onClose={() => setShowVehicleReg(false)}
          onSuccess={() => {}}
        />
      )}

      {showHelpModal && (
        <HelpAndComplaintModal lang={lang} onClose={() => setShowHelpModal(false)} />
      )}

      {reviewBooking && (
        <ReviewModal
          lang={lang}
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitSuccess={() => setReviewBooking(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 text-xs py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-neutral-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-lg text-white">
                {t.brandName}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Official
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {t.brandTagline}. 4-पहिया वाहन किराया, शहर व बाहरी यात्रा, पार्सल डिलीवरी और ड्राइवर
              सेवाएं।
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">
              संचालक एवं संपर्क
            </h3>
            <div className="space-y-1 text-neutral-400 font-medium">
              <div className="text-white font-bold">{settings.adminName}</div>
              <div>मो: <a href="tel:9279120271" className="hover:text-amber-400 font-mono">9279120271</a></div>
              <div>डेवलपर संपर्क: <a href="tel:9297120291" className="hover:text-amber-400 font-mono">9297120291</a></div>
              <div>ईमेल: <a href={`mailto:${settings.adminEmail}`} className="hover:text-amber-400">{settings.adminEmail}</a></div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">
              शीघ्र लिंक (Quick Links)
            </h3>
            <ul className="space-y-1 text-neutral-400">
              <li>
                <button
                  onClick={() => setActiveTab('book-ride')}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.navBookRide}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('rent-vehicle')}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.navRentVehicle}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('delivery')}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.navDelivery}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className="hover:text-amber-400 cursor-pointer"
                >
                  {t.navAdminDashboard}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">
              सुरक्षा एवं भरोसा
            </h3>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              सवारी शुरू करने से पूर्व 4-अंकीय OTP सुरक्षा सत्यापन अनिवार्य है। पैसे का नियंत्रण एवं
              कमीशन दरें संतोष प्रसाद के रेज़रपे खाते द्वारा अधिकृत हैं।
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-[11px] gap-2">
          <div>
            © {new Date().getFullYear()} लक्ष्मी ट्रैवल्स (Laxmi Travels). सर्वाधिकार सुरक्षित।
          </div>
          <div>
            संचालक: संतोष प्रसाद | फोन: 9279120271 / 9297120291
          </div>
        </div>
      </footer>
    </div>
  );
}
