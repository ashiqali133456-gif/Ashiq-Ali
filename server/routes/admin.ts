/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { requireAuth, requireRole, sanitizeUser } from '../auth.js';
import {
  CollegeSettings,
  PhoneNumber,
  EmailAddress,
  ContactInfo,
  Department,
  Course,
  Teacher,
  Student,
  ResultRecord,
  AttendanceRecord,
  CollegeEvent,
  GalleryAlbum,
  GalleryImage,
  VideoItem,
  Notice,
  DocumentItem,
  HeroBanner,
} from '../../src/types.js';

const router = Router();

// Enforce Super Admin on all admin routes
router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN'));

// Verify authenticated user identity against the single immutable Super Admin owner
router.use((req: Request, res: Response, next) => {
  if (!req.user || !db.verifyIsSuperAdmin(req.user.email, req.user.userId)) {
    db.logAudit(req.user?.userId || 'unknown', req.user?.name || 'Anonymous', 'VISITOR', 'ADMIN_ACCESS_DENIED', 'Security', `Access denied to admin endpoint: ${req.originalUrl}`, req.ip);
    return res.status(403).json({
      success: false,
      error: 'Access denied.',
    });
  }
  next();
});

// Admin Dashboard Summary Metrics
router.get('/dashboard-stats', (req: Request, res: Response) => {
  const data = db.getRawData();
  const stats = {
    totalStudents: data.students.length,
    totalFaculty: data.teachers.length,
    totalDepartments: data.departments.length,
    totalCourses: data.courses.length,
    totalResults: data.results.length,
    totalNotices: data.notices.length,
    totalEvents: data.events.length,
    totalAlbums: data.albums.length,
    totalGalleryImages: data.galleryImages.length,
    totalVideos: data.videos.length,
    totalInquiries: data.inquiries.length,
    unreadInquiries: data.inquiries.filter((i) => i.status === 'New' || (i.status as string) === 'Unread').length,
    totalAuditLogs: data.auditLogs.length,
    collegeSettings: data.settings,
    recentAuditLogs: data.auditLogs.slice(0, 10),
  };

  return res.json({ success: true, stats });
});

// ==================== 1. WEBSITE SETTINGS & BRANDING ====================
router.get('/settings', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({
    success: true,
    settings: data.settings,
    contactInfo: data.contactInfo,
    securitySettings: data.securitySettings,
  });
});

router.put('/settings', (req: Request, res: Response) => {
  const data = db.getRawData();
  const updatedSettings: Partial<CollegeSettings> = req.body;

  data.settings = { ...data.settings, ...updatedSettings };
  db.save();

  db.logAudit(
    req.user!.userId,
    req.user!.name,
    req.user!.role,
    'SETTINGS_UPDATED',
    'College Settings',
    'Super Admin updated college branding, logo, or public settings.',
    req.ip
  );

  return res.json({ success: true, settings: data.settings });
});

// ==================== 2. HERO BANNERS ====================
router.get('/banners', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, banners: data.heroBanners });
});

router.post('/banners', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { title, subtitle, imageUrl, ctaText, ctaLink, badge, active } = req.body;

  const newBanner: HeroBanner = {
    id: `ban-${Date.now()}`,
    title: title || 'New Banner Title',
    subtitle: subtitle || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    ctaText: ctaText || 'Learn More',
    ctaLink: ctaLink || '#',
    badge: badge || '',
    active: active !== undefined ? active : true,
    order: data.heroBanners.length + 1,
  };

  data.heroBanners.push(newBanner);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'BANNER_CREATED', 'Hero Banners', `Created banner: ${newBanner.title}`, req.ip);

  return res.json({ success: true, banner: newBanner });
});

router.put('/banners/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.heroBanners.findIndex((b) => b.id === id);

  if (index === -1) {
    const newBanner = { id, title: 'New Banner', subtitle: '', imageUrl: '', ctaText: 'Explore', ctaLink: '#', active: true, ...req.body, order: data.heroBanners.length + 1 };
    data.heroBanners.push(newBanner);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'BANNER_CREATED', 'Hero Banners', `Created banner: ${newBanner.title}`, req.ip);
    return res.json({ success: true, banner: newBanner });
  }

  data.heroBanners[index] = { ...data.heroBanners[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'BANNER_UPDATED', 'Hero Banners', `Updated banner ID: ${id}`, req.ip);

  return res.json({ success: true, banner: data.heroBanners[index] });
});

router.delete('/banners/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const banner = data.heroBanners.find((b) => b.id === id);
  data.heroBanners = data.heroBanners.filter((b) => b.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'BANNER_DELETED', 'Hero Banners', `Deleted banner: ${banner?.title || id}`, req.ip);

  return res.json({ success: true, message: 'Banner deleted successfully.' });
});

// ==================== 3. PHONE NUMBERS ====================
router.get('/phone-numbers', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, phoneNumbers: data.phoneNumbers });
});

router.post('/phone-numbers', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { title, number, type, isPrimary, isPublic, isWhatsApp } = req.body;

  if (!title || !number) {
    return res.status(400).json({ success: false, error: 'Title and number are required.' });
  }

  if (isPrimary) {
    data.phoneNumbers.forEach((p) => (p.isPrimary = false));
  }

  const newPhone: PhoneNumber = {
    id: `ph-${Date.now()}`,
    title,
    number,
    type: type || 'general',
    isPrimary: !!isPrimary,
    isPublic: isPublic !== undefined ? isPublic : true,
    isWhatsApp: !!isWhatsApp,
    displayOrder: data.phoneNumbers.length + 1,
  };

  data.phoneNumbers.push(newPhone);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'PHONE_ADDED', 'Phone Numbers', `Added phone: ${newPhone.title} (${newPhone.number})`, req.ip);

  return res.json({ success: true, phoneNumber: newPhone });
});

router.put('/phone-numbers/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.phoneNumbers.findIndex((p) => p.id === id);

  if (req.body.isPrimary) {
    data.phoneNumbers.forEach((p) => (p.isPrimary = false));
  }

  if (index === -1) {
    const newPhone: PhoneNumber = {
      id,
      title: req.body.title || 'Contact Phone',
      number: req.body.number || '',
      type: req.body.type || 'general',
      isPrimary: !!req.body.isPrimary,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      isWhatsApp: !!req.body.isWhatsApp,
      displayOrder: data.phoneNumbers.length + 1,
      ...req.body,
    };
    data.phoneNumbers.push(newPhone);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'PHONE_ADDED', 'Phone Numbers', `Added phone: ${newPhone.number}`, req.ip);
    return res.json({ success: true, phoneNumber: newPhone });
  }

  data.phoneNumbers[index] = { ...data.phoneNumbers[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'PHONE_UPDATED', 'Phone Numbers', `Updated phone: ${data.phoneNumbers[index].number}`, req.ip);

  return res.json({ success: true, phoneNumber: data.phoneNumbers[index] });
});

