/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { InquiryMessage } from '../../src/types.js';

const router = Router();

// Public College Info & Settings
router.get('/college-info', (req: Request, res: Response) => {
  console.log('Received request for /college-info');
  const data = db.getRawData();
  const { emergencyNotice, emergencyNoticeActive, stats, sectionVisibility, ...generalSettings } = data.settings;

  // Mask any private admin info
  return res.json({
    success: true,
    settings: {
      ...generalSettings,
      emergencyNotice: emergencyNoticeActive ? emergencyNotice : '',
      emergencyNoticeActive,
      stats,
      sectionVisibility,
      managedByNotice: 'Official Website Managed by Jinnah Polytechnic Administration',
    },
    heroBanners: data.heroBanners.filter((b) => b.active).sort((a, b) => a.order - b.order),
  });
});

// Public Departments
router.get('/departments', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({
    success: true,
    departments: data.departments,
  });
});

// Public Courses
router.get('/courses', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({
    success: true,
    courses: data.courses,
  });
});

// Public Faculty Directory (Strip private details)
router.get('/faculty', (req: Request, res: Response) => {
  const data = db.getRawData();
  const publicFaculty = data.teachers
    .filter((t) => t.isPublic)
    .map((t) => ({
      id: t.id,
      name: t.name,
      designation: t.designation,
      department: t.department,
      qualification: t.qualification,
      experience: t.experience,
      photoUrl: t.photoUrl,
      subjects: t.subjects,
      status: t.status,
      joinedYear: t.joinedYear,
      bio: t.bio,
      email: t.email,
    }));

  return res.json({
    success: true,
    faculty: publicFaculty,
  });
});

// Public Events
router.get('/events', (req: Request, res: Response) => {
  const data = db.getRawData();
  const publishedEvents = data.events.filter((e) => e.isPublished);
  return res.json({
    success: true,
    events: publishedEvents,
  });
});

// Public Gallery
router.get('/gallery', (req: Request, res: Response) => {
  const data = db.getRawData();
  const albums = data.albums.filter((a) => a.isPublished);
  const images = data.galleryImages.filter((img) => img.isPublished).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return res.json({
    success: true,
    albums,
    images,
  });
});

// Public Videos
router.get('/videos', (req: Request, res: Response) => {
  const data = db.getRawData();
  const videos = data.videos.filter((v) => v.isPublished);
  return res.json({
    success: true,
    videos,
  });
});

// Public Notices & Circulars
router.get('/notices', (req: Request, res: Response) => {
  const data = db.getRawData();
  const publicNotices = data.notices.filter(
    (n) => n.isPublished && (n.targetAudience === 'All' || n.targetAudience === 'Public')
  );
  return res.json({
    success: true,
    notices: publicNotices,
  });
});

// Public Documents & Downloads
router.get('/documents', (req: Request, res: Response) => {
  const data = db.getRawData();
  const publicDocs = data.documents.filter((d) => d.isPublic && (!d.targetRole || d.targetRole === 'All'));
  return res.json({
    success: true,
    documents: publicDocs,
  });
});

// Public Contact Details & Phone Numbers (Only verified public numbers)
router.get('/contact-info', (req: Request, res: Response) => {
  const data = db.getRawData();
  const publicPhones = (data.phoneNumbers || [])
    .filter((p) => p.isPublic)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const publicEmails = (data.emailAddresses || [])
    .filter((e) => e.isPublic)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return res.json({
    success: true,
    contactInfo: data.contactInfo,
    phoneNumbers: publicPhones,
    emailAddresses: publicEmails,
  });
});

// Public Phone Numbers (Dedicated endpoint)
router.get('/phone-numbers', (req: Request, res: Response) => {
  const data = db.getRawData();
  const publicPhones = (data.phoneNumbers || [])
    .filter((p) => p.isPublic)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return res.json({
    success: true,
    phoneNumbers: publicPhones,
  });
});

// Public Email Addresses (Dedicated endpoint)
router.get('/email-addresses', (req: Request, res: Response) => {
  const data = db.getRawData();
  const publicEmails = (data.emailAddresses || [])
    .filter((e) => e.isPublic)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return res.json({
    success: true,
    emailAddresses: publicEmails,
  });
});

// Public Result Verification
router.post('/verify-result', (req: Request, res: Response) => {
  const { rollNumber, registrationNumber, examination } = req.body;

  if (!rollNumber) {
    return res.status(400).json({
      success: false,
      error: 'Please provide student Roll Number to verify examination result.',
    });
  }

  const data = db.getRawData();
  const cleanRoll = String(rollNumber).trim().toUpperCase();

  // Search published results
  const matches = data.results.filter(
    (r) =>
      r.isPublished &&
      r.rollNumber.toUpperCase() === cleanRoll &&
      (!registrationNumber || r.registrationNumber.toUpperCase().includes(String(registrationNumber).trim().toUpperCase())) &&
      (!examination || r.examination.toLowerCase().includes(String(examination).trim().toLowerCase()))
  );

  if (matches.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No published examination record found for the provided Roll Number. Please verify credentials or contact the examination controller.',
    });
  }

  return res.json({
    success: true,
    results: matches,
  });
});

// Submit Contact / Admission Inquiry
router.post('/submit-inquiry', (req: Request, res: Response) => {
  const { name, email, phone, subject, message, technologyInterest } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({
      success: false,
      error: 'Name, phone number, and message are required.',
    });
  }

  const newInquiry: InquiryMessage = {
    id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: String(name).trim(),
    email: String(email || '').trim(),
    phone: String(phone).trim(),
    subject: String(subject || 'General Inquiry').trim(),
    message: String(message).trim(),
    technologyInterest,
    date: new Date().toISOString(),
    status: 'Unread',
  };

  const data = db.getRawData();
  data.inquiries.unshift(newInquiry);
  db.save();

  db.logAudit('public', newInquiry.name, 'VISITOR', 'INQUIRY_SUBMITTED', 'Public Contact', `New inquiry from ${newInquiry.name} (${newInquiry.phone})`, req.ip);

  return res.json({
    success: true,
    message: 'Thank you. Your inquiry has been received by JPC Admissions Office. Our representative will contact you shortly.',
  });
});

// Public Principal Profile
router.get('/principal-profile', (req: Request, res: Response) => {
  const profile = db.getPrincipalProfile();
  return res.json({
    success: true,
    profile,
  });
});

// Public Principal Messages
router.get('/principal-messages', (req: Request, res: Response) => {
  const allMessages = db.getPrincipalMessages();
  const publicMessages = allMessages.filter(
    (m) => (m.isPublic || m.audienceType === 'PUBLIC') && m.isPublished && m.status === 'PUBLISHED'
  );
  return res.json({
    success: true,
    messages: publicMessages,
  });
});

export default router;
