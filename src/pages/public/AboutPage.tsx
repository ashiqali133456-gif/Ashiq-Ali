/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, BookOpen, CheckCircle2, ChevronRight, Compass, GraduationCap, History, Lightbulb, ShieldCheck, Target, Users } from 'lucide-react';
import { CollegeSettings } from '../../types.js';

interface AboutPageProps {
  settings: CollegeSettings;
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Page Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-12 shadow-md relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-3">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              ESTABLISHED IN {settings.sinceYear || '1995'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              About Jinnah Polytechnic Institute
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Three decades of premier engineering education, practical industrial skills, and disciplined character building in Faisalabad, Punjab.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <GraduationCap className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* 1. 30-Year Legacy Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Our 30-Year Heritage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-950 tracking-tight">
              A Legacy of Engineering Craftsmanship Since 1995
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {settings.aboutHistory ||
                'Founded in 1995 with the visionary ideal of bridging Pakistan’s industrial skills gap, Jinnah Polytechnic Institute has grown from a humble single-discipline campus into a multi-technology technical powerhouse.'}
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Affiliated with the Punjab Board of Technical Education (PBTE) and recognized by the Technical Education & Vocational Training Authority (TEVTA), the institute has produced over 18,500 associate engineers serving in leading government agencies (WAPDA, NESPAK, FWO) and multinational industrial corporations across Pakistan and the Middle East.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>PBTE Affiliated Campus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>TEVTA Recognized</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>24+ Modern Laboratories</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span>Job Placement Cell</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-200 aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80"
                alt="Jinnah Polytechnic Campus"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-blue-950 text-white p-5 rounded-xl shadow-xl border border-blue-900 max-w-xs hidden sm:block">
              <div className="text-2xl font-black text-orange-400">1995 - 2025</div>
              <div className="text-xs font-bold mt-0.5">3 Decades of Technical Mastery</div>
              <p className="text-[11px] text-slate-400 mt-1">Transforming matric students into skilled engineers.</p>
            </div>
          </div>
        </div>

        {/* 2. Vision, Mission & Quality Policy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-blue-950">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {settings.vision ||
                'To be the benchmark center of excellence in polytechnic and associate engineering education in Punjab, producing ethically grounded, technologically innovative associate engineers.'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-blue-950">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {settings.mission ||
                'To deliver hands-on, industry-grade technical training through state-of-the-art laboratories, expert faculty mentorship, and active industrial collaboration.'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-blue-950">Quality Policy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {settings.qualityPolicy ||
                'We are committed to continuous curriculum evolution, maintaining modern laboratory test equipment according to PBTE guidelines, and fostering high moral integrity.'}
            </p>
          </div>
        </div>

        {/* 3. Official Accreditations */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-blue-950 mb-6 text-center">
            Official Accreditations &amp; Affiliations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-2">
              <Award className="w-10 h-10 text-orange-500" />
              <h4 className="font-bold text-sm text-slate-900">Punjab Board of Technical Education (PBTE)</h4>
              <p className="text-xs text-slate-500">
                All 3-Year DAE examinations, curriculum standards, practical assessments, and diploma certificates are officially registered under PBTE Lahore.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
              <h4 className="font-bold text-sm text-slate-900">TEVTA Recognized</h4>
              <p className="text-xs text-slate-500">
                Recognized by the Technical Education and Vocational Training Authority, Government of the Punjab, ensuring quality technical benchmarks.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-2">
              <BookOpen className="w-10 h-10 text-emerald-600" />
              <h4 className="font-bold text-sm text-slate-900">NAVTTC Short Courses</h4>
              <p className="text-xs text-slate-500">
                Authorized training provider for Prime Minister’s National Vocational &amp; Technical Training Commission short certification programs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <button
            onClick={() => onNavigate('departments')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-lg text-sm transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>Explore DAE Technologies &amp; Lab Structures</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
