/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { authMiddleware } from './server/auth.js';
import authRoutes from './server/routes/auth.js';
import publicRoutes from './server/routes/public.js';
import adminRoutes from './server/routes/admin.js';
import studentRoutes from './server/routes/student.js';
import teacherRoutes from './server/routes/teacher.js';
import uploadRoutes from './server/routes/upload.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic security and parsing middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(cookieParser());
  app.use(authMiddleware);

  // Static uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', college: 'Jina Polytechnic College Since 1995' });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/upload', uploadRoutes);

  // Catch-all for API routes so unmatched endpoints return JSON 404 instead of falling through to Vite/index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: `API route ${req.method} ${req.path} not found` });
  });

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JPC Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
