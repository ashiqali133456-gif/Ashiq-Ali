/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../src/types.js';
import { db } from './db.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  rollNumber?: string;
  employeeId?: string;
  department?: string;
  is2FAVerified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'jpc_secure_polytechnic_jwt_secret_1995';

export function signUserToken(payload: TokenPayload, expiresIn: string | number = '12h'): string {
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyUserToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.jpc_auth_token) {
    token = req.cookies.jpc_auth_token;
  }

  if (token) {
    const payload = verifyUserToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthenticated. Please log in to access this resource.',
    });
  }
  next();
}

export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthenticated. Please log in.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: You do not have permission to perform this action.',
      });
    }

    // Additional check for Super Admin if 2FA is required and not verified
    if (req.user.role === 'SUPER_ADMIN') {
      const data = db.getRawData();
      if (data.securitySettings.twoFactorRequiredForAdmin && !req.user.is2FAVerified) {
        return res.status(403).json({
          success: false,
          needs2FA: true,
          error: 'Two-Factor Authentication (2FA) verification is required.',
        });
      }
    }

    next();
  };
}

export function sanitizeUser(user: any) {
  const { passwordHash, twoFactorPin, ...safeUser } = user;
  return safeUser;
}
