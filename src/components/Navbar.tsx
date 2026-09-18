import React from 'react';
import {
  Car,
  ShieldCheck,
  Phone,
  Globe,
  UserCheck,
  Sliders,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { UserRole } from '../types';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDriverReg: () => void;
  onOpenVehicleReg: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  activeRole,
  onRoleChange,
  activeTab,
  onSelectTab,
  onOpenDriverReg,
  onOpenVehicleReg,
  onOpenHelp
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      {/* Top Banner with Santosh Prasad Admin / Contact info */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-50 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              {t.ownerTitle}: {t.ownerName}
            </span>
            <span className="hidden sm:inline text-amber-200/70">|</span>
            <span className="hidden sm:inline text-amber-100">
              मो: <a href="tel:9279120271" className="underline hover:text-white font-mono">9279120271</a> / <a href="tel:9297120291" className="underline hover:text-white font-mono">9297120291</a>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleLang}
              id="btn-switch-language"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-800/60 hover:bg-amber-800 text-amber-100 text-xs font-medium transition cursor-pointer"
            >
              <Globe className="w-3 h-3 text-amber-300" />
              <span>{t.switchLanguage}</span>
            </button>

            <a
              href="tel:9279120271"
              id="link-admin-call"
              className="inline-flex items-center gap-1 text-xs text-amber-100 hover:text-white font-medium"
            >
              <Phone className="w-3 h-3 text-amber-300" />
              <span className="hidden md:inline">24x7 हेल्पलाइन: 9279120271</span>
              <span className="md:hidden">हेल्पलाइन</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('book-ride')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-neutral-900 font-serif">
                {t.brandName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Official
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-tight hidden sm:block">
              {t.brandTagline}
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => onSelectTab('book-ride')}
            id="nav-tab-book-ride"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'book-ride'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-amber-600" />
            {t.navBookRide}
          </button>

          <button
            onClick={() => onSelectTab('rent-vehicle')}
            id="nav-tab-rent-vehicle"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rent-vehicle'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            {t.navRentVehicle}
          </button>

          <button
            onClick={() => onSelectTab('delivery')}
            id="nav-tab-delivery"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'delivery'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-600" />
            {t.navDelivery}
          </button>

          <button
            onClick={() => onSelectTab('admin-dashboard')}
            id="nav-tab-admin-dashboard"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admin-dashboard'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-100/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {t.navAdminDashboard}
          </button>
        </nav>

        {/* Right Section: Role Simulator & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Role Switcher Pill */}
          <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-0.5 text-xs">
            <span className="px-2 py-1 text-[11px] font-medium text-neutral-500 hidden sm:inline">
              मोड:
            </span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              id="select-active-role"
              className="bg-white border-0 rounded-md py-1 px-2 text-xs font-semibold text-neutral-800 focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
            >
              <option value="CUSTOMER">{t.roleCustomer}</option>
              <option value="DRIVER">{t.roleDriver}</option>
              <option value="ADMIN">{t.roleAdmin}</option>
            </select>
          </div>

          {/* Quick action: Register Driver / Vehicle or Help */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={onOpenDriverReg}
              id="btn-register-driver"
              className="px-2.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition cursor-pointer"
            >
              + {t.navBecomeDriver}
            </button>

            <button
              onClick={onOpenHelp}
              id="btn-open-help"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
              title={t.navHelp}
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Secondary Tab Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-neutral-100 bg-neutral-50 px-2 py-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => onSelectTab('book-ride')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'book-ride' ? 'bg-amber-600 text-white' : 'text-neutral-600'
          }`}
        >
          {t.navBookRide}
        </button>
        <button
          onClick={() => onSelectTab('rent-vehicle')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'rent-vehicle' ? 'bg-amber-600 text-white' : 'text-neutral-600'
          }`}
        >
          {t.navRentVehicle}
        </button>
        <button
          onClick={() => onSelectTab('delivery')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'delivery' ? 'bg-amber-600 text-white' : 'text-neutral-600'
          }`}
        >
          {t.navDelivery}
        </button>
        <button
          onClick={() => onSelectTab('admin-dashboard')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'admin-dashboard' ? 'bg-amber-700 text-white' : 'text-amber-800'
          }`}
        >
          एडमिन नियंत्रण
        </button>
      </div>
    </header>
  );
};