router.delete('/phone-numbers/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const phone = data.phoneNumbers.find((p) => p.id === id);
  data.phoneNumbers = data.phoneNumbers.filter((p) => p.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'PHONE_DELETED', 'Phone Numbers', `Deleted phone: ${phone?.number || id}`, req.ip);

  return res.json({ success: true, message: 'Phone number removed.' });
});

// ==================== 4. EMAIL ADDRESSES ====================
router.get(['/emails', '/email-addresses'], (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, emailAddresses: data.emailAddresses });
});

router.post(['/emails', '/email-addresses'], (req: Request, res: Response) => {
  const data = db.getRawData();
  const { title, email, department, isPrimary, isPublic } = req.body;

  if (!title || !email) {
    return res.status(400).json({ success: false, error: 'Title and email are required.' });
  }

  if (isPrimary) {
    data.emailAddresses.forEach((e) => (e.isPrimary = false));
  }

  const newEmail: EmailAddress = {
    id: `em-${Date.now()}`,
    title,
    email,
    department: department || 'General',
    isPrimary: !!isPrimary,
    isPublic: isPublic !== undefined ? isPublic : true,
    displayOrder: data.emailAddresses.length + 1,
  };

  data.emailAddresses.push(newEmail);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'EMAIL_ADDED', 'Email Management', `Added email: ${newEmail.email}`, req.ip);

  return res.json({ success: true, emailAddress: newEmail });
});

router.put(['/emails/:id', '/email-addresses/:id'], (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.emailAddresses.findIndex((e) => e.id === id);

  if (req.body.isPrimary) {
    data.emailAddresses.forEach((e) => (e.isPrimary = false));
  }

  if (index === -1) {
    const newEmail: EmailAddress = {
      id,
      title: req.body.title || 'Official Email',
      email: req.body.email || '',
      department: req.body.department || 'General',
      isPrimary: !!req.body.isPrimary,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      displayOrder: data.emailAddresses.length + 1,
      ...req.body,
    };
    data.emailAddresses.push(newEmail);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'EMAIL_ADDED', 'Email Management', `Added email: ${newEmail.email}`, req.ip);
    return res.json({ success: true, emailAddress: newEmail });
  }

  data.emailAddresses[index] = { ...data.emailAddresses[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'EMAIL_UPDATED', 'Email Management', `Updated email: ${data.emailAddresses[index].email}`, req.ip);

  return res.json({ success: true, emailAddress: data.emailAddresses[index] });
});

router.delete(['/emails/:id', '/email-addresses/:id'], (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const emailItem = data.emailAddresses.find((e) => e.id === id);
  data.emailAddresses = data.emailAddresses.filter((e) => e.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'EMAIL_DELETED', 'Email Management', `Deleted email: ${emailItem?.email || id}`, req.ip);

  return res.json({ success: true, message: 'Email address removed.' });
});

// ==================== 5. CONTACT & SOCIAL INFO ====================
router.put('/contact-info', (req: Request, res: Response) => {
  const data = db.getRawData();
  data.contactInfo = { ...data.contactInfo, ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'CONTACT_UPDATED', 'Contact & Socials', `Updated address and contact channels.`, req.ip);

  return res.json({ success: true, contactInfo: data.contactInfo });
});

// ==================== 6. DEPARTMENTS & COURSES ====================
router.get('/departments', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, departments: data.departments });
});

router.post('/departments', (req: Request, res: Response) => {
  const data = db.getRawData();
  const newDept: Department = {
    id: `dept-${Date.now()}`,
    code: req.body.code || 'ENG',
    name: req.body.name || 'New Technology Department',
    urduName: req.body.urduName || '',
    degreeType: req.body.degreeType || 'DAE',
    description: req.body.description || '',
    iconName: req.body.iconName || 'Building2',
    headOfDepartment: req.body.headOfDepartment || '',
    establishedYear: req.body.establishedYear || '2024',
    totalLabs: Number(req.body.totalLabs) || 2,
    duration: req.body.duration || '3 Years',
    image: req.body.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    featured: !!req.body.featured,
    totalSeats: Number(req.body.totalSeats) || 60,
    careerOpportunities: req.body.careerOpportunities || [],
    keySubjects: req.body.keySubjects || [],
  };

  data.departments.push(newDept);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DEPT_CREATED', 'Departments', `Created department: ${newDept.name}`, req.ip);

  return res.json({ success: true, department: newDept });
});

router.put('/departments/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.departments.findIndex((d) => d.id === id);

  if (index === -1) {
    const newDept: Department = {
      id,
      code: req.body.code || 'TECH',
      name: req.body.name || 'New Technology',
      urduName: req.body.urduName || '',
      degreeType: req.body.degreeType || 'DAE',
      duration: req.body.duration || '3 Years',
      establishedYear: req.body.establishedYear || '1995',
      headOfDepartment: req.body.headOfDepartment || '',
      description: req.body.description || '',
      image: req.body.image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      totalLabs: Number(req.body.totalLabs) || 3,
      totalSeats: Number(req.body.totalSeats) || 60,
      keySubjects: req.body.keySubjects || [],
      careerOpportunities: req.body.careerOpportunities || [],
      ...req.body,
    };
    data.departments.push(newDept);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DEPT_CREATED', 'Departments', `Created department: ${newDept.name}`, req.ip);
    return res.json({ success: true, department: newDept });
  }

  data.departments[index] = { ...data.departments[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DEPT_UPDATED', 'Departments', `Updated department: ${data.departments[index].name}`, req.ip);

  return res.json({ success: true, department: data.departments[index] });
});

router.delete('/departments/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const dept = data.departments.find((d) => d.id === id);
  data.departments = data.departments.filter((d) => d.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DEPT_DELETED', 'Departments', `Deleted department: ${dept?.name || id}`, req.ip);

  return res.json({ success: true, message: 'Department deleted.' });
});

// Courses CRUD
router.get('/courses', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, courses: data.courses });
});

