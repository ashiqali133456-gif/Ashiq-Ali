/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Lock, AlertCircle, ArrowLeft, CheckCircle2, Search, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { LogoBadge } from '../../components/common/LogoBadge.js';
import { CollegeSettings } from '../../types.js';
import { signInWithGoogle, isSupabaseConfigured } from '../../lib/supabaseClient.js';

interface StudentLoginPageProps {
  settings: CollegeSettings;
  onNavigate: (route: string) => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ settings, onNavigate }) => {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [googleEmail, setGoogleEmail] = useState('');
  const [identifier, setIdentifier] = useState('DAE-CIV-2101');
  const [password, setPassword] = useState('Student@1995');
  const [useCredentials, setUseCredentials] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Preferred: CONTINUE WITH GOOGLE
  const handleContinueWithGoogle = async (targetEmail?: string) => {
    const emailToUse = targetEmail || googleEmail;
    if (!emailToUse) {
      setError('Please provide your registered Google / Gmail address.');
      return;
    }

    setError(null);
    setIsGoogleLoading(true);

    try {
      if (isSupabaseConfigured) {
        await signInWithGoogle(window.location.origin);
      }

      const success = await loginWithGoogle({
        email: emailToUse,
        name: 'Student User',
        requestedRole: 'STUDENT',
      });

      if (success) {
        onNavigate('student-dashboard');
      }
    } catch (err: any) {
      setError(
        err.message ||
        'Your account is not linked to an approved college student record. Please contact administration.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await login(identifier, password, 'STUDENT');
      if (res.success) {
        onNavigate('student-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Roll Number or Password.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white p-6 text-center space-y-2 relative">
          <button
            onClick={() => onNavigate('home')}
            className="absolute left-4 top-4 text-slate-400 hover:text-white p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex justify-center">
            <LogoBadge logoUrl={settings.logoUrl} size="md" />
          </div>

          <h2 className="text-lg font-black tracking-tight uppercase">Student Academic Portal</h2>
          <p className="text-xs text-blue-200">
            {settings.collegeName || 'Jina Polytechnic College'} • {settings.tagline || 'SINCE 1995'}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!useCredentials ? (
            /* PREFERRED: CONTINUE WITH GOOGLE */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 text-[11px] font-black px-2.5 py-0.5 rounded uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                  Student Verification
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Authenticate with your registered student Google / Gmail account to view your verified semester marks, attendance, and documents.
                </p>
              </div>

              {/* Quick Select Approved Student Accounts */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Approved Student Google Accounts:
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    disabled={isLoading || isGoogleLoading}
                    onClick={() => handleContinueWithGoogle('student.ali@jpc.edu.pk')}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                        Ali Raza (DAE-CIV-2101)
                      </div>
                      <div className="text-[11px] text-slate-500">student.ali@jpc.edu.pk</div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Civil Tech
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading || isGoogleLoading}
                    onClick={() => handleContinueWithGoogle('student.hamza@jpc.edu.pk')}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                        Hamza Bilal (DAE-ELE-2102)
                      </div>
                      <div className="text-[11px] text-slate-500">student.hamza@jpc.edu.pk</div>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Electrical Tech
                    </span>
                  </button>
                </div>
              </div>

              {/* Or enter custom Google Email */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or enter your student Gmail:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="your-roll-number@gmail.com"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isLoading || isGoogleLoading || !googleEmail}
                    onClick={() => handleContinueWithGoogle()}
                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-bold shrink-0">
                  Or Password Login
                </span>
              </div>

              <button
                type="button"
                onClick={() => setUseCredentials(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Use Roll Number &amp; Password</span>
              </button>
            </div>
          ) : (
            /* CREDENTIALS LOGIN */
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Roll Number or Registered Email
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="DAE-CIV-2101"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{isLoading ? 'Signing In...' : 'Sign In to Student Portal'}</span>
              </button>

              <button
                type="button"
                onClick={() => setUseCredentials(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-800 text-center"
              >
                Return to Continue with Google
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
            Student privacy notice: You are only authorized to view your own attendance and academic transcripts.
          </div>
        </div>
      </div>
    </div>
  );
};
