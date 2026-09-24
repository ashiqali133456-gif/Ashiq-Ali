/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  GraduationCap,
  Hammer,
  Laptop,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  CollegeSettings,
  HeroBanner,
  Department,
  Notice,
  CollegeEvent,
  GalleryImage,
  PrincipalProfile,
} from '../../types.js';
import { publicApi } from '../../lib/api.js';

interface HomePageProps {
  settings: CollegeSettings;
  heroBanners?: HeroBanner[];
  departments: Department[];
  notices: Notice[];
  events: CollegeEvent[];
  galleryImages?: GalleryImage[];
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  heroBanners = [],
  departments,
  notices,
  events,
  galleryImages = [],
  onNavigate,
}) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [principalProfile, setPrincipalProfile] = useState<PrincipalProfile | null>(null);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryTech, setInquiryTech] = useState('Civil Engineering Technology');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const fallbackBanners: HeroBanner[] = [
    {
      id: 'default-1',
      title: 'Pioneering Technical Excellence in Pakistan Since 1995',
      subtitle: 'Affiliated with Punjab Board of Technical Education (PBTE) & TEVTA',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Explore DAE Technologies',
      ctaLink: 'departments',
      badge: 'ADMISSIONS OPEN 2024-2027',
      active: true,
      order: 1,
    },
    {
      id: 'default-2',
      title: '24+ Modern Industrial Grade Engineering Laboratories',
      subtitle: 'Hands-on practical training with CNC machining, civil surveying, and power electronics.',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Visit Campus & Labs',
      ctaLink: 'contact',
      badge: '30 YEARS OF MASTERY',
      active: true,
      order: 2,
    },
  ];

  const activeBanners = heroBanners.filter((b) => b.active).length > 0
    ? heroBanners.filter((b) => b.active)
    : fallbackBanners;

  // Auto rotate banner carousel
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  useEffect(() => {
    fetch('/api/public/principal-profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          setPrincipalProfile(data.profile);
        }
      })
      .catch((err) => console.error('Failed to load principal profile:', err));
  }, []);

  const currentBanner = activeBanners[currentBannerIndex] || fallbackBanners[0];
  const urgentNotices = notices.filter((n) => n.isPublished !== false).slice(0, 5);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;

    setInquiryLoading(true);
    try {
      await publicApi.submitInquiry({
        name: inquiryName,
        phone: inquiryPhone,
        email: inquiryEmail,
        technologyInterest: inquiryTech,
        subject: `Admission Inquiry for ${inquiryTech}`,
        message: inquiryMessage || 'Requested admission details and prospectus.',
      });
      setInquirySubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit inquiry. Please try again or call our admission helpline.');
    } finally {
      setInquiryLoading(false);
    }
  };

  const getDepartmentIcon = (code: string) => {
    switch (code) {
      case 'CIVIL':
        return <Layers className="w-6 h-6 text-orange-500" />;
      case 'ELECTRICAL':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'MECHANICAL':
        return <Wrench className="w-6 h-6 text-blue-500" />;
      case 'CIT':
        return <Laptop className="w-6 h-6 text-emerald-500" />;
      case 'ELECTRONICS':
        return <Hammer className="w-6 h-6 text-purple-500" />;
      default:
        return <BookOpen className="w-6 h-6 text-orange-500" />;
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50">
      {/* 1. HERO CAROUSEL SECTION */}
      {settings.sectionVisibility?.showHeroSlider !== false && (
        <section className="relative w-full min-h-[500px] lg:min-h-[580px] bg-slate-950 flex items-center overflow-hidden">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-30 transition-all duration-1000 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 w-full">
            <div className="max-w-2xl text-white space-y-5">
              {currentBanner.badge && (
                <div className="inline-flex items-center gap-2 bg-orange-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-orange-600/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentBanner.badge}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
                {currentBanner.title}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                {currentBanner.subtitle || settings.tagline || 'Leading Technical Institute in Faisalabad since 1995.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate(currentBanner.ctaLink === 'departments' ? 'departments' : 'contact')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
                >
                  <span>{currentBanner.ctaText || 'Apply for Admission'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('results')}
                  className="bg-blue-900/80 hover:bg-blue-800 text-white border border-blue-700 font-bold px-5 py-3 rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  <span>Verify PBTE Result</span>
                </button>
              </div>

              {/* Badges strip */}
              <div className="pt-4 flex items-center gap-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-orange-400" /> PBTE Registered
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> TEVTA Government Approved
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" /> 30+ Years Legacy
                </span>
              </div>
            </div>
          </div>

          {/* Carousel Slider Controls */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
                }
                className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-orange-500 text-white flex items-center justify-center transition-colors border border-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-white px-2">
                {currentBannerIndex + 1} / {activeBanners.length}
              </span>
              <button
                onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length)}
                className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-orange-500 text-white flex items-center justify-center transition-colors border border-slate-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* 2. STATS & KEY METRICS RIBBON */}
      {settings.sectionVisibility?.showStatsRibbon !== false && (
        <section className="w-full bg-blue-950 text-white border-y border-blue-900 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border-r border-blue-900/60 last:border-none">
              <div className="text-3xl sm:text-4xl font-black text-orange-400 tracking-tight">
                {settings.stats?.graduatedStudents ? `${settings.stats.graduatedStudents.toLocaleString()}+` : '18,500+'}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 uppercase tracking-wide">
                DAE Engineers Graduated
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Serving across Pakistan &amp; Gulf</p>
            </div>

            <div className="text-center p-4 border-r border-blue-900/60 last:border-none">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {settings.stats?.yearsOfExcellence ? `${settings.stats.yearsOfExcellence}+` : '30+'}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 uppercase tracking-wide">
                Years of Excellence
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Established 1995</p>
            </div>

            <div className="text-center p-4 border-r border-blue-900/60 last:border-none">
              <div className="text-3xl sm:text-4xl font-black text-orange-400 tracking-tight">
                {settings.stats?.modernLabs ? `${settings.stats.modernLabs}+` : '24+'}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 uppercase tracking-wide">
                Modern Practical Labs
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Hands-on Industrial Machinery</p>
            </div>

            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {settings.stats?.employmentRate ? `${settings.stats.employmentRate}%` : '94%'}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 uppercase tracking-wide">
                Industry Placement Rate
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct hiring in NESPAK, WAPDA, FWO</p>
            </div>
          </div>
        </section>
      )}

      {/* 3. PRINCIPAL MESSAGE & URGENT NOTICES SPLIT */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Col 1 & 2: Principal Welcome Note */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-full sm:w-48 shrink-0 flex flex-col items-center text-center">
                <div className="w-36 h-44 rounded-lg overflow-hidden border-2 border-orange-500 shadow-md mb-3 bg-slate-100">
                  <img
                    src={principalProfile?.photoUrl || settings.principalPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                    alt={principalProfile?.name || settings.principalName || 'Principal Engr. Sir Usman'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <h4 className="font-extrabold text-blue-950 text-sm leading-snug">
                  {principalProfile?.name || settings.principalName || 'Engr. Sir Usman'}
                </h4>
                <p className="text-orange-600 text-xs font-semibold mt-0.5">
                  {principalProfile?.designation || settings.principalTitle || settings.principalDesignation || 'Principal & Chief Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {principalProfile?.qualification || settings.principalQualification || 'M.Sc. Civil Engineering (UET), B.Sc. Civil Engg, FIE (Pak)'}
                </p>
              </div>

              <div className="flex-1 space-y-3">
                <div className="inline-block bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Leadership Message
                </div>
                <h2 className="text-2xl font-bold text-blue-950 tracking-tight">
                  Welcome to Jina Polytechnic College
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {principalProfile?.biography || principalProfile?.about || settings.principalMessage ||
                    'Welcome to Jina Polytechnic College Faisalabad. Since our foundation in 1995, our mission has been to equip youth with cutting-edge technical craftsmanship, practical engineering skills, and moral discipline. Our state-of-the-art workshops, qualified engineers, and dedicated training prepare our diploma graduates to lead in national infrastructure, industrial manufacturing, power generation, and global technologies.'}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('principal')}
                    className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Award className="w-4 h-4 text-orange-400" />
                    <span>View Full Principal Profile &amp; Directives</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Urgent Notice Board */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Notice Board</h3>
                  <p className="text-[11px] text-slate-500">Official PBTE &amp; Campus Circulars</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {urgentNotices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => onNavigate('notices')}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-orange-50/60 border border-slate-100 hover:border-orange-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                        notice.priority === 'Urgent' || notice.priority === 'Urgent_Marquee'
                          ? 'bg-red-100 text-red-700'
                          : notice.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {notice.priority}
                    </span>
                    <span className="text-slate-400">{notice.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {notice.title}
                  </h4>
                  {notice.fileName && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Download className="w-3 h-3 text-blue-600" />
                      <span>{notice.fileName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('results')}
              className="mt-4 w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>Check PBTE Exam Results</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. DAE TECHNOLOGY DEPARTMENTS SHOWCASE */}
      {settings.sectionVisibility?.showDepartments !== false && (
        <section className="w-full bg-slate-100 py-16 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-orange-600 font-bold text-xs uppercase tracking-wider">
                Punjab Board of Technical Education Approved
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
                3-Year DAE Engineering Technologies
              </h2>
              <p className="text-slate-600 text-sm">
                Practical, industry-aligned diploma courses designed to lead directly into high-demand engineering careers and Bachelor of Technology (B.Tech) admissions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden flex flex-col transition-all group"
                >
                  <div className="h-44 w-full relative overflow-hidden bg-slate-200">
                    <img
                      src={dept.image}
                      alt={dept.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-blue-950 text-white font-bold text-[11px] px-2.5 py-1 rounded shadow">
                      {dept.code} TECHNOLOGY
                    </div>
                    <div className="absolute top-3 right-3 bg-orange-500 text-white font-bold text-[11px] px-2.5 py-1 rounded shadow">
                      {dept.duration}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {getDepartmentIcon(dept.code)}
                        <h3 className="font-bold text-base text-blue-950 group-hover:text-orange-600 transition-colors">
                          {dept.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {dept.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Labs</span>
                        <strong className="text-slate-800">{dept.totalLabs} Heavy Labs</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Intake Seats</span>
                        <strong className="text-slate-800">{dept.totalSeats} Students/Year</strong>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onNavigate('departments')}
                        className="w-full bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-300 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>View Lab Facilities &amp; Syllabus</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={() => onNavigate('departments')}
                className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-lg text-xs transition-all shadow"
              >
                Explore Complete Technology Syllabi &amp; Eligibility
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. PRACTICAL LABORATORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-orange-600 font-bold text-xs uppercase tracking-wider">
            Hands-on Engineering Training
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
            24+ Industrial Grade Laboratories
          </h2>
          <p className="text-slate-600 text-sm">
            We prioritize physical machinery, circuit design boards, concrete testing apparatus, and high-spec computing terminals over pure blackboard theory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Civil Surveying & Materials Lab',
              desc: 'Equipped with Digital Total Stations, Theodolites, Auto Levels, and Universal Testing Machine (UTM) for compressive strength testing.',
              img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Electrical Machines & High Voltage Bay',
              desc: 'Featuring 3-phase AC/DC motor-generator test benches, transformer winding setups, PLC automation kits, and protective relay racks.',
              img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Mechanical Workshop & CNC Lathes',
              desc: 'Comprehensive machine shop with CNC machining centers, hydraulic shapers, universal milling machines, and gas/arc welding bays.',
              img: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Advanced Computer & Network Lab',
              desc: 'High-speed gigabit fiber backbone, Cisco routing workstations, auto-CAD engineering stations, and modern software development labs.',
              img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
            },
          ].map((lab, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={lab.img}
                  alt={lab.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-blue-950 mb-1.5">{lab.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{lab.desc}</p>
                </div>
                <div className="pt-3 flex items-center gap-1 text-[11px] font-bold text-orange-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PBTE Practical Exam Center</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ALUMNI SUCCESS & EMPLOYERS */}
      <section className="w-full bg-blue-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">
              Where Our Graduates Work
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Trusted by Top Engineering Organizations
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
            {['NESPAK', 'WAPDA', 'FWO', 'DESCON', 'CPEC Projects', 'FESCO Punjab'].map((org, i) => (
              <div
                key={i}
                className="bg-blue-900/50 border border-blue-800/80 rounded-lg p-4 flex flex-col items-center justify-center font-black text-slate-200 text-sm tracking-wider"
              >
                <span>{org}</span>
                <span className="text-[10px] text-orange-400 font-normal mt-0.5">Top DAE Recruiter</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ADMISSION INQUIRY & CONTACT FORM */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left Info Column */}
          <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Admissions Session 2024 - 2027
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Secure Your Engineering Career at Jinnah Polytechnic
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Admissions are open for Matric (Science / Arts / Technical) and Intermediate graduates. Get detailed counseling, prospectus fee structure, and scholarship guidance from our faculty.
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Admission Hotline</div>
                  <strong className="text-white">+92 (041) 876-5432 / 0300-1234567</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">WhatsApp Student Guidance</div>
                  <strong className="text-white">0321-9876543 (Direct Chat)</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Campus Address</div>
                  <span className="text-white text-xs">Main College Road, Faisalabad, Punjab, Pakistan</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
              Approved by Government of the Punjab &amp; PBTE Lahore.
            </div>
          </div>

          {/* Right Form Column */}
          <div className="p-8 sm:p-12">
            <h4 className="text-xl font-bold text-blue-950 mb-2">Request Admission Information</h4>
            <p className="text-xs text-slate-500 mb-6">
              Fill out this form and our Admissions Officer will call you with complete eligibility and fee discount criteria.
            </p>

            {inquirySubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-emerald-900 text-base">Inquiry Submitted Successfully!</h5>
                <p className="text-xs text-emerald-700">
                  Thank you for your interest. An admissions officer from Jinnah Polytechnic Institute will contact you shortly.
                </p>
                <button
                  onClick={() => setInquirySubmitted(false)}
                  className="text-xs font-bold text-emerald-800 underline mt-2"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Mobile / WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Technology of Interest
                  </label>
                  <select
                    value={inquiryTech}
                    onChange={(e) => setInquiryTech(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="Civil Engineering Technology">DAE Civil Engineering Technology</option>
                    <option value="Electrical Engineering Technology">DAE Electrical Engineering Technology</option>
                    <option value="Mechanical Engineering Technology">DAE Mechanical Engineering Technology</option>
                    <option value="Computer Information Technology">DAE Computer Information Technology (CIT)</option>
                    <option value="Electronics Technology">DAE Electronics Technology</option>
                    <option value="Short Technical Vocational Courses">Short Technical Courses / NAVTTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Question / Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Ask about fee discount, transport facility, or hostel accommodation..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{inquiryLoading ? 'Submitting Inquiry...' : 'Submit Admission Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
