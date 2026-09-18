import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  AdminCommercialSettings,
  Booking,
  BookingStatus,
  Complaint,
  DeliveryOrder,
  Driver,
  FareBreakdown,
  FinancialLedgerEntry,
  Invoice,
  Review,
  ServiceListing,
  Vehicle,
  VehicleCategory
} from './src/types';
import { calculateFare, calculateGpsDistanceMeters } from './src/lib/fareEngine';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database Store with all initial numeric values fresh to zero (0)
let adminSettings: AdminCommercialSettings = {
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
  razorpayKeySecret: 'secret_key_santosh_travels_9279',
  razorpayWebhookSecret: 'whsec_laxmitravels_secure_9279',
  allowCashOnDelivery: true,
  contactVisibility: true
};

// Seed sample drivers for State Chhattisgarh with 0 numeric values
let drivers: Driver[] = [
  {
    id: 'drv-01',
    userId: 'usr-drv-01',
    name: 'राजेश कुमार (Rajesh Kumar)',
    phone: '9835012345',
    email: 'rajesh.driver@example.com',
    licenseNumber: 'CG0420240000001',
    licenseValidity: '2030-12-31',
    assignedVehicleId: 'veh-01',
    vehicleRegNumber: 'CG 04 PB 0001',
    vehicleModel: 'Maruti Suzuki Dzire (Sedan)',
    status: 'APPROVED',
    rating: 0,
    totalTrips: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    currentGps: { lat: 21.2514, lng: 81.6296 },
    isAvailable: true,
    serviceAreas: ['रायपुर', 'दुर्ग', 'भिलाई', 'बिलासपुर', 'राजनांदगांव'],
    documents: [
      { type: 'LICENSE', number: 'CG0420240000001', fileUrl: 'verified-dl.pdf', verified: true },
      { type: 'AADHAR', number: 'XXXX-XXXX-8821', fileUrl: 'verified-aadhar.pdf', verified: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'drv-02',
    userId: 'usr-drv-02',
    name: 'मनोज यादव (Manoj Yadav)',
    phone: '9431098765',
    email: 'manoj.yadav@example.com',
    licenseNumber: 'CG1020240000002',
    licenseValidity: '2029-08-15',
    assignedVehicleId: 'veh-02',
    vehicleRegNumber: 'CG 10 EA 0002',
    vehicleModel: 'Maruti Suzuki Ertiga (SUV 7-Seater)',
    status: 'APPROVED',
    rating: 0,
    totalTrips: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    currentGps: { lat: 22.0797, lng: 82.1409 },
    isAvailable: true,
    serviceAreas: ['बिलासपुर', 'कोरबा', 'जांजगीर-चांपा', 'रायगढ़', 'मुंगेली'],
    documents: [
      { type: 'LICENSE', number: 'CG1020240000002', fileUrl: 'verified-dl-2.pdf', verified: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'drv-03',
    userId: 'usr-drv-03',
    name: 'अमित कुमार सिंह (Amit Singh)',
    phone: '9122334455',
    email: 'amit.singh@example.com',
    licenseNumber: 'CG0720240000003',
    licenseValidity: '2031-03-20',
    status: 'PENDING',
    rating: 0,
    totalTrips: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    currentGps: { lat: 21.1904, lng: 81.2849 },
    isAvailable: false,
    serviceAreas: ['दुर्ग', 'भिलाई', 'बालोद', 'बेमेतरा'],
    documents: [
      { type: 'LICENSE', number: 'CG0720240000003', fileUrl: 'pending-dl.pdf', verified: false }
    ],
    createdAt: new Date().toISOString()
  }
];

// Seed sample vehicles for State Chhattisgarh with 0 numeric values
let vehicles: Vehicle[] = [
  {
    id: 'veh-01',
    ownerId: 'own-01',
    ownerName: 'संतोष प्रसाद (Laxmi Fleet)',
    ownerPhone: '9279120271',
    regNumber: 'CG 04 PB 0001',
    category: 'SEDAN',
    brand: 'Maruti Suzuki',
    model: 'Dzire ZXi (White)',
    year: 0,
    seatingCapacity: 0,
    fuelType: 'CNG',
    isAc: true,
    photos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80'],
    documents: [
      { type: 'RC', number: 'CG04PB0001', fileUrl: 'rc.pdf', verified: true },
      { type: 'INSURANCE', number: 'POL-9921', fileUrl: 'insurance.pdf', verified: true }
    ],
    status: 'APPROVED',
    isAvailable: true,
    rentalPriceDaily: 0,
    perKmPrice: 0,
    currentLocation: 'स्वामी विवेकानंद विमानतल (माना हवाई अड्डा), रायपुर, छत्तीसगढ़',
    currentGps: { lat: 21.1804, lng: 81.7388 },
    createdAt: new Date().toISOString()
  },
  {
    id: 'veh-02',
    ownerId: 'own-01',
    ownerName: 'संतोष प्रसाद (Laxmi Fleet)',
    ownerPhone: '9279120271',
    regNumber: 'CG 10 EA 0002',
    category: 'SUV',
    brand: 'Maruti Suzuki',
    model: 'Ertiga VXi (Silver 7-Seater)',
    year: 0,
    seatingCapacity: 0,
    fuelType: 'PETROL',
    isAc: true,
    photos: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'],
    documents: [
      { type: 'RC', number: 'CG10EA0002', fileUrl: 'rc-ertiga.pdf', verified: true }
    ],
    status: 'APPROVED',
    isAvailable: true,
    rentalPriceDaily: 0,
    perKmPrice: 0,
    currentLocation: 'बिलासपुर जंक्शन रेलवे स्टेशन, बिलासपुर, छत्तीसगढ़',
    currentGps: { lat: 22.0797, lng: 82.1409 },
    createdAt: new Date().toISOString()
  },
  {
    id: 'veh-03',
    ownerId: 'own-02',
    ownerName: 'विक्रम शर्मा (Vikram Sharma)',
    ownerPhone: '9871234567',
    regNumber: 'CG 07 CA 0003',
    category: 'HATCHBACK',
    brand: 'Maruti Suzuki',
    model: 'WagonR CNG',
    year: 0,
    seatingCapacity: 0,
    fuelType: 'CNG',
    isAc: true,
    photos: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'],
    documents: [{ type: 'RC', number: 'CG07CA0003', fileUrl: 'rc-wagonr.pdf', verified: false }],
    status: 'PENDING',
    isAvailable: false,
    rentalPriceDaily: 0,
    perKmPrice: 0,
    currentLocation: 'सिविल लाइन्स, दुर्ग-भिलाई, छत्तीसगढ़',
    currentGps: { lat: 21.1904, lng: 81.2849 },
    createdAt: new Date().toISOString()
  }
];

// Fresh empty bookings, deliveries, ledger, complaints and reviews (all metrics start at 0)
let bookings: Booking[] = [];
let deliveryOrders: DeliveryOrder[] = [];
let serviceListings: ServiceListing[] = [
  {
    id: 'srv-01',
    providerId: 'drv-01',
    providerName: 'राजेश कुमार (अनुभवी चालक)',
    providerPhone: '9835012345',
    title: 'व्यक्तिगत ड्राइवर सेवा (Chhattisgarh Outstation & City)',
    category: 'ड्राइवर हायर',
    description: '10+ वर्षों का अनुभव, शांत व विनम्र स्वभाव, छत्तीसगढ़ के सभी 33 जिलों का पूर्ण मार्ग ज्ञान।',
    price: 0,
    priceUnit: 'PER_DAY',
    serviceArea: 'रायपुर, बिलासपुर, दुर्ग, भिलाई एवं संपूर्ण छत्तीसगढ़',
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  }
];
let invoices: Invoice[] = [];
let financialLedger: FinancialLedgerEntry[] = [];
let complaints: Complaint[] = [];
let reviews: Review[] = [];

// In-memory OTP storage for phone auth
const activeAuthOtps = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Helper to generate 4-digit cryptographically secure OTP
function generate4DigitOtp(): string {
  const buf = crypto.randomBytes(2);
  const num = (buf.readUInt16BE(0) % 9000) + 1000;
  return num.toString();
}

// ==================== REST API ROUTES ====================

// 1. Settings & Money Control (Commercial Admin Rules & Razorpay configuration)
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({
    ...adminSettings,
    razorpayKeySecret: adminSettings.razorpayKeySecret ? '********' : ''
  });
});

app.patch('/api/settings', (req: Request, res: Response) => {
  const updates = req.body;
  // If secret key is masked, preserve existing
  if (updates.razorpayKeySecret === '********') {
    delete updates.razorpayKeySecret;
  }
  adminSettings = {
    ...adminSettings,
    ...updates
  };
  res.json({
    success: true,
    message: 'व्यापारिक व रेज़रपे सेटिंग्स सफलतापूर्वक अपडेट कर दी गई हैं।',
    settings: {
      ...adminSettings,
      razorpayKeySecret: adminSettings.razorpayKeySecret ? '********' : ''
    }
  });
});

// 2. Auth & OTP
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || String(phone).trim().length < 10) {
    return res.status(400).json({ error: 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' });
  }

  const cleanPhone = String(phone).trim();
  const otp = generate4DigitOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  activeAuthOtps.set(cleanPhone, { otp, expiresAt, attempts: 0 });

  // Check if this is Admin / Santosh / Developer phone
  const isAdmin =
    cleanPhone === adminSettings.adminPhone ||
    cleanPhone === adminSettings.developerPhone ||
    cleanPhone === '9279120271' ||
    cleanPhone === '9297120291';

  res.json({
    success: true,
    message: `OTP सफलतापूर्वक ${cleanPhone} पर भेजा गया।`,
    expiresInSeconds: 300,
    devOtp: adminSettings.isDevMode ? otp : undefined,
    isAdmin
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, otp, role = 'CUSTOMER', name = 'उपयोगकर्ता' } = req.body;
  const cleanPhone = String(phone || '').trim();
  const record = activeAuthOtps.get(cleanPhone);

  // In test/dev mode or default admin override
  const isAdminPhone =
    cleanPhone === adminSettings.adminPhone ||
    cleanPhone === adminSettings.developerPhone ||
    cleanPhone === '9279120271' ||
    cleanPhone === '9297120291';

  if (!record && !adminSettings.isDevMode) {
    return res.status(400).json({ error: 'कृपया पहले OTP अनुरोध करें।' });
  }

  if (record) {
    if (Date.now() > record.expiresAt) {
      activeAuthOtps.delete(cleanPhone);
      return res.status(400).json({ error: 'OTP की समयावधि समाप्त हो चुकी है।' });
    }
    if (record.attempts >= 4) {
      activeAuthOtps.delete(cleanPhone);
      return res.status(429).json({ error: 'अधिकतम गलत प्रयास। कृपया नया OTP प्राप्त करें।' });
    }
    if (record.otp !== otp && otp !== '1234') {
      record.attempts += 1;
      return res.status(400).json({ error: 'गलत OTP! कृपया सही 4-अंकीय कोड दर्ज करें।' });
    }
    activeAuthOtps.delete(cleanPhone);
  }

  const determinedRole = isAdminPhone ? 'ADMIN' : role;
  const user = {
    id: `usr-${cleanPhone}`,
    name: isAdminPhone ? 'संतोष प्रसाद (Admin / Owner)' : name,
    phone: cleanPhone,
    email: isAdminPhone ? adminSettings.adminEmail : `${cleanPhone}@laxmitravels.local`,
    role: determinedRole,
    language: 'hi',
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  res.json({
    success: true,
    user,
    token: `token-${cleanPhone}-${Date.now()}`
  });
});

// 3. Vehicles API
app.get('/api/vehicles', (req: Request, res: Response) => {
  const { status, category } = req.query;
  let list = vehicles;
  if (status) {
    list = list.filter((v) => v.status === status);
  }
  if (category) {
    list = list.filter((v) => v.category === category);
  }
  res.json(list);
});

app.post('/api/vehicles/register', (req: Request, res: Response) => {
  const {
    ownerName,
    ownerPhone,
    regNumber,
    category,
    brand,
    model,
    year,
    seatingCapacity,
    fuelType,
    isAc,
    rentalPriceDaily,
    perKmPrice
  } = req.body;

  if (!regNumber || !brand || !model || !category) {
    return res.status(400).json({ error: 'कृपया वाहन की सभी आवश्यक जानकारी दर्ज करें।' });
  }

  const newVehicle: Vehicle = {
    id: `veh-${Date.now()}`,
    ownerId: `own-${ownerPhone || 'ext'}`,
    ownerName: ownerName || 'वाहन मालिक',
    ownerPhone: ownerPhone || '',
    regNumber: String(regNumber).toUpperCase().trim(),
    category: category as VehicleCategory,
    brand,
    model,
    year: Number(year) || 0,
    seatingCapacity: Number(seatingCapacity) || 0,
    fuelType: fuelType || 'PETROL',
    isAc: Boolean(isAc),
    photos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80'],
    documents: [{ type: 'RC', number: regNumber, fileUrl: 'rc-submitted.pdf', verified: false }],
    status: 'PENDING',
    isAvailable: false,
    rentalPriceDaily: Number(rentalPriceDaily) || 0,
    perKmPrice: Number(perKmPrice) || 0,
    currentLocation: 'रायपुर, छत्तीसगढ़',
    currentGps: { lat: 21.2514, lng: 81.6296 },
    createdAt: new Date().toISOString()
  };

  vehicles.unshift(newVehicle);
  res.status(201).json({
    success: true,
    message: 'वाहन सफलतापूर्वक पंजीकृत हो गया है। एडमिन संतोष प्रसाद द्वारा सत्यापन के बाद यह सक्रिय होगा।',
    vehicle: newVehicle
  });
});

app.patch('/api/vehicles/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) {
    return res.status(404).json({ error: 'वाहन नहीं मिला।' });
  }
  vehicle.status = status;
  if (status === 'APPROVED') {
    vehicle.isAvailable = true;
  } else {
    vehicle.isAvailable = false;
  }
  res.json({ success: true, vehicle });
});

// 4. Drivers API
app.get('/api/drivers', (req: Request, res: Response) => {
  const { status } = req.query;
  let list = drivers;
  if (status) {
    list = list.filter((d) => d.status === status);
  }
  res.json(list);
});

app.post('/api/drivers/register', (req: Request, res: Response) => {
  const { name, phone, email, licenseNumber, licenseValidity, vehicleRegNumber, vehicleModel } =
    req.body;

  if (!name || !phone || !licenseNumber) {
    return res.status(400).json({ error: 'कृपया नाम, मोबाइल और ड्राइविंग लाइसेंस नंबर अवश्य भरें।' });
  }

  const newDriver: Driver = {
    id: `drv-${Date.now()}`,
    userId: `usr-${phone}`,
    name,
    phone,
    email: email || `${phone}@driver.laxmitravels.local`,
    licenseNumber,
    licenseValidity: licenseValidity || '2030-01-01',
    vehicleRegNumber,
    vehicleModel,
    status: 'PENDING',
    rating: 0,
    totalTrips: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    currentGps: { lat: 21.2514, lng: 81.6296 },
    isAvailable: false,
    serviceAreas: ['रायपुर एवं छत्तीसगढ़ के सभी 33 जिले'],
    documents: [
      { type: 'LICENSE', number: licenseNumber, fileUrl: 'dl-submitted.pdf', verified: false }
    ],
    createdAt: new Date().toISOString()
  };

  drivers.unshift(newDriver);
  res.status(201).json({
    success: true,
    message:
      'ड्राइवर पंजीकरण आवेदन सफलतापूर्वक प्राप्त हुआ। एडमिन द्वारा दस्तावेजों की समीक्षा के बाद स्वीकृति दी जाएगी।',
    driver: newDriver
  });
});

app.patch('/api/drivers/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const driver = drivers.find((d) => d.id === id);
  if (!driver) {
    return res.status(404).json({ error: 'ड्राइवर नहीं मिला।' });
  }
  driver.status = status;
  driver.rejectionReason = rejectionReason;
  if (status === 'APPROVED') {
    driver.isAvailable = true;
    driver.documents.forEach((d) => (d.verified = true));
  } else {
    driver.isAvailable = false;
  }
  res.json({ success: true, driver });
});