router.post('/courses', (req: Request, res: Response) => {
  const data = db.getRawData();
  const newCourse: Course = {
    id: `crs-${Date.now()}`,
    departmentId: req.body.departmentId || 'dept-civ',
    departmentName: req.body.departmentName || 'Civil Engineering Technology',
    title: req.body.title || 'New Course',
    code: req.body.code || 'DAE-100',
    degreeType: req.body.degreeType || 'DAE',
    durationYears: req.body.durationYears || '3 Years',
    semestersCount: Number(req.body.semestersCount) || 6,
    eligibility: req.body.eligibility || 'Matric Science',
    description: req.body.description || '',
    feePerSemester: req.body.feePerSemester || 'Rs. 18,500',
    admissionOpen: req.body.admissionOpen !== undefined ? req.body.admissionOpen : true,
    syllabus: req.body.syllabus || [],
    practicalLabs: req.body.practicalLabs || [],
  };

  data.courses.push(newCourse);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'COURSE_CREATED', 'Courses', `Created course: ${newCourse.title}`, req.ip);

  return res.json({ success: true, course: newCourse });
});

router.put('/courses/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.courses.findIndex((c) => c.id === id);

  if (index === -1) {
    const newCourse = { id, ...req.body };
    data.courses.push(newCourse);
    db.save();
    return res.json({ success: true, course: newCourse });
  }

  data.courses[index] = { ...data.courses[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'COURSE_UPDATED', 'Courses', `Updated course: ${data.courses[index].title}`, req.ip);

  return res.json({ success: true, course: data.courses[index] });
});

router.delete('/courses/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const crs = data.courses.find((c) => c.id === id);
  data.courses = data.courses.filter((c) => c.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'COURSE_DELETED', 'Courses', `Deleted course: ${crs?.title || id}`, req.ip);

  return res.json({ success: true, message: 'Course deleted.' });
});

// ==================== 7. FACULTY / TEACHERS ====================
router.get('/teachers', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, teachers: data.teachers });
});

router.post('/teachers', (req: Request, res: Response) => {
  const data = db.getRawData();
  const newTeacher: Teacher = {
    id: `tea-${Date.now()}`,
    name: req.body.name,
    designation: req.body.designation || 'Lecturer / Instructor',
    department: req.body.department || 'Civil Engineering Technology',
    qualification: req.body.qualification || 'B.Sc. Engineering',
    experience: req.body.experience || '5 Years',
    photoUrl: req.body.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    subjects: req.body.subjects || [],
    isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
    status: req.body.status || 'Active',
    email: req.body.email || `teacher.${Date.now()}@jinnahpolytechnic.edu.pk`,
    phone: req.body.phone || '',
    joinedYear: req.body.joinedYear || '2024',
    bio: req.body.bio || '',
  };

  data.teachers.push(newTeacher);

  // If create user account requested
  if (req.body.createLogin && req.body.loginPassword) {
    const salt = bcrypt.genSaltSync(10);
    data.users.push({
      id: `usr-tea-${newTeacher.id}`,
      email: newTeacher.email,
      name: newTeacher.name,
      role: 'TEACHER',
      employeeId: `EMP-${Date.now().toString().slice(-4)}`,
      department: newTeacher.department,
      status: 'Active',
      createdAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(req.body.loginPassword, salt),
    });
  }

  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'TEACHER_ADDED', 'Faculty', `Added faculty member: ${newTeacher.name}`, req.ip);

  return res.json({ success: true, teacher: newTeacher });
});

router.put('/teachers/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.teachers.findIndex((t) => t.id === id);

  if (index === -1) {
    const newTeacher: Teacher = {
      id,
      employeeId: req.body.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      name: req.body.name || 'New Faculty Member',
      urduName: req.body.urduName || '',
      designation: req.body.designation || 'Lecturer / Instructor',
      department: req.body.department || 'Civil Engineering Technology',
      qualification: req.body.qualification || 'B.Sc. / B.Tech Engineering',
      pecOrNtcNumber: req.body.pecOrNtcNumber || '',
      experience: req.body.experience || '3+ Years',
      email: req.body.email || '',
      phone: req.body.phone || '',
      photoUrl: req.body.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      subjects: req.body.subjects || [],
      joiningYear: req.body.joiningYear || '2024',
      status: req.body.status || 'Active',
      ...req.body,
    };
    data.teachers.push(newTeacher);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'TEACHER_ADDED', 'Faculty', `Added faculty: ${newTeacher.name}`, req.ip);
    return res.json({ success: true, teacher: newTeacher });
  }

  data.teachers[index] = { ...data.teachers[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'TEACHER_UPDATED', 'Faculty', `Updated faculty: ${data.teachers[index].name}`, req.ip);

  return res.json({ success: true, teacher: data.teachers[index] });
});

router.delete('/teachers/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const teacher = data.teachers.find((t) => t.id === id);
  data.teachers = data.teachers.filter((t) => t.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'TEACHER_DELETED', 'Faculty', `Deleted faculty: ${teacher?.name || id}`, req.ip);

  return res.json({ success: true, message: 'Faculty member deleted.' });
});

// ==================== 8. STUDENTS ====================
router.get('/students', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, students: data.students });
});

router.post('/students', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { rollNumber, registrationNumber, name, fatherName, cnic, email, phone, department, technology, currentSemester, session, photoUrl, status } = req.body;

  if (!rollNumber || !name) {
    return res.status(400).json({ success: false, error: 'Roll number and student name are required.' });
  }

  const newStudent: Student = {
    id: `stu-${Date.now()}`,
    rollNumber: String(rollNumber).trim().toUpperCase(),
    registrationNumber: registrationNumber || `PBTE-${Date.now().toString().slice(-5)}`,
    name,
    fatherName: fatherName || '',
    cnic: cnic || '',
    email: email || `student.${rollNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@jpc.edu.pk`,
    phone: phone || '',
    department: department || 'Civil Engineering Technology',
    technology: technology || 'DAE Civil Technology',
    currentSemester: currentSemester || '1st Semester',
    session: session || '2024-2027',
    admissionDate: new Date().toISOString().split('T')[0],
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    status: status || 'Active',
  };

  data.students.push(newStudent);

  // If student login password provided
  if (req.body.loginPassword) {
    const salt = bcrypt.genSaltSync(10);
    data.users.push({
      id: `usr-stu-${newStudent.id}`,
      email: newStudent.email,
      name: newStudent.name,
      role: 'STUDENT',
      rollNumber: newStudent.rollNumber,
      department: newStudent.department,
      status: 'Active',
      createdAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(req.body.loginPassword, salt),
    });
  }

  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'STUDENT_ENROLLED', 'Students', `Enrolled student ${newStudent.name} (${newStudent.rollNumber})`, req.ip);

  return res.json({ success: true, student: newStudent });
});

