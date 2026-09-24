/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CollegeEvent } from '../../types.js';
import { Calendar, Clock, MapPin, Tag, Users, Video } from 'lucide-react';

interface EventsPageProps {
  events: CollegeEvent[];
}

export const EventsPage: React.FC<EventsPageProps> = ({ events }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(events.map((e) => e.category)))];

  const filteredEvents = events.filter(
    (e) => selectedCategory === 'All' || e.category === selectedCategory
  );

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-8 sm:p-10 shadow-md">
          <div className="max-w-3xl space-y-2">
            <span className="bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Campus Life &amp; Activities
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Events, Technical Workshops &amp; Exhibitions
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Discover our annual robotics competitions, technical project galas, industry seminars, sports festivals, and convocations.
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-blue-950 text-white border-blue-900 shadow'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden flex flex-col transition-all group"
            >
              <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                <img
                  src={evt.posterUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'}
                  alt={evt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-blue-950 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow">
                  {evt.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      {evt.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {evt.time}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-blue-950 group-hover:text-orange-600 transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{evt.location}</span>
                  </div>
                  {evt.videoUrl && (
                    <span className="text-blue-600 font-bold flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" /> Video Demo
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