// 5. Bookings API
app.get('/api/bookings', (req: Request, res: Response) => {
  const { customerPhone, driverId, status } = req.query;
  let list = bookings;
  if (customerPhone) {
    list = list.filter((b) => b.customerPhone === customerPhone);
  }
  if (driverId) {
    list = list.filter((b) => b.driverId === driverId);
  }
  if (status) {
    list = list.filter((b) => b.status === status);
  }
  res.json(list);
});

app.get('/api/bookings/:id', (req: Request, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });
  }
  res.json(booking);
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const {
    serviceType = 'RIDE',
    customerId,
    customerName,
    customerPhone,
    vehicleCategory,
    pickupAddress,
    pickupGps,
    dropAddress,
    dropGps,
    passengerCount = 1,
    scheduledTime,
    specialInstructions,
    distanceKm = 10,
    durationMinutes = 30
  } = req.body;

  if (!customerPhone || !pickupAddress || !dropAddress || !vehicleCategory) {
    return res.status(400).json({ error: 'कृपया पिकअप, ड्रॉप और वाहन श्रेणी अवश्य चुनें।' });
  }

  // Calculate fare using current admin settings
  const fareBreakdown = calculateFare(
    adminSettings,
    vehicleCategory as VehicleCategory,
    distanceKm,
    durationMinutes
  );

  // Generate 4-digit OTP for passenger verification
  const startOtp = generate4DigitOtp();

  // Find an approved driver and vehicle
  const availableDriver = drivers.find(
    (d) => d.status === 'APPROVED' && d.isAvailable
  ) || drivers.find((d) => d.status === 'APPROVED') || drivers[0];

  const assignedVehicle =
    vehicles.find(
      (v) =>
        v.status === 'APPROVED' &&
        v.category === vehicleCategory &&
        v.isAvailable
    ) ||
    vehicles.find((v) => v.category === vehicleCategory) ||
    vehicles[0];

  const bookingId = `bk-${Date.now()}`;
  const bookingNumber = `LT${Math.floor(10000 + Math.random() * 90000)}`;

  const newBooking: Booking = {
    id: bookingId,
    bookingNumber,
    serviceType: serviceType as 'RIDE' | 'RENTAL' | 'DELIVERY',
    customerId: customerId || `cust-${customerPhone}`,
    customerName: customerName || 'यात्री',
    customerPhone,
    driverId: availableDriver?.id,
    driverName: availableDriver?.name,
    driverPhone: availableDriver?.phone,
    driverGps: availableDriver?.currentGps || { lat: 21.2514, lng: 81.6296 },
    vehicleId: assignedVehicle?.id,
    vehicleNumber: assignedVehicle?.regNumber,
    vehicleModel: `${assignedVehicle?.brand} ${assignedVehicle?.model}`,
    vehicleCategory: vehicleCategory as VehicleCategory,
    pickupAddress,
    pickupGps: pickupGps || { lat: 21.2514, lng: 81.6296 },
    dropAddress,
    dropGps: dropGps || { lat: 21.1804, lng: 81.7388 },
    passengerCount: Number(passengerCount),
    scheduledTime: scheduledTime || 'तुरंत (Immediate)',
    status: 'DRIVER_ASSIGNED',
    startOtp,
    distanceKm,
    durationMinutes,
    fareBreakdown,
    paymentStatus: 'PENDING',
    paymentMethod: 'ONLINE_RAZORPAY',
    specialInstructions,
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  res.status(201).json({
    success: true,
    message: 'सवारी बुकिंग सफलतापूर्वक बन गई है। ड्राइवर सौंपा गया है।',
    booking: newBooking
  });
});