router.put('/students/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.students.findIndex((s) => s.id === id);

  if (index === -1) {
    const newStudent: Student = {
      id,
      rollNumber: String(req.body.rollNumber || `JPC-${Date.now().toString().slice(-4)}`).trim().toUpperCase(),
      registrationNumber: req.body.registrationNumber || `PBTE-${Date.now().toString().slice(-5)}`,
      name: req.body.name || 'New Student',
      fatherName: req.body.fatherName || '',
      cnic: req.body.cnic || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      department: req.body.department || 'Civil Engineering Technology',
      technology: req.body.technology || 'DAE Civil Technology',
      currentSemester: req.body.currentSemester || '1st Semester',
      session: req.body.session || '2024-2027',
      admissionDate: req.body.admissionDate || new Date().toISOString().split('T')[0],
      photoUrl: req.body.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      status: req.body.status || 'Active',
      ...req.body,
    };
    data.students.push(newStudent);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'STUDENT_ENROLLED', 'Students', `Enrolled student ${newStudent.name} (${newStudent.rollNumber})`, req.ip);
    return res.json({ success: true, student: newStudent });
  }

  data.students[index] = { ...data.students[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'STUDENT_UPDATED', 'Students', `Updated student ${data.students[index].rollNumber}`, req.ip);

  return res.json({ success: true, student: data.students[index] });
});

router.delete('/students/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const stu = data.students.find((s) => s.id === id);
  data.students = data.students.filter((s) => s.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'STUDENT_DELETED', 'Students', `Deleted student: ${stu?.rollNumber || id}`, req.ip);

  return res.json({ success: true, message: 'Student record deleted.' });
});

// ==================== 9. RESULTS MANAGEMENT ====================
router.get('/results', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, results: data.results });
});

router.post('/results', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { rollNumber, registrationNumber, studentName, fatherName, examination, academicYear, semester, department, technology, subjects, remarks, isPublished } = req.body;

  if (!rollNumber || !examination || !subjects || !subjects.length) {
    return res.status(400).json({ success: false, error: 'Roll number, examination title, and subjects array are required.' });
  }

  // Calculate totals
  let totalMarks = 0;
  let obtainedMarks = 0;
  let hasSupply = false;

  const calculatedSubjects = subjects.map((sub: any) => {
    const subTotal = Number(sub.totalMarks) || 100;
    const subObt = Number(sub.obtainedMarks) || 0;
    const pct = (subObt / subTotal) * 100;
    let grade = 'F';
    let status: 'Pass' | 'Supply' = 'Pass';

    if (pct >= 85) grade = 'A+';
    else if (pct >= 75) grade = 'A';
    else if (pct >= 65) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 40) grade = 'D';
    else {
      grade = 'F';
      status = 'Supply';
      hasSupply = true;
    }

    totalMarks += subTotal;
    obtainedMarks += subObt;

    return {
      subjectCode: sub.subjectCode || 'SUB-101',
      subjectName: sub.subjectName || 'Subject Title',
      totalMarks: subTotal,
      obtainedMarks: subObt,
      grade,
      status,
    };
  });

  const percentage = Number(((obtainedMarks / (totalMarks || 1)) * 100).toFixed(2));
  let overallGrade = 'A+';
  let gpa = '4.00';
  let resultStatus: 'Passed' | 'Supplementary' | 'Failed' = hasSupply ? 'Supplementary' : 'Passed';

  if (percentage >= 85) {
    overallGrade = 'A+ (Distinction)';
    gpa = '3.90';
  } else if (percentage >= 75) {
    overallGrade = 'A (1st Div)';
    gpa = '3.60';
  } else if (percentage >= 65) {
    overallGrade = 'B (1st Div)';
    gpa = '3.00';
  } else if (percentage >= 50) {
    overallGrade = 'C (2nd Div)';
    gpa = '2.50';
  } else if (percentage >= 40) {
    overallGrade = 'D (Pass)';
    gpa = '2.00';
  } else {
    overallGrade = 'F (Fail)';
    gpa = '0.00';
    resultStatus = 'Failed';
  }

  const newResult: ResultRecord = {
    id: `res-${Date.now()}`,
    studentId: req.body.studentId || `stu-${Date.now()}`,
    rollNumber: String(rollNumber).trim().toUpperCase(),
    registrationNumber: registrationNumber || 'PBTE-REG',
    studentName: studentName || 'Student Name',
    fatherName: fatherName || '',
    examination,
    academicYear: academicYear || '2024-2025',
    semester: semester || '1st Semester',
    department: department || 'Civil Engineering Technology',
    technology: technology || 'DAE Civil Technology',
    subjects: calculatedSubjects,
    totalMarks,
    obtainedMarks,
    percentage,
    gpa,
    overallGrade,
    resultStatus,
    issueDate: req.body.issueDate || new Date().toISOString().split('T')[0],
    isPublished: isPublished !== undefined ? isPublished : true,
    remarks: remarks || (resultStatus === 'Passed' ? 'Cleared all examination subjects.' : 'Supplementary examination required.'),
  };

  data.results.push(newResult);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'RESULT_CREATED', 'Results', `Created result for ${newResult.rollNumber} - ${newResult.examination}`, req.ip);

  return res.json({ success: true, result: newResult });
});

router.put('/results/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.results.findIndex((r) => r.id === id);

  if (index === -1) {
    const newResult: ResultRecord = {
      id,
      rollNumber: String(req.body.rollNumber || '').trim().toUpperCase(),
      registrationNumber: req.body.registrationNumber || '',
      studentName: req.body.studentName || '',
      fatherName: req.body.fatherName || '',
      technology: req.body.technology || 'DAE Civil Technology',
      examination: req.body.examination || 'Annual 2024',
      year: req.body.year || '2024',
      semester: req.body.semester || '1st Year',
      totalMarks: Number(req.body.totalMarks) || 1050,
      obtainedMarks: Number(req.body.obtainedMarks) || 850,
      percentage: Number(req.body.percentage) || 80.9,
      grade: req.body.grade || 'A',
      status: req.body.status || 'PASS',
      issueDate: req.body.issueDate || new Date().toISOString().split('T')[0],
      isPubliclySearchable: req.body.isPubliclySearchable !== undefined ? req.body.isPubliclySearchable : true,
      subjects: req.body.subjects || [],
      ...req.body,
    };
    data.results.push(newResult);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'RESULT_ADDED', 'Results', `Added result for ${newResult.rollNumber}`, req.ip);
    return res.json({ success: true, result: newResult });
  }

  data.results[index] = { ...data.results[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'RESULT_UPDATED', 'Results', `Updated result ID: ${id} (${data.results[index].rollNumber})`, req.ip);

  return res.json({ success: true, result: data.results[index] });
});

