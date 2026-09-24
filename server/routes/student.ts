/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['STUDENT', 'SUPER_ADMIN']));

// Student Profile (strictly scoped to authenticated student)
router.get('/profile', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = req.user!;

  const student = data.students.find(
    (s) =>
      (user.rollNumber && s.rollNumber.toUpperCase() === user.rollNumber.toUpperCase()) ||
      s.email.toLowerCase() === user.email.toLowerCase()
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student academic record not found. Please contact the registrar office.',
    });
  }

  // Calculate quick stats
  const studentResults = data.results.filter((r) => r.isPublished && r.rollNumber.toUpperCase() === student.rollNumber.toUpperCase());
  const studentAttendance = data.attendance.filter((a) => a.rollNumber.toUpperCase() === student.rollNumber.toUpperCase());

  const presentCount = studentAttendance.filter((a) => a.status === 'Present').length;
  const attendancePercentage = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 100;

  return res.json({
    success: true,
    student,
    summary: {
      totalExamsRecorded: studentResults.length,
      attendancePercentage,
      totalLectures: studentAttendance.length,
      presentLectures: presentCount,
    },
  });
});

// Student's Own Examination Results (Strictly ownership verified)
router.get('/results', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = req.user!;

  if (!user.rollNumber) {
    return res.status(400).json({ success: false, error: 'Student Roll Number is not linked to your account.' });
  }

  const myResults = data.results.filter(
    (r) => r.isPublished && r.rollNumber.toUpperCase() === user.rollNumber!.toUpperCase()
  );

  return res.json({
    success: true,
    results: myResults,
  });
});

// Student's Own Attendance Records (Strictly ownership verified)
router.get('/attendance', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = req.user!;

  if (!user.rollNumber) {
    return res.status(400).json({ success: false, error: 'Student Roll Number is not linked to your account.' });
  }

  const myAttendance = data.attendance.filter(
    (a) => a.rollNumber.toUpperCase() === user.rollNumber!.toUpperCase()
  );

  // Group subject-wise statistics
  const subjectStats: Record<string, { total: number; present: number; absent: number; leave: number }> = {};
  myAttendance.forEach((rec) => {
    if (!subjectStats[rec.subject]) {
      subjectStats[rec.subject] = { total: 0, present: 0, absent: 0, leave: 0 };
    }
    subjectStats[rec.subject].total += 1;
    if (rec.status === 'Present') subjectStats[rec.subject].present += 1;
    else if (rec.status === 'Absent') subjectStats[rec.subject].absent += 1;
    else if (rec.status === 'Leave') subjectStats[rec.subject].leave += 1;
  });

  return res.json({
    success: true,
    records: myAttendance,
    subjectSummary: Object.entries(subjectStats).map(([subject, stat]) => ({
      subject,
      total: stat.total,
      present: stat.present,
      absent: stat.absent,
      percentage: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 100,
    })),
  });
});

// Student Notices & Circulars
router.get('/notices', (req: Request, res: Response) => {
  const data = db.getRawData();
  const studentNotices = data.notices.filter(
    (n) => n.isPublished && (n.targetAudience === 'All' || n.targetAudience === 'Students')
  );

  return res.json({
    success: true,
    notices: studentNotices,
  });
});

// Student Documents & Challans
router.get('/documents', (req: Request, res: Response) => {
  const data = db.getRawData();
  const studentDocs = data.documents.filter(
    (d) => d.isPublic || d.targetRole === 'Student' || d.targetRole === 'All'
  );

  return res.json({
    success: true,
    documents: studentDocs,
  });
});

// Student Targeted Principal Messages
router.get('/principal-messages', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = req.user!;
  const student = data.students.find(
    (s) =>
      (user.rollNumber && s.rollNumber.toUpperCase() === user.rollNumber.toUpperCase()) ||
      s.email.toLowerCase() === user.email.toLowerCase()
  );

  const allMessages = db.getPrincipalMessages();
  const studentMessages = allMessages.filter((m) => {
    if (!m.isPublished || m.status !== 'PUBLISHED') return false;

    // Audience type checks
    if (m.audienceType === 'PUBLIC' || m.audienceType === 'ALL_STUDENTS' || m.audienceType === 'STUDENTS_AND_TEACHERS') {
      return true;
    }

    if (!student) return false;

    if (m.audienceType === 'DEPARTMENT') {
      return (
        !m.departmentName ||
        m.departmentName.toLowerCase() === student.department?.toLowerCase() ||
        m.departmentId === student.department
      );
    }

    if (m.audienceType === 'SEMESTER') {
      return !m.semester || String(m.semester) === String(student.currentSemester);
    }

    if (m.audienceType === 'SPECIFIC_STUDENT') {
      return (
        m.studentId === student.id ||
        m.studentId?.toUpperCase() === student.rollNumber.toUpperCase() ||
        m.studentName?.toLowerCase() === student.name.toLowerCase()
      );
    }

    return false;
  });

  return res.json({
    success: true,
    messages: studentMessages,
  });
});

export default router;