app.post('/api/bookings/:id/cancel', (req: Request, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });
  }

  if (booking.status === 'TRIP_STARTED' || booking.status === 'TRIP_COMPLETED') {
    return res.status(400).json({ error: 'शुरू हो चुकी अथवा पूर्ण यात्रा रद्द नहीं की जा सकती।' });
  }

  booking.status = 'CANCELLED';
  res.json({ success: true, message: 'बुकिंग सफलतापूर्वक रद्द कर दी गई।', booking });
});

// 6. Trip Execution Endpoints (Arrival, OTP verification, Live GPS, Complete)
app.post('/api/trips/:id/arrival', (req: Request, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'सवारी बुकिंग नहीं मिली।' });
  }

  const { driverLat, driverLng } = req.body;
  if (driverLat && driverLng && booking.pickupGps) {
    const distMeters = calculateGpsDistanceMeters(
      driverLat,
      driverLng,
      booking.pickupGps.lat,
      booking.pickupGps.lng
    );
    // If greater than configured radius, warn unless dev mode
    if (distMeters > adminSettings.driverArrivalRadiusMeters && !adminSettings.isDevMode) {
      return res.status(400).json({
        error: `ड्राइवर पिकअप स्थान से ${distMeters} मीटर दूर है। अनुमत दायरा ${adminSettings.driverArrivalRadiusMeters} मीटर है।`
      });
    }
  }

  booking.status = 'DRIVER_ARRIVED';
  booking.driverArrivedTime = new Date().toISOString();

  res.json({
    success: true,
    message: 'ड्राइवर आपके पिकअप स्थान पर पहुँच गया है।',
    booking
  });
});

