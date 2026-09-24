/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../auth.js';
import { db } from '../db.js';

const router = Router();

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.error('Error creating uploads directory:', e);
}

router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN'));

// Secure Base64/Media Upload Validator & Saver
router.post('/media', (req: Request, res: Response) => {
  const { dataUrl, filename, mimeType, category } = req.body;

  if (!dataUrl) {
    return res.status(400).json({ success: false, error: 'Media payload (Data URL) is required.' });
  }

  // Validate MIME type
  const allowedMimeTypes: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip',
  };

  const detectedMime = mimeType || (dataUrl.startsWith('data:') ? dataUrl.split(';')[0].replace('data:', '') : 'image/jpeg');

  if (detectedMime && !allowedMimeTypes[detectedMime.toLowerCase()] && !filename?.match(/\.(jpg|jpeg|png|webp|svg|gif|pdf|doc|docx|xls|xlsx|txt|zip)$/i)) {
    return res.status(400).json({
      success: false,
      error: `Invalid file type "${detectedMime}". Allowed formats: JPG, PNG, WEBP, SVG, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP.`,
    });
  }

  // Check approximate payload size (max 15MB)
  const roughSizeBytes = (dataUrl.length * 3) / 4;
  if (roughSizeBytes > 15 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds the 15MB limit. Please optimize or compress the file.',
    });
  }

  let finalUrl = dataUrl;
  const ext = allowedMimeTypes[detectedMime.toLowerCase()] || '.jpg';
  const cleanName = (filename || 'file').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const diskFileName = `${Date.now()}_${cleanName}${cleanName.endsWith(ext) ? '' : ext}`;
  const diskFilePath = path.join(UPLOADS_DIR, diskFileName);

  try {
    if (dataUrl.includes(';base64,')) {
      const base64Data = dataUrl.split(';base64,').pop();
      if (base64Data) {
        fs.writeFileSync(diskFilePath, Buffer.from(base64Data, 'base64'));
        finalUrl = `/uploads/${diskFileName}`;
      }
    }
  } catch (writeErr) {
    console.warn('Could not write uploaded file to disk, falling back to dataUrl:', writeErr);
    finalUrl = dataUrl;
  }

  db.logAudit(
    req.user!.userId,
    req.user!.name,
    req.user!.role,
    'MEDIA_UPLOADED',
    'Media Storage',
    `Uploaded file: ${diskFileName} (${detectedMime}) for category: ${category || 'General'}`,
    req.ip
  );

  return res.json({
    success: true,
    url: finalUrl,
    filename: diskFileName,
    mimeType: detectedMime,
    size: Math.round(roughSizeBytes / 1024) + ' KB',
  });
});

export default router;
