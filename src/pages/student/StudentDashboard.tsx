/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { studentApi } from '../../lib/api.js';
import { Student, ResultRecord, AttendanceRecord, Notice, DocumentItem } from '../../types.js';
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck,
  FileText,
  GraduationCap,
  LogOut,
  Printer,
  QrCode,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { LogoBadge } from '../../components/common/LogoBadge.js';

export const StudentDashboard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'results' | 'attendance' | 'notices' | 'documents' | 'principal-directives'>('profile');
  const [student, setStudent] = useState<Student | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [selectedResult, setSelectedResult] = useState<ResultRecord | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [subjectSummary, setSubjectSummary] = useState<any[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [principalMessages, setPrincipalMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profRes, resRes, attRes, notRes, docRes] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getResults(),
        studentApi.getAttendance(),
        studentApi.getNotices(),
        studentApi.getDocuments(),
      ]);

      setStudent(profRes.student);
      setSummary(profRes.summary);
      setResults(resRes.results || []);
      if (resRes.results && resRes.results.length > 0) {
        setSelectedResult(resRes.results[0]);
      }
      setAttendance(attRes.records || []);
      setSubjectSummary(attRes.subjectSummary || []);
      setNotices(notRes.notices || []);
      setDocuments(docRes.documents || []);

      // Fetch principal messages targeted to student
      fetch('/api/student/principal-messages', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jpc_auth_token')}`,
        },
      })
        .then((r) => r.json())
        .then((pData) => {
          if (pData.success && pData.messages) {
            setPrincipalMessages(pData.messages);
          }
        })
        .catch((e) => console.error(e));
    } catch (err) {
      console.error('Error loading student portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Loading Student Academic Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Top Student Header Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-200 border-2 border-orange-500 shadow-md shrink-0">
              <img
                src={student?.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'}
                alt={student?.name || 'Student'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Active Student
                </span>
                <span className="text-xs font-mono text-slate-300 font-bold">{student?.rollNumber}</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">{student?.name}</h1>
              <p className="text-xs text-slate-300">
                {student?.technology} • {student?.currentSemester} • Session {student?.session}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              onClick={() => onNavigate('home')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors"
            >
              Public Website
            </button>
            <button
              onClick={logout}
              className="bg-red-800/80 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Digital Student Card & Bio', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'principal-directives', label: 'Principal Directives', icon: <Award className="w-4 h-4 text-orange-500" /> },
            { id: 'results', label: 'My Examination Results', icon: <FileCheck className="w-4 h-4" /> },
            { id: 'attendance', label: 'My Attendance Record', icon: <Clock className="w-4 h-4" /> },
            { id: 'notices', label: 'Student Circulars', icon: <Bell className="w-4 h-4" /> },
            { id: 'documents', label: 'Downloads & Challans', icon: <Download className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-950 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: DIGITAL STUDENT IDENTITY CARD */}
        {activeTab === 'profile' && student && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student ID Card Visual Component */}
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-950 space-y-4 max-w-sm mx-auto w-full">
              <div className="text-center pb-3 border-b-2 border-blue-950 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <LogoBadge size="sm" />
                  <div className="text-left">
                    <h3 className="font-black text-blue-950 text-xs uppercase leading-none">
                      JINNAH POLYTECHNIC INSTITUTE
                    </h3>
                    <span className="text-[9px] text-orange-600 font-bold block">FAISALABAD CAMPUS</span>
                  </div>
                </div>
                <div className="bg-blue-950 text-white text-[10px] font-bold py-0.5 rounded mt-1 uppercase tracking-wider">
                  STUDENT IDENTITY CARD
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-24 h-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Name</span>
                    <strong className="text-blue-950 font-bold block text-sm">{student.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Roll Number</span>
                    <strong className="text-orange-600 font-mono font-black">{student.rollNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Technology</span>
                    <span className="text-slate-800 text-[11px] font-semibold">{student.technology}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Father Name:</span>
                  <strong className="text-slate-800">{student.fatherName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration No:</span>
                  <strong className="text-slate-800 font-mono text-[11px]">{student.registrationNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session:</span>
                  <strong className="text-slate-800">{student.session}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Card Status:</span>
                  <span className="text-emerald-700 font-bold">VERIFIED VALID</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>Principal Signature</span>
                <span className="font-mono">PBTE REG# {student.registrationNumber}</span>
              </div>
            </div>

            {/* Academic Summary Info */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <h2 className="text-lg font-bold text-blue-950 pb-3 border-b border-slate-100">
                Academic &amp; Enrollment Details
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Current Semester</span>
                  <strong className="text-slate-900 text-sm">{student.currentSemester}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Overall Attendance</span>
                  <strong className="text-emerald-600 text-sm font-black">{summary?.attendancePercentage || 92}%</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Exams Recorded</span>
                  <strong className="text-blue-950 text-sm font-black">{results.length} Semesters</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Registered Email</span>
                  <span className="text-slate-800 font-semibold truncate block">{student.email}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Contact Mobile</span>
                  <span className="text-slate-800 font-semibold">{student.phone || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">CNIC / B-Form</span>
                  <span className="text-slate-800 font-semibold">{student.cnic || 'N/A'}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-bold">Student Notice:</div>
                <p>
                  Your academic records and examination marks are verified by the Examination Branch. In case of discrepancies in marks or attendance, contact your Department Head immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESULTS SECTION */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700">No Examination Results Published Yet</h3>
                <p className="text-xs text-slate-400">Results will be available once finalized by the Examination Controller.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Examination selector tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {results.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setSelectedResult(res)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        selectedResult?.id === res.id
                          ? 'bg-blue-950 text-white border-blue-900 shadow'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {res.examination} ({res.semester})
                    </button>
                  ))}
                </div>

                {selectedResult && (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-orange-600 uppercase">
                          {selectedResult.academicYear}
                        </span>
                        <h3 className="text-lg font-bold text-blue-950">{selectedResult.examination}</h3>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                          selectedResult.resultStatus === 'Passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedResult.resultStatus}
                      </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold">
                            <th className="p-2.5 border-r border-slate-200">Code</th>
                            <th className="p-2.5 border-r border-slate-200">Subject Title</th>
                            <th className="p-2.5 border-r border-slate-200 text-center">Total</th>
                            <th className="p-2.5 border-r border-slate-200 text-center">Obtained</th>
                            <th className="p-2.5 border-r border-slate-200 text-center">Grade</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedResult.subjects.map((sub, i) => (
                            <tr key={i} className="border-b border-slate-100">
                              <td className="p-2.5 border-r border-slate-200 font-mono font-bold">{sub.subjectCode}</td>
                              <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-900">{sub.subjectName}</td>
                              <td className="p-2.5 border-r border-slate-200 text-center">{sub.totalMarks}</td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-bold text-blue-950">{sub.obtainedMarks}</td>
                              <td className="p-2.5 border-r border-slate-200 text-center font-bold">{sub.grade}</td>
                              <td className="p-2.5 text-center font-bold">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${sub.status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                  {sub.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                            <td colSpan={2} className="p-3 text-right">Grand Total:</td>
                            <td className="p-3 text-center">{selectedResult.totalMarks}</td>
                            <td className="p-3 text-center text-blue-950 font-black">{selectedResult.obtainedMarks}</td>
                            <td className="p-3 text-center text-orange-600 font-black">{selectedResult.overallGrade}</td>
                            <td className="p-3 text-center font-black">{selectedResult.percentage}%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ATTENDANCE SECTION */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {subjectSummary.map((sub, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-blue-950 truncate">{sub.subject}</h4>
                    <span className="font-black text-sm text-emerald-600">{sub.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${sub.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Present: <strong>{sub.present}</strong></span>
                    <span>Absent: <strong>{sub.absent}</strong></span>
                    <span>Total: <strong>{sub.total}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance History Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-blue-950">Daily Attendance Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold">
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Instructor</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((rec) => (
                      <tr key={rec.id} className="border-b border-slate-100">
                        <td className="p-2.5 font-mono">{rec.date}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{rec.subject}</td>
                        <td className="p-2.5 text-slate-600">{rec.teacherName}</td>
                        <td className="p-2.5 text-center font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                              rec.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'Absent'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT CIRCULARS */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            {notices.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-orange-600 uppercase">{n.category}</span>
                  <span className="text-slate-400">{n.date}</span>
                </div>
                <h3 className="font-bold text-base text-blue-950">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>
                {n.fileName && (
                  <div className="pt-2">
                    <a
                      href={n.fileAttachmentUrl || '#'}
                      className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 font-bold px-3 py-1.5 rounded text-xs border border-blue-200 hover:bg-blue-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Attachment: {n.fileName}</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB: PRINCIPAL DIRECTIVES */}
        {activeTab === 'principal-directives' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-950 to-slate-900 p-6 rounded-2xl text-white border border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Desk of the Principal
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  Official Principal Messages &amp; Student Directives
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Directives, academic advisories, and workshop instructions issued specifically for your enrollment class.
                </p>
              </div>
            </div>

            {principalMessages.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No specific principal directives at this moment.</h4>
                <p className="text-xs text-slate-500 mt-1">Check back regularly for updates from Principal Engr. Sir Usman.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {principalMessages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-extrabold rounded-full uppercase">
                          {msg.priority} Notice
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-blue-950 text-base">{msg.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {msg.messageBody}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={msg.principalPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                          alt={msg.principalName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-semibold text-slate-700 text-[11px]">{msg.principalName}</span>
                      </div>

                      {msg.attachmentUrl && (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-blue-950 text-white font-bold text-[11px] rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Attachment</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DOWNLOADS & CHALLANS */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase">{doc.category}</span>
                  <h4 className="font-bold text-sm text-blue-950">{doc.title}</h4>
                  <p className="text-xs text-slate-500">{doc.description}</p>
                  <span className="text-[10px] text-slate-400 block font-mono">File Size: {doc.fileSize}</span>
                </div>
                <a
                  href={doc.fileUrl}
                  download={doc.title}
                  className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
