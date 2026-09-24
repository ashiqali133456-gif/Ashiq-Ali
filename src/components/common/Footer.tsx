/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Lock,
} from 'lucide-react';
import { CollegeSettings, PhoneNumber, EmailAddress, ContactInfo } from '../../types.js';
import { LogoBadge } from './LogoBadge.js';

interface FooterProps {
  settings: CollegeSettings;
  phoneNumbers: PhoneNumber[];
  emailAddresses: EmailAddress[];
  contactInfo: ContactInfo;
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  phoneNumbers,
  emailAddresses,
  contactInfo,
  onNavigate,
}) => {
  const publicPhones = phoneNumbers.filter((p) => p.isPublic);
  const publicEmails = emailAddresses.filter((e) => e.isPublic);

  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t-4 border-orange-500 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Accreditation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LogoBadge logoUrl={settings.logoUrl} size="md" />
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight tracking-tight">
                  {settings.collegeName || 'JINNAH POLYTECHNIC INSTITUTE'}
                </h3>
                <p className="text-orange-400 text-xs font-semibold">
                  SINCE {settings.sinceYear || '1995'} • {settings.campus || 'Faisalabad Campus'}
                </p>
                <p className="font-urdu text-xs text-slate-400 mt-0.5">{settings.urduName || 'جناح پولی ٹیکنک انسٹیٹیوٹ'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Premier technical education institution in Punjab providing 3-Year Diploma of Associate Engineer (DAE) programs recognized by the Punjab Board of Technical Education (PBTE) and TEVTA.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-slate-800 text-orange-400 text-[11px] font-bold px-2.5 py-1 rounded border border-slate-700">
                <Award className="w-3.5 h-3.5" /> PBTE Affiliated
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 text-blue-400 text-[11px] font-bold px-2.5 py-1 rounded border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" /> TEVTA Recognized
              </span>
            </div>
          </div>

          {/* Col 2: DAE Programs */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
              Academic Technologies
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'DAE Civil Technology', code: 'CIVIL' },
                { name: 'DAE Electrical Technology', code: 'ELECTRICAL' },
                { name: 'DAE Mechanical Technology', code: 'MECHANICAL' },
                { name: 'DAE Computer Information Tech (CIT)', code: 'CIT' },
                { name: 'DAE Electronics Technology', code: 'ELECTRONICS' },
                { name: 'Short Technical Courses & NAVTTC', code: 'SHORT' },
              ].map((prog) => (
                <li key={prog.code}>
                  <button
                    onClick={() => onNavigate('departments')}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-orange-400 transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
                    <span>{prog.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'About Institute & History', route: 'about' },
                { name: 'Faculty & Instructors Directory', route: 'faculty' },
                { name: 'Verify PBTE Examination Result', route: 'results' },
                { name: 'Latest Notices & Circulars', route: 'notices' },
                { name: 'Campus Facilities & Laboratories', route: 'facilities' },
                { name: 'Photo & Video Gallery', route: 'gallery' },
              ].map((link) => (
                <li key={link.route}>
                  <button
                    onClick={() => onNavigate(link.route)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400 transition-colors" />
                    <span>{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Verified Contact Info */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
              Campus Contact &amp; Helplines
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>{contactInfo.address || 'College Road, Main Campus, Faisalabad, Punjab, Pakistan'}</span>
              </div>

              {publicPhones.slice(0, 3).map((phone) => (
                <div key={phone.id} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>
                      <span className="text-slate-400">{phone.title}:</span>{' '}
                      <strong className="text-white">{phone.number}</strong>
                    </span>
                  </div>
                  {phone.isWhatsApp && (
                    <a
                      href={`https://wa.me/${phone.number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}

              {publicEmails.slice(0, 2).map((email) => (
                <div key={email.id} className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{email.email}</span>
                </div>
              ))}

              <div className="flex items-center gap-2 text-slate-400 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Office Hours: {contactInfo.officeHours || 'Mon - Sat: 8:00 AM - 3:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap text-center md:text-left">
            <span>© {new Date().getFullYear()} {settings.collegeName || 'Jinnah Polytechnic Institute'}. All Rights Reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="text-amber-500 font-semibold">Official Website Managed by JPC Administration</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-slate-300 transition-colors"
            >
              Admissions
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('results')}
              className="hover:text-slate-300 transition-colors"
            >
              Verify Marks
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('notices')}
              className="hover:text-slate-300 transition-colors"
            >
              Notice Board
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('admin-login')}
              className="text-slate-500 hover:text-orange-400 transition-colors text-[11px]"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
