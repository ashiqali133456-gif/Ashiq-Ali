/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Bus, CheckCircle2, Coffee, Cpu, Hammer, Laptop, ShieldCheck, Trophy, Wifi, Wrench, Zap } from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const facilities = [
    {
      title: 'Heavy Engineering Machinery Workshops',
      icon: <Hammer className="w-6 h-6 text-orange-500" />,
      desc: 'Dedicated heavy workshops housing industrial CNC lathe machines, hydraulic shapers, universal milling machines, drilling rigs, and oxy-acetylene and electric arc welding bays.',
      specs: ['CNC Lathe & Milling', 'Arc & Gas Welding Racks', 'Safety Goggles & PPE Protocols', 'Pattern Making & Foundry'],
      img: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'High-Voltage & Power Systems Lab',
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      desc: 'Complete 3-phase AC/DC motor-generator sets, electrical substation simulation boards, PLC automation racks, protective relay testing benches, and domestic/commercial wiring bays.',
      specs: ['3-Phase Motor Control', 'PLC Siemens Automation Kits', 'Transformer Winding Station', 'Earth Resistance Testers'],
      img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Civil Surveying & Materials Testing Lab',
      icon: <Cpu className="w-6 h-6 text-blue-500" />,
      desc: 'Digital Total Stations, electronic theodolites, automatic optical levels, universal tensile testing machine (UTM), concrete slump test apparatus, and soil mechanics testing kits.',
      specs: ['Leica Digital Total Stations', 'Universal Testing Machine (UTM)', 'Concrete Compressive Testing', 'Highway Soil & Bitumen Lab'],
      img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'High-Performance Computing & CAD Center',
      icon: <Laptop className="w-6 h-6 text-emerald-500" />,
      desc: 'Modern air-conditioned computer terminals with dedicated fiber-optic gigabit internet, licensed AutoCAD software, Cisco networking racks, and programming development suites.',
      specs: ['120+ Core i7 Workstations', 'AutoCAD 2D/3D & SolidWorks', 'Cisco Packet Tracer Racks', 'Gigabit Dedicated Internet'],
      img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Central Technical Reference Library',
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      desc: 'Over 14,000 engineering textbooks, PBTE syllabus reference volumes, international technical journals, quiet study cubicles, and digital e-library stations.',
      specs: ['14,000+ Engineering Books', 'Digital E-Library Terminals', 'PBTE Past Papers Bank', 'Air-conditioned Study Halls'],
      img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Student Transportation Network',
      icon: <Bus className="w-6 h-6 text-rose-500" />,
      desc: 'Dedicated fleet of buses and coasters covering all major routes across Faisalabad city, Jaranwala, Samundri, Tandlianwala, and surrounding industrial belts.',
      specs: ['Covering 12 City Routes', 'GPS-Monitored Buses', 'Subsidized Student Fares', 'Punctual Schedule'],
      img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-10 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              State-of-the-Art Infrastructure
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Campus Facilities &amp; Practical Workshops
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Jinnah Polytechnic Institute features purpose-built engineering infrastructure designed to simulate real industrial manufacturing and construction environments.
            </p>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden flex flex-col transition-all group"
            >
              <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={fac.img}
                  alt={fac.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {fac.icon}
                    <h3 className="font-bold text-base text-blue-950">{fac.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{fac.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Features &amp; Equipment
                  </span>
                  <div className="grid grid-cols-1 gap-1 text-xs text-slate-700">
                    {fac.specs.map((spec, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
