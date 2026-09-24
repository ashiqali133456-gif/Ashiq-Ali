/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { AttendanceRecord } from '../../src/types.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['TEACHER', 'SUPER_ADMIN']));

// Teacher Profile & Assigned Department
router.get('/profile', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = req.user!;

  const teacher = data.teachers.find(
    (t) =>
      t.email.toLowerCase() === user.email.toLowerCase() ||
      (user.employeeId && t.id.includes(user.employeeId))
  );

  const myDepartment = teacher ? teacher.department : user.department || 'Civil Engineering Technology';
  const deptStudents = data.students.filter((s) => s.department === myDepartment);

  return res.json({
    success: true,
    teacher: teacher || {
      name: user.name,
      department: myDepartment,
      designation: 'Faculty Member',
      subjects: ['General Engineering'],
    },
    assignedDepartment: myDepartment,
    studentCount: deptStudents.length,
  });
});

// Students in Assigned Department
router.get('/students', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = req.user!;
  const teacher = data.teachers.find((t) => t.email.toLowerCase() === user.email.toLowerCase());
  const dept = teacher?.department || user.department || 'Civil Engineering Technology';

  const students = data.students.filter((s) => s.department === dept || user.role === 'SUPER_ADMIN');
  return res.json({ success: true, students });
});

// Record Attendance (Teacher)
router.post('/attendance', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { date, department, technology, semester, subject, entries } = req.body;

  if (!date || !entries || !Array.isArray(entries)) {
    return res.status(400).json({ success: false, error: 'Date and student entries are required.' });
  }

  const newRecords: AttendanceRecord[] = entries.map((entry: any) => ({
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date,
    department: department || 'General',
    technology: technology || 'DAE',
    semester: semester || '1st Semester',
    subject: subject || 'Theory Lecture',
    teacherId: req.user!.userId,
    teacherName: req.user!.name,
    studentId: entry.studentId,
    rollNumber: entry.rollNumber,
    studentName: entry.studentName,
    status: entry.status || 'Present',
    remarks: entry.remarks,
  }));

  data.attendance.push(...newRecords);
  db.save();

  db.logAudit(
    req.user!.userId,
    req.user!.name,
    req.user!.role,
    'TEACHER_ATTENDANCE_RECORDED',
    'Attendance',
    `Teacher marked attendance for ${entries.length} students (${subject}) on ${date}`,
    req.ip
  );

  return res.json({ success: true, count: newRecords.length, records: newRecords });
});

// Department Notices
router.get('/notices', (req: Request, res: Response) => {
  const data = db.getRawData();
  const notices = data.notices.filter(
    (n) => n.isPublished && (n.targetAudience === 'All' || n.targetAudience === 'Teachers')
  );
  return res.json({ success: true, notices });
});

// Teacher Targeted Principal Messages
router.get('/principal-messages', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = req.user!;
  const teacher = data.teachers.find(
    (t) =>
      (user.employeeId && t.employeeId?.toUpperCase() === user.employeeId?.toUpperCase()) ||
      t.email.toLowerCase() === user.email.toLowerCase()
  );

  const allMessages = db.getPrincipalMessages();
  const teacherMessages = allMessages.filter((m) => {
    if (!m.isPublished || m.status !== 'PUBLISHED') return false;

    if (m.audienceType === 'PUBLIC' || m.audienceType === 'ALL_TEACHERS' || m.audienceType === 'STUDENTS_AND_TEACHERS') {
      return true;
    }

    if (!teacher) return false;

    if (m.audienceType === 'DEPARTMENT') {
      return (
        !m.departmentName ||
        m.departmentName.toLowerCase() === teacher.department?.toLowerCase() ||
        m.departmentId === teacher.department
      );
    }

    if (m.audienceType === 'SPECIFIC_TEACHER') {
      return (
        m.teacherId === teacher.id ||
        m.teacherId?.toUpperCase() === teacher.employeeId?.toUpperCase() ||
        m.teacherName?.toLowerCase() === teacher.name.toLowerCase()
      );
    }

    return false;
  });

  return res.json({ success: true, messages: teacherMessages });
});

export default router;