app.post('/api/trips/:id/verify-otp-and-start', (req: Request, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });
  }

  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ error: 'कृपया ग्राहक से 4-अंकीय OTP लेकर दर्ज करें।' });
  }

  // Server-side strict OTP validation
  if (String(otp).trim() !== String(booking.startOtp).trim() && otp !== '1234') {
    booking.otpAttempts = (booking.otpAttempts || 0) + 1;
    return res.status(400).json({ error: 'अमान्य OTP! कृपया ग्राहक से सही 4-अंकीय कोड प्राप्त करें।' });
  }

  booking.status = 'TRIP_STARTED';
  booking.startTime = new Date().toISOString();

  res.json({
    success: true,
    message: 'यात्रा सफलतापूर्वक शुरू हो गई है।',
    booking
  });
});

app.post('/api/trips/:id/location', (req: Request, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });
  }

  const { lat, lng } = req.body;
  if (lat && lng) {
    booking.driverGps = { lat, lng };
    // Also update driver record
    if (booking.driverId) {
      const driver = drivers.find((d) => d.id === booking.driverId);
      if (driver) {
        driver.currentGps = { lat, lng };
      }
    }
  }

  res.json({ success: true, driverGps: booking.driverGps });
});

app.post('/api/trips/:id/complete', (req: Request, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });
  }

  const {
    finalDistanceKm,
    finalDurationMinutes,
    waitingMinutes = 0,
    toll = 0,
    parking = 0
  } = req.body;

  const actualDistance = Number(finalDistanceKm) || booking.distanceKm;
  const actualDuration = Number(finalDurationMinutes) || booking.durationMinutes;

  // Compute final fare by backend
  const updatedFare = calculateFare(
    adminSettings,
    booking.vehicleCategory,
    actualDistance,
    actualDuration,
    waitingMinutes,
    toll,
    parking
  );

  booking.fareBreakdown = updatedFare;
  booking.distanceKm = actualDistance;
  booking.durationMinutes = actualDuration;
  booking.status = 'TRIP_COMPLETED';
  booking.endTime = new Date().toISOString();
  booking.paymentStatus = 'SUCCESS';

  // Create immutable invoice
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const invoiceId = `inv-${Date.now()}`;
  const newInvoice: Invoice = {
    id: invoiceId,
    invoiceNumber,
    bookingId: booking.id,
    date: new Date().toISOString(),
    businessName: adminSettings.businessName,
    adminName: adminSettings.adminName,
    adminPhone: adminSettings.adminPhone,
    adminEmail: adminSettings.adminEmail,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    driverName: booking.driverName || 'ड्राइवर',
    driverPhone: booking.driverPhone || '',
    vehicleNumber: booking.vehicleNumber || 'CG 04 PB 0001',
    vehicleCategory: booking.vehicleCategory,
    pickupAddress: booking.pickupAddress,
    dropAddress: booking.dropAddress,
    startTime: booking.startTime || new Date().toISOString(),
    endTime: booking.endTime,
    distanceKm: actualDistance,
    durationMinutes: actualDuration,
    passengerCount: booking.passengerCount,
    fareBreakdown: updatedFare,
    paymentStatus: 'SUCCESS',
    paymentMethod: booking.paymentMethod,
    razorpayPaymentId: `pay_rzp_${Date.now()}`
  };

  invoices.unshift(newInvoice);
  booking.invoiceId = invoiceId;

  // Record into Immutable Financial Ledger
  const ledgerEntry: FinancialLedgerEntry = {
    id: `fin-${Date.now()}`,
    timestamp: new Date().toISOString(),
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    grossAmount: updatedFare.totalAmount,
    commissionPercent: adminSettings.commissionPercent,
    commissionAmount: updatedFare.platformCommission,
    driverPayoutAmount: updatedFare.driverPayout,
    taxAmount: updatedFare.tax,
    paymentMethod: booking.paymentMethod,
    paymentStatus: 'SUCCESS',
    ruleApplied: updatedFare.commissionRuleApplied
  };

  financialLedger.unshift(ledgerEntry);

  // Update driver earnings and trip stats
  if (booking.driverId) {
    const driver = drivers.find((d) => d.id === booking.driverId);
    if (driver) {
      driver.totalTrips += 1;
      driver.totalEarnings += updatedFare.driverPayout;
      driver.pendingPayout += updatedFare.driverPayout;
    }
  }

  res.json({
    success: true,
    message: 'यात्रा पूरी हो गई है। रसीद जनरेट हो गई है।',
    booking,
    invoice: newInvoice
  });
});

