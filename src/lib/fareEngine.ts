import { AdminCommercialSettings, FareBreakdown, VehicleCategory } from '../types';

export const VEHICLE_CAPACITY_LIMITS: Record<VehicleCategory, number> = {
  DELIVERY_BIKE: 1,
  AUTO_RICKSHAW: 3,
  HATCHBACK: 4,
  SEDAN: 4,
  SUV: 7,
  PREMIUM_SUV: 7,
  COMMERCIAL_VAN: 12,
};

export function validatePassengerCapacity(
  category: VehicleCategory,
  passengerCount: number
): { valid: boolean; maxAllowed: number; messageHi: string; messageEn: string } {
  const maxAllowed = VEHICLE_CAPACITY_LIMITS[category] || 4;
  if (passengerCount > maxAllowed) {
    return {
      valid: false,
      maxAllowed,
      messageHi: `इस वाहन श्रेणी (${category}) में अधिकतम ${maxAllowed} यात्री बैठ सकते हैं। कृपया बड़ी गाड़ी चुनें।`,
      messageEn: `Maximum passenger capacity for ${category} is ${maxAllowed}. Please select a larger vehicle.`
    };
  }
  return {
    valid: true,
    maxAllowed,
    messageHi: 'यात्री क्षमता स्वीकृत है।',
    messageEn: 'Passenger count is within capacity.'
  };
}

export function calculateFare(
  settings: AdminCommercialSettings,
  category: VehicleCategory,
  distanceKm: number,
  durationMinutes: number,
  waitingMinutes: number = 0,
  toll: number = 0,
  parking: number = 0,
  discount: number = 0
): FareBreakdown {
  const baseFare = settings.baseFare[category] ?? 80;
  const perKm = settings.perKmRate[category] ?? 14;
  const distanceCharge = Math.round(distanceKm * perKm);
  const timeCharge = Math.round(durationMinutes * settings.perMinuteRate);
  const waitingCharge = Math.round(waitingMinutes * settings.waitingChargePerMinute);
  const fuelSurcharge = settings.fuelSurcharge || 0;

  const subtotalBeforeTax = Math.max(
    baseFare,
    baseFare + distanceCharge + timeCharge + waitingCharge + fuelSurcharge + toll + parking - discount
  );

  const tax = Math.round((subtotalBeforeTax * (settings.gstRate || 5)) / 100);
  const totalAmount = subtotalBeforeTax + tax;

  // Calculate platform commission based on Admin Settings
  let commission = 0;
  let ruleApplied = '';

  if (settings.commissionType === 'PERCENTAGE') {
    commission = Math.round((totalAmount * settings.commissionPercent) / 100);
    ruleApplied = `${settings.commissionPercent}% platform commission`;
  } else if (settings.commissionType === 'FIXED') {
    commission = settings.commissionFixed;
    ruleApplied = `₹${settings.commissionFixed} fixed platform fee`;
  } else {
    // HYBRID
    const pct = Math.round((totalAmount * settings.commissionPercent) / 100);
    commission = pct + settings.commissionFixed;
    ruleApplied = `${settings.commissionPercent}% + ₹${settings.commissionFixed} hybrid fee`;
  }

  // Enforce min & max commission bounds set by Admin
  if (settings.minCommission && commission < settings.minCommission) {
    commission = settings.minCommission;
  }
  if (settings.maxCommission && commission > settings.maxCommission) {
    commission = settings.maxCommission;
  }

  // Driver Payout
  const driverPayout = Math.max(0, totalAmount - commission);

  return {
    baseFare,
    distanceCharge,
    timeCharge,
    waitingCharge,
    fuelSurcharge,
    toll,
    parking,
    discount,
    tax,
    totalAmount,
    platformCommission: commission,
    commissionRuleApplied: ruleApplied,
    driverPayout
  };
}

/**
 * Calculates distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateGpsDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
