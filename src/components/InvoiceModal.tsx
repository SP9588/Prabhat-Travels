import React, { useEffect, useState } from 'react';
import {
  FileText,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Car,
  MapPin,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { Invoice } from '../types';

interface InvoiceModalProps {
  lang: Language;
  invoiceId: string;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ lang, invoiceId, onClose }) => {
  const t = translations[lang];

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    fetch(`/api/invoices/${invoiceId}`)
      .then((res) => res.json())
      .then((data) => setInvoice(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center text-xs font-semibold">
          रसीद लोड हो रही है...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center text-xs space-y-3 max-w-sm">
          <p className="text-red-600 font-bold">रसीद नहीं मिली।</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    );
  }

  const { fareBreakdown } = invoice;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 print:p-0 print:shadow-none print:max-w-none">
        {/* Header with Print and Close Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-sm text-neutral-900">{t.invoiceTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="btn-print-receipt"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printInvoiceBtn}</span>
            </button>

            <button
              onClick={onClose}
              id="btn-close-invoice"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Bill Body */}
        <div className="space-y-6 print:space-y-4">
          {/* Business Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-neutral-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-serif tracking-tight text-neutral-900">
                  {invoice.businessName || 'लक्ष्मी ट्रैवल्स (Laxmi Travels)'}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Official
                </span>
              </div>
              <div className="text-xs text-neutral-600 font-medium mt-1">
                प्रबंधक / संचालक: <strong>संतोष प्रसाद (Santosh Prasad)</strong>
              </div>
              <div className="text-xs text-neutral-500 font-mono mt-0.5 flex flex-wrap gap-x-3">
                <span>मो: 9279120271 / 9297120291</span>
                <span>ईमेल: {invoice.adminEmail || 'santoshprasad8891@gmail.com'}</span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <div className="font-mono font-bold text-base text-amber-900">
                {invoice.invoiceNumber}
              </div>
              <div className="text-neutral-500 font-mono text-[11px] mt-0.5">
                बुकिंग: {invoice.bookingId}
              </div>
              <div className="text-neutral-500 text-[11px] mt-0.5">
                दिनांक: {new Date(invoice.date).toLocaleDateString('hi-IN')}
              </div>
            </div>
          </div>

          {/* Customer & Journey Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div className="space-y-1">
              <div className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                ग्राहक विवरण (Customer Details)
              </div>
              <div className="font-bold text-sm text-neutral-900">{invoice.customerName}</div>
              <div className="font-mono text-neutral-600">मो: {invoice.customerPhone}</div>
              <div className="text-neutral-500 text-[11px]">यात्री संख्या: {invoice.passengerCount}</div>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                चालक व वाहन (Driver & Fleet)
              </div>
              <div className="font-bold text-sm text-neutral-900">{invoice.driverName}</div>
              <div className="font-mono text-neutral-600">मो: {invoice.driverPhone}</div>
              <div className="font-mono font-bold text-amber-900">
                गाड़ी: {invoice.vehicleNumber} ({invoice.vehicleCategory})
              </div>
            </div>
          </div>

          {/* Route details */}
          <div className="text-xs space-y-1 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>पिकअप:</strong> {invoice.pickupAddress}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>गंतव्य:</strong> {invoice.dropAddress}
              </span>
            </div>
            <div className="text-neutral-500 text-[11px] pt-1 flex gap-4 font-mono">
              <span>कुल दूरी: {invoice.distanceKm} किमी</span>
              <span>समय: {invoice.durationMinutes} मिनट</span>
            </div>
          </div>

          {/* Itemized Fare Breakdown Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-700">
              किराया व वित्तीय विवरण (Itemized Breakdown)
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-300 text-neutral-600">
                  <th className="py-2 text-left">मद (Description)</th>
                  <th className="py-2 text-right">राशि (Amount)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                <tr>
                  <td className="py-2 text-neutral-800 font-sans">{t.baseFare}</td>
                  <td className="py-2 text-right text-neutral-900">₹{fareBreakdown.baseFare}</td>
                </tr>
                <tr>
                  <td className="py-2 text-neutral-800 font-sans">
                    {t.distanceCharge} ({invoice.distanceKm} किमी)
                  </td>
                  <td className="py-2 text-right text-neutral-900">
                    ₹{fareBreakdown.distanceCharge}
                  </td>
                </tr>
                {fareBreakdown.fuelSurcharge > 0 && (
                  <tr>
                    <td className="py-2 text-neutral-800 font-sans">{t.fuelSurcharge}</td>
                    <td className="py-2 text-right text-neutral-900">
                      ₹{fareBreakdown.fuelSurcharge}
                    </td>
                  </tr>
                )}
                {fareBreakdown.tax > 0 && (
                  <tr>
                    <td className="py-2 text-neutral-800 font-sans">{t.taxGst} (5%)</td>
                    <td className="py-2 text-right text-neutral-900">₹{fareBreakdown.tax}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-neutral-900 font-bold text-sm bg-neutral-50">
                  <td className="py-2.5 px-2 text-neutral-900 font-sans">{t.totalPayable}</td>
                  <td className="py-2.5 px-2 text-right text-neutral-900 font-black text-base">
                    ₹{fareBreakdown.totalAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Commercial Platform Audit Note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-bold">मंच कमीशन व चालक भुगतान सत्यापन:</span>
              <div>
                लागू नियम: {fareBreakdown.commissionRuleApplied} | चालक शुद्ध प्राप्ति: ₹
                {fareBreakdown.driverPayout}
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                रेज़रपे सत्यापित
              </span>
            </div>
          </div>

          {/* Footer declaration */}
          <div className="text-center text-[10px] text-neutral-400 border-t border-neutral-200 pt-3">
            यह कंप्यूटर जनित अधिकृत बीजक है। किसी भी सहायता अथवा पूछताछ के लिए संपर्क करें:
            संतोष प्रसाद (मो: 9279120271 / 9297120291)
          </div>
        </div>
      </div>
    </div>
  );
};
