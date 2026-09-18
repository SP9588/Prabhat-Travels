import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Fuel,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  Phone
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { Vehicle } from '../types';

interface VehicleRentalViewProps {
  lang: Language;
  onBookRentalVehicle: (vehicle: Vehicle) => void;
  onOpenVehicleReg: () => void;
}

export const VehicleRentalView: React.FC<VehicleRentalViewProps> = ({
  lang,
  onBookRentalVehicle,
  onOpenVehicleReg
}) => {
  const t = translations[lang];

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    if (filterCategory === 'ALL') return true;
    return v.category === filterCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30">
            दैनिक व प्रति किमी किराया सेवा - State: Chhattisgarh
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-serif mt-1">
            {t.rentalTitle}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1">
            रायपुर, बिलासपुर, दुर्ग-भिलाई, कोरबा, रायगढ़ सहित छत्तीसगढ़ के सभी 33 जिलों में दैनिक व साप्ताहिक वाहन रेंटल।
          </p>
        </div>

        <button
          onClick={onOpenVehicleReg}
          id="btn-register-my-vehicle"
          className="px-4 py-2.5 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 text-xs font-bold shadow-xs transition cursor-pointer self-stretch sm:self-auto text-center"
        >
          + अपना वाहन जोड़ें (वाहन मालिक)
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'ALL', label: 'सभी गाड़ियाँ (All)' },
          { key: 'SEDAN', label: 'सेडान (Sedan)' },
          { key: 'SUV', label: 'एसयूवी (SUV 7-Seater)' },
          { key: 'HATCHBACK', label: 'हैचबैक (Hatchback)' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterCategory(item.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterCategory === item.key
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((veh) => (
          <div
            key={veh.id}
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-44 bg-neutral-100">
                <img
                  src={veh.photos[0]}
                  alt={veh.model}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900/80 text-white backdrop-blur-xs font-mono">
                    {veh.regNumber}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      veh.status === 'APPROVED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {veh.status === 'APPROVED' ? 'सत्यापित' : 'समीक्षाधीन'}
                  </span>
                </div>
              </div>

              {/* Specs Body */}
              <div className="p-4 space-y-3">
                <div>
                  <h2 className="font-bold text-sm text-neutral-900 font-serif">
                    {veh.brand} {veh.model}
                  </h2>
                  <p className="text-xs text-neutral-500">{veh.currentLocation}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                  <div>
                    <span className="text-neutral-400 block">क्षमता</span>
                    <span className="font-bold text-neutral-800">{veh.seatingCapacity} सीट</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">ईंधन</span>
                    <span className="font-bold text-neutral-800">{veh.fuelType}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">कूलिंग</span>
                    <span className="font-bold text-neutral-800">{veh.isAc ? 'एसी' : 'नॉन-एसी'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Footer & Action */}
            <div className="p-4 pt-0 border-t border-neutral-100 mt-2">
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-lg font-black text-neutral-900 font-mono">
                    ₹{veh.rentalPriceDaily}
                  </span>
                  <span className="text-xs text-neutral-500"> / दिन</span>
                </div>
                <div className="text-right text-[11px] text-neutral-500 font-medium">
                  या ₹{veh.perKmPrice}/किमी
                </div>
              </div>

              <button
                onClick={() => onBookRentalVehicle(veh)}
                id={`btn-rent-vehicle-${veh.id}`}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{t.bookRentalBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