router.delete('/results/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const resRecord = data.results.find((r) => r.id === id);
  data.results = data.results.filter((r) => r.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'RESULT_DELETED', 'Results', `Deleted result for ${resRecord?.rollNumber || id}`, req.ip);

  return res.json({ success: true, message: 'Result record deleted.' });
});

// ==================== 10. ATTENDANCE MANAGEMENT ====================
router.get('/attendance', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { department, semester, subject, date } = req.query;

  let records = data.attendance;
  if (department) records = records.filter((r) => r.department === department);
  if (semester) records = records.filter((r) => r.semester === semester);
  if (subject) records = records.filter((r) => r.subject === subject);
  if (date) records = records.filter((r) => r.date === date);

  return res.json({ success: true, attendance: records });
});

router.post('/attendance/bulk', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { date, department, technology, semester, subject, teacherName, entries } = req.body;

  if (!date || !entries || !Array.isArray(entries)) {
    return res.status(400).json({ success: false, error: 'Date and student entries are required.' });
  }

  const newRecords: AttendanceRecord[] = entries.map((entry: any) => ({
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date,
    department: department || 'General',
    technology: technology || 'DAE',
    semester: semester || '1st Semester',
    subject: subject || 'General Subject',
    teacherId: req.user!.userId,
    teacherName: teacherName || req.user!.name,
    studentId: entry.studentId,
    rollNumber: entry.rollNumber,
    studentName: entry.studentName,
    status: entry.status || 'Present',
    remarks: entry.remarks,
  }));

  data.attendance.push(...newRecords);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'ATTENDANCE_RECORDED', 'Attendance', `Recorded attendance for ${entries.length} students on ${date} (${subject})`, req.ip);

  return res.json({ success: true, count: newRecords.length, records: newRecords });
});

router.delete('/attendance/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  data.attendance = data.attendance.filter((a) => a.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'ATTENDANCE_DELETED', 'Attendance', `Deleted attendance record ID: ${id}`, req.ip);

  return res.json({ success: true, message: 'Attendance record removed.' });
});

// ==================== 11. EVENTS ====================
router.get('/events', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, events: data.events });
});

router.post('/events', (req: Request, res: Response) => {
  const data = db.getRawData();
  const newEvent: CollegeEvent = {
    id: `evt-${Date.now()}`,
    title: req.body.title || 'New Event',
    category: req.body.category || 'Academic',
    date: req.body.date || new Date().toISOString().split('T')[0],
    time: req.body.time || '10:00 AM',
    location: req.body.location || 'College Campus',
    posterUrl: req.body.posterUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    photos: req.body.photos || [],
    videoUrl: req.body.videoUrl,
    description: req.body.description || '',
    isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
    targetAudience: req.body.targetAudience || 'All',
    featured: !!req.body.featured,
  };

  data.events.push(newEvent);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'EVENT_CREATED', 'Events', `Created event: ${newEvent.title}`, req.ip);

  return res.json({ success: true, event: newEvent });
});

router.put('/events/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.events.findIndex((e) => e.id === id);

  if (index === -1) {
    const newEvent: CollegeEvent = {
      id,
      title: req.body.title || 'New Event',
      category: req.body.category || 'Workshop',
      date: req.body.date || new Date().toISOString().split('T')[0],
      time: req.body.time || '10:00 AM',
      venue: req.body.venue || 'College Auditorium',
      description: req.body.description || '',
      bannerUrl: req.body.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      ...req.body,
    };
    data.events.push(newEvent);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'EVENT_CREATED', 'Events', `Created event: ${newEvent.title}`, req.ip);
    return res.json({ success: true, event: newEvent });
  }

  data.events[index] = { ...data.events[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'EVENT_UPDATED', 'Events', `Updated event: ${data.events[index].title}`, req.ip);

  return res.json({ success: true, event: data.events[index] });
});

router.delete('/events/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const evt = data.events.find((e) => e.id === id);
  data.events = data.events.filter((e) => e.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'EVENT_DELETED', 'Events', `Deleted event: ${evt?.title || id}`, req.ip);

  return res.json({ success: true, message: 'Event deleted.' });
});

// ==================== 12. GALLERY & ALBUMS ====================
router.get('/albums', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, albums: data.albums, images: data.galleryImages });
});

router.post('/albums', (req: Request, res: Response) => {
  const data = db.getRawData();
  const newAlbum: GalleryAlbum = {
    id: `alb-${Date.now()}`,
    name: req.body.name || 'New Album',
    category: req.body.category || 'Campus',
    coverImageUrl: req.body.coverImageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    description: req.body.description || '',
    date: req.body.date || new Date().toISOString().split('T')[0],
    isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
    imagesCount: 0,
  };

  data.albums.push(newAlbum);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'ALBUM_CREATED', 'Gallery', `Created gallery album: ${newAlbum.name}`, req.ip);

  return res.json({ success: true, album: newAlbum });
});

router.put('/albums/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.albums.findIndex((a) => a.id === id);

  if (index === -1) {
    const newAlb: GalleryAlbum = {
      id,
      name: req.body.name || 'New Album',
      coverImage: req.body.coverImage || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      description: req.body.description || '',
      year: req.body.year || '2024',
      ...req.body,
    };
    data.albums.push(newAlb);
    db.save();
    return res.json({ success: true, album: newAlb });
  }

  data.albums[index] = { ...data.albums[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'ALBUM_UPDATED', 'Gallery', `Updated album: ${data.albums[index].name}`, req.ip);

  return res.json({ success: true, album: data.albums[index] });
});

router.delete('/albums/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const alb = data.albums.find((a) => a.id === id);
  data.albums = data.albums.filter((a) => a.id !== id);
  data.galleryImages = data.galleryImages.filter((img) => img.albumId !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'ALBUM_DELETED', 'Gallery', `Deleted album: ${alb?.name || id}`, req.ip);

  return res.json({ success: true, message: 'Album deleted.' });
});

