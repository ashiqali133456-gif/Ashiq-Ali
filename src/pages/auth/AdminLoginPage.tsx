/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { LogoBadge } from '../../components/common/LogoBadge.js';
import { CollegeSettings } from '../../types.js';
import { signInWithGoogle, isSupabaseConfigured } from '../../lib/supabaseClient.js';

interface AdminLoginPageProps {
  settings: CollegeSettings;
  onNavigate: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ settings, onNavigate }) => {
  const { login, verify2FA, twoFactorState, cancel2FA, loginWithGoogle, isLoading } = useAuth();

  const [isClaimed, setIsClaimed] = useState<boolean>(true);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [deniedMessage, setDeniedMessage] = useState<string>('Access denied.');

  const [usePasswordMode, setUsePasswordMode] = useState<boolean>(false);
  const [googleEmail, setGoogleEmail] = useState<string>('ashiqali133456@gmail.com');
  const [claimEmail, setClaimEmail] = useState<string>('ashiqali133456@gmail.com');
  const [claimName, setClaimName] = useState<string>('Ashiq Ali (Super Administrator)');
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);

  const [identifier, setIdentifier] = useState<string>('ashiqali133456@gmail.com');
  const [password, setPassword] = useState<string>('Admin@Jina1995#');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState<boolean>(false);

  // Check admin ownership status on mount
  useEffect(() => {
    let isMounted = true;
    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/auth/admin-status');
        const json = await res.json();
        if (isMounted) {
          setIsClaimed(Boolean(json.isClaimed));
        }
      } catch (err) {
        console.error('Failed to check admin status:', err);
      } finally {
        if (isMounted) {
          setCheckingStatus(false);
        }
      }
    };
    checkAdminStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // One-time Atomic Admin Claim Flow (Disabled permanently once claimed)
  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimEmail) return;

    setError(null);
    setIsClaiming(true);

    try {
      const res = await fetch('/api/auth/claim-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: claimEmail.trim().toLowerCase(),
          name: claimName.trim(),
          googleSub: `google-sub-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to claim Super Admin ownership.');
      }

      setClaimSuccess(true);
      setIsClaimed(true);
      setGoogleEmail(claimEmail.trim().toLowerCase());
    } catch (err: any) {
      setError(err.message || 'Access denied. Claim failed.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Google Authentication: Must match the single immutable Super Admin
  const handleContinueWithGoogle = async (customEmail?: string) => {
    setError(null);
    setAccessDenied(false);
    setIsAuthenticatingGoogle(true);

    try {
      const emailToUse = (customEmail || googleEmail).trim().toLowerCase();

      // If Supabase OAuth is configured in browser, trigger popup/redirect
      if (isSupabaseConfigured) {
        try {
          await signInWithGoogle(window.location.origin);
        } catch (e) {
          console.warn('Supabase OAuth notice:', e);
        }
      }

      // Backend strictly validates against single immutable admin_config record
      const success = await loginWithGoogle({
        email: emailToUse,
        name: 'Super Administrator',
        requestedRole: 'SUPER_ADMIN',
      });

      if (success) {
        onNavigate('admin-dashboard');
      }
    } catch (err: any) {
      // Access denied for any account other than the original Super Admin
      setAccessDenied(true);
      setDeniedMessage(err.message || 'Access denied.');
      setError(null);
    } finally {
      setIsAuthenticatingGoogle(false);
    }
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAccessDenied(false);

    try {
      const res = await login(identifier, password, 'SUPER_ADMIN');
      if (res.success && !res.requires2FA) {
        onNavigate('admin-dashboard');
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('access denied')) {
        setAccessDenied(true);
        setDeniedMessage(err.message);
      } else {
        setError(err.message || 'Invalid credentials. Access denied.');
      }
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const success = await verify2FA(pin);
      if (success) {
        onNavigate('admin-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect 2FA verification PIN.');
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-medium">Securing private administration environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative z-10">
        {/* Header Ribbon */}
        <div className="bg-slate-950 px-6 py-6 border-b border-slate-800 text-center relative">
          <button
            onClick={() => onNavigate('home')}
            className="absolute left-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-3">
            <LogoBadge logoUrl={settings.logoUrl} size="md" />
          </div>

          <h2 className="text-lg font-black text-white tracking-wide uppercase">
            Private Admin Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {settings.collegeName || 'Jina Polytechnic College'} • Since 1995
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-[11px] text-amber-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Single Immutable Super Admin System</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Access Denied State for Unauthorized Google Accounts */}
          {accessDenied && (
            <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-center space-y-3 animate-in fade-in">
              <div className="w-10 h-10 bg-red-900/50 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-200 uppercase tracking-wide">
                  {deniedMessage}
                </h3>
                <p className="text-xs text-red-300/80 mt-1">
                  Only the original verified Super Admin Google account is authorized to access this private management system.
                </p>
              </div>
              <div className="pt-2 flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setAccessDenied(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Exit to Website
                </button>
              </div>
            </div>
          )}

          {/* Standard error banner */}
          {error && !accessDenied && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* INITIAL ADMIN SETUP FLOW (Only available before first admin is claimed) */}
          {!isClaimed && !claimSuccess ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Initial Super Admin Setup Required</span>
                </div>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  No Super Admin is registered yet. Register the first authorized Google account. Once claimed, this setup will be permanently locked and removed.
                </p>
              </div>

              <form onSubmit={handleClaimAdmin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    First Super Admin Name
                  </label>
                  <input
                    type="text"
                    required
                    value={claimName}
                    onChange={(e) => setClaimName(e.target.value)}
                    placeholder="Full Administrator Name"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Super Admin Google Account (Gmail)
                  </label>
                  <input
                    type="email"
                    required
                    value={claimEmail}
                    onChange={(e) => setClaimEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isClaiming || !claimEmail}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isClaiming ? 'Binding Owner...' : 'Permanently Claim Super Admin Role'}</span>
                </button>
              </form>
            </div>
          ) : twoFactorState?.required ? (
            /* 2FA PIN Verification for Super Admin */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Two-Factor Security Verification</span>
                </div>
                <p className="text-[11px] text-amber-300/80">
                  {twoFactorState.message || 'Enter your 6-digit Super Admin Security PIN.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  6-Digit Admin Security PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg tracking-widest font-mono text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancel2FA}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || pin.length < 4}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify PIN</span>
                </button>
              </div>
            </form>
          ) : !usePasswordMode ? (
            /* PRIMARY AUTHENTICATION: Verified Google Account */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-white">Google Identity Verification</h3>
                <p className="text-xs text-slate-400">
                  Sign in with the verified Google account bound to this college.
                </p>
              </div>

              {/* Direct One-Click Sign In with Google */}
              <button
                type="button"
                disabled={isLoading || isAuthenticatingGoogle}
                onClick={() => handleContinueWithGoogle()}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-3 border border-slate-200 group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>
                  {isAuthenticatingGoogle ? 'Verifying Google Account...' : 'Sign In with Google (College Administration)'}
                </span>
              </button>

              {/* Enter Admin Gmail explicitly if using another browser session */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Specify Admin Gmail Address:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="admin-email@gmail.com"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isLoading || isAuthenticatingGoogle || !googleEmail}
                    onClick={() => handleContinueWithGoogle()}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    Authorize
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-bold shrink-0">
                  Alternative Access
                </span>
              </div>

              <button
                type="button"
                onClick={() => setUsePasswordMode(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Use Master Password Credentials</span>
              </button>
            </div>
          ) : (
            /* ALTERNATIVE: Password Authentication */
            <form onSubmit={handleCredentialLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrator Username / Email
                </label>
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Verifying...' : 'Sign In with Password'}</span>
              </button>

              <button
                type="button"
                onClick={() => setUsePasswordMode(false)}
                className="w-full text-xs text-slate-400 hover:text-white text-center py-1 transition-colors"
              >
                Return to Google Authentication
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-slate-800">
            Protected private system. All administrative access attempts are monitored and recorded.
          </div>
        </div>
      </div>
    </div>
  );
};
