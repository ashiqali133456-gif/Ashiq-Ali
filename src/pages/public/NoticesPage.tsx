/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Notice } from '../../types.js';
import { Bell, Calendar, Download, Eye, FileText, Search, Tag, X } from 'lucide-react';

interface NoticesPageProps {
  notices: Notice[];
}

export const NoticesPage: React.FC<NoticesPageProps> = ({ notices }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  const categories = ['All', 'Admission', 'Examination', 'Academic', 'Fee', 'General'];

  const filteredNotices = notices.filter((n) => {
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-10 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Official Administration
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Notices, Circulars &amp; Examination Notifications
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Official announcements issued by the Principal, Registrar, and Punjab Board of Technical Education (PBTE).
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-950 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars by title or keyword..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Notices List */}
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setActiveNotice(notice)}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">
                    {notice.date.split('-')[1]}
                  </span>
                  <span className="text-base font-black text-blue-950 leading-none mt-0.5">
                    {notice.date.split('-')[2]}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        notice.priority === 'Urgent' || notice.priority === 'Urgent_Marquee'
                          ? 'bg-red-100 text-red-800'
                          : notice.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {notice.priority}
                    </span>
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {notice.category}
                    </span>
                    <span className="text-xs text-slate-400">{notice.date}</span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-blue-950 group-hover:text-orange-600 transition-colors">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">{notice.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {notice.fileName && (
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1.5 rounded">
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attachment</span>
                  </span>
                )}
                <button className="bg-slate-50 group-hover:bg-orange-500 group-hover:text-white text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-200 group-hover:border-orange-500 transition-colors flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Notice</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Notice Modal */}
        {activeNotice && (
          <div
            onClick={() => setActiveNotice(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative"
            >
              <button
                onClick={() => setActiveNotice(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-600 uppercase">
                    {activeNotice.category} Circular
                  </span>
                  <span className="text-xs text-slate-400">• {activeNotice.date}</span>
                </div>
                <h2 className="text-xl font-black text-blue-950">{activeNotice.title}</h2>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
                {activeNotice.content}
              </div>

              {activeNotice.fileName && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <div>
                      <div className="text-xs font-bold text-blue-950">{activeNotice.fileName}</div>
                      <div className="text-[11px] text-blue-700">Official Document Attachment</div>
                    </div>
                  </div>
                  <a
                    href={activeNotice.fileAttachmentUrl || '#'}
                    download={activeNotice.fileName}
                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Issued by Office of the Registrar</span>
                <button
                  onClick={() => setActiveNotice(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
