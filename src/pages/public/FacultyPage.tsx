/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Teacher } from '../../types.js';
import { Award, BookOpen, GraduationCap, Mail, Search, Users } from 'lucide-react';

interface FacultyPageProps {
  faculty: Teacher[];
}

export const FacultyPage: React.FC<FacultyPageProps> = ({ faculty }) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = ['All', ...Array.from(new Set(faculty.map((f) => f.department)))];

  const filteredFaculty = faculty.filter((teacher) => {
    const matchesDept = selectedDept === 'All' || teacher.department === selectedDept;
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-10 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Experienced Engineering Mentors
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Distinguished Faculty &amp; Technical Instructors
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our faculty comprises certified professional engineers, industrial practitioners, and veteran educators dedicated to hands-on student mastery.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDept === dept
                    ? 'bg-blue-950 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name or subject..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden flex flex-col transition-all group"
            >
              <div className="p-6 flex items-start gap-4 pb-4 border-b border-slate-100">
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={teacher.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                    {teacher.department}
                  </span>
                  <h3 className="font-extrabold text-base text-blue-950 truncate">{teacher.name}</h3>
                  <p className="text-xs text-slate-600 font-semibold">{teacher.designation}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{teacher.qualification}</span>
                  </p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Teaching Experience:</span>
                    <strong className="text-slate-800 font-bold">{teacher.experience}</strong>
                  </div>

                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                        Assigned Subjects
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((sub, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {teacher.bio && (
                    <p className="text-slate-500 text-[11px] line-clamp-2 italic">{teacher.bio}</p>
                  )}
                </div>

                {teacher.email && (
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredFaculty.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">No Faculty Found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search query or department filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
