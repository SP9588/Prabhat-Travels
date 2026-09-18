import React, { useState } from 'react';
import { UserPlus, X, CheckCircle2, Shield, Upload } from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface DriverRegistrationModalProps {
  lang: Language;
  onClose: () => void;
  onSuccess: () => void;
}

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({
  lang,
  onClose,
  onSuccess
}) => {
  const t = translations[lang];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleRegNumber, setVehicleRegNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/drivers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          licenseNumber,
          vehicleModel,
          vehicleRegNumber
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
            <UserPlus className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base text-neutral-900 font-serif">
              {t.driverRegTitle}
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
            <h3 className="text-base font-bold text-neutral-900">आवेदन सफलतापूर्वक जमा हुआ</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t.pendingApprovalNotice}
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
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                {t.driverFullName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="जैसे: राकेश कुमार"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                {t.driverPhone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-अंकीय मोबाइल नंबर"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                {t.driverLicenseNumber} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="जैसे: CG0420230012345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">वाहन मॉडल</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Dzire / Ertiga"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">गाड़ी नंबर (यदि है)</label>
                <input
                  type="text"
                  value={vehicleRegNumber}
                  onChange={(e) => setVehicleRegNumber(e.target.value)}
                  placeholder="CG 04 EA 0000"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-300 text-center space-y-1">
              <Upload className="w-5 h-5 text-neutral-400 mx-auto" />
              <div className="font-semibold text-neutral-700">{t.driverUploadDocs}</div>
              <div className="text-[10px] text-neutral-400">
                दस्तावेज़ की तस्वीर या पीडीएफ अपलोड करें (Admin समीक्षा हेतु)
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="btn-submit-driver-application"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {loading ? 'आवेदन जमा हो रहा है...' : t.submitDriverRegBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
