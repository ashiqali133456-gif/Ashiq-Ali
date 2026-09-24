/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signUserToken, sanitizeUser, requireAuth, verifyUserToken } from '../auth.js';

const router = Router();

// Check if system has initial Super Admin
router.get('/init-status', (req: Request, res: Response) => {
  const data = db.getRawData();
  const config = db.getAdminConfig();
  return res.json({
    initialized: Boolean(config && config.is_claimed),
    isClaimed: Boolean(config && config.is_claimed),
    collegeName: data.settings.collegeName,
    twoFactorEnabled: data.securitySettings.twoFactorRequiredForAdmin,
  });
});

// Status of single Super Admin claim (never exposes email or IDs)
router.get('/admin-status', (req: Request, res: Response) => {
  const config = db.getAdminConfig();
  return res.json({
    success: true,
    isClaimed: Boolean(config && config.is_claimed),
  });
});

// Atomic first admin claim
router.post('/claim-admin', async (req: Request, res: Response) => {
  const config = db.getAdminConfig();
  if (config && config.is_claimed) {
    db.logAudit('system', 'Unknown User', 'VISITOR', 'CLAIM_ADMIN_REJECTED', 'Security', 'Attempted to claim already claimed Super Admin', req.ip);
    return res.status(403).json({
      success: false,
      error: 'Access denied. Super Admin has already been claimed permanently.',
    });
  }

  const { email, googleSub, name } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required to claim Super Admin.' });
  }

  const result = db.claimSuperAdmin({
    userId: `usr-admin-${Date.now()}`,
    googleSub: googleSub || `google-sub-${Date.now()}`,
    email: String(email).trim().toLowerCase(),
    name: name || 'Super Administrator',
  });

  if (!result.success) {
    return res.status(403).json({ success: false, error: result.error || 'Access denied.' });
  }

  db.logAudit(result.config!.admin_user_id, result.config!.admin_name, 'SUPER_ADMIN', 'ADMIN_CLAIMED', 'Security', 'Super Admin role permanently claimed.', req.ip);

  return res.json({
    success: true,
    message: 'Super Admin successfully claimed and permanently bound.',
  });
});