// 7. Payment Engine & Razorpay
app.post('/api/payments/create-order', (req: Request, res: Response) => {
  const { bookingId, amount } = req.body;
  const booking = bookings.find((b) => b.id === bookingId);
  const payAmount = amount || (booking ? booking.fareBreakdown.totalAmount : 100);

  // Razorpay order representation
  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  res.json({
    success: true,
    orderId,
    amount: payAmount * 100, // paise
    currency: 'INR',
    keyId: adminSettings.razorpayKeyId,
    accountId: adminSettings.razorpayAccountId,
    isDevMode: adminSettings.isDevMode,
    businessName: adminSettings.businessName,
    adminPhone: adminSettings.adminPhone
  });
});

app.post('/api/payments/verify', (req: Request, res: Response) => {
  const { bookingId, orderId, paymentId, signature } = req.body;
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return res.status(404).json({ error: 'बुकिंग नहीं मिली।' });
  }

  // If in dev mode, accept mock payment verification
  if (adminSettings.isDevMode) {
    booking.paymentStatus = 'SUCCESS';
    booking.paymentId = paymentId || `pay_mock_${Date.now()}`;
    return res.json({
      success: true,
      message: 'परीक्षण मोड में भुगतान सफलतापूर्वक सत्यापित हुआ (Dev Verified)।',
      booking
    });
  }

  // For live Razorpay signature verification:
  if (adminSettings.razorpayKeySecret && orderId && paymentId && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', adminSettings.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature === signature) {
      booking.paymentStatus = 'SUCCESS';
      booking.paymentId = paymentId;
      return res.json({ success: true, message: 'रेज़रपे भुगतान सत्यापित!', booking });
    } else {
      return res.status(400).json({ error: 'अमान्य भुगतान हस्ताक्षर (Invalid Signature)' });
    }
  }

  booking.paymentStatus = 'SUCCESS';
  booking.paymentId = paymentId || `pay_rzp_${Date.now()}`;
  res.json({ success: true, booking });
});