// Gallery Images
router.post('/gallery-images', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id, albumId, title, caption, altText, imageUrl, isPublished } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ success: false, error: 'Image URL is required.' });
  }

  const resolvedAlbumId = albumId || data.albums[0]?.id || 'alb-1';
  const album = data.albums.find((a) => a.id === resolvedAlbumId);

  // If ID exists and matches an image, update it
  if (id) {
    const existingIndex = data.galleryImages.findIndex((img) => img.id === id);
    if (existingIndex !== -1) {
      data.galleryImages[existingIndex] = {
        ...data.galleryImages[existingIndex],
        ...req.body,
        albumId: resolvedAlbumId,
        albumName: album?.name || data.galleryImages[existingIndex].albumName || 'General',
      };
      if (album) {
        album.imagesCount = data.galleryImages.filter((i) => i.albumId === resolvedAlbumId).length;
      }
      db.save();
      db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'IMAGE_UPDATED', 'Gallery', `Updated image ID: ${id}`, req.ip);
      return res.json({ success: true, image: data.galleryImages[existingIndex] });
    }
  }

  const newImage: GalleryImage = {
    id: id || `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    albumId: resolvedAlbumId,
    albumName: album?.name || 'General',
    title: title || 'Campus Photograph',
    caption: caption || '',
    altText: altText || 'JPC Campus Photo',
    imageUrl,
    date: req.body.date || new Date().toISOString().split('T')[0],
    isPublished: isPublished !== undefined ? isPublished : true,
    displayOrder: data.galleryImages.length + 1,
    ...req.body,
  };

  data.galleryImages.push(newImage);
  if (album) {
    album.imagesCount = data.galleryImages.filter((i) => i.albumId === resolvedAlbumId).length;
  }
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'IMAGE_UPLOADED', 'Gallery', `Added image to album: ${album?.name || 'General'}`, req.ip);

  return res.json({ success: true, image: newImage });
});

router.put('/gallery-images/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.galleryImages.findIndex((i) => i.id === id);
  const resolvedAlbumId = req.body.albumId || data.albums[0]?.id || 'alb-1';
  const album = data.albums.find((a) => a.id === resolvedAlbumId);

  if (index === -1) {
    const newImage: GalleryImage = {
      id,
      albumId: resolvedAlbumId,
      albumName: album?.name || 'General',
      title: req.body.title || 'Campus Photograph',
      caption: req.body.caption || '',
      altText: req.body.altText || 'JPC Campus Photo',
      imageUrl: req.body.imageUrl || '',
      date: req.body.date || new Date().toISOString().split('T')[0],
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
      displayOrder: data.galleryImages.length + 1,
      ...req.body,
    };
    data.galleryImages.push(newImage);
    if (album) {
      album.imagesCount = data.galleryImages.filter((i) => i.albumId === resolvedAlbumId).length;
    }
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'IMAGE_ADDED', 'Gallery', `Added image: ${newImage.title}`, req.ip);
    return res.json({ success: true, image: newImage });
  }

  data.galleryImages[index] = {
    ...data.galleryImages[index],
    ...req.body,
    albumId: resolvedAlbumId,
    albumName: album?.name || data.galleryImages[index].albumName || 'General',
  };
  if (album) {
    album.imagesCount = data.galleryImages.filter((i) => i.albumId === resolvedAlbumId).length;
  }
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'IMAGE_UPDATED', 'Gallery', `Updated image ID: ${id}`, req.ip);
  return res.json({ success: true, image: data.galleryImages[index] });
});

router.delete('/gallery-images/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const img = data.galleryImages.find((i) => i.id === id);
  data.galleryImages = data.galleryImages.filter((i) => i.id !== id);

  if (img) {
    const album = data.albums.find((a) => a.id === img.albumId);
    if (album) {
      album.imagesCount = data.galleryImages.filter((i) => i.albumId === img.albumId).length;
    }
  }
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'IMAGE_DELETED', 'Gallery', `Deleted gallery image ID: ${id}`, req.ip);

  return res.json({ success: true, message: 'Image deleted.' });
});

// ==================== 13. VIDEOS ====================
router.get('/videos', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, videos: data.videos });
});

router.post('/videos', (req: Request, res: Response) => {
  const data = db.getRawData();
  const newVideo: VideoItem = {
    id: `vid-${Date.now()}`,
    title: req.body.title || 'College Video Demonstration',
    category: req.body.category || 'Campus Tour',
    videoUrl: req.body.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: req.body.thumbnailUrl || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    description: req.body.description || '',
    duration: req.body.duration || '5:00',
    eventId: req.body.eventId,
    isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
    uploadDate: new Date().toISOString().split('T')[0],
  };

  data.videos.push(newVideo);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'VIDEO_ADDED', 'Videos', `Added video: ${newVideo.title}`, req.ip);

  return res.json({ success: true, video: newVideo });
});

router.put('/videos/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.videos.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Video not found.' });
  }

  data.videos[index] = { ...data.videos[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'VIDEO_UPDATED', 'Videos', `Updated video: ${data.videos[index].title}`, req.ip);

  return res.json({ success: true, video: data.videos[index] });
});

router.delete('/videos/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const vid = data.videos.find((v) => v.id === id);
  data.videos = data.videos.filter((v) => v.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'VIDEO_DELETED', 'Videos', `Deleted video: ${vid?.title || id}`, req.ip);

  return res.json({ success: true, message: 'Video deleted.' });
});

// ==================== 14. NOTICES & CIRCULARS ====================
router.get('/notices', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, notices: data.notices });
});

router.post('/notices', (req: Request, res: Response) => {
  const data = db.getRawData();
  const newNotice: Notice = {
    id: `not-${Date.now()}`,
    title: req.body.title || 'Official Notice',
    category: req.body.category || 'General',
    content: req.body.content || '',
    date: req.body.date || new Date().toISOString().split('T')[0],
    expiryDate: req.body.expiryDate,
    priority: req.body.priority || 'Normal',
    targetAudience: req.body.targetAudience || 'All',
    fileAttachmentUrl: req.body.fileAttachmentUrl,
    fileName: req.body.fileName,
    isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
  };

  data.notices.unshift(newNotice);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'NOTICE_PUBLISHED', 'Notices', `Published notice: ${newNotice.title}`, req.ip);

  return res.json({ success: true, notice: newNotice });
});

router.put('/notices/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.notices.findIndex((n) => n.id === id);

  if (index === -1) {
    const newNotice: Notice = {
      id,
      title: req.body.title || 'Official Notice',
      category: req.body.category || 'General',
      content: req.body.content || '',
      date: req.body.date || new Date().toISOString().split('T')[0],
      expiryDate: req.body.expiryDate,
      priority: req.body.priority || 'Normal',
      targetAudience: req.body.targetAudience || 'All',
      fileAttachmentUrl: req.body.fileAttachmentUrl,
      fileName: req.body.fileName,
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
      ...req.body,
    };
    data.notices.unshift(newNotice);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'NOTICE_PUBLISHED', 'Notices', `Published notice: ${newNotice.title}`, req.ip);
    return res.json({ success: true, notice: newNotice });
  }

  data.notices[index] = { ...data.notices[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'NOTICE_UPDATED', 'Notices', `Updated notice: ${data.notices[index].title}`, req.ip);

  return res.json({ success: true, notice: data.notices[index] });
});

router.delete('/notices/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const not = data.notices.find((n) => n.id === id);
  data.notices = data.notices.filter((n) => n.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'NOTICE_DELETED', 'Notices', `Deleted notice: ${not?.title || id}`, req.ip);

  return res.json({ success: true, message: 'Notice deleted.' });
});

// ==================== 15. DOCUMENTS & DOWNLOADS ====================
router.get('/documents', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, documents: data.documents });
});

router.post('/documents', (req: Request, res: Response) => {
  const data = db.getRawData();
  const newDoc: DocumentItem = {
    id: `doc-${Date.now()}`,
    title: req.body.title || 'Downloadable Document',
    category: req.body.category || 'Admission',
    description: req.body.description || '',
    fileUrl: req.body.fileUrl || '#download',
    fileSize: req.body.fileSize || '1.5 MB',
    uploadDate: new Date().toISOString().split('T')[0],
    isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
    targetRole: req.body.targetRole || 'All',
  };

  data.documents.push(newDoc);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DOC_UPLOADED', 'Documents', `Uploaded document: ${newDoc.title}`, req.ip);

  return res.json({ success: true, document: newDoc });
});

router.put('/documents/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const index = data.documents.findIndex((d) => d.id === id);

  if (index === -1) {
    const newDoc: DocumentItem = {
      id,
      title: req.body.title || 'Official Document',
      category: req.body.category || 'Forms',
      description: req.body.description || '',
      fileUrl: req.body.fileUrl || '',
      fileSize: req.body.fileSize || '1.2 MB',
      uploadDate: req.body.uploadDate || new Date().toISOString().split('T')[0],
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      targetRole: req.body.targetRole || 'All',
      ...req.body,
    };
    data.documents.push(newDoc);
    db.save();
    db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DOC_UPLOADED', 'Documents', `Uploaded document: ${newDoc.title}`, req.ip);
    return res.json({ success: true, document: newDoc });
  }

  data.documents[index] = { ...data.documents[index], ...req.body };
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DOC_UPDATED', 'Documents', `Updated document: ${data.documents[index].title}`, req.ip);

  return res.json({ success: true, document: data.documents[index] });
});

router.delete('/documents/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const doc = data.documents.find((d) => d.id === id);
  data.documents = data.documents.filter((d) => d.id !== id);
  db.save();

  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'DOC_DELETED', 'Documents', `Deleted document: ${doc?.title || id}`, req.ip);

  return res.json({ success: true, message: 'Document deleted.' });
});

// ==================== 16. USER MANAGEMENT ====================
router.get('/users', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({
    success: true,
    users: data.users.map(sanitizeUser),
  });
});

router.post('/users', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { email, name, role, password, rollNumber, employeeId, department } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, error: 'Email, password, and role are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const existing = data.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, error: 'A user with this email address already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newUser = {
    id: `usr-${Date.now()}`,
    email: cleanEmail,
    name: name || 'User',
    role,
    rollNumber,
    employeeId,
    department,
    status: 'Active' as const,
    createdAt: new Date().toISOString(),
    passwordHash: bcrypt.hashSync(password, salt),
  };

  data.users.push(newUser);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'USER_CREATED', 'User Management', `Created user account for ${newUser.email} (${newUser.role})`, req.ip);

  return res.json({ success: true, user: sanitizeUser(newUser) });
});

router.put('/users/:id/status', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const user = data.users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  if (user.role === 'SUPER_ADMIN' && req.body.status !== 'Active') {
    return res.status(400).json({ success: false, error: 'Cannot deactivate the primary Super Admin account.' });
  }

  user.status = req.body.status;
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'USER_STATUS_CHANGED', 'User Management', `Changed status for ${user.email} to ${user.status}`, req.ip);

  return res.json({ success: true, user: sanitizeUser(user) });
});

router.delete('/users/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const user = data.users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  if (user.role === 'SUPER_ADMIN') {
    return res.status(400).json({ success: false, error: 'The Super Administrator account cannot be deleted.' });
  }

  data.users = data.users.filter((u) => u.id !== id);
  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'USER_DELETED', 'User Management', `Deleted user account ${user.email}`, req.ip);

  return res.json({ success: true, message: 'User deleted.' });
});

// ==================== 17. AUDIT LOGS ====================
router.get('/audit-logs', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { category, search } = req.query;

  let logs = data.auditLogs;
  if (category && category !== 'All') {
    logs = logs.filter((l) => l.category === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter((l) =>
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      (l.actorName || l.userName || '').toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, logs });
});

// ==================== 18. INQUIRIES ====================
router.get('/inquiries', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({ success: true, inquiries: data.inquiries });
});

router.put('/inquiries/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  const inq = data.inquiries.find((i) => i.id === id);

  if (!inq) {
    return res.status(404).json({ success: false, error: 'Inquiry not found.' });
  }

  inq.status = req.body.status || 'Read';
  db.save();

  return res.json({ success: true, inquiry: inq });
});

router.delete('/inquiries/:id', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { id } = req.params;
  data.inquiries = data.inquiries.filter((i) => i.id !== id);
  db.save();

  return res.json({ success: true, message: 'Inquiry deleted.' });
});

// ==================== 19. SECURITY SETTINGS & 2FA PIN ====================
router.put('/security-settings', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { twoFactorRequiredForAdmin, adminTwoFactorPin, sessionTimeoutMinutes } = req.body;

  if (twoFactorRequiredForAdmin !== undefined) {
    data.securitySettings.twoFactorRequiredForAdmin = !!twoFactorRequiredForAdmin;
  }
  if (sessionTimeoutMinutes) {
    data.securitySettings.sessionTimeoutMinutes = Number(sessionTimeoutMinutes);
  }

  if (adminTwoFactorPin) {
    const superAdmin = data.users.find((u) => u.role === 'SUPER_ADMIN');
    if (superAdmin) {
      superAdmin.twoFactorPin = String(adminTwoFactorPin).trim();
      data.securitySettings.adminTwoFactorPinSet = true;
    }
  }

  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'SECURITY_SETTINGS_CHANGED', 'Security', `Updated 2FA configuration or admin security policy.`, req.ip);

  return res.json({ success: true, securitySettings: data.securitySettings });
});

// ==================== 20. SYSTEM BACKUP & RESTORE ====================
router.get('/backup/export', (req: Request, res: Response) => {
  const rawData = db.getRawData();
  // Strip raw password hashes from export if desired or provide secure dump
  const safeDump = {
    exportDate: new Date().toISOString(),
    system: 'Jinnah Polytechnic Institute Administration System',
    version: '1.0.0',
    data: {
      ...rawData,
      users: rawData.users.map((u) => sanitizeUser(u)),
    },
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="JPC_Backup_${new Date().toISOString().split('T')[0]}.json"`);
  return res.send(JSON.stringify(safeDump, null, 2));
});

