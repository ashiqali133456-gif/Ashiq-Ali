/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { LogoBadge } from '../../components/common/LogoBadge.js';
import { CollegeSettings } from '../../types.js';

interface TeacherLoginPageProps {
  settings: CollegeSettings;
  onNavigate: (route: string) => void;
}

export const TeacherLoginPage: React.FC<TeacherLoginPageProps> = ({ settings, onNavigate }) => {
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('engr.ahmed@jpc.edu.pk');
  const [password, setPassword] = useState('Teacher@123');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await login(identifier, password, 'TEACHER');
      if (res.success) {
        onNavigate('teacher-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Teacher / Faculty credentials.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 text-center space-y-2 relative">
          <button
            onClick={() => onNavigate('home')}
            className="absolute left-4 top-4 text-slate-400 hover:text-white p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex justify-center">
            <LogoBadge logoUrl={settings.logoUrl} size="md" />
          </div>

          <h2 className="text-lg font-black tracking-tight uppercase">Faculty &amp; Staff Portal</h2>
          <p className="text-xs text-emerald-200">
            Attendance marker, student roster &amp; departmental records
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty Email Address
              </label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="engr.ahmed@jpc.edu.pk"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
              <div className="font-bold">Faculty Demo Account:</div>
              <div>Email: <code className="font-bold text-emerald-800">engr.ahmed@jpc.edu.pk</code></div>
              <div>Password: <code className="font-bold text-emerald-800">Teacher@123</code></div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>{isLoading ? 'Signing In...' : 'Sign In as Faculty Member'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