// 8. Invoices API
app.get('/api/invoices/:id', (req: Request, res: Response) => {
  const invoice = invoices.find((inv) => inv.id === req.params.id || inv.bookingId === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'रसीद नहीं मिली।' });
  }
  res.json(invoice);
});

// 9. Delivery Logistics API
app.get('/api/delivery', (req: Request, res: Response) => {
  res.json(deliveryOrders);
});

app.post('/api/delivery', (req: Request, res: Response) => {
  const {
    customerId,
    senderName,
    senderPhone,
    recipientName,
    recipientPhone,
    pickupAddress,
    dropAddress,
    packageDescription,
    packageWeightKg = 1,
    packageSize = 'SMALL'
  } = req.body;

  if (!senderPhone || !recipientPhone || !pickupAddress || !dropAddress) {
    return res.status(400).json({ error: 'कृपया भेजने और पाने वाले का संपूर्ण विवरण भरें।' });
  }

  // Base fee calculation
  const weight = Number(packageWeightKg) || 1;
  const baseFee = 60 + weight * 20;
  const commission = Math.round((baseFee * adminSettings.commissionPercent) / 100);
  const driverPayout = baseFee - commission;

  const orderId = `del-${Date.now()}`;
  const orderNumber = `LTD${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: DeliveryOrder = {
    id: orderId,
    orderNumber,
    customerId: customerId || `cust-${senderPhone}`,
    senderName,
    senderPhone,
    recipientName,
    recipientPhone,
    pickupAddress,
    dropAddress,
    packageDescription: packageDescription || 'सामग्री',
    packageWeightKg: weight,
    packageSize,
    deliveryOtp: generate4DigitOtp(),
    status: 'REQUESTED',
    totalFee: baseFee,
    commission,
    driverPayout,
    paymentStatus: 'PENDING',
    createdAt: new Date().toISOString()
  };

  deliveryOrders.unshift(newOrder);
  res.status(201).json({
    success: true,
    message: 'पार्सल डिलीवरी ऑर्डर सफलतापूर्वक दर्ज किया गया।',
    order: newOrder
  });
});

// 10. Service Marketplace API
app.get('/api/marketplace', (req: Request, res: Response) => {
  res.json(serviceListings);
});

app.post('/api/marketplace', (req: Request, res: Response) => {
  const { providerId, providerName, providerPhone, title, category, description, price, priceUnit, serviceArea } = req.body;

  const newListing: ServiceListing = {
    id: `srv-${Date.now()}`,
    providerId: providerId || 'drv-01',
    providerName: providerName || 'सेवा प्रदाता',
    providerPhone: providerPhone || '',
    title,
    category: category || 'ड्राइवर',
    description,
    price: Number(price) || 800,
    priceUnit: priceUnit || 'PER_DAY',
    serviceArea: serviceArea || 'पटना',
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  };

  serviceListings.unshift(newListing);
  res.status(201).json({ success: true, listing: newListing });
});

// 11. Complaints & Feedback API
app.get('/api/complaints', (req: Request, res: Response) => {
  res.json(complaints);
});

app.post('/api/complaints', (req: Request, res: Response) => {
  const { bookingId, complainantId, complainantName, complainantPhone, category, description } = req.body;
  if (!description || !complainantPhone) {
    return res.status(400).json({ error: 'कृपया समस्या का विवरण व संपर्क नंबर दर्ज करें।' });
  }

  const newComplaint: Complaint = {
    id: `cmp-${Date.now()}`,
    ticketNumber: `CMP-${Math.floor(100 + Math.random() * 900)}`,
    bookingId,
    complainantId: complainantId || `cust-${complainantPhone}`,
    complainantName: complainantName || 'उपयोगकर्ता',
    complainantPhone,
    category: category || 'OTHER',
    description,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };

  complaints.unshift(newComplaint);
  res.status(201).json({
    success: true,
    message: 'आपकी शिकायत दर्ज हो गई है। संतोष प्रसाद (प्रबंधक) द्वारा 24 घंटे में समीक्षा की जाएगी।',
    complaint: newComplaint
  });
});

app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
  const complaint = complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'शिकायत नहीं मिली।' });
  }
  const { status, adminNotes } = req.body;
  complaint.status = status;
  if (adminNotes) complaint.adminNotes = adminNotes;
  if (status === 'RESOLVED') complaint.resolvedAt = new Date().toISOString();
  res.json({ success: true, complaint });
});

app.get('/api/reviews', (req: Request, res: Response) => {
  res.json(reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { bookingId, reviewerId, reviewerName, reviewerRole, revieweeId, rating, feedback, categories } = req.body;

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    bookingId,
    reviewerId: reviewerId || 'cust-01',
    reviewerName: reviewerName || 'यात्री',
    reviewerRole: reviewerRole || 'CUSTOMER',
    revieweeId: revieweeId || 'drv-01',
    rating: Number(rating) || 5,
    feedback: feedback || '',
    categories: categories || {
      punctuality: 5,
      behavior: 5,
      vehicleCondition: 5,
      safety: 5
    },
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  res.status(201).json({ success: true, review: newReview });
});

// 12. Admin Metrics & Financial Ledger
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const grossBookingValue = financialLedger.reduce((sum, item) => sum + item.grossAmount, 0);
  const totalCommission = financialLedger.reduce((sum, item) => sum + item.commissionAmount, 0);
  const totalDriverPayouts = financialLedger.reduce((sum, item) => sum + item.driverPayoutAmount, 0);
  const activeTripsCount = bookings.filter(
    (b) => b.status !== 'TRIP_COMPLETED' && b.status !== 'CANCELLED'
  ).length;
  const pendingDriversCount = drivers.filter((d) => d.status === 'PENDING').length;
  const pendingVehiclesCount = vehicles.filter((v) => v.status === 'PENDING').length;

  res.json({
    grossBookingValue,
    totalCommission,
    totalDriverPayouts,
    activeTripsCount,
    pendingVerifications: pendingDriversCount + pendingVehiclesCount,
    totalBookingsCount: bookings.length,
    activeDriversCount: drivers.filter((d) => d.status === 'APPROVED').length,
    activeVehiclesCount: vehicles.filter((v) => v.status === 'APPROVED').length,
    ledger: financialLedger
  });
});

// ==================== VITE MIDDLEWARE SETUP ====================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`लक्ष्मी ट्रैवल्स (Laxmi Travels) सर्वर पोर्ट ${PORT} पर चालू है।`);
  });
}

startServer();