router.post('/backup/restore', (req: Request, res: Response) => {
  const { backupData } = req.body;

  if (!backupData || !backupData.data) {
    return res.status(400).json({ success: false, error: 'Invalid backup JSON file payload.' });
  }

  const currentData = db.getRawData();
  const restored = backupData.data;

  // Preserve Super Admin password if not in dump
  const adminUser = currentData.users.find((u) => u.role === 'SUPER_ADMIN');

  currentData.settings = restored.settings || currentData.settings;
  currentData.heroBanners = restored.heroBanners || currentData.heroBanners;
  currentData.phoneNumbers = restored.phoneNumbers || currentData.phoneNumbers;
  currentData.emailAddresses = restored.emailAddresses || currentData.emailAddresses;
  currentData.contactInfo = restored.contactInfo || currentData.contactInfo;
  currentData.departments = restored.departments || currentData.departments;
  currentData.courses = restored.courses || currentData.courses;
  currentData.teachers = restored.teachers || currentData.teachers;
  currentData.students = restored.students || currentData.students;
  currentData.results = restored.results || currentData.results;
  currentData.attendance = restored.attendance || currentData.attendance;
  currentData.events = restored.events || currentData.events;
  currentData.albums = restored.albums || currentData.albums;
  currentData.galleryImages = restored.galleryImages || currentData.galleryImages;
  currentData.videos = restored.videos || currentData.videos;
  currentData.notices = restored.notices || currentData.notices;
  currentData.documents = restored.documents || currentData.documents;

  db.save();
  db.logAudit(req.user!.userId, req.user!.name, req.user!.role, 'SYSTEM_RESTORED', 'Backup & Restore', `Restored system state from backup created on ${backupData.exportDate}`, req.ip);

  return res.json({ success: true, message: 'Database successfully restored from backup snapshot.' });
});

