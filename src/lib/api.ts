/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('jpc_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; [key: string]: any }> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// Public API helpers
export const publicApi = {
  getCollegeInfo: () => apiRequest('/public/college-info'),
  getSettings: () => apiRequest('/public/college-info'),
  getDepartments: () => apiRequest('/public/departments'),
  getCourses: () => apiRequest('/public/courses'),
  getFaculty: () => apiRequest('/public/faculty'),
  getEvents: () => apiRequest('/public/events'),
  getGallery: () => apiRequest('/public/gallery'),
  getVideos: () => apiRequest('/public/videos'),
  getNotices: () => apiRequest('/public/notices'),
  getDocuments: () => apiRequest('/public/documents'),
  getContactInfo: () => apiRequest('/public/contact-info'),
  getPhoneNumbers: () => apiRequest('/public/phone-numbers'),
  getEmailAddresses: () => apiRequest('/public/email-addresses'),
  verifyResult: (body: { rollNumber: string; registrationNumber?: string; examination?: string }) =>
    apiRequest('/public/verify-result', { method: 'POST', body: JSON.stringify(body) }),
  submitInquiry: (body: any) =>
    apiRequest('/public/submit-inquiry', { method: 'POST', body: JSON.stringify(body) }),
};

// Admin API helpers
export const adminApi = {
  getDashboardStats: () => apiRequest('/admin/dashboard-stats'),
  getStats: () => apiRequest('/admin/dashboard-stats'),
  getSettings: () => apiRequest('/admin/settings'),
  updateSettings: (settings: any) =>
    apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  getBanners: () => apiRequest('/admin/banners'),
  createBanner: (banner: any) =>
    apiRequest('/admin/banners', { method: 'POST', body: JSON.stringify(banner) }),
  updateBanner: (id: string, banner: any) =>
    apiRequest(`/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(banner) }),
  saveBanner: (banner: any) =>
    banner.id && !banner.id.startsWith('temp-') && !banner.id.startsWith('ban-new')
      ? apiRequest(`/admin/banners/${banner.id}`, { method: 'PUT', body: JSON.stringify(banner) })
      : apiRequest('/admin/banners', { method: 'POST', body: JSON.stringify(banner) }),
  deleteBanner: (id: string) =>
    apiRequest(`/admin/banners/${id}`, { method: 'DELETE' }),

  getPhoneNumbers: () => apiRequest('/admin/phone-numbers'),
  createPhoneNumber: (phone: any) =>
    apiRequest('/admin/phone-numbers', { method: 'POST', body: JSON.stringify(phone) }),
  updatePhoneNumber: (id: string, phone: any) =>
    apiRequest(`/admin/phone-numbers/${id}`, { method: 'PUT', body: JSON.stringify(phone) }),
  savePhoneNumber: (phone: any) =>
    phone.id && !phone.id.startsWith('temp-') && !phone.id.startsWith('phone-new')
      ? apiRequest(`/admin/phone-numbers/${phone.id}`, { method: 'PUT', body: JSON.stringify(phone) })
      : apiRequest('/admin/phone-numbers', { method: 'POST', body: JSON.stringify(phone) }),
  deletePhoneNumber: (id: string) =>
    apiRequest(`/admin/phone-numbers/${id}`, { method: 'DELETE' }),

  getEmails: () => apiRequest('/admin/emails'),
  getEmailAddresses: () => apiRequest('/admin/emails'),
  createEmail: (email: any) =>
    apiRequest('/admin/emails', { method: 'POST', body: JSON.stringify(email) }),
  updateEmail: (id: string, email: any) =>
    apiRequest(`/admin/emails/${id}`, { method: 'PUT', body: JSON.stringify(email) }),
  saveEmailAddress: (email: any) =>
    email.id && !email.id.startsWith('temp-') && !email.id.startsWith('email-new')
      ? apiRequest(`/admin/emails/${email.id}`, { method: 'PUT', body: JSON.stringify(email) })
      : apiRequest('/admin/emails', { method: 'POST', body: JSON.stringify(email) }),
  deleteEmail: (id: string) =>
    apiRequest(`/admin/emails/${id}`, { method: 'DELETE' }),
  deleteEmailAddress: (id: string) =>
    apiRequest(`/admin/emails/${id}`, { method: 'DELETE' }),

  updateContactInfo: (contactInfo: any) =>
    apiRequest('/admin/contact-info', { method: 'PUT', body: JSON.stringify(contactInfo) }),

  getDepartments: () => apiRequest('/admin/departments'),
  createDepartment: (dept: any) =>
    apiRequest('/admin/departments', { method: 'POST', body: JSON.stringify(dept) }),
  updateDepartment: (id: string, dept: any) =>
    apiRequest(`/admin/departments/${id}`, { method: 'PUT', body: JSON.stringify(dept) }),
  saveDepartment: (dept: any) =>
    dept.id && !dept.id.startsWith('temp-') && !dept.id.startsWith('dept-new')
      ? apiRequest(`/admin/departments/${dept.id}`, { method: 'PUT', body: JSON.stringify(dept) })
      : apiRequest('/admin/departments', { method: 'POST', body: JSON.stringify(dept) }),
  deleteDepartment: (id: string) =>
    apiRequest(`/admin/departments/${id}`, { method: 'DELETE' }),

  getCourses: () => apiRequest('/admin/courses'),
  createCourse: (crs: any) =>
    apiRequest('/admin/courses', { method: 'POST', body: JSON.stringify(crs) }),
  updateCourse: (id: string, crs: any) =>
    apiRequest(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(crs) }),
  saveCourse: (crs: any) =>
    crs.id && !crs.id.startsWith('temp-')
      ? apiRequest(`/admin/courses/${crs.id}`, { method: 'PUT', body: JSON.stringify(crs) })
      : apiRequest('/admin/courses', { method: 'POST', body: JSON.stringify(crs) }),
  deleteCourse: (id: string) =>
    apiRequest(`/admin/courses/${id}`, { method: 'DELETE' }),

  getTeachers: () => apiRequest('/admin/teachers'),
  createTeacher: (teacher: any) =>
    apiRequest('/admin/teachers', { method: 'POST', body: JSON.stringify(teacher) }),
  updateTeacher: (id: string, teacher: any) =>
    apiRequest(`/admin/teachers/${id}`, { method: 'PUT', body: JSON.stringify(teacher) }),
  saveTeacher: (teacher: any) =>
    teacher.id && !teacher.id.startsWith('temp-') && !teacher.id.startsWith('t-new')
      ? apiRequest(`/admin/teachers/${teacher.id}`, { method: 'PUT', body: JSON.stringify(teacher) })
      : apiRequest('/admin/teachers', { method: 'POST', body: JSON.stringify(teacher) }),
  deleteTeacher: (id: string) =>
    apiRequest(`/admin/teachers/${id}`, { method: 'DELETE' }),

  getStudents: () => apiRequest('/admin/students'),
  createStudent: (student: any) =>
    apiRequest('/admin/students', { method: 'POST', body: JSON.stringify(student) }),
  updateStudent: (id: string, student: any) =>
    apiRequest(`/admin/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }),
  saveStudent: (student: any) =>
    student.id && !student.id.startsWith('temp-') && !student.id.startsWith('std-new')
      ? apiRequest(`/admin/students/${student.id}`, { method: 'PUT', body: JSON.stringify(student) })
      : apiRequest('/admin/students', { method: 'POST', body: JSON.stringify(student) }),
  deleteStudent: (id: string) =>
    apiRequest(`/admin/students/${id}`, { method: 'DELETE' }),

  getResults: () => apiRequest('/admin/results'),
  createResult: (resData: any) =>
    apiRequest('/admin/results', { method: 'POST', body: JSON.stringify(resData) }),
  updateResult: (id: string, resData: any) =>
    apiRequest(`/admin/results/${id}`, { method: 'PUT', body: JSON.stringify(resData) }),
  saveResult: (resData: any) =>
    resData.id && !resData.id.startsWith('temp-') && !resData.id.startsWith('res-new')
      ? apiRequest(`/admin/results/${resData.id}`, { method: 'PUT', body: JSON.stringify(resData) })
      : apiRequest('/admin/results', { method: 'POST', body: JSON.stringify(resData) }),
  deleteResult: (id: string) =>
    apiRequest(`/admin/results/${id}`, { method: 'DELETE' }),

  getAttendance: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/admin/attendance${qs}`);
  },
  recordAttendanceBulk: (payload: any) =>
    apiRequest('/admin/attendance/bulk', { method: 'POST', body: JSON.stringify(payload) }),
  deleteAttendance: (id: string) =>
    apiRequest(`/admin/attendance/${id}`, { method: 'DELETE' }),

  getEvents: () => apiRequest('/admin/events'),
  createEvent: (evt: any) =>
    apiRequest('/admin/events', { method: 'POST', body: JSON.stringify(evt) }),
  updateEvent: (id: string, evt: any) =>
    apiRequest(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(evt) }),
  saveEvent: (evt: any) =>
    evt.id && !evt.id.startsWith('temp-') && !evt.id.startsWith('evt-new')
      ? apiRequest(`/admin/events/${evt.id}`, { method: 'PUT', body: JSON.stringify(evt) })
      : apiRequest('/admin/events', { method: 'POST', body: JSON.stringify(evt) }),
  deleteEvent: (id: string) =>
    apiRequest(`/admin/events/${id}`, { method: 'DELETE' }),

  getAlbums: () => apiRequest('/admin/albums'),
  getGallery: () => apiRequest('/admin/albums'),
  createAlbum: (album: any) =>
    apiRequest('/admin/albums', { method: 'POST', body: JSON.stringify(album) }),
  updateAlbum: (id: string, album: any) =>
    apiRequest(`/admin/albums/${id}`, { method: 'PUT', body: JSON.stringify(album) }),
  saveAlbum: (album: any) =>
    album.id && !album.id.startsWith('temp-') && !album.id.startsWith('alb-new')
      ? apiRequest(`/admin/albums/${album.id}`, { method: 'PUT', body: JSON.stringify(album) })
      : apiRequest('/admin/albums', { method: 'POST', body: JSON.stringify(album) }),
  deleteAlbum: (id: string) =>
    apiRequest(`/admin/albums/${id}`, { method: 'DELETE' }),

  uploadGalleryImage: (image: any) =>
    apiRequest('/admin/gallery-images', { method: 'POST', body: JSON.stringify(image) }),
  saveGalleryImage: (image: any) =>
    image.id && !image.id.startsWith('temp-') && !image.id.startsWith('img-new')
      ? apiRequest(`/admin/gallery-images/${image.id}`, { method: 'PUT', body: JSON.stringify(image) })
      : apiRequest('/admin/gallery-images', { method: 'POST', body: JSON.stringify(image) }),
  deleteGalleryImage: (id: string) =>
    apiRequest(`/admin/gallery-images/${id}`, { method: 'DELETE' }),

  getVideos: () => apiRequest('/admin/videos'),
  createVideo: (vid: any) =>
    apiRequest('/admin/videos', { method: 'POST', body: JSON.stringify(vid) }),
  updateVideo: (id: string, vid: any) =>
    apiRequest(`/admin/videos/${id}`, { method: 'PUT', body: JSON.stringify(vid) }),
  deleteVideo: (id: string) =>
    apiRequest(`/admin/videos/${id}`, { method: 'DELETE' }),

  getNotices: () => apiRequest('/admin/notices'),
  createNotice: (not: any) =>
    apiRequest('/admin/notices', { method: 'POST', body: JSON.stringify(not) }),
  updateNotice: (id: string, not: any) =>
    apiRequest(`/admin/notices/${id}`, { method: 'PUT', body: JSON.stringify(not) }),
  saveNotice: (not: any) =>
    not.id && !not.id.startsWith('temp-') && !not.id.startsWith('not-new')
      ? apiRequest(`/admin/notices/${not.id}`, { method: 'PUT', body: JSON.stringify(not) })
      : apiRequest('/admin/notices', { method: 'POST', body: JSON.stringify(not) }),
  deleteNotice: (id: string) =>
    apiRequest(`/admin/notices/${id}`, { method: 'DELETE' }),

  getDocuments: () => apiRequest('/admin/documents'),
  createDocument: (doc: any) =>
    apiRequest('/admin/documents', { method: 'POST', body: JSON.stringify(doc) }),
  updateDocument: (id: string, doc: any) =>
    apiRequest(`/admin/documents/${id}`, { method: 'PUT', body: JSON.stringify(doc) }),
  saveDocument: (doc: any) =>
    doc.id && !doc.id.startsWith('temp-') && !doc.id.startsWith('doc-new')
      ? apiRequest(`/admin/documents/${doc.id}`, { method: 'PUT', body: JSON.stringify(doc) })
      : apiRequest('/admin/documents', { method: 'POST', body: JSON.stringify(doc) }),
  deleteDocument: (id: string) =>
    apiRequest(`/admin/documents/${id}`, { method: 'DELETE' }),

  getUsers: () => apiRequest('/admin/users'),
  createUser: (user: any) =>
    apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(user) }),
  updateUserStatus: (id: string, status: string) =>
    apiRequest(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteUser: (id: string) =>
    apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),

  getAuditLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/admin/audit-logs${qs}`);
  },

  getInquiries: () => apiRequest('/admin/inquiries'),
  updateInquiryStatus: (id: string, status: string) =>
    apiRequest(`/admin/inquiries/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteInquiry: (id: string) =>
    apiRequest(`/admin/inquiries/${id}`, { method: 'DELETE' }),

  updateSecuritySettings: (settings: any) =>
    apiRequest('/admin/security-settings', { method: 'PUT', body: JSON.stringify(settings) }),
  update2FASettings: (settings: any) =>
    apiRequest('/admin/security-settings', { method: 'PUT', body: JSON.stringify(settings) }),

  exportBackup: () => window.open('/api/admin/backup/export', '_blank'),
  restoreBackup: (backupData: any) =>
    apiRequest('/admin/backup/restore', { method: 'POST', body: JSON.stringify({ backupData }) }),

  uploadMedia: (dataUrl: string, filename?: string, mimeType?: string, category?: string) =>
    apiRequest('/upload/media', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename, mimeType, category }),
    }),
};

// Student API helpers
export const studentApi = {
  getProfile: () => apiRequest('/student/profile'),
  getResults: () => apiRequest('/student/results'),
  getAttendance: () => apiRequest('/student/attendance'),
  getNotices: () => apiRequest('/student/notices'),
  getDocuments: () => apiRequest('/student/documents'),
};

// Teacher API helpers
export const teacherApi = {
  getProfile: () => apiRequest('/teacher/profile'),
  getStudents: () => apiRequest('/teacher/students'),
  recordAttendance: (payload: any) =>
    apiRequest('/teacher/attendance', { method: 'POST', body: JSON.stringify(payload) }),
  submitAttendance: (payload: any) =>
    apiRequest('/teacher/attendance', { method: 'POST', body: JSON.stringify(payload) }),
  getNotices: () => apiRequest('/teacher/notices'),
};
