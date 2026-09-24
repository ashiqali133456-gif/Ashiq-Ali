/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Image as ImageIcon,
  Save,
  Trash2,
  Upload,
  UserCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PrincipalProfile } from '../../types.js';
import { MediaUploader } from './MediaUploader.js';

export const PrincipalManagement: React.FC = () => {
  const [profile, setProfile] = useState<PrincipalProfile>({
    id: 'global_principal_profile',
    name: 'Engr. Sir Usman',
    photoUrl: '/uploads/principal-usman.jpg',
    designation: 'Principal & Chief Administrator',
    qualification: 'M.Sc. Civil Engineering (UET), B.Sc. Civil Engg, FIE (Pak)',
    department: 'Engineering & Institutional Administration',
    experience: '28+ Years in Technical Education & Industrial Administration',
    joiningDate: '1995-09-01',
    biography: 'Principal Engr. Muhammad Usman is an eminent engineering scholar, educational visionary, and Principal Administrator of Jinnah Polytechnic Institute Faisalabad Campus.',
    about: 'Jinnah Polytechnic Institute stands as a leading institute for technical education in Faisalabad.',
    vision: 'To be Pakistan’s premier associate engineering institution.',
    mission: 'To equip youth with cutting-edge engineering skills, industrial apprenticeships, and problem-solving mindsets.',
    messageToStudents: 'Dear Students, focus on your practical workshop exercises and daily technical training.',
    messageToTeachers: 'Respected Faculty Members, continue to mentor our students with dedication.',
    isPublished: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/principal-profile');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error('Failed to load principal profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/principal-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setFeedback({
          type: 'success',
          message: 'Principal photo and details updated successfully!',
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to save principal details.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Network error occurred while saving details.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = () => {
    if (window.confirm('Are you sure you want to delete/remove the Principal photo?')) {
      const updatedProfile = { ...profile, photoUrl: '' };
      setProfile(updatedProfile);
      setFeedback({
        type: 'success',
        message: 'Photo removed. Click "Save Changes" to apply across the website.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-orange-400" />
            <span>Principal Details &amp; Photo</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Principal Photo &amp; Name Upload
          </h2>
          <p className="text-xs text-slate-300">
            Upload or replace the official Principal picture and edit name details displayed on the website.
          </p>
        </div>

        <button
          onClick={fetchProfile}
          disabled={isLoading}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Picture Preview & Upload / Delete Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 flex flex-col items-center text-center">
            <div className="w-full text-left border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                <span>Principal Picture</span>
              </h3>
              <p className="text-[11px] text-slate-500">Official photo used across college pages.</p>
            </div>

            {/* Photo Frame Container */}
            <div className="relative group">
              {profile.photoUrl ? (
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-emerald-600 shadow-lg bg-slate-100 mx-auto">
                  <img
                    src={profile.photoUrl}
                    alt={profile.name || 'Principal'}
                    className="w-full h-full object-cover"
                  />
                  {/* Delete Overlay Icon */}
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    title="Delete Picture"
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-6 h-6 text-red-400" />
                    <span className="text-xs font-bold text-red-200">Delete Photo</span>
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-400 mx-auto">
                  <UserCheck className="w-16 h-16 text-slate-300 mb-2" />
                  <span className="text-xs font-bold text-slate-600">No Photo Set</span>
                  <span className="text-[10px] text-slate-400 mt-1">Upload a picture below</span>
                </div>
              )}
            </div>

            {/* Action Buttons for Image */}
            <div className="w-full space-y-3 pt-2">
              <MediaUploader
                currentUrl={profile.photoUrl}
                label="Upload / Replace Photo"
                category="Principal Photo"
                accept="image/*"
                onUploaded={(url) => {
                  setProfile((prev) => ({ ...prev, photoUrl: url }));
                  setFeedback({
                    type: 'success',
                    message: 'New photo selected! Click "Save Changes" below to apply.',
                  });
                }}
              />

              {profile.photoUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Delete Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Name & Designation Fields */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-950" />
                <span>Principal Personal Information</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Update official name, designation, and qualification details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Principal Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Principal Engr. Muhammad Usman"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  placeholder="e.g. Principal & Chief Administrator"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Educational Qualifications
                </label>
                <input
                  type="text"
                  value={profile.qualification}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  placeholder="e.g. M.Sc. Civil Engineering (UET), B.Sc. Civil Engg, FIE (Pak)"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Office
                </label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="e.g. Engineering & Institutional Administration"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message / Quote
                </label>
                <textarea
                  rows={4}
                  value={profile.biography}
                  onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
                  placeholder="e.g. Freedom is a precious legacy, but building a better Pakistan is our shared responsibility..."
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-blue-950 hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