// ==================== PRINCIPAL MODULE ====================
router.get('/principal-profile', (req: Request, res: Response) => {
  const profile = db.getPrincipalProfile();
  return res.json({ success: true, profile });
});

router.post('/principal-profile', (req: Request, res: Response) => {
  const updated = db.updatePrincipalProfile(req.body);
  db.logAudit(
    req.user!.userId,
    req.user!.name,
    req.user!.role,
    'PRINCIPAL_PROFILE_UPDATED',
    'Principal Management',
    `Updated Principal Profile for ${updated.name}`,
    req.ip
  );
  return res.json({ success: true, profile: updated, message: 'Principal profile saved successfully.' });
});

router.get('/principal-messages', (req: Request, res: Response) => {
  const messages = db.getPrincipalMessages();
  return res.json({ success: true, messages });
});

router.post('/principal-messages', (req: Request, res: Response) => {
  const newMsg = db.addPrincipalMessage(req.body);
  db.logAudit(
    req.user!.userId,
    req.user!.name,
    req.user!.role,
    'PRINCIPAL_MESSAGE_CREATED',
    'Principal Management',
    `Created Principal Message: ${newMsg.title} (Audience: ${newMsg.audienceType})`,
    req.ip
  );
  return res.json({ success: true, messageRecord: newMsg, message: 'Principal message created and saved successfully.' });
});

router.put('/principal-messages/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updatePrincipalMessage(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Principal message not found.' });
  }
  db.logAudit(
    req.user!.userId,
    req.user!.name,
    req.user!.role,
    'PRINCIPAL_MESSAGE_UPDATED',
    'Principal Management',
    `Updated Principal Message: ${updated.title}`,
    req.ip
  );
  return res.json({ success: true, messageRecord: updated, message: 'Principal message updated successfully.' });
});

router.delete('/principal-messages/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deletePrincipalMessage(id);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Principal message not found.' });
  }
  db.logAudit(
    req.user!.userId,
    req.user!.name,
    req.user!.role,
    'PRINCIPAL_MESSAGE_DELETED',
    'Principal Management',
    `Deleted Principal Message ID: ${id}`,
    req.ip
  );
  return res.json({ success: true, message: 'Principal message permanently deleted.' });
});

router.patch('/principal-messages/:id/publish', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isPublished, status } = req.body;
  const updated = db.updatePrincipalMessage(id, {
    isPublished: Boolean(isPublished),
    status: status || (isPublished ? 'PUBLISHED' : 'UNPUBLISHED'),
  });
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Principal message not found.' });
  }
  db.logAudit(
    req.user!.userId,
    req.user!.name,
    req.user!.role,
    isPublished ? 'PRINCIPAL_MESSAGE_PUBLISHED' : 'PRINCIPAL_MESSAGE_UNPUBLISHED',
    'Principal Management',
    `${isPublished ? 'Published' : 'Unpublished'} Principal Message: ${updated.title}`,
    req.ip
  );
  return res.json({ success: true, messageRecord: updated, message: `Message ${isPublished ? 'published' : 'unpublished'} successfully.` });
});

export default router;
