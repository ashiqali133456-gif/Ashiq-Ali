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
  ChevronRight,
  Clock,
  Download,
  FileText,
  Heart,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  User,
  Users,
  X,
  Target,
  Compass,
} from 'lucide-react';
import { PrincipalProfile, PrincipalMessage } from '../../types.js';

interface PrincipalPageProps {
  onNavigate: (route: string) => void;
}

export const PrincipalPage: React.FC<PrincipalPageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<PrincipalProfile | null>(null);
  const [messages, setMessages] = useState<PrincipalMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<PrincipalMessage | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, messagesRes] = await Promise.all([
        fetch('/api/public/principal-profile'),
        fetch('/api/public/principal-messages'),
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData.success && pData.profile) {
          setProfile(pData.profile);
        }
      }

      if (messagesRes.ok) {
        const mData = await messagesRes.json();
        if (mData.success && mData.messages) {
          setMessages(mData.messages);
        }
      }
    } catch (err) {
      console.error('Error fetching principal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.messageBody.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white py-12 px-4 shadow-md border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Award className="w-4 h-4 text-orange-400" />
              <span>Desk of the Principal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Institutional Leadership &amp; Official Communications
            </h1>
            <p className="text-blue-200 text-sm max-w-2xl">
              Official profile, educational philosophy, and public directives from the Principal of Jina Polytechnic College.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('principal-messages-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>View Official Messages</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {/* Profile Card */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-pulse flex flex-col md:flex-row gap-8">
            <div className="w-48 h-60 bg-slate-200 rounded-xl"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-20 bg-slate-200 rounded w-full"></div>
            </div>
          </div>
        ) : profile ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Photo & Core Credentials */}
              <div className="lg:col-span-4 bg-gradient-to-b from-blue-950 to-slate-900 p-8 text-white flex flex-col items-center text-center justify-between border-b lg:border-b-0 lg:border-r border-blue-900/40">
                <div className="space-y-4 w-full">
                  <div className="relative w-44 h-56 mx-auto rounded-2xl overflow-hidden border-4 border-orange-500/80 shadow-xl bg-slate-800">
                    <img
                      src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                      alt={profile.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold text-white">{profile.name}</h2>
                    <p className="text-orange-400 font-bold text-xs mt-1 uppercase tracking-wide">
                      {profile.designation}
                    </p>
                    <p className="text-blue-200 text-xs mt-1">
                      {profile.qualification}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-blue-800/60 w-full space-y-2 text-left text-xs text-blue-200">
                    {profile.department && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-orange-400 shrink-0" />
                        <span>{profile.department}</span>
                      </div>
                    )}
                    {profile.experience && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-orange-400 shrink-0" />
                        <span>{profile.experience}</span>
                      </div>
                    )}
                    {profile.joiningDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                        <span>Joined Jina Polytechnic: {profile.joiningDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-blue-800/60 w-full">
                  <div className="bg-blue-900/50 p-3 rounded-xl border border-blue-700/50 text-[11px] text-blue-200">
                    <Shield className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <span>Certified Chief Executive &amp; Academic Administrator</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Biography, About, Vision & Mission */}
              <div className="lg:col-span-8 p-8 space-y-8">
                {/* Biography / Leadership Message */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Leadership Philosophy &amp; Welcome</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Welcome to Jina Polytechnic College
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {profile.biography || profile.about}
                  </p>
                </div>

                {/* Vision & Mission Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.vision && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                        <Compass className="w-4 h-4 text-orange-600" />
                        <span>Our Vision</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{profile.vision}</p>
                    </div>
                  )}

                  {profile.mission && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                        <Target className="w-4 h-4 text-blue-700" />
                        <span>Our Mission</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{profile.mission}</p>
                    </div>
                  )}
                </div>

                {/* Direct Message To Students & Teachers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {profile.messageToStudents && (
                    <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-orange-950 text-xs uppercase tracking-wider">
                        <Users className="w-4 h-4 text-orange-600" />
                        <span>Message To Students</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed italic">
                        "{profile.messageToStudents}"
                      </p>
                    </div>
                  )}

                  {profile.messageToTeachers && (
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs uppercase tracking-wider">
                        <User className="w-4 h-4 text-blue-700" />
                        <span>Message To Teachers</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed italic">
                        "{profile.messageToTeachers}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Official Public Messages Stream */}
        <div id="principal-messages-section" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                <span>Official Directives</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Public Principal Messages &amp; Directives
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search directives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Messages Grid */}
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No public directives match your search.</h3>
              <p className="text-xs text-slate-500 mt-1">Check back later for updated official notices from the Principal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          msg.priority === 'Urgent'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : msg.priority === 'High' || msg.priority === 'Important'
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {msg.priority} Notice
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors line-clamp-2">
                      {msg.title}
                    </h3>

                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {msg.messageBody}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={msg.principalPhotoUrl || profile?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                        alt={msg.principalName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-700 text-[11px]">{msg.principalName}</span>
                    </div>

                    <button
                      onClick={() => setSelectedMessage(msg)}
                      className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Read Directive</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMessage.principalPhotoUrl || profile?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedMessage.principalName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-orange-500 shadow-sm"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{selectedMessage.principalName}</h4>
                  <p className="text-orange-600 font-semibold text-xs">{profile?.designation || 'Principal & Chief Administrator'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="inline-block bg-blue-100 text-blue-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official Public Directive
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">{selectedMessage.title}</h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {selectedMessage.messageBody}
              </div>

              {selectedMessage.attachmentUrl && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <div>
                      <p className="text-xs font-bold text-blue-950">{selectedMessage.attachmentName || 'Official Attachment'}</p>
                      <p className="text-[10px] text-blue-700 uppercase">{selectedMessage.attachmentType || 'Document'}</p>
                    </div>
                  </div>
                  <a
                    href={selectedMessage.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
