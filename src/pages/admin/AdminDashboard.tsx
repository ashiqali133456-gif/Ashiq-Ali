/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { adminApi, publicApi } from '../../lib/api.js';
import {
  CollegeSettings,
  Department,
  Course,
  Teacher,
  Student,
  ResultRecord,
  AttendanceRecord,
  Notice,
  CollegeEvent,
  GalleryAlbum,
  GalleryImage,
  DocumentItem,
  AdmissionInquiry,
  PhoneNumber,
  EmailAddress,
  AuditLog,
  SystemUser,
  HeroBanner,
} from '../../types.js';
import {
  Activity,
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Download,
  Edit,
  Eye,
  FileCheck,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
  Zap,
  Loader2,
} from 'lucide-react';
import { LogoBadge } from '../../components/common/LogoBadge.js';
import { MediaUploader } from '../../components/admin/MediaUploader.js';
import { PrincipalManagement } from '../../components/admin/PrincipalManagement.js';

interface AdminDashboardProps {
  onNavigate: (route: string) => void;
}

type AdminSection =
  | 'overview'
  | 'principal'
  | 'settings'
  | 'banners'
  | 'departments'
  | 'faculty'
  | 'students'
  | 'inquiries'
  | 'results'
  | 'attendance'
  | 'notices'
  | 'documents'
  | 'events'
  | 'gallery'
  | 'contacts'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [inquiries, setInquiries] = useState<AdmissionInquiry[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [emailAddresses, setEmailAddresses] = useState<EmailAddress[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminUsers, setAdminUsers] = useState<SystemUser[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Modals State
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    title: string;
    itemDescription: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // In-app 2FA PIN change state
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [newPinValue, setNewPinValue] = useState<string>('');

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const requestDelete = (title: string, itemDescription: string, deleteAction: () => Promise<void>) => {
    setDeleteTarget({
      title,
      itemDescription,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteAction();
          setDeleteTarget(null);
          await loadAllData();
          window.dispatchEvent(new Event('college-data-updated'));
          showMessage(`"${itemDescription}" deleted successfully.`);
        } catch (err: any) {
          showMessage(err.message || 'Error deleting item.', 'error');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        statsRes,
        settingsRes,
        banRes,
        deptRes,
        teachRes,
        stuRes,
        resRes,
        notRes,
        docRes,
        evtRes,
        galRes,
        inqRes,
        phoneRes,
        emailRes,
        auditRes,
      ] = await Promise.all([
        adminApi.getStats(),
        adminApi.getSettings(),
        adminApi.getBanners(),
        adminApi.getDepartments(),
        adminApi.getTeachers(),
        adminApi.getStudents(),
        adminApi.getResults(),
        adminApi.getNotices(),
        adminApi.getDocuments(),
        adminApi.getEvents(),
        adminApi.getGallery(),
        adminApi.getInquiries(),
        adminApi.getPhoneNumbers(),
        adminApi.getEmailAddresses(),
        adminApi.getAuditLogs(),
      ]);

      setStats(statsRes.stats);
      setSettings(settingsRes.settings);
      setBanners(banRes.banners || []);
      setDocuments(docRes.documents || []);
      setDepartments(deptRes.departments || []);
      setCourses(deptRes.courses || []);
      setFaculty(teachRes.teachers || []);
      setStudents(stuRes.students || []);
      setResults(resRes.results || []);
      setNotices(notRes.notices || []);
      setEvents(evtRes.events || []);
      setAlbums(galRes.albums || []);
      setImages(galRes.images || []);
      setInquiries(inqRes.inquiries || []);
      setPhoneNumbers(phoneRes.phoneNumbers || []);
      setEmailAddresses(emailRes.emailAddresses || []);
      setAuditLogs(auditRes.auditLogs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showMessage('Error loading admin control datasets.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Settings Save Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await adminApi.updateSettings(settings);
      setSettings(res.settings);
      window.dispatchEvent(new Event('college-data-updated'));
      showMessage('College and Website settings updated successfully!');
    } catch (err: any) {
      showMessage(err.message || 'Error updating settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Section Selector Helper
  const menuItems: { id: AdminSection; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Master Overview', icon: LayoutDashboard },
    { id: 'principal', label: 'Principal Photo & Name', icon: Award },
    { id: 'settings', label: 'Website & Branding Settings', icon: Settings },
    { id: 'banners', label: 'Hero Sliders & Banners', icon: Sliders, count: banners.length },
    { id: 'departments', label: 'Technologies & Syllabi', icon: Layers, count: departments.length },
    { id: 'faculty', label: 'Faculty Directory', icon: Users, count: faculty.length },
    { id: 'students', label: 'Student Admissions', icon: GraduationCap, count: students.length },
    { id: 'inquiries', label: 'Admission Inquiries', icon: Mail, count: inquiries.filter((i) => i.status === 'New').length },
    { id: 'results', label: 'PBTE Examination Results', icon: FileCheck, count: results.length },
    { id: 'notices', label: 'Circulars & Notices', icon: Bell, count: notices.length },
    { id: 'documents', label: 'Official Circulars & Downloads', icon: FileText, count: documents.length },
    { id: 'events', label: 'Events & Workshops', icon: Calendar, count: events.length },
    { id: 'gallery', label: 'Media & Photo Gallery', icon: ImageIcon, count: images.length },
    { id: 'contacts', label: 'Verified Contacts & Help', icon: Phone },
    { id: 'security', label: '2FA & Security Audit Logs', icon: ShieldCheck, count: auditLogs.length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-300">Loading Super Admin Control Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-4">
          <LogoBadge logoUrl={settings?.logoUrl} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wider uppercase text-white">
                Super Admin Control System
              </h1>
              <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                Sole Authority
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {settings?.collegeName || 'Jinnah Polytechnic Institute'} • Since {settings?.sinceYear || '1995'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Public Site</span>
          </button>
          <button
            onClick={loadAllData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Reload Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="bg-red-900/80 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace Grid */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-1 shrink-0 overflow-y-auto max-h-[calc(100vh-60px)]">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Control Modules
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                      isActive ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 border-t border-slate-800/80 p-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Full CRUD Access</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              All modifications are persisted directly to the active institutional database.
            </p>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-60px)] space-y-6">
          {/* Action Notification Banner */}
          {actionMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-lg ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <span>{actionMessage.text}</span>
              <button onClick={() => setActionMessage(null)} className="p-1 hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 1: MASTER OVERVIEW & SYSTEM HEALTH           */}
          {/* ==================================================== */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-950 to-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-2">
                <span className="bg-orange-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                  Centralized Command Center
                </span>
                <h2 className="text-2xl font-black text-white">
                  Welcome, Super Admin ({user?.name || 'Administrator'})
                </h2>
                <p className="text-xs text-slate-300">
                  Full server authorization granted. You have unrestricted write control over college information, academic programs, marks statements, and faculty rosters.
                </p>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Students</span>
                  <div className="text-2xl font-black text-orange-400">{stats?.totalStudents || students.length}</div>
                  <span className="text-[11px] text-slate-400">PBTE Registered</span>
                </div>
                <div className="p-5 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty Mentors</span>
                  <div className="text-2xl font-black text-blue-400">{stats?.totalTeachers || faculty.length}</div>
                  <span className="text-[11px] text-slate-400">Engineering Instructors</span>
                </div>
                <div className="p-5 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">DAE Technologies</span>
                  <div className="text-2xl font-black text-emerald-400">{departments.length} Disciplines</div>
                  <span className="text-[11px] text-slate-400">6 Specialized Labs</span>
                </div>
                <div className="p-5 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Published Results</span>
                  <div className="text-2xl font-black text-amber-400">{results.length} Statements</div>
                  <span className="text-[11px] text-slate-400">Online Verifiable</span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveSection('results')}
                  className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-left space-y-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-orange-400">
                    Publish Examination Result
                  </h4>
                  <p className="text-xs text-slate-400">
                    Input marks, subject-wise breakdown, and generate verifiable marksheet for any student.
                  </p>
                </button>

                <button
                  onClick={() => setActiveSection('notices')}
                  className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-left space-y-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400">
                    Post Official Notice
                  </h4>
                  <p className="text-xs text-slate-400">
                    Issue an urgent circular with PDF attachment for immediate display across the portal.
                  </p>
                </button>

                <button
                  onClick={() => setActiveSection('settings')}
                  className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-left space-y-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-400">
                    Edit Website Settings
                  </h4>
                  <p className="text-xs text-slate-400">
                    Update phone numbers, admissions banner, vision &amp; mission statement, and hero images.
                  </p>
                </button>
              </div>

              {/* Recent Audit Logs Stream */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span>Live Administrative Activity Log</span>
                  </h3>
                  <button
                    onClick={() => setActiveSection('security')}
                    className="text-xs text-orange-400 hover:underline"
                  >
                    View Full Security Log
                  </button>
                </div>

                <div className="space-y-2">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-400 font-mono text-[11px]">{log.action}</span>
                          <span className="text-slate-400 text-[11px]">by {log.userName}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION: PRINCIPAL MODULE                            */}
          {/* ==================================================== */}
          {activeSection === 'principal' && <PrincipalManagement />}

          {/* ==================================================== */}
          {/* SECTION 2: WEBSITE & BRANDING SETTINGS               */}
          {/* ==================================================== */}
          {activeSection === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">College Branding &amp; Website Settings</h2>
                  <p className="text-xs text-slate-400">
                    Control institutional headers, hero sliders, emergency ticker, and accreditation statements.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

              {/* General College Information */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                  Core College Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">College Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={settings.collegeName}
                      onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">College Name (Urdu)</label>
                    <input
                      type="text"
                      value={settings.urduName || ''}
                      onChange={(e) => setSettings({ ...settings, urduName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-urdu text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Tagline / Motto *</label>
                    <input
                      type="text"
                      required
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Established Since Year *</label>
                    <input
                      type="text"
                      required
                      value={settings.sinceYear}
                      onChange={(e) => setSettings({ ...settings, sinceYear: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">PBTE Affiliation Registration Code</label>
                    <input
                      type="text"
                      value={settings.pbteAffiliationCode || ''}
                      onChange={(e) => setSettings({ ...settings, pbteAffiliationCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">TEVTA Reg#</label>
                    <input
                      type="text"
                      value={settings.tevtaRegNumber || ''}
                      onChange={(e) => setSettings({ ...settings, tevtaRegNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Bar Settings */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                    Header Live Announcement Ticker
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.announcementBarEnabled}
                      onChange={(e) =>
                        setSettings({ ...settings, announcementBarEnabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-orange-500 focus:ring-0"
                    />
                    <span>Show Ticker on Website</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs">
                    Ticker Text Announcement
                  </label>
                  <input
                    type="text"
                    value={settings.announcementText || ''}
                    onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                    placeholder="e.g. Admissions Open for 2024-2025 DAE Batch. Limited seats in Civil & Electrical!"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Vision & Mission Narrative */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                  Vision, Mission &amp; 30-Year History
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Vision Statement</label>
                    <textarea
                      rows={2}
                      value={settings.vision}
                      onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Mission Statement</label>
                    <textarea
                      rows={2}
                      value={settings.mission}
                      onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">30-Year College History Text</label>
                    <textarea
                      rows={4}
                      value={settings.aboutHistory}
                      onChange={(e) => setSettings({ ...settings, aboutHistory: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Media & Official Branding Uploads */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                  Official College Logo &amp; Leadership Media
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                    <MediaUploader
                      label="College Official Logo / Emblem (PNG / SVG / JPG)"
                      currentUrl={settings.logoUrl || ''}
                      accept="image/*"
                      category="Branding"
                      onUploaded={(url) => setSettings({ ...settings, logoUrl: url })}
                    />
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                    <MediaUploader
                      label="Principal Official Photograph"
                      currentUrl={(settings as any).principalPhotoUrl || ''}
                      accept="image/*"
                      category="Leadership"
                      onUploaded={(url) => setSettings({ ...settings, principalPhotoUrl: url } as any)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save All Website Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* SECTION: HERO SLIDERS & BANNERS                      */}
          {/* ==================================================== */}
          {activeSection === 'banners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Hero Sliders &amp; Promotional Banners</h2>
                  <p className="text-xs text-slate-400">Manage homepage hero slides, badges, images, call-to-actions, and display order.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'banner',
                      data: {
                        id: `ban_${Date.now()}`,
                        title: 'Admissions Open 2024-2025',
                        subtitle: 'Shape Your Engineering Future with 30 Years of Technical Excellence',
                        imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80',
                        ctaText: 'Apply Online',
                        ctaLink: '#admissions',
                        badge: 'Admissions 2024',
                        active: true,
                        order: banners.length + 1,
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Banner</span>
                </button>
              </div>

              <div className="space-y-4">
                {banners.map((ban) => (
                  <div
                    key={ban.id}
                    className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={ban.imageUrl}
                        alt={ban.title}
                        referrerPolicy="no-referrer"
                        className="w-28 h-16 object-cover rounded-xl border border-slate-800 shrink-0 bg-slate-900"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {ban.badge && (
                            <span className="text-[10px] font-bold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/60 uppercase">
                              {ban.badge}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              ban.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {ban.active ? 'Active' : 'Hidden'}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">Order #{ban.order}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{ban.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{ban.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => setEditingItem({ type: 'banner', data: { ...ban } })}
                        className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          requestDelete('Delete Hero Banner', ban.title, async () => {
                            setBanners((prev) => prev.filter((b) => b.id !== ban.id));
                            await adminApi.deleteBanner(ban.id);
                          })
                        }
                        className="p-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 3: TECHNOLOGIES & SYLLABI                    */}
          {/* ==================================================== */}
          {activeSection === 'departments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Engineering Technologies &amp; DAE Programs</h2>
                  <p className="text-xs text-slate-400">Manage 3-Year DAE curricula, laboratory facilities, and seat quotas.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'department',
                      data: {
                        id: `dept_${Date.now()}`,
                        code: 'NEW_TECH',
                        name: 'New Technology Program',
                        urduName: '',
                        degreeType: 'DAE',
                        duration: '3 Years',
                        establishedYear: '2024',
                        headOfDepartment: 'Engr. Faculty Lead',
                        description: 'Department description and practical syllabus.',
                        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
                        totalLabs: 4,
                        totalSeats: 60,
                        keySubjects: ['Applied Engineering', 'Workshop Practice'],
                        careerOpportunities: ['Assistant Engineer', 'Plant Supervisor'],
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Technology</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-orange-500 uppercase">{dept.code}</span>
                          <h3 className="text-base font-bold text-white">{dept.name}</h3>
                          {dept.urduName && <p className="font-urdu text-xs text-slate-400">{dept.urduName}</p>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingItem({ type: 'department', data: { ...dept } })}
                            className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              requestDelete('Delete Department', dept.name, async () => {
                                setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
                                await adminApi.deleteDepartment(dept.id);
                              })
                            }
                            className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">{dept.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                        <div>HOD: <strong className="text-white">{dept.headOfDepartment}</strong></div>
                        <div>Intake: <strong className="text-white">{dept.totalSeats} Seats</strong></div>
                        <div>Duration: <strong className="text-white">{dept.duration}</strong></div>
                        <div>Labs: <strong className="text-white">{dept.totalLabs} Labs</strong></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 4: FACULTY DIRECTORY                         */}
          {/* ==================================================== */}
          {activeSection === 'faculty' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Faculty &amp; Technical Staff Directory</h2>
                  <p className="text-xs text-slate-400">Add, edit, or modify verified teacher profiles and assigned disciplines.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'teacher',
                      data: {
                        id: `teach_${Date.now()}`,
                        name: 'Engr. New Instructor',
                        designation: 'Lecturer / Lab Engineer',
                        department: 'Civil Technology',
                        qualification: 'B.Sc Civil Engineering (UET)',
                        experience: '5 Years',
                        email: 'instructor@jpc.edu.pk',
                        phone: '0300-1122334',
                        subjects: ['Surveying', 'Hydraulics'],
                        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Faculty Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faculty.map((teach) => (
                  <div
                    key={teach.id}
                    className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={teach.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={teach.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-orange-500 uppercase">{teach.department}</span>
                        <h4 className="font-bold text-sm text-white truncate">{teach.name}</h4>
                        <p className="text-xs text-slate-400">{teach.designation}</p>
                        <p className="text-[11px] text-slate-500 truncate">{teach.qualification}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{teach.experience} Exp.</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingItem({ type: 'teacher', data: { ...teach } })}
                          className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            requestDelete('Remove Faculty Member', teach.name, async () => {
                              setFaculty((prev) => prev.filter((f) => f.id !== teach.id));
                              await adminApi.deleteTeacher(teach.id);
                            })
                          }
                          className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 5: STUDENT ADMISSIONS                        */}
          {/* ==================================================== */}
          {activeSection === 'students' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Student Enrollment &amp; Admissions Database</h2>
                  <p className="text-xs text-slate-400">Manage student academic files, roll numbers, and active semesters.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'student',
                      data: {
                        id: `stu_${Date.now()}`,
                        rollNumber: `DAE-CIV-${Math.floor(2000 + Math.random() * 900)}`,
                        registrationNumber: `PBTE-2024-${Math.floor(1000 + Math.random() * 9000)}`,
                        name: 'New Student Name',
                        fatherName: 'Father Name',
                        department: 'Civil Technology',
                        technology: 'Civil Technology (DAE)',
                        session: '2024-2027',
                        currentSemester: '1st Semester',
                        email: 'student.new@jpc.edu.pk',
                        phone: '0300-9988776',
                        cnic: '33100-1234567-1',
                        status: 'Active',
                        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Student</span>
                </button>
              </div>

              <div className="overflow-x-auto bg-slate-950 rounded-2xl border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                      <th className="p-3">Student</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Registration No</th>
                      <th className="p-3">Technology</th>
                      <th className="p-3">Semester</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((stu) => (
                      <tr key={stu.id} className="border-b border-slate-900 hover:bg-slate-900/50">
                        <td className="p-3 flex items-center gap-2.5">
                          <img
                            src={stu.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'}
                            alt={stu.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <strong className="block text-white">{stu.name}</strong>
                            <span className="text-[10px] text-slate-500">S/O {stu.fatherName}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-orange-400">{stu.rollNumber}</td>
                        <td className="p-3 font-mono text-slate-400">{stu.registrationNumber}</td>
                        <td className="p-3 text-slate-300">{stu.technology}</td>
                        <td className="p-3 text-slate-300">{stu.currentSemester}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {stu.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => setEditingItem({ type: 'student', data: { ...stu } })}
                            className="p-1.5 bg-slate-850 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              requestDelete('Delete Student Record', `${stu.name} (${stu.rollNumber})`, async () => {
                                setStudents((prev) => prev.filter((s) => s.id !== stu.id));
                                await adminApi.deleteStudent(stu.id);
                              })
                            }
                            className="p-1.5 bg-slate-850 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 6: INQUIRIES                                 */}
          {/* ==================================================== */}
          {activeSection === 'inquiries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Public Admission &amp; General Inquiries</h2>
                  <p className="text-xs text-slate-400">Review prospective student applications and phone messages.</p>
                </div>
              </div>

              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-orange-400 uppercase">{inq.subject}</span>
                        <h4 className="font-bold text-sm text-white">{inq.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-0.5">
                          <span>📞 {inq.phone}</span>
                          {inq.email && <span>✉️ {inq.email}</span>}
                          <span>📅 {inq.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={inq.status}
                          onChange={async (e) => {
                            await adminApi.updateInquiryStatus(inq.id, e.target.value as any);
                            loadAllData();
                            showMessage(`Inquiry marked as ${e.target.value}`);
                          }}
                          className="bg-slate-900 border border-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 text-white"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Enrolled">Enrolled</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <button
                          onClick={() =>
                            requestDelete('Delete Inquiry', `Inquiry from ${inq.name}`, async () => {
                              setInquiries((prev) => prev.filter((i) => i.id !== inq.id));
                              await adminApi.deleteInquiry(inq.id);
                            })
                          }
                          className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      "{inq.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 7: PBTE EXAMINATION RESULTS CONTROLLER       */}
          {/* ==================================================== */}
          {activeSection === 'results' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">PBTE Examination Result Publishing Controller</h2>
                  <p className="text-xs text-slate-400">
                    Publish official student marksheets with individual subject breakdown for public verification.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'result',
                      data: {
                        id: `res_${Date.now()}`,
                        studentId: students[0]?.id || '',
                        rollNumber: students[0]?.rollNumber || 'DAE-CIV-2101',
                        registrationNumber: students[0]?.registrationNumber || 'PBTE-2021-9872',
                        studentName: students[0]?.name || 'Student Name',
                        fatherName: students[0]?.fatherName || 'Father Name',
                        department: 'Civil Technology',
                        technology: 'Civil Technology (DAE)',
                        semester: '3rd Semester',
                        academicYear: '2023-2024',
                        examination: '1st Annual Examination 2024',
                        totalMarks: 700,
                        obtainedMarks: 580,
                        percentage: 82.8,
                        overallGrade: 'A+',
                        gpa: '3.75',
                        resultStatus: 'Passed',
                        isPublished: true,
                        issueDate: new Date().toISOString().split('T')[0],
                        remarks: 'Passed all theory and laboratory practicals.',
                        subjects: [
                          { subjectCode: 'CIV-313', subjectName: 'Advanced Surveying', totalMarks: 150, obtainedMarks: 128, grade: 'A', status: 'Pass' },
                          { subjectCode: 'CIV-323', subjectName: 'Civil CAD & Drafting', totalMarks: 150, obtainedMarks: 135, grade: 'A+', status: 'Pass' },
                          { subjectCode: 'GEN-311', subjectName: 'Technical Report Writing', totalMarks: 100, obtainedMarks: 82, grade: 'A', status: 'Pass' },
                        ],
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Marksheet</span>
                </button>
              </div>

              <div className="space-y-4">
                {results.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-orange-400 text-sm">
                            {res.rollNumber}
                          </span>
                          <span className="text-slate-400 text-xs">• {res.studentName}</span>
                          <span className="text-slate-500 text-xs">({res.technology})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-bold">
                          {res.examination} — {res.semester} ({res.academicYear})
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                            res.resultStatus === 'Passed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {res.resultStatus} ({res.percentage}%)
                        </span>

                        <button
                          onClick={() => setEditingItem({ type: 'result', data: { ...res } })}
                          className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            requestDelete('Delete Marksheet / Result', `Result for Roll No: ${res.rollNumber} (${res.studentName})`, async () => {
                              setResults((prev) => prev.filter((r) => r.id !== res.id));
                              await adminApi.deleteResult(res.id);
                            })
                          }
                          className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subjects overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {res.subjects.map((sub, i) => (
                        <div key={i} className="p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                          <span className="text-[10px] text-slate-400 font-mono block">{sub.subjectCode}</span>
                          <strong className="block text-slate-200 truncate">{sub.subjectName}</strong>
                          <div className="text-[11px] text-orange-400 font-bold mt-1">
                            {sub.obtainedMarks} / {sub.totalMarks} ({sub.grade})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 8: NOTICES & CIRCULARS                       */}
          {/* ==================================================== */}
          {activeSection === 'notices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Official Notices, Circulars &amp; Alerts</h2>
                  <p className="text-xs text-slate-400">Post announcements to the public site, student, and teacher dashboards.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'notice',
                      data: {
                        id: `not_${Date.now()}`,
                        title: 'Official Notification Title',
                        category: 'Academic',
                        priority: 'Normal',
                        date: new Date().toISOString().split('T')[0],
                        content: 'Official circular announcement content text...',
                        isPublic: true,
                        isTargetStudent: true,
                        isTargetTeacher: true,
                        fileName: 'Notification.pdf',
                        fileAttachmentUrl: '',
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Circular</span>
                </button>
              </div>

              <div className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-orange-400 uppercase bg-orange-950/60 px-2 py-0.5 rounded">
                          {n.category}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {n.priority} Priority
                        </span>
                        <span className="text-xs text-slate-500">• {n.date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{n.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{n.content}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setEditingItem({ type: 'notice', data: { ...n } })}
                        className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          requestDelete('Delete Official Circular', n.title, async () => {
                            setNotices((prev) => prev.filter((item) => item.id !== n.id));
                            await adminApi.deleteNotice(n.id);
                          })
                        }
                        className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION: OFFICIAL DOCUMENTS & DOWNLOADS              */}
          {/* ==================================================== */}
          {activeSection === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Official Documents, Circulars &amp; Downloads</h2>
                  <p className="text-xs text-slate-400">Upload and manage official PDF prospectuses, admission forms, and PBTE circulars.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'document',
                      data: {
                        id: `doc_${Date.now()}`,
                        title: 'Official Document / Form',
                        category: 'Admission',
                        description: 'Official downloadable PDF/document for students and public.',
                        fileUrl: '',
                        fileSize: '1.2 MB',
                        uploadDate: new Date().toISOString().split('T')[0],
                        isPublic: true,
                        targetRole: 'All',
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-orange-400 uppercase bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/60">
                          {doc.category}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{doc.fileSize} • {doc.uploadDate}</span>
                        {doc.isPublic ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">Public</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded">Private</span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white">{doc.title}</h4>
                      <p className="text-xs text-slate-400">{doc.description}</p>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-blue-400 hover:underline flex items-center gap-1 mt-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View / Download Attachment</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingItem({ type: 'document', data: { ...doc } })}
                        className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          requestDelete('Delete Document / Download', doc.title, async () => {
                            setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                            await adminApi.deleteDocument(doc.id);
                          })
                        }
                        className="p-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 9: EVENTS & WORKSHOPS                        */}
          {/* ==================================================== */}
          {activeSection === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Campus Events, Galas &amp; Robotics Expos</h2>
                  <p className="text-xs text-slate-400">Manage technical workshops, annual convocations, and sports galas.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'event',
                      data: {
                        id: `evt_${Date.now()}`,
                        title: 'Annual Technical Exhibition & Robotics Expo 2025',
                        category: 'Technical Gala',
                        date: '2025-04-15',
                        time: '09:00 AM - 04:00 PM',
                        location: 'Main Engineering Workshop Block',
                        description: 'Annual project showcase by final-year DAE engineering students.',
                        posterUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <div key={evt.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-orange-400 uppercase">{evt.category}</span>
                        <h4 className="font-bold text-sm text-white">{evt.title}</h4>
                        <span className="text-xs text-slate-400">📅 {evt.date} • {evt.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingItem({ type: 'event', data: { ...evt } })}
                          className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            requestDelete('Delete College Event', evt.title, async () => {
                              setEvents((prev) => prev.filter((e) => e.id !== evt.id));
                              await adminApi.deleteEvent(evt.id);
                            })
                          }
                          className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 10: MEDIA & PHOTO GALLERY                    */}
          {/* ==================================================== */}
          {activeSection === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Media Library &amp; Photo Albums</h2>
                  <p className="text-xs text-slate-400">Upload campus and laboratory photographs directly to the website gallery.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingItem({
                      type: 'gallery_image',
                      data: {
                        id: `img_${Date.now()}`,
                        albumId: albums[0]?.id || 'alb_1',
                        albumName: albums[0]?.name || 'Civil Engineering Lab',
                        title: 'Practical Heavy Machinery Operation',
                        caption: 'Students practicing on universal lathe testing bay',
                        imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
                        date: new Date().toISOString().split('T')[0],
                      },
                    })
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 aspect-4/3"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div>
                        <span className="text-[9px] font-bold text-orange-400 uppercase">{img.albumName}</span>
                        <h5 className="font-bold text-xs text-white truncate">{img.title}</h5>
                      </div>
                      <button
                        onClick={() =>
                          requestDelete('Remove Gallery Image', img.title, async () => {
                            setImages((prev) => prev.filter((i) => i.id !== img.id));
                            await adminApi.deleteGalleryImage(img.id);
                          })
                        }
                        className="self-end p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 11: VERIFIED CONTACTS                        */}
          {/* ==================================================== */}
          {activeSection === 'contacts' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Official Helpline Numbers &amp; Email Addresses</h2>
                <p className="text-xs text-slate-400">Update verified numbers shown on headers, footers, and contact forms.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone Numbers */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-orange-400 uppercase">Verified Phone Numbers</h3>
                    <button
                      onClick={() =>
                        setEditingItem({
                          type: 'phone',
                          data: {
                            id: `phone_${Date.now()}`,
                            title: 'Admissions Office Helpline',
                            number: '0300-1234567',
                            isWhatsApp: true,
                            isPublic: true,
                          },
                        })
                      }
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Phone
                    </button>
                  </div>

                  <div className="space-y-2">
                    {phoneNumbers.map((ph) => (
                      <div
                        key={ph.id}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="block text-white">{ph.title}</strong>
                          <span className="font-mono text-orange-400 font-bold">{ph.number}</span>
                          {ph.isWhatsApp && <span className="text-[10px] text-emerald-400 ml-2">WhatsApp Enabled</span>}
                        </div>
                        <button
                          onClick={() =>
                            requestDelete('Delete Official Phone', `${ph.title} (${ph.number})`, async () => {
                              setPhoneNumbers((prev) => prev.filter((p) => p.id !== ph.id));
                              await adminApi.deletePhoneNumber(ph.id);
                            })
                          }
                          className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emails */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-orange-400 uppercase">Official Email Addresses</h3>
                    <button
                      onClick={() =>
                        setEditingItem({
                          type: 'email',
                          data: {
                            id: `email_${Date.now()}`,
                            title: 'Principal Office',
                            email: 'principal@jpc.edu.pk',
                            isPublic: true,
                          },
                        })
                      }
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Email
                    </button>
                  </div>

                  <div className="space-y-2">
                    {emailAddresses.map((em) => (
                      <div
                        key={em.id}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="block text-white">{em.title}</strong>
                          <span className="font-mono text-blue-400">{em.email}</span>
                        </div>
                        <button
                          onClick={() =>
                            requestDelete('Delete Official Email', `${em.title} (${em.email})`, async () => {
                              setEmailAddresses((prev) => prev.filter((e) => e.id !== em.id));
                              await adminApi.deleteEmailAddress(em.id);
                            })
                          }
                          className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 12: 2FA & SECURITY AUDIT LOGS                */}
          {/* ==================================================== */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Security, 2FA &amp; Complete Audit Trail</h2>
                <p className="text-xs text-slate-400">
                  Manage Super Admin 2FA credentials and review real-time security events.
                </p>
              </div>

              {/* 2FA Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Super Admin Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-slate-400">
                      Enforces high-security PIN validation on every Super Admin login session.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Current Status:</span>
                    <strong className="text-emerald-400 font-bold">2FA Active &amp; Enforced</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Master 2FA Security PIN: •••••• (Configured)</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewPinValue('');
                      setIsChangingPin(true);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-lg"
                  >
                    Change 2FA PIN
                  </button>
                </div>
              </div>

              {/* Security Audit Table */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Complete Security Audit Trail ({auditLogs.length} Events)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-900 text-slate-300 font-bold">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Details</th>
                        <th className="p-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-900 hover:bg-slate-900/50">
                          <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-3 font-mono font-bold text-orange-400">{log.action}</td>
                          <td className="p-3 text-white font-medium">{log.userName}</td>
                          <td className="p-3 text-slate-400">{log.userRole}</td>
                          <td className="p-3 text-slate-300">{log.details}</td>
                          <td className="p-3 font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* GENERIC EDIT MODAL FOR ENTITIES                      */}
          {/* ==================================================== */}
          {editingItem && (
            <div
              onClick={() => setEditingItem(null)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950 rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="font-bold text-base text-white uppercase">
                    {editingItem.type.replace('_', ' ')} Editor
                  </h3>
                  <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSaving(true);
                    try {
                      if (editingItem.type === 'department') {
                        await adminApi.saveDepartment(editingItem.data);
                      } else if (editingItem.type === 'teacher') {
                        await adminApi.saveTeacher(editingItem.data);
                      } else if (editingItem.type === 'student') {
                        await adminApi.saveStudent(editingItem.data);
                      } else if (editingItem.type === 'result') {
                        await adminApi.saveResult(editingItem.data);
                      } else if (editingItem.type === 'notice') {
                        await adminApi.saveNotice(editingItem.data);
                      } else if (editingItem.type === 'event') {
                        await adminApi.saveEvent(editingItem.data);
                      } else if (editingItem.type === 'gallery_image') {
                        await adminApi.saveGalleryImage(editingItem.data);
                      } else if (editingItem.type === 'phone') {
                        await adminApi.savePhoneNumber(editingItem.data);
                      } else if (editingItem.type === 'email') {
                        await adminApi.saveEmailAddress(editingItem.data);
                      } else if (editingItem.type === 'banner') {
                        await adminApi.saveBanner(editingItem.data);
                      } else if (editingItem.type === 'document') {
                        await adminApi.saveDocument(editingItem.data);
                      } else if (editingItem.type === 'album') {
                        await adminApi.saveAlbum(editingItem.data);
                      } else if (editingItem.type === 'course') {
                        await adminApi.saveCourse(editingItem.data);
                      }

                      setEditingItem(null);
                      await loadAllData();
                      window.dispatchEvent(new Event('college-data-updated'));
                      showMessage('Record saved & published successfully!');
                    } catch (err: any) {
                      showMessage(err.message || 'Error saving record', 'error');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="space-y-4 text-xs"
                >
                  {/* Dynamic Form Inputs based on fields */}
                  {Object.keys(editingItem.data).map((key) => {
                    if (key === 'id') return null;
                    const val = editingItem.data[key];

                    const isMediaField = [
                      'image',
                      'imageUrl',
                      'photoUrl',
                      'bannerUrl',
                      'coverImage',
                      'fileAttachmentUrl',
                      'fileUrl',
                      'logoUrl',
                    ].includes(key);

                    if (isMediaField) {
                      const isPdf = key === 'fileAttachmentUrl' || key === 'fileUrl';
                      return (
                        <div key={key} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                          <MediaUploader
                            label={key.replace(/([A-Z])/g, ' $1')}
                            currentUrl={val || ''}
                            accept={isPdf ? 'application/pdf,image/*' : 'image/*'}
                            category={editingItem.type}
                            onUploaded={(url, filename, size) => {
                              const updated = { ...editingItem.data, [key]: url };
                              if (filename && editingItem.data.fileName !== undefined) {
                                updated.fileName = filename;
                              }
                              if (size && editingItem.data.fileSize !== undefined) {
                                updated.fileSize = size;
                              }
                              setEditingItem({
                                ...editingItem,
                                data: updated,
                              });
                            }}
                          />
                        </div>
                      );
                    }

                    if (Array.isArray(val)) {
                      if (key === 'subjects') {
                        return (
                          <div key={key} className="space-y-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-slate-200 uppercase text-xs">Subject Breakdown &amp; Marks</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newSubject = {
                                    subjectCode: `SUB-${(val?.length || 0) + 1}`,
                                    subjectName: 'New Subject',
                                    totalMarks: 100,
                                    obtainedMarks: 75,
                                    grade: 'B',
                                    status: 'Pass',
                                  };
                                  const updatedSubjects = [...(val || []), newSubject];
                                  const newTotal = updatedSubjects.reduce((acc, s) => acc + Number(s.totalMarks || 0), 0);
                                  const newObt = updatedSubjects.reduce((acc, s) => acc + Number(s.obtainedMarks || 0), 0);
                                  const newPct = newTotal > 0 ? Number(((newObt / newTotal) * 100).toFixed(1)) : 0;
                                  setEditingItem({
                                    ...editingItem,
                                    data: {
                                      ...editingItem.data,
                                      subjects: updatedSubjects,
                                      totalMarks: newTotal,
                                      obtainedMarks: newObt,
                                      percentage: newPct,
                                    },
                                  });
                                }}
                                className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-[11px] font-bold flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Add Subject
                              </button>
                            </div>

                            <div className="space-y-2">
                              {(val || []).map((sub: any, sIdx: number) => (
                                <div key={sIdx} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                                  <div className="col-span-3">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Code</span>
                                    <input
                                      type="text"
                                      placeholder="CIV-213"
                                      value={sub.subjectCode || ''}
                                      onChange={(e) => {
                                        const updated = [...val];
                                        updated[sIdx] = { ...updated[sIdx], subjectCode: e.target.value };
                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, subjects: updated } });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white font-mono text-[11px]"
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Subject Name</span>
                                    <input
                                      type="text"
                                      placeholder="Subject Name"
                                      value={sub.subjectName || ''}
                                      onChange={(e) => {
                                        const updated = [...val];
                                        updated[sIdx] = { ...updated[sIdx], subjectName: e.target.value };
                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, subjects: updated } });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-[11px]"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Total</span>
                                    <input
                                      type="number"
                                      placeholder="100"
                                      value={sub.totalMarks ?? 100}
                                      onChange={(e) => {
                                        const updated = [...val];
                                        updated[sIdx] = { ...updated[sIdx], totalMarks: Number(e.target.value) };
                                        const newTotal = updated.reduce((acc, s) => acc + Number(s.totalMarks || 0), 0);
                                        const newObt = updated.reduce((acc, s) => acc + Number(s.obtainedMarks || 0), 0);
                                        const newPct = newTotal > 0 ? Number(((newObt / newTotal) * 100).toFixed(1)) : 0;
                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, subjects: updated, totalMarks: newTotal, percentage: newPct } });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-[11px]"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Obtained</span>
                                    <input
                                      type="number"
                                      placeholder="80"
                                      value={sub.obtainedMarks ?? 0}
                                      onChange={(e) => {
                                        const updated = [...val];
                                        const obt = Number(e.target.value);
                                        const tot = Number(updated[sIdx].totalMarks || 100);
                                        const grade = obt >= tot * 0.8 ? 'A+' : obt >= tot * 0.7 ? 'A' : obt >= tot * 0.6 ? 'B' : obt >= tot * 0.5 ? 'C' : obt >= tot * 0.4 ? 'D' : 'F';
                                        const status = obt >= tot * 0.4 ? 'Pass' : 'Supply';
                                        updated[sIdx] = { ...updated[sIdx], obtainedMarks: obt, grade, status };
                                        const newTotal = updated.reduce((acc, s) => acc + Number(s.totalMarks || 0), 0);
                                        const newObt = updated.reduce((acc, s) => acc + Number(s.obtainedMarks || 0), 0);
                                        const newPct = newTotal > 0 ? Number(((newObt / newTotal) * 100).toFixed(1)) : 0;
                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, subjects: updated, totalMarks: newTotal, obtainedMarks: newObt, percentage: newPct } });
                                      }}
                                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-[11px]"
                                    />
                                  </div>
                                  <div className="col-span-1 flex justify-end pt-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = val.filter((_: any, i: number) => i !== sIdx);
                                        const newTotal = updated.reduce((acc: number, s: any) => acc + Number(s.totalMarks || 0), 0);
                                        const newObt = updated.reduce((acc, s) => acc + Number(s.obtainedMarks || 0), 0);
                                        const newPct = newTotal > 0 ? Number(((newObt / newTotal) * 100).toFixed(1)) : 0;
                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, subjects: updated, totalMarks: newTotal, obtainedMarks: newObt, percentage: newPct } });
                                      }}
                                      className="p-1 text-slate-500 hover:text-red-400"
                                      title="Remove Subject"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={key}>
                          <label className="block font-bold text-slate-300 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')} (Comma Separated)
                          </label>
                          <input
                            type="text"
                            value={val.join(', ')}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                data: {
                                  ...editingItem.data,
                                  [key]: e.target.value.split(',').map((s) => s.trim()),
                                },
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      );
                    }

                    if (typeof val === 'boolean') {
                      return (
                        <label key={key} className="flex items-center gap-2 cursor-pointer pt-2">
                          <input
                            type="checkbox"
                            checked={val}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                data: {
                                  ...editingItem.data,
                                  [key]: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4 rounded text-orange-500"
                          />
                          <span className="font-bold text-slate-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                        </label>
                      );
                    }

                    if (typeof val === 'number') {
                      return (
                        <div key={key}>
                          <label className="block font-bold text-slate-300 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </label>
                          <input
                            type="number"
                            value={val}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                data: {
                                  ...editingItem.data,
                                  [key]: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      );
                    }

                    const isLongText = ['description', 'content', 'about', 'bio', 'mission', 'vision', 'caption'].includes(key);
                    if (isLongText) {
                      return (
                        <div key={key}>
                          <label className="block font-bold text-slate-300 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </label>
                          <textarea
                            rows={3}
                            value={val || ''}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                data: {
                                  ...editingItem.data,
                                  [key]: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={key}>
                        <label className="block font-bold text-slate-300 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <input
                          type="text"
                          value={val || ''}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: {
                                ...editingItem.data,
                                [key]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                    );
                  })}

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold shadow"
                    >
                      {isSaving ? 'Saving...' : 'Save Record'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteTarget && (
            <div
              onClick={() => !isDeleting && setDeleteTarget(null)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950 rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{deleteTarget.title}</h3>
                    <p className="text-xs text-slate-400">Confirm permanent deletion</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <p className="mb-2">Are you sure you want to permanently delete this item?</p>
                  <p className="font-bold text-white break-words">"{deleteTarget.itemDescription}"</p>
                  <p className="text-[11px] text-red-400 mt-2">
                    ⚠️ This action will immediately remove the record from all portals and cannot be undone.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => deleteTarget.onConfirm()}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Permanently</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2FA PIN Change Modal */}
          {isChangingPin && (
            <div
              onClick={() => setIsChangingPin(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950 rounded-2xl max-w-sm w-full p-6 border border-slate-800 shadow-2xl space-y-4"
              >
                <h3 className="text-base font-bold text-white">Update Super Admin 2FA PIN</h3>
                <p className="text-xs text-slate-400">Enter a secure 4 to 6 digit numeric security code.</p>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="e.g. 199500"
                  value={newPinValue}
                  onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-orange-500"
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPin(false);
                      setNewPinValue('');
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={newPinValue.length < 4}
                    onClick={async () => {
                      try {
                        await adminApi.update2FASettings({ twoFactorSecret: newPinValue });
                        setIsChangingPin(false);
                        setNewPinValue('');
                        showMessage('2FA Security PIN updated successfully!');
                      } catch (err: any) {
                        showMessage(err.message || 'Error updating PIN', 'error');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs"
                  >
                    Save PIN
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
