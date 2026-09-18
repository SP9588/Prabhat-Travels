export type UserRole =
  | 'CUSTOMER'
  | 'DRIVER'
  | 'VEHICLE_OWNER'
  | 'DELIVERY_PARTNER'
  | 'SERVICE_PROVIDER'
  | 'ADMIN';

export type BookingStatus =
  | 'REQUESTED'
  | 'DRIVER_SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_EN_ROUTE'
  | 'DRIVER_ARRIVED'
  | 'OTP_REQUIRED'
  | 'TRIP_STARTED'
  | 'TRIP_IN_PROGRESS'
  | 'TRIP_COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type VehicleCategory =
  | 'HATCHBACK'
  | 'SEDAN'
  | 'SUV'
  | 'PREMIUM_SUV'
  | 'AUTO_RICKSHAW'
  | 'COMMERCIAL_VAN'
  | 'DELIVERY_BIKE';

export type VerificationStatus =
  | 'PENDING'
  | 'DOCUMENT_REVIEW'
  | 'VERIFICATION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED';

export type CommissionType = 'PERCENTAGE' | 'FIXED' | 'HYBRID';

export interface AdminCommercialSettings {
  businessName: string;
  adminName: string;
  adminPhone: string;
  developerPhone: string;
  adminEmail: string;
  commissionType: CommissionType;
  commissionPercent: number; // e.g. 10%
  commissionFixed: number; // e.g. 20 rupees
  minCommission: number; // e.g. 20 rupees
  maxCommission: number; // e.g. 500 rupees
  baseFare: Record<VehicleCategory, number>;
  perKmRate: Record<VehicleCategory, number>;
  perMinuteRate: number;
  waitingChargePerMinute: number;
  cancellationFee: number;
  gstRate: number; // e.g. 5%
  fuelSurcharge: number;
  driverArrivalRadiusMeters: number; // e.g. 100 meters
  driverArrivalWindowMinutes: number; // e.g. 10 minutes
  isDevMode: boolean; // simulated gateway vs live Razorpay
  razorpayAccountId: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  allowCashOnDelivery: boolean;
  contactVisibility: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar?: string;
  language: 'hi' | 'en';
  isVerified: boolean;
  createdAt: string;
}

export interface DriverDocument {
  type: 'LICENSE' | 'AADHAR' | 'PAN' | 'POLICE_VERIFICATION' | 'PHOTO';
  number?: string;
  fileUrl: string;
  expiryDate?: string;
  verified: boolean;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseValidity: string;
  assignedVehicleId?: string;
  vehicleRegNumber?: string;
  vehicleModel?: string;
  status: VerificationStatus;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  pendingPayout: number;
  currentGps: { lat: number; lng: number };
  isAvailable: boolean;
  serviceAreas: string[];
  documents: DriverDocument[];
  rejectionReason?: string;
  createdAt: string;
}

export interface VehicleDocument {
  type: 'RC' | 'INSURANCE' | 'FITNESS' | 'POLLUTION' | 'PERMIT';
  number?: string;
  fileUrl: string;
  expiryDate?: string;
  verified: boolean;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  regNumber: string;
  category: VehicleCategory;
  brand: string;
  model: string;
  year: number;
  seatingCapacity: number;
  fuelType: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC';
  isAc: boolean;
  photos: string[];
  documents: VehicleDocument[];
  status: VerificationStatus;
  isAvailable: boolean;
  rentalPriceDaily: number;
  perKmPrice: number;
  currentLocation: string;
  currentGps: { lat: number; lng: number };
  createdAt: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceCharge: number;
  timeCharge: number;
  waitingCharge: number;
  fuelSurcharge: number;
  toll: number;
  parking: number;
  discount: number;
  tax: number;
  totalAmount: number;
  platformCommission: number;
  commissionRuleApplied: string;
  driverPayout: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  serviceType: 'RIDE' | 'RENTAL' | 'DELIVERY';
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverGps?: { lat: number; lng: number };
  vehicleId?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  vehicleCategory: VehicleCategory;
  pickupAddress: string;
  pickupGps: { lat: number; lng: number };
  dropAddress: string;
  dropGps: { lat: number; lng: number };
  passengerCount: number;
  scheduledTime: string;
  status: BookingStatus;
  startOtp: string; // 4-digit random OTP
  otpAttempts?: number;
  startTime?: string;
  endTime?: string;
  distanceKm: number;
  durationMinutes: number;
  fareBreakdown: FareBreakdown;
  paymentStatus: PaymentStatus;
  paymentMethod: 'ONLINE_RAZORPAY' | 'UPI' | 'CASH';
  paymentId?: string;
  driverArrivedTime?: string;
  invoiceId?: string;
  customerReviewId?: string;
  driverReviewId?: string;
  specialInstructions?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  date: string;
  businessName: string;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
  customerName: string;
  customerPhone: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  vehicleCategory: string;
  pickupAddress: string;
  dropAddress: string;
  startTime: string;
  endTime: string;
  distanceKm: number;
  durationMinutes: number;
  passengerCount: number;
  fareBreakdown: FareBreakdown;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  razorpayPaymentId?: string;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  dropAddress: string;
  packageDescription: string;
  packageWeightKg: number;
  packageSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'HEAVY';
  deliveryOtp: string;
  status:
    | 'REQUESTED'
    | 'ASSIGNED'
    | 'PICKUP_PENDING'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'FAILED'
    | 'CANCELLED';
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  totalFee: number;
  commission: number;
  driverPayout: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  title: string;
  category: string;
  description: string;
  price: number;
  priceUnit: 'PER_DAY' | 'PER_TRIP' | 'PER_HOUR';
  serviceArea: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  revieweeId: string;
  rating: number; // 1 to 5
  feedback: string;
  categories: {
    punctuality: number;
    behavior: number;
    vehicleCondition: number;
    safety: number;
  };
  createdAt: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  bookingId?: string;
  complainantId: string;
  complainantName: string;
  complainantPhone: string;
  category: 'DRIVER_BEHAVIOR' | 'OVERCHARGING' | 'SAFETY' | 'VEHICLE_ISSUE' | 'DELAY' | 'OTHER';
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface FinancialLedgerEntry {
  id: string;
  timestamp: string;
  bookingId: string;
  bookingNumber: string;
  grossAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  driverPayoutAmount: number;
  taxAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  ruleApplied: string;
}
