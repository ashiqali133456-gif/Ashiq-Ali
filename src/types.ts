/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPER_ADMIN' | 'STUDENT' | 'TEACHER' | 'Super Admin' | 'Student' | 'Teacher';

export type AudienceType =
  | 'PUBLIC'
  | 'ALL_STUDENTS'
  | 'ALL_TEACHERS'
  | 'STUDENTS_AND_TEACHERS'
  | 'DEPARTMENT'
  | 'PROGRAM'
  | 'SEMESTER'
  | 'CLASS'
  | 'SPECIFIC_STUDENT'
  | 'SPECIFIC_TEACHER';

export type MessagePriority = 'Normal' | 'Urgent' | 'Important' | 'High';
export type MessageStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export interface PrincipalProfile {
  id: string; // 'global_principal_profile'
  name: string;
  photoUrl: string;
  designation: string;
  qualification: string;
  department?: string;
  experience?: string;
  joiningDate?: string;
  biography: string;
  about: string;
  vision: string;
  mission: string;
  messageToStudents?: string;
  messageToTeachers?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrincipalMessage {
  id: string;
  principalId?: string;
  title: string;
  messageBody: string;
  principalName: string;
  principalPhotoUrl?: string;
  audienceType: AudienceType;
  departmentId?: string;
  departmentName?: string;
  programId?: string;
  programName?: string;
  semester?: string;
  className?: string;
  studentId?: string;
  studentName?: string;
  teacherId?: string;
  teacherName?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'document' | string;
  priority: MessagePriority;
  status: MessageStatus;
  isPublic: boolean;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminConfig {
  id: string; // 'global_admin_config'
  admin_user_id: string;
  admin_google_sub: string;
  admin_email: string;
  admin_name: string;
  admin_claimed_at: string;
  is_claimed: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rollNumber?: string;
  employeeId?: string;
  department?: string;
  avatar?: string;
  phone?: string;
  isTwoFactorEnabled?: boolean;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
}

export type SystemUser = User;

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  active: boolean;
  order: number;
}

export interface CollegeSettings {
  collegeName: string;
  shortName?: string;
  urduName?: string;
  campus?: string;
  sinceYear: string;
  tagline: string;
  affiliation?: string;
  recognition?: string;
  registrationNumber?: string;
  logoUrl?: string;
  faviconUrl?: string;
  principalName?: string;
  principalTitle?: string;
  principalDesignation?: string;
  principalQualification?: string;
  principalMessage?: string;
  principalPhotoUrl?: string;
  heroHeading?: string;
  heroSubheading?: string;
  heroBadge?: string;
  aboutHeading?: string;
  aboutText?: string;
  historyText?: string;
  aboutHistory?: string;
  vision?: string;
  visionText?: string;
  mission?: string;
  missionText?: string;
  qualityPolicy?: string;
  accreditationDetails?: string;
  emergencyNotice?: string;
  emergencyNoticeActive?: boolean;
  announcementBarEnabled?: boolean;
  announcementText?: string;
  pbteAffiliationCode?: string;
  tevtaRegNumber?: string;
  stats?: {
    yearsOfExcellence: number;
    graduatedStudents: number;
    graduatesCount?: number;
    modernLabs: number;
    laboratoriesCount?: number;
    employmentRate: number;
    qualifiedFaculty: number;
  };
  sectionVisibility?: {
    showEmergencyTicker?: boolean;
    showStats?: boolean;
    showStatsRibbon?: boolean;
    showPrincipalMessage?: boolean;
    showDepartments?: boolean;
    showDepartmentsGrid?: boolean;
    showNoticesMarquee?: boolean;
    showFacilities?: boolean;
    showEvents?: boolean;
    showGallery?: boolean;
    showVideos?: boolean;
    showTestimonials?: boolean;
    showMap?: boolean;
    showHeroSlider?: boolean;
  };
}

export interface PhoneNumber {
  id: string;
  title: string;
  number: string;
  type?: 'general' | 'admission' | 'accounts' | 'principal' | 'emergency' | 'whatsapp';
  isPrimary?: boolean;
  isPublic?: boolean;
  isWhatsApp?: boolean;
  displayOrder?: number;
}

export interface EmailAddress {
  id: string;
  title: string;
  email: string;
  department?: string;
  isPrimary?: boolean;
  isPublic?: boolean;
  displayOrder?: number;
}

export interface ContactInfo {
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  mapEmbedUrl?: string;
  googleMapEmbedUrl?: string;
  openingHours?: string;
  officeHours?: string;
  helplineHours?: string;
  whatsappNumber?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  admissionsHelpline?: string;
  examinationOffice?: string;
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

export interface Department {
  id: string;
  code: string;
  name: string;
  urduName?: string;
  degreeType: 'DAE' | 'Short Course' | 'Certification' | string;
  description: string;
  iconName?: string;
  headOfDepartment: string;
  establishedYear: string;
  totalLabs: number;
  duration: string;
  image: string;
  featured?: boolean;
  totalSeats: number;
  careerOpportunities: string[];
  keySubjects: string[];
}

export interface Course {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  code: string;
  degreeType: 'DAE' | 'Short Course' | 'Certification' | string;
  durationYears?: string;
  semestersCount?: number;
  eligibility?: string;
  description: string;
  feePerSemester: string;
  admissionOpen?: boolean;
  syllabus?: any[];
  practicalLabs?: string[];
}

export interface Teacher {
  id: string;
  employeeId?: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experience: string;
  photoUrl: string;
  subjects: string[];
  isPublic?: boolean;
  status?: 'Active' | 'On Leave' | 'Visiting';
  email: string;
  phone?: string;
  joinedYear?: string;
  bio?: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  registrationNumber: string;
  name: string;
  fatherName: string;
  cnic?: string;
  email: string;
  phone?: string;
  department: string;
  technology: string;
  currentSemester: string;
  session: string;
  admissionDate?: string;
  photoUrl: string;
  status: 'Active' | 'Graduated' | 'Suspended';
}

export interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  status: 'Pass' | 'Supply';
}

export interface ResultRecord {
  id: string;
  studentId: string;
  rollNumber: string;
  registrationNumber: string;
  studentName: string;
  fatherName: string;
  examination: string;
  academicYear: string;
  semester: string;
  department: string;
  technology: string;
  subjects: SubjectResult[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  gpa: string;
  overallGrade: string;
  resultStatus: 'Passed' | 'Supplementary' | 'Failed';
  issueDate: string;
  isPublished: boolean;
  remarks: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  department: string;
  technology?: string;
  semester?: string;
  subject: string;
  teacherId?: string;
  teacherName?: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Leave';
  remarks?: string;
}

export interface CollegeEvent {
  id: string;
  title: string;
  category: 'Academic' | 'Sports' | 'Workshops' | 'Cultural' | 'Exhibition' | 'Ceremony' | 'Technical Gala' | string;
  date: string;
  time: string;
  location: string;
  posterUrl: string;
  photos?: string[];
  videoUrl?: string;
  description: string;
  isPublished?: boolean;
  targetAudience?: string;
  featured?: boolean;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  category?: 'Campus' | 'Classrooms' | 'Laboratories' | 'Workshops' | 'Sports' | 'Seminars' | 'Cultural Events' | 'Prize Distribution' | 'Student Activities' | string;
  coverImageUrl?: string;
  description?: string;
  date?: string;
  isPublished?: boolean;
  imagesCount?: number;
}

export interface GalleryImage {
  id: string;
  albumId: string;
  albumName: string;
  title: string;
  caption: string;
  altText?: string;
  imageUrl: string;
  date: string;
  isPublished?: boolean;
  displayOrder?: number;
}

export interface VideoItem {
  id: string;
  title: string;
  category?: 'Campus Tour' | 'Lab Demonstrations' | 'Convocation' | 'Workshops' | 'Sports' | 'Documentary';
  videoUrl: string;
  thumbnailUrl?: string;
  description: string;
  duration?: string;
  eventId?: string;
  isPublished?: boolean;
  uploadDate?: string;
}

export interface Notice {
  id: string;
  title: string;
  category: 'Academic' | 'Exams' | 'Admissions' | 'General' | 'Urgent' | 'Scholarships' | 'Admission' | 'Examination' | 'Fee' | string;
  content: string;
  date: string;
  expiryDate?: string;
  priority: 'Normal' | 'High' | 'Urgent' | 'Urgent_Marquee';
  targetAudience?: 'All' | 'Students' | 'Teachers' | 'Public';
  fileAttachmentUrl?: string;
  fileName?: string;
  isPublished?: boolean;
  isPublic?: boolean;
  isTargetStudent?: boolean;
  isTargetTeacher?: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Admission' | 'Prospectus' | 'Syllabus' | 'Forms' | 'Affiliation' | 'Fee_Challan' | 'Academic_Calendar' | string;
  description: string;
  fileUrl: string;
  fileSize: string;
  uploadDate: string;
  isPublic?: boolean;
  targetRole?: 'All' | 'Student' | 'Teacher';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId?: string;
  actorName?: string;
  userName?: string;
  actorRole?: UserRole;
  userRole?: string;
  action: string;
  category?: string;
  details: string;
  ipAddress?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  isExternal?: boolean;
  order: number;
  isVisible: boolean;
  children?: Array<{ label: string; path: string }>;
}

export interface SecuritySettings {
  twoFactorRequiredForAdmin: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lastPasswordChangedDate: string;
  adminTwoFactorPinSet: boolean;
}

export interface AdmissionInquiry {
  id: string;
  name: string;
  email?: string;
  phone: string;
  subject: string;
  message: string;
  technologyInterest?: string;
  date: string;
  status: 'New' | 'Contacted' | 'Enrolled' | 'Closed' | 'Unread' | 'Read' | 'Replied';
}

export type InquiryMessage = AdmissionInquiry;
