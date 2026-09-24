/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Department, Course } from '../../types.js';
import {
  Layers,
  Zap,
  Wrench,
  Laptop,
  Hammer,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Download,
  Users,
  Building,
} from 'lucide-react';

interface DepartmentsPageProps {
  departments: Department[];
  courses: Course[];
  onNavigate: (route: string) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  courses,
  onNavigate,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || '');

  const activeDept = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const deptCourses = courses.filter((c) => c.departmentId === activeDept?.id);

  const getIcon = (code: string) => {
    switch (code) {
      case 'CIVIL':
        return <Layers className="w-5 h-5 text-orange-500" />;
      case 'ELECTRICAL':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'MECHANICAL':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      case 'CIT':
        return <Laptop className="w-5 h-5 text-emerald-500" />;
      case 'ELECTRONICS':
        return <Hammer className="w-5 h-5 text-purple-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-10 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              PBTE Approved Curriculum
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Academic Technologies &amp; DAE Programs
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Explore our 3-Year Diploma of Associate Engineer (DAE) engineering technologies, specialized lab equipment, semester syllabus structures, and industry career pathways.
            </p>
          </div>
        </div>

        {/* Technology Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {departments.map((dept) => {
            const isSelected = dept.id === activeDept?.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-blue-950 text-white border-blue-900 shadow-md ring-2 ring-orange-500/50'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {getIcon(dept.code)}
                <span>{dept.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {dept.code}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Department Deep-Dive View */}
        {activeDept && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Main Info, Labs, Syllabi */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                        3-Year Diploma of Associate Engineer (DAE)
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-blue-950">{activeDept.name}</h2>
                    {activeDept.urduName && (
                      <p className="font-urdu text-sm text-slate-500">{activeDept.urduName}</p>
                    )}
                  </div>
                  <div className="bg-orange-50 text-orange-800 border border-orange-200 px-4 py-2 rounded-xl text-center shrink-0">
                    <span className="block text-[10px] uppercase font-bold text-orange-600">Established</span>
                    <strong className="text-sm font-extrabold">{activeDept.establishedYear}</strong>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={activeDept.image}
                    alt={activeDept.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Department Overview
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{activeDept.description}</p>
                </div>

                {/* Key Subjects */}
                {activeDept.keySubjects && activeDept.keySubjects.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Core Technical Subjects
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeDept.keySubjects.map((sub, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career Scope */}
                {activeDept.careerOpportunities && activeDept.careerOpportunities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Industrial Career Pathways
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeDept.careerOpportunities.map((career, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Courses & Lab Equipment breakdown */}
              {deptCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                        Course Code: {course.code}
                      </span>
                      <h3 className="text-lg font-bold text-blue-950 mt-1">{course.title}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee / Semester</span>
                      <strong className="text-sm font-extrabold text-slate-800">{course.feePerSemester}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>

                  {/* Practical Labs List */}
                  {course.practicalLabs && course.practicalLabs.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Department Practical Test Bays &amp; Machinery
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {course.practicalLabs.map((lab, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded">
                            <Wrench className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span>{lab}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Syllabus breakdown */}
                  {course.syllabus && course.syllabus.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Semester-wise Syllabus Matrix
                      </h4>
                      <div className="space-y-2">
                        {course.syllabus.map((syl: any, i: number) => {
                          const isObj = typeof syl === 'object' && syl !== null;
                          const semesterTitle = isObj ? syl.semester : `Module ${i + 1}`;
                          const subjectsList: string[] = isObj && Array.isArray(syl.subjects)
                            ? syl.subjects
                            : typeof syl === 'string'
                            ? [syl]
                            : [];

                          return (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="font-bold text-xs text-blue-950 mb-1">{semesterTitle}</div>
                              <div className="flex flex-wrap gap-1.5">
                                {subjectsList.map((sub: string, j: number) => (
                                  <span key={j} className="bg-white border border-slate-200 text-slate-600 text-[11px] px-2 py-0.5 rounded">
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Col: Quick Facts Card & Application CTA */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-base text-blue-950 pb-3 border-b border-slate-100">
                  Technology Quick Facts
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Degree Level:</span>
                    <strong className="text-slate-800 font-bold">{activeDept.degreeType} (3-Years)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <strong className="text-slate-800 font-bold">{activeDept.duration} (6 Semesters)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Head of Department:</span>
                    <strong className="text-slate-800 font-bold">{activeDept.headOfDepartment}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Heavy Labs:</span>
                    <strong className="text-slate-800 font-bold">{activeDept.totalLabs} Labs</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Annual Intake Seats:</span>
                    <strong className="text-slate-800 font-bold">{activeDept.totalSeats} Seats</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Eligibility:</span>
                    <strong className="text-slate-800 font-bold">Matric Science / Arts</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Affiliation:</span>
                    <strong className="text-orange-600 font-bold">PBTE Lahore</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => onNavigate('contact')}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Apply for {activeDept.code} Admission</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('results')}
                    className="w-full bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Check Examination Results</span>
                  </button>
                </div>
              </div>

              {/* Assistance Helpline */}
              <div className="bg-blue-950 text-white rounded-2xl p-6 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-orange-400">Need Academic Guidance?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Call our department coordinator for course fee discounts and transport routes.
                </p>
                <div className="text-sm font-bold text-white pt-1">
                  📞 0300-1234567 / (041) 876-5432
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
