/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { teacherApi } from '../../lib/api.js';
import { Teacher, Student, AttendanceRecord, Notice } from '../../types.js';
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  LogOut,
  Save,
  Users,
  XCircle,
} from 'lucide-react';

export const TeacherDashboard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'profile' | 'principal-directives'>('attendance');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [principalMessages, setPrincipalMessages] = useState<any[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('3rd Semester');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<{ [studentId: string]: 'Present' | 'Absent' | 'Leave' }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profRes, stuRes] = await Promise.all([
        teacherApi.getProfile(),
        teacherApi.getStudents(),
      ]);

      setTeacher(profRes.teacher);
      setAssignedSubjects(profRes.assignedSubjects || []);
      if (profRes.assignedSubjects && profRes.assignedSubjects.length > 0) {
        setSelectedSubject(profRes.assignedSubjects[0]);
      }
      setStudents(stuRes.students || []);

      // Initialize all students as Present
      const initialMap: { [studentId: string]: 'Present' | 'Absent' | 'Leave' } = {};
      (stuRes.students || []).forEach((s: Student) => {
        initialMap[s.id] = 'Present';
      });
      setAttendanceStatusMap(initialMap);

      // Fetch teacher-targeted principal messages
      fetch('/api/teacher/principal-messages', {
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
      console.error('Error loading teacher data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    const updated: { [studentId: string]: 'Present' | 'Absent' | 'Leave' } = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceStatusMap(updated);
  };

  const handleToggleStatus = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendanceStatusMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubject) {
      alert('Please select a subject to record attendance.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const records = students.map((s) => ({
        studentId: s.id,
        rollNumber: s.rollNumber,
        studentName: s.name,
        department: s.department,
        subject: selectedSubject,
        date: attendanceDate,
        status: attendanceStatusMap[s.id] || 'Present',
      }));

      await teacherApi.submitAttendance({
        date: attendanceDate,
        subject: selectedSubject,
        records,
      });

      setSaveSuccess(`Attendance for ${students.length} students recorded successfully!`);
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Error saving attendance records.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Loading Faculty Academic Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Top Faculty Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-200 border-2 border-emerald-500 shadow-md shrink-0">
              <img
                src={teacher?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={teacher?.name || 'Faculty'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Faculty Instructor
              </span>
              <h1 className="text-2xl font-black text-white mt-1">{teacher?.name}</h1>
              <p className="text-xs text-emerald-200">
                {teacher?.designation} • Department of {teacher?.department}
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

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Mark Daily Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'students'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Assigned Students Roster ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>My Teaching Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('principal-directives')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'principal-directives'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-orange-500" />
            <span>Principal Directives ({principalMessages.length})</span>
          </button>
        </div>

        {/* TAB 1: ATTENDANCE MARKER */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Lecture &amp; Practical Attendance Marker</h2>
                <p className="text-xs text-slate-500">Record daily classroom attendance for your assigned department students.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('Present')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Absent')}
                  className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Attendance Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Subject *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {assignedSubjects.map((sub, i) => (
                    <option key={i} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                </select>
              </div>
            </div>

            {/* Student List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="p-3 w-12 text-center">Sr.</th>
                    <th className="p-3">Student Details</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Technology</th>
                    <th className="p-3 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((stu, i) => {
                    const currentStatus = attendanceStatusMap[stu.id] || 'Present';
                    return (
                      <tr key={stu.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 text-center text-slate-400 font-mono">{i + 1}</td>
                        <td className="p-3 flex items-center gap-3">
                          <img
                            src={stu.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'}
                            alt={stu.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-300"
                          />
                          <div>
                            <strong className="block text-slate-900 text-sm">{stu.name}</strong>
                            <span className="text-[11px] text-slate-400">S/O {stu.fatherName}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-blue-950">{stu.rollNumber}</td>
                        <td className="p-3 text-slate-600">{stu.technology}</td>
                        <td className="p-3 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-white gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(stu.id, 'Present')}
                              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(stu.id, 'Absent')}
                              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                currentStatus === 'Absent'
                                  ? 'bg-red-600 text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(stu.id, 'Leave')}
                              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                currentStatus === 'Leave'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total students in class: <strong>{students.length}</strong>
              </span>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Submitting...' : 'Save & Submit Attendance'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS ROSTER */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Department Enrolled Student Roster</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((stu) => (
                <div key={stu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <img
                    src={stu.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'}
                    alt={stu.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <strong className="block text-slate-900 text-xs truncate">{stu.name}</strong>
                    <span className="text-[11px] font-mono font-bold text-blue-950 block">{stu.rollNumber}</span>
                    <span className="text-[10px] text-slate-500 block">{stu.currentSemester} • {stu.session}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TEACHER PROFILE */}
        {activeTab === 'profile' && teacher && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Instructor Profile &amp; Qualifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Full Name</span>
                <strong className="text-slate-900 text-sm">{teacher.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Designation</span>
                <strong className="text-slate-900 text-sm">{teacher.designation}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Department</span>
                <strong className="text-slate-900 text-sm">{teacher.department}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Qualification</span>
                <strong className="text-slate-900 text-sm">{teacher.qualification}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Teaching Experience</span>
                <strong className="text-slate-900 text-sm">{teacher.experience}</strong>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Official Email</span>
                <strong className="text-slate-900 text-sm">{teacher.email}</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRINCIPAL DIRECTIVES FOR FACULTY */}
        {activeTab === 'principal-directives' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 p-6 rounded-2xl text-white border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Desk of the Principal
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  Official Principal Directives for Faculty
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Academic instructions, department circulars, and administrative guidance issued for teaching staff.
                </p>
              </div>
            </div>

            {principalMessages.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No specific faculty directives at this moment.</h4>
                <p className="text-xs text-slate-500 mt-1">Check back regularly for updates from Principal Engr. Sir Usman.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {principalMessages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-extrabold rounded-full uppercase">
                          {msg.priority} Priority
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-base">{msg.title}</h4>
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
                          className="px-3 py-1 bg-emerald-950 text-white font-bold text-[11px] rounded-lg hover:bg-emerald-900 transition-colors flex items-center gap-1"
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
      </div>
    </div>
  );
};
