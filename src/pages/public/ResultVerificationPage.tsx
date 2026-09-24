/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  FileCheck,
  GraduationCap,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { ResultRecord, CollegeSettings } from '../../types.js';
import { publicApi } from '../../lib/api.js';
import { LogoBadge } from '../../components/common/LogoBadge.js';

interface ResultVerificationPageProps {
  settings: CollegeSettings;
}

export const ResultVerificationPage: React.FC<ResultVerificationPageProps> = ({ settings }) => {
  const [rollNumber, setRollNumber] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [examination, setExamination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResultRecord[] | null>(null);
  const [selectedResult, setSelectedResult] = useState<ResultRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResults(null);
    setSelectedResult(null);

    try {
      const res = await publicApi.verifyResult({
        rollNumber: rollNumber.trim(),
        registrationNumber: regNumber.trim() || undefined,
        examination: examination.trim() || undefined,
      });

      if (res.results && res.results.length > 0) {
        setResults(res.results);
        setSelectedResult(res.results[0]);
      } else {
        setErrorMessage('No published examination record found for this roll number.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'No examination record found for the provided credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header (Hidden on Print) */}
        <div className="print:hidden bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 shadow-md">
          <div className="max-w-2xl space-y-2">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Examination Controller
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Online PBTE Examination Result Verification
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Verify official Diploma of Associate Engineer (DAE) examination marksheets and term assessment records online.
            </p>
          </div>
        </div>

        {/* Search Card (Hidden on Print) */}
        <div className="print:hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-500" />
            <span>Search Examination Record</span>
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. DAE-CIV-2101 or 2101"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration No (Optional)
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. PBTE-2021-9872"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Examination Term
                </label>
                <select
                  value={examination}
                  onChange={(e) => setExamination(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                >
                  <option value="">All Examinations</option>
                  <option value="1st Annual Examination 2024">1st Annual Examination 2024</option>
                  <option value="2nd Annual Examination 2023">2nd Annual Examination 2023</option>
                  <option value="Mid-Term Assessment 2024">Mid-Term Assessment 2024</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Tip: Try sample roll number <strong>DAE-CIV-2101</strong> or <strong>DAE-ELE-2102</strong>
              </span>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{isLoading ? 'Verifying...' : 'Search Result'}</span>
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Verification Notice</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Examination History Selector (if multiple) */}
        {results && results.length > 1 && (
          <div className="print:hidden flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">Select Examination:</span>
            {results.map((res) => (
              <button
                key={res.id}
                onClick={() => setSelectedResult(res)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                  selectedResult?.id === res.id
                    ? 'bg-blue-950 text-white border-blue-900 shadow'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {res.examination} ({res.semester})
              </button>
            ))}
          </div>
        )}

        {/* PRINTABLE OFFICIAL MARKSHEET CARD */}
        {selectedResult && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-300 p-8 sm:p-10 space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0">
            {/* Action Bar (Hidden on print) */}
            <div className="print:hidden flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED OFFICIAL RECORD
                </span>
              </div>

              <button
                onClick={handlePrint}
                className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Marksheet</span>
              </button>
            </div>

            {/* Official Marksheet Header */}
            <div className="text-center space-y-2 border-b-2 border-slate-800 pb-6">
              <div className="flex items-center justify-center gap-4">
                <LogoBadge logoUrl={settings.logoUrl} size="lg" />
                <div className="text-left">
                  <h2 className="text-xl sm:text-2xl font-black text-blue-950 uppercase tracking-tight">
                    {settings.collegeName || 'JINNAH POLYTECHNIC INSTITUTE'}
                  </h2>
                  <p className="text-xs font-bold text-orange-600">
                    FAISALABAD CAMPUS • SINCE 1995 • PBTE AFFILIATED
                  </p>
                  <p className="text-[11px] text-slate-500 font-urdu">جناح پولی ٹیکنک انسٹیٹیوٹ فیصل آباد</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-block bg-blue-950 text-white font-extrabold text-xs sm:text-sm px-4 py-1 rounded tracking-wide uppercase">
                  OFFICIAL PROVISIONAL RESULT STATEMENT
                </span>
                <p className="text-xs font-bold text-slate-700 mt-1 uppercase">
                  {selectedResult.examination}
                </p>
              </div>
            </div>

            {/* Student Credentials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
                <strong className="text-slate-900 text-sm">{selectedResult.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Father's Name</span>
                <strong className="text-slate-900 text-sm">{selectedResult.fatherName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Roll Number</span>
                <strong className="text-blue-950 font-mono text-sm font-extrabold">{selectedResult.rollNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Registration No</span>
                <strong className="text-slate-900 font-mono text-xs">{selectedResult.registrationNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Department</span>
                <span className="text-slate-800 font-semibold">{selectedResult.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Technology</span>
                <span className="text-slate-800 font-semibold">{selectedResult.technology}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Semester</span>
                <span className="text-slate-800 font-semibold">{selectedResult.semester}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Academic Session</span>
                <span className="text-slate-800 font-semibold">{selectedResult.academicYear}</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2.5 border-r border-slate-300 text-center w-12">Sr.</th>
                    <th className="p-2.5 border-r border-slate-300">Subject Code</th>
                    <th className="p-2.5 border-r border-slate-300">Subject Title</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Total Marks</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Obtained Marks</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Grade</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedResult.subjects.map((sub, i) => (
                    <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-300 text-center text-slate-500">{i + 1}</td>
                      <td className="p-2.5 border-r border-slate-300 font-mono font-bold text-slate-700">
                        {sub.subjectCode}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 font-medium text-slate-900">
                        {sub.subjectName}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-semibold text-slate-700">
                        {sub.totalMarks}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-bold text-blue-950">
                        {sub.obtainedMarks}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-extrabold text-slate-800">
                        {sub.grade}
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            sub.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={3} className="p-3 text-right text-slate-800 uppercase tracking-wider">
                      Grand Total &amp; Cumulative Performance:
                    </td>
                    <td className="p-3 text-center text-slate-800">{selectedResult.totalMarks}</td>
                    <td className="p-3 text-center text-blue-950 text-sm font-black">
                      {selectedResult.obtainedMarks}
                    </td>
                    <td className="p-3 text-center text-orange-600 font-black">
                      {selectedResult.overallGrade}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                          selectedResult.resultStatus === 'Passed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {selectedResult.resultStatus}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Performance Summary Metrics */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 text-center text-xs">
              <div>
                <span className="text-blue-900 block font-bold text-[11px] uppercase">Percentage</span>
                <strong className="text-blue-950 text-base font-black">{selectedResult.percentage}%</strong>
              </div>
              <div>
                <span className="text-blue-900 block font-bold text-[11px] uppercase">Calculated GPA</span>
                <strong className="text-blue-950 text-base font-black">{selectedResult.gpa || '3.80'} / 4.00</strong>
              </div>
              <div>
                <span className="text-blue-900 block font-bold text-[11px] uppercase">Official Status</span>
                <strong
                  className={`text-base font-black ${
                    selectedResult.resultStatus === 'Passed' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {selectedResult.resultStatus.toUpperCase()}
                </strong>
              </div>
            </div>

            {/* Remarks & Signatures */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-8 text-xs">
              <div className="space-y-1 text-slate-500">
                <p><strong>Remarks:</strong> {selectedResult.remarks || 'Cleared all subjects successfully.'}</p>
                <p><strong>Issue Date:</strong> {selectedResult.issueDate}</p>
                <p className="text-[10px]">This is a verified provisional marks statement issued by the Examination Controller.</p>
              </div>

              <div className="flex items-center gap-10 text-center">
                <div className="space-y-8">
                  <div className="w-32 border-b border-slate-400"></div>
                  <span className="block font-bold text-slate-800">Tabulator / Registrar</span>
                </div>
                <div className="space-y-8">
                  <div className="w-32 border-b border-slate-800"></div>
                  <span className="block font-bold text-blue-950">Controller of Examinations</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
