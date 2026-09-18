import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CreditCard,
  UserCheck,
  Car,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Save,
  RefreshCw,
  Phone,
  Lock,
  FileSpreadsheet,
  IndianRupee,
  Clock
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import {
  AdminCommercialSettings,
  CommissionType,
  Complaint,
  Driver,
  FinancialLedgerEntry,
  Vehicle,
  VehicleCategory
} from '../types';

interface AdminDashboardProps {
  lang: Language;
  currentSettings: AdminCommercialSettings;
  onSettingsUpdated: (settings: AdminCommercialSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  currentSettings,
  onSettingsUpdated
}) => {
  const t = translations[lang];

  const [activeSubTab, setActiveSubTab] = useState<
    'commercial' | 'razorpay' | 'drivers' | 'vehicles' | 'ledger' | 'complaints'
  >('commercial');

  const [formData, setFormData] = useState<AdminCommercialSettings>(currentSettings);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [ledger, setLedger] = useState<FinancialLedgerEntry[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState<{
    grossBookingValue: number;
    totalCommission: number;
    totalDriverPayouts: number;
    activeTripsCount: number;
    pendingVerifications: number;
    totalBookingsCount: number;
  }>({
    grossBookingValue: 0,
    totalCommission: 0,
    totalDriverPayouts: 0,
    activeTripsCount: 0,
    pendingVerifications: 0,
    totalBookingsCount: 0
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Sync formData when currentSettings change
  useEffect(() => {
    setFormData(currentSettings);
  }, [currentSettings]);

  // Load backend admin data
  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const [driversRes, vehiclesRes, metricsRes, complaintsRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/vehicles'),
        fetch('/api/admin/metrics'),
        fetch('/api/complaints')
      ]);

      if (driversRes.ok) setDrivers(await driversRes.json());
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json());
      if (complaintsRes.ok) setComplaints(await complaintsRes.json());
      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetrics(mData);
        if (mData.ledger) setLedger(mData.ledger);
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सेटिंग्स सहेजने में विफल।');

      onSettingsUpdated(data.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'त्रुटि हुई');
    } finally {
      setSaving(false);
    }
  };

  // Driver Status Update
  const handleDriverStatus = async (driverId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Vehicle Status Update
  const handleVehicleStatus = async (vehicleId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Complaint Status Update
  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED', adminNotes: 'संतोष प्रसाद द्वारा निवारण किया गया।' })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with Admin Authority Notice */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-950 text-white rounded-2xl p-6 shadow-md border border-neutral-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>प्रबंधक नियंत्रण पैनल | सर्वाधिकार सुरक्षित</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
              {t.adminPanelTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
              संचालक: <strong>संतोष प्रसाद</strong> (मो: <strong>9279120271</strong> / डेवलपर: <strong>9297120291</strong>)।
              मंच के सभी व्यावसायिक नियम, कमीशन, किराया दरें और रेज़रपे मर्चेंट खाता यहीं से नियंत्रित होते हैं।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              id="btn-refresh-admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-600 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>ताज़ा करें</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-neutral-700/60">
          <div className="bg-neutral-800/60 rounded-xl p-3 border border-neutral-700">
            <div className="text-[11px] text-neutral-400 font-medium">सकल बुकिंग राशि</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              ₹{metrics.grossBookingValue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-900/60">
            <div className="text-[11px] text-amber-300 font-medium">प्लेटफ़ॉर्म कमीशन आय</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              ₹{metrics.totalCommission.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-neutral-800/60 rounded-xl p-3 border border-neutral-700">
            <div className="text-[11px] text-neutral-400 font-medium">चालक भुगतान (Payouts)</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              ₹{metrics.totalDriverPayouts.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-neutral-800/60 rounded-xl p-3 border border-neutral-700">
            <div className="text-[11px] text-neutral-400 font-medium">लंबित अनुमोदन (Pending)</div>
            <div className="text-xl font-bold font-mono text-orange-400 mt-0.5">
              {metrics.pendingVerifications}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveSubTab('commercial')}
          id="tab-btn-commercial"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'commercial'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t.tabCommercialRules}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('razorpay')}
          id="tab-btn-razorpay"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'razorpay'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t.tabRazorpayGateway}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('drivers')}
          id="tab-btn-drivers"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'drivers'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>ड्राइवर अनुमोदन ({drivers.filter((d) => d.status === 'PENDING').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vehicles')}
          id="tab-btn-vehicles"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'vehicles'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>वाहन अनुमोदन ({vehicles.filter((v) => v.status === 'PENDING').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          id="tab-btn-ledger"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'ledger'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{t.tabFinancialLedger}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('complaints')}
          id="tab-btn-complaints"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'complaints'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{t.tabComplaints} ({complaints.filter((c) => c.status === 'OPEN').length})</span>
        </button>
      </div>

      {/* SUBTAB 1: Commercial Rules & Money Control Form */}
      {activeSubTab === 'commercial' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>व्यापारिक व कमीशन सेटिंग्स सफलतापूर्वक अपडेट कर दी गई हैं!</span>
            </div>
          )}

          {/* Commission Engine Box */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 font-serif">
                  {t.commissionSettingsTitle}
                </h2>
                <p className="text-xs text-neutral-500">
                  प्रत्येक पूर्ण सवारी अथवा किराए पर मंच की कमीशन राशि निर्धारित करें।
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-amber-100 text-amber-900">
                वर्तमान दर: {formData.commissionPercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.commissionTypeLabel}
                </label>
                <select
                  value={formData.commissionType}
                  onChange={(e) =>
                    setFormData({ ...formData, commissionType: e.target.value as CommissionType })
                  }
                  id="select-commission-type"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-800"
                >
                  <option value="PERCENTAGE">प्रतिशत आधारित (Percentage %)</option>
                  <option value="FIXED">निश्चित राशि (Fixed ₹)</option>
                  <option value="HYBRID">मिश्रित (Percentage + Fixed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.commissionPercentLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    id="input-commission-percent"
                    value={formData.commissionPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionPercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-neutral-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.minCommissionLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  id="input-min-commission"
                  value={formData.minCommission}
                  onChange={(e) =>
                    setFormData({ ...formData, minCommission: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.maxCommissionLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  id="input-max-commission"
                  value={formData.maxCommission}
                  onChange={(e) =>
                    setFormData({ ...formData, maxCommission: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Pricing Per Vehicle Category */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900 font-serif">
                वाहन श्रेणी अनुसार आधार किराया व प्रति किलोमीटर दर (Pricing Engine)
              </h2>
              <p className="text-xs text-neutral-500">
                प्रत्येक वाहन श्रेणी का न्यूनतम बेस किराया एवं प्रति किमी शुल्क तय करें।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  { key: 'HATCHBACK', label: 'हैचबैक (Hatchback 4-Seater)' },
                  { key: 'SEDAN', label: 'सेडान (Sedan 4-Seater)' },
                  { key: 'SUV', label: 'एसयूवी (SUV 7-Seater)' },
                  { key: 'PREMIUM_SUV', label: 'प्रीमियम (Innova / Fortuner)' },
                  { key: 'AUTO_RICKSHAW', label: 'ऑटो रिक्शा (3-Seater)' },
                  { key: 'COMMERCIAL_VAN', label: 'कमर्शियल वैन (12-Seater)' }
                ] as { key: VehicleCategory; label: string }[]
              ).map((cat) => (
                <div
                  key={cat.key}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3"
                >
                  <div className="font-bold text-xs text-neutral-900">{cat.label}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-neutral-600 font-medium">बेस किराया (₹)</label>
                      <input
                        type="number"
                        value={formData.baseFare[cat.key] || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baseFare: {
                              ...formData.baseFare,
                              [cat.key]: parseInt(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-600 font-medium">प्रति किमी (₹)</label>
                      <input
                        type="number"
                        value={formData.perKmRate[cat.key] || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            perKmRate: {
                              ...formData.perKmRate,
                              [cat.key]: parseInt(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Operational Charges & Tax */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900 font-serif">
              अतिरिक्त प्रभार व जीपीएस सीमा (Operational & Surcharges)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700">जीएसटी दर (%)</label>
                <input
                  type="number"
                  value={formData.gstRate}
                  onChange={(e) =>
                    setFormData({ ...formData, gstRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700">ईंधन अधिभार (₹)</label>
                <input
                  type="number"
                  value={formData.fuelSurcharge}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelSurcharge: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700">रद्दीकरण शुल्क (₹)</label>
                <input
                  type="number"
                  value={formData.cancellationFee}
                  onChange={(e) =>
                    setFormData({ ...formData, cancellationFee: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700">प्रतीक्षा शुल्क/मिनट (₹)</label>
                <input
                  type="number"
                  value={formData.waitingChargePerMinute}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waitingChargePerMinute: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700">ड्राइवर आगमन दायरा (मीटर)</label>
                <input
                  type="number"
                  value={formData.driverArrivalRadiusMeters}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      driverArrivalRadiusMeters: parseInt(e.target.value) || 100
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700">आगमन समय विंडो (मिनट)</label>
                <input
                  type="number"
                  value={formData.driverArrivalWindowMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      driverArrivalWindowMinutes: parseInt(e.target.value) || 10
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              id="btn-save-commercial-settings"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'सहेजा जा रहा है...' : t.saveCommissionBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 2: Razorpay Account Control */}
      {activeSubTab === 'razorpay' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>रेज़रपे खाता क्रेडेंशियल्स सफलतापूर्वक सहेजे गए!</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-neutral-900 font-serif flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span>{t.razorpaySettingsTitle}</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">{t.razorpayNotice}</p>
              </div>

              {/* Dev Mode toggle badge */}
              <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
                <input
                  type="checkbox"
                  id="checkbox-dev-mode"
                  checked={formData.isDevMode}
                  onChange={(e) => setFormData({ ...formData, isDevMode: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="checkbox-dev-mode"
                  className="text-xs font-bold text-neutral-800 cursor-pointer select-none"
                >
                  {t.devModeToggle}
                </label>
              </div>
            </div>

            {formData.isDevMode && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>डेवलपर परीक्षण मोड सक्रिय है (Sandbox Active)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">{t.devModeNotice}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Razorpay Account ID */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.razorpayAccountIdLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  id="input-razorpay-account-id"
                  value={formData.razorpayAccountId}
                  onChange={(e) => setFormData({ ...formData, razorpayAccountId: e.target.value })}
                  placeholder="acc_santosh_9297120291"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-xs font-bold text-neutral-900"
                />
                <span className="text-[10px] text-neutral-500">
                  संतोष प्रसाद / डेवलपर के अधिकृत रेज़रपे खाते की आईडी
                </span>
              </div>

              {/* Razorpay Key ID */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.razorpayKeyIdLabel}
                </label>
                <input
                  type="text"
                  id="input-razorpay-key-id"
                  value={formData.razorpayKeyId}
                  onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                  placeholder="rzp_test_santoshprasad"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-xs font-bold text-neutral-900"
                />
              </div>

              {/* Razorpay Key Secret */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{t.razorpayKeySecretLabel}</span>
                </label>
                <input
                  type="password"
                  id="input-razorpay-key-secret"
                  value={formData.razorpayKeySecret}
                  onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                  placeholder="********"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-neutral-900"
                />
                <span className="text-[10px] text-neutral-500">
                  सर्वर साइड पर सुरक्षित रहता है, कभी ब्राउज़र में प्रकट नहीं होता।
                </span>
              </div>

              {/* Razorpay Webhook Secret */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{t.razorpayWebhookLabel}</span>
                </label>
                <input
                  type="password"
                  id="input-razorpay-webhook-secret"
                  value={formData.razorpayWebhookSecret}
                  onChange={(e) =>
                    setFormData({ ...formData, razorpayWebhookSecret: e.target.value })
                  }
                  placeholder="whsec_..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-xs text-neutral-900"
                />
              </div>
            </div>

            {/* Admin and Developer Phone Numbers */}
            <div className="pt-4 border-t border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  प्रबंधक संतोष प्रसाद का फ़ोन नंबर (Admin Phone)
                </label>
                <input
                  type="tel"
                  id="input-admin-phone"
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  डेवलपर फ़ोन नंबर (Dev Phone: 9297120291)
                </label>
                <input
                  type="tel"
                  id="input-developer-phone"
                  value={formData.developerPhone}
                  onChange={(e) => setFormData({ ...formData, developerPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              id="btn-save-razorpay-creds"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'सहेजा जा रहा है...' : t.saveRazorpayBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 3: Driver Approvals */}
      {activeSubTab === 'drivers' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 font-serif">
                ड्राइवर सत्यापन एवं अनुमोदन सूची
              </h2>
              <p className="text-xs text-neutral-500">
                केवल स्वीकृत (Approved) ड्राइवर ही लक्ष्मी ट्रैवल्स पर सवारी स्वीकार कर सकते हैं।
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-2.5 px-3">नाम व मोबाइल</th>
                  <th className="py-2.5 px-3">लाइसेंस संख्या</th>
                  <th className="py-2.5 px-3">वाहन मॉडल</th>
                  <th className="py-2.5 px-3">रेटिंग / ट्रिप</th>
                  <th className="py-2.5 px-3">स्थिति (Status)</th>
                  <th className="py-2.5 px-3 text-right">कार्रवाई (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-900">{drv.name}</div>
                      <div className="font-mono text-neutral-500">{drv.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-700">
                      {drv.licenseNumber}
                    </td>
                    <td className="py-3 px-3 text-neutral-700">
                      {drv.vehicleModel || 'असाइन नहीं'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold">{drv.rating} ★</span> ({drv.totalTrips} यात्राएं)
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          drv.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : drv.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {drv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {drv.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleDriverStatus(drv.id, 'APPROVED')}
                          id={`btn-approve-driver-${drv.id}`}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          अनुमोदित करें (Approve)
                        </button>
                      )}
                      {drv.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleDriverStatus(drv.id, 'REJECTED')}
                          id={`btn-reject-driver-${drv.id}`}
                          className="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-[11px] transition cursor-pointer"
                        >
                          अस्वीकार
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Vehicle Approvals */}
      {activeSubTab === 'vehicles' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-base font-bold text-neutral-900 font-serif">
              वाहन सत्यापन एवं बेड़ा अनुमोदन सूची
            </h2>
            <p className="text-xs text-neutral-500">
              वाहन के आरसी (RC) व फिटनेस के सत्यापन के बाद ही बुकिंग स्वीकार्य होगी।
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-2.5 px-3">गाड़ी नंबर</th>
                  <th className="py-2.5 px-3">ब्रांड व मॉडल</th>
                  <th className="py-2.5 px-3">श्रेणी / सीट</th>
                  <th className="py-2.5 px-3">ईंधन / एसी</th>
                  <th className="py-2.5 px-3">दैनिक किराया</th>
                  <th className="py-2.5 px-3">स्थिति</th>
                  <th className="py-2.5 px-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {vehicles.map((veh) => (
                  <tr key={veh.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-mono font-black text-amber-900">
                      {veh.regNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-900">
                      {veh.brand} {veh.model} ({veh.year})
                    </td>
                    <td className="py-3 px-3 text-neutral-600">
                      {veh.category} ({veh.seatingCapacity} सीट)
                    </td>
                    <td className="py-3 px-3 text-neutral-600">
                      {veh.fuelType} | {veh.isAc ? 'AC' : 'Non-AC'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                      ₹{veh.rentalPriceDaily}/दिन
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          veh.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {veh.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {veh.status !== 'APPROVED' ? (
                        <button
                          onClick={() => handleVehicleStatus(veh.id, 'APPROVED')}
                          id={`btn-approve-veh-${veh.id}`}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          स्वीकार करें
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVehicleStatus(veh.id, 'REJECTED')}
                          id={`btn-suspend-veh-${veh.id}`}
                          className="px-2.5 py-1 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold text-[11px] transition cursor-pointer"
                        >
                          निलंबित करें
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 5: Immutable Financial Ledger */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-neutral-900 font-serif">
                अपरिवर्तनीय वित्तीय बहीखाता (Immutable Commission Ledger)
              </h2>
              <p className="text-xs text-neutral-500">
                हर लेन-देन का स्थायी वित्तीय रिकॉर्ड, कमीशन गणना और भुगतान नियम।
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              कुल आय: ₹{metrics.totalCommission}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-2.5 px-3">समय</th>
                  <th className="py-2.5 px-3">बुकिंग संख्या</th>
                  <th className="py-2.5 px-3">सकल किराया</th>
                  <th className="py-2.5 px-3">कमीशन नियम</th>
                  <th className="py-2.5 px-3">मंच कमीशन (आय)</th>
                  <th className="py-2.5 px-3">चालक भुगतान</th>
                  <th className="py-2.5 px-3">भुगतान स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 text-neutral-500 text-[11px]">
                      {new Date(entry.timestamp).toLocaleString('hi-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                      {entry.bookingNumber}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                      ₹{entry.grossAmount}
                    </td>
                    <td className="py-3 px-3 text-neutral-600">{entry.ruleApplied}</td>
                    <td className="py-3 px-3 font-mono font-black text-amber-700">
                      +₹{entry.commissionAmount}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-700">
                      ₹{entry.driverPayoutAmount}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {entry.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 6: Complaints & Dispute Resolution */}
      {activeSubTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-base font-bold text-neutral-900 font-serif">
              ग्राहक व चालक शिकायत निवारण केंद्र
            </h2>
            <p className="text-xs text-neutral-500">
              संतोष प्रसाद द्वारा व्यक्तिगत समीक्षा और त्वरित समाधान।
            </p>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-neutral-200 hover:border-amber-300 transition bg-neutral-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-neutral-500">
                      {c.ticketNumber}
                    </span>
                    <span className="font-bold text-xs text-neutral-900">{c.complainantName}</span>
                    <span className="text-xs text-neutral-500 font-mono">({c.complainantPhone})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-800">{c.description}</p>

                {c.adminNotes && (
                  <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-lg">
                    <strong>एडमिन टिप्पणी:</strong> {c.adminNotes}
                  </div>
                )}

                {c.status !== 'RESOLVED' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleResolveComplaint(c.id)}
                      id={`btn-resolve-complaint-${c.id}`}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      समाधान चिह्नित करें (Mark Resolved)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
