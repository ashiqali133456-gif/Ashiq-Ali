/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  ShieldCheck,
  GraduationCap,
  Users,
  Lock,
  Menu,
  X,
  ChevronDown,
  Award,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  Bell,
  CheckCircle2,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { CollegeSettings, PhoneNumber, EmailAddress } from '../../types.js';
import { LogoBadge } from './LogoBadge.js';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  settings: CollegeSettings;
  phoneNumbers: PhoneNumber[];
  emailAddresses: EmailAddress[];
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  phoneNumbers,
  emailAddresses,
  currentRoute,
  onNavigate,
}) => {
  const { user, isSuperAdmin, isStudent, isTeacher, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const primaryPhone = phoneNumbers.find((p) => p.isPrimary && p.isPublic) || phoneNumbers[0];
  const primaryEmail = emailAddresses.find((e) => e.isPrimary && e.isPublic) || emailAddresses[0];

  const navItems = [
    { label: 'Home', route: 'home' },
    { label: 'About College', route: 'about' },
    { label: 'PRINCIPAL', route: 'principal' },
    { label: 'Departments & DAE', route: 'departments' },
    { label: 'Faculty Directory', route: 'faculty' },
    { label: 'Verify Result', route: 'results' },
    { label: 'Events & News', route: 'events' },
    { label: 'Gallery', route: 'gallery' },
    { label: 'Notices', route: 'notices' },
    { label: 'Facilities', route: 'facilities' },
    { label: 'Contact', route: 'contact' },
  ];

  return (
    <header className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      {/* 1. Top Emergency Notice Marquee Ticker */}
      {settings.sectionVisibility?.showEmergencyTicker && settings.emergencyNoticeActive && settings.emergencyNotice && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-700 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-white text-red-700 uppercase px-2 py-0.5 rounded text-[10px] font-black tracking-wider animate-pulse flex items-center gap-1">
              <Bell className="w-3 h-3" /> URGENT
            </span>
          </div>
          <div className="overflow-hidden whitespace-nowrap ml-3 flex-1">
            <div className="inline-block animate-marquee pl-4">
              <span>{settings.emergencyNotice}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('notices')}
            className="text-[11px] underline ml-3 shrink-0 text-amber-100 hover:text-white"
          >
            View Circulars
          </button>
        </div>
      )}

      {/* 2. Top Info Strip */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {primaryPhone && (
              <a
                href={`tel:${primaryPhone.number.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 text-slate-300 hover:text-orange-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-semibold text-white">{primaryPhone.title}:</span> {primaryPhone.number}
              </a>
            )}
            {primaryEmail && (
              <a
                href={`mailto:${primaryEmail.email}`}
                className="flex items-center gap-1.5 text-slate-300 hover:text-orange-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>{primaryEmail.email}</span>
              </a>
            )}
            <div className="flex items-center gap-1.5 text-amber-400 font-medium border-l border-slate-700 pl-4">
              <Award className="w-3.5 h-3.5" />
              <span>PBTE & TEVTA Approved • Established 1995</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-urdu text-sm text-slate-200">{settings.urduName || 'جناح پولی ٹیکنک انسٹیٹیوٹ'}</span>

            {user && isSuperAdmin && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded flex items-center gap-1.5 transition-all text-xs shadow"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Admin Control Panel</span>
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="text-slate-400 hover:text-red-400 p-1 transition-colors flex items-center gap-1 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Branding & Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <LogoBadge logoUrl={settings.logoUrl} size="lg" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl md:text-2xl text-blue-950 tracking-tight leading-tight group-hover:text-blue-800 transition-colors">
                {settings.collegeName || 'JINNAH POLYTECHNIC INSTITUTE'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs md:text-sm text-slate-600 font-medium">
              <span className="text-orange-600 font-bold uppercase tracking-wider">
                {settings.campus || 'Faisalabad Campus'}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline font-semibold text-slate-700">
                SINCE {settings.sinceYear || '1995'}
              </span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span className="hidden md:inline text-slate-500 text-xs">
                PBTE &amp; TEVTA Recognized
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons for Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => onNavigate('results')}
            className="bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Verify PBTE Result
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20"
          >
            Apply for Admission
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 4. Desktop Navigation Bar */}
      <nav className="hidden lg:block bg-blue-950 text-white border-t border-blue-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`px-3.5 py-3 text-xs md:text-sm font-semibold transition-all border-b-2 ${
                  currentRoute === item.route
                    ? 'border-orange-500 text-orange-400 bg-blue-900/50'
                    : 'border-transparent text-slate-200 hover:text-white hover:bg-blue-900/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 5. Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-white px-4 py-4 border-t border-slate-800 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => {
                  onNavigate(item.route);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  currentRoute === item.route
                    ? 'bg-orange-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user && isSuperAdmin && (
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded text-sm flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Admin Control Panel
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-800/60 text-red-200 py-2 px-3 rounded text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