// Real credential login
router.post('/login', async (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both identification (email/roll number) and password.',
    });
  }

  const data = db.getRawData();
  const cleanId = String(identifier).trim().toLowerCase();

  // Find user by email, rollNumber, or employeeId
  const user = data.users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      (u.rollNumber && u.rollNumber.toLowerCase() === cleanId) ||
      (u.employeeId && u.employeeId.toLowerCase() === cleanId)
  );

  if (!user) {
    db.logAudit('system', cleanId, 'VISITOR', 'LOGIN_FAILED', 'Authentication', `Failed login attempt for nonexistent user ${cleanId}`, req.ip);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Please verify your identification and password.',
    });
  }

  if (user.status !== 'Active') {
    return res.status(403).json({
      success: false,
      error: 'Account is inactive or suspended. Please contact college administration.',
    });
  }

  // If role filter requested, verify role match
  if (role && role !== user.role) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: This portal is for ${role} accounts only.`,
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    db.logAudit(user.id, user.name, user.role, 'LOGIN_FAILED', 'Authentication', `Failed password attempt for ${user.email}`, req.ip);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Password is incorrect.',
    });
  }

  // Handle 2FA for Super Admin
  if (user.role === 'SUPER_ADMIN' && data.securitySettings.twoFactorRequiredForAdmin) {
    const tempToken = signUserToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        is2FAVerified: false,
      },
      '15m'
    );

    return res.json({
      success: true,
      requires2FA: true,
      tempToken,
      message: 'Password verified. Enter your 6-digit Super Admin Security PIN to complete login.',
    });
  }

  // Generate full session token
  const token = signUserToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    rollNumber: user.rollNumber,
    employeeId: user.employeeId,
    department: user.department,
    is2FAVerified: true,
  });

  // Set httpOnly cookie as extra layer
  res.cookie('jpc_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000,
  });

  db.logAudit(user.id, user.name, user.role, 'LOGIN_SUCCESS', 'Authentication', `Successful login into ${user.role} account.`, req.ip);

  return res.json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

// Verify 2FA PIN for Super Admin
router.post('/verify-2fa', (req: Request, res: Response) => {
  const { tempToken, pin } = req.body;

  if (!tempToken || !pin) {
    return res.status(400).json({
      success: false,
      error: 'Verification token and 6-digit PIN are required.',
    });
  }

  const payload = verifyUserToken(tempToken);
  if (!payload || payload.role !== 'SUPER_ADMIN') {
    return res.status(401).json({
      success: false,
      error: '2FA session expired. Please log in again.',
    });
  }

  const data = db.getRawData();
  const user = data.users.find((u) => u.id === payload.userId);

  if (!user || user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Unauthorized user.' });
  }

  const storedPin = user.twoFactorPin || '199500';
  if (String(pin).trim() !== storedPin) {
    db.logAudit(user.id, user.name, user.role, '2FA_FAILED', 'Security', `Invalid 2FA PIN attempt for Super Admin.`, req.ip);
    return res.status(401).json({
      success: false,
      error: 'Incorrect 2FA Security PIN.',
    });
  }

  const fullToken = signUserToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    is2FAVerified: true,
  });

  res.cookie('jpc_auth_token', fullToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000,
  });

  db.logAudit(user.id, user.name, user.role, '2FA_SUCCESS', 'Security', `Super Admin passed 2FA verification.`, req.ip);

  return res.json({
    success: true,
    token: fullToken,
    user: sanitizeUser(user),
  });
});

// Google Authentication for Super Admin, Students, and Teachers
router.post('/google', async (req: Request, res: Response) => {
  const { email, name, googleId, picture, requestedRole, supabaseToken } = req.body;

  let verifiedEmail = email ? String(email).trim().toLowerCase() : '';
  let verifiedName = name || 'Google User';
  let verifiedPicture = picture;

  // If Supabase token is provided, verify against Supabase Auth
  if (supabaseToken) {
    const { getServerSupabase } = await import('../supabase.js');
    const supabase = getServerSupabase();
    if (supabase) {
      const { data: supaUser, error: supaErr } = await supabase.auth.getUser(supabaseToken);
      if (!supaErr && supaUser?.user?.email) {
        verifiedEmail = supaUser.user.email.toLowerCase();
        verifiedName = supaUser.user.user_metadata?.full_name || verifiedName;
        verifiedPicture = supaUser.user.user_metadata?.avatar_url || verifiedPicture;
      }
    }
  }

  if (!verifiedEmail) {
    return res.status(400).json({ success: false, error: 'Google email is required.' });
  }

  const data = db.getRawData();

  // Check if logging into Super Admin Portal
  if (requestedRole === 'SUPER_ADMIN') {
    const adminConfig = db.getAdminConfig();
    if (!adminConfig || !adminConfig.is_claimed) {
      return res.status(403).json({
        success: false,
        error: 'Access denied.',
      });
    }

    const isMatch = db.verifyIsSuperAdmin(verifiedEmail) || (googleId && db.verifyIsSuperAdmin(googleId));
    if (!isMatch) {
      db.logAudit('system', 'Unauthorized User', 'VISITOR', 'ADMIN_ACCESS_DENIED', 'Security', `Unauthorized Google account attempted Super Admin access`, req.ip);
      return res.status(403).json({
        success: false,
        error: 'Access denied.',
      });
    }

    let user = data.users.find((u) => u.email.toLowerCase() === verifiedEmail || u.id === adminConfig.admin_user_id);
    if (!user) {
      user = {
        id: adminConfig.admin_user_id,
        email: verifiedEmail,
        name: verifiedName || adminConfig.admin_name,
        role: 'SUPER_ADMIN',
        status: 'Active',
        avatar: verifiedPicture,
        isTwoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        passwordHash: bcrypt.hashSync(googleId || 'GoogleAdmin1995#', 10),
      };
      data.users.push(user);
      db.save();
    } else {
      user.role = 'SUPER_ADMIN';
      user.status = 'Active';
      if (verifiedPicture) user.avatar = verifiedPicture;
      db.save();
    }

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      role: 'SUPER_ADMIN',
      name: user.name,
      is2FAVerified: true,
    });

    res.cookie('jpc_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000,
    });

    db.logAudit(user.id, user.name, 'SUPER_ADMIN', 'ADMIN_GOOGLE_LOGIN', 'Authentication', `Super Admin logged in via Google OAuth`, req.ip);

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  }

  let user = data.users.find((u) => u.email.toLowerCase() === verifiedEmail);

  // Student Login flow
  if (requestedRole === 'STUDENT' || !user) {
    const studentRecord = data.students.find(
      (s) =>
        s.email?.toLowerCase() === verifiedEmail ||
        (s as any).googleEmail?.toLowerCase() === verifiedEmail
    );

    if (studentRecord) {
      if (!user) {
        user = {
          id: `usr-stu-${Date.now()}`,
          email: verifiedEmail,
          name: studentRecord.name || verifiedName,
          role: 'STUDENT',
          rollNumber: studentRecord.rollNumber,
          department: studentRecord.department,
          avatar: verifiedPicture || studentRecord.photoUrl,
          status: 'Active',
          createdAt: new Date().toISOString(),
          passwordHash: bcrypt.hashSync(googleId || 'GoogleStudent1995#', 10),
        };
        data.users.push(user);
        db.save();
      }
    } else {
      // Check if student exists or check if user was already registered
      if (user && user.role === 'STUDENT') {
        // user already registered as student
      } else {
        return res.status(403).json({
          success: false,
          error: 'Your account is not linked to an approved college student record.',
        });
      }
    }
  }

  if (!user) {
    return res.status(403).json({
      success: false,
      error: 'Account not found or not approved.',
    });
  }

  const token = signUserToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    rollNumber: user.rollNumber,
    employeeId: user.employeeId,
    department: user.department,
    is2FAVerified: true,
  });

  res.cookie('jpc_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000,
  });

  db.logAudit(user.id, user.name, user.role, 'GOOGLE_LOGIN', 'Authentication', `Logged in via Google OAuth (${user.email})`, req.ip);

  return res.json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

// Current user verification
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = data.users.find((u) => u.id === req.user?.userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User profile not found.' });
  }

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  if (req.user) {
    db.logAudit(req.user.userId, req.user.name, req.user.role, 'LOGOUT', 'Authentication', `User logged out`, req.ip);
  }
  res.clearCookie('jpc_auth_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Change Password
router.post('/change-password', requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Please provide both current and new passwords.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
  }

  const data = db.getRawData();
  const user = data.users.find((u) => u.id === req.user?.userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  data.securitySettings.lastPasswordChangedDate = new Date().toISOString();
  db.save();

  db.logAudit(user.id, user.name, user.role, 'PASSWORD_CHANGED', 'Security', `Password successfully changed.`, req.ip);

  return res.json({ success: true, message: 'Password updated successfully.' });
});

export default router;
