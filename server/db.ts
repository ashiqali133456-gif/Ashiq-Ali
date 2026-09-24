/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
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
  AuditLog,
  HeroBanner,
  InquiryMessage,
  SecuritySettings,
  AdminConfig,
  PrincipalProfile,
  PrincipalMessage,
} from '../src/types.js';

export interface DatabaseSchema {
  adminConfig: AdminConfig;
  users: Array<User & { passwordHash: string; twoFactorPin?: string }>;
  settings: CollegeSettings;
  principalProfile: PrincipalProfile;
  principalMessages: PrincipalMessage[];
  heroBanners: HeroBanner[];
  phoneNumbers: PhoneNumber[];
  emailAddresses: EmailAddress[];
  contactInfo: ContactInfo;
  departments: Department[];
  courses: Course[];
  teachers: Teacher[];
  students: Student[];
  results: ResultRecord[];
  attendance: AttendanceRecord[];
  events: CollegeEvent[];
  albums: GalleryAlbum[];
  galleryImages: GalleryImage[];
  videos: VideoItem[];
  notices: Notice[];
  documents: DocumentItem[];
  auditLogs: AuditLog[];
  inquiries: InquiryMessage[];
  securitySettings: SecuritySettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="%23002B7F"/><circle cx="200" cy="200" r="185" fill="%23FFFFFF" stroke="%23F36F21" stroke-width="12"/><g transform="translate(200, 140)"><circle cx="0" cy="-20" r="48" fill="%230B3C95"/><path d="M-8,-70 L8,-70 L6,-52 L-6,-52 Z M-70,-8 L-70,8 L-52,6 L-52,-6 Z M-8,32 L8,32 L6,14 L-6,14 Z M32,-8 L32,8 L14,6 L14,-8 Z M-48,-48 L-36,-36 L-24,-48 L-36,-60 Z M48,48 L36,36 L24,48 L36,60 Z M48,-48 L36,-36 L24,-48 L36,-60 Z M-48,48 L-36,36 L-24,48 L-36,60 Z" fill="%230B3C95"/><circle cx="0" cy="-20" r="34" fill="%23FFFFFF"/><circle cx="0" cy="-20" r="30" fill="%23E0F2FE"/><path d="M-15,-20 Q0,-42 15,-20 L10,-5 L-10,-5 Z" fill="%230284C7"/><path d="M-12,-48 Q0,-55 12,-48 Q0,-42 -12,-48" fill="%23F36F21"/><text x="0" y="-16" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="%23002B7F" text-anchor="middle">ESTD 1995</text><path d="M-85,0 C-70,40 70,40 85,0 C65,22 -65,22 -85,0 Z" fill="%23FFF" stroke="%230B3C95" stroke-width="2"/><text x="0" y="16" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%23002B7F" text-anchor="middle">جناح پولی ٹیکنک کالج</text></g><text x="200" y="245" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="%23002B7F" text-anchor="middle" letter-spacing="2">JINA</text><text x="200" y="278" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="%23002B7F" text-anchor="middle" letter-spacing="1.5">POLYTECHNIC COLLEGE</text><rect x="65" y="295" width="270" height="34" rx="6" fill="%23F36F21"/><text x="200" y="318" font-family="Arial, sans-serif" font-size="15" font-weight="900" fill="%23FFFFFF" text-anchor="middle" letter-spacing="1">FAISALABAD CAMPUS</text><text x="200" y="358" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="%23002B7F" text-anchor="middle">SINCE 1995</text></svg>`;

function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const defaultAdminPasswordHash = bcrypt.hashSync('Admin@Jina1995#', salt);
  const defaultTeacherPasswordHash = bcrypt.hashSync('Teacher@1995', salt);
  const defaultStudentPasswordHash = bcrypt.hashSync('Student@1995', salt);

  return {
    adminConfig: {
      id: 'global_admin_config',
      admin_user_id: 'usr-admin-00',
      admin_google_sub: 'google-sub-ashiqali133456',
      admin_email: 'ashiqali133456@gmail.com',
      admin_name: 'Ashiq Ali (Super Administrator)',
      admin_claimed_at: '1995-09-01T00:00:00.000Z',
      is_claimed: true,
    },
    users: [
      {
        id: 'usr-admin-00',
        email: 'ashiqali133456@gmail.com',
        name: 'Ashiq Ali (Super Administrator)',
        role: 'SUPER_ADMIN',
        status: 'Active',
        isTwoFactorEnabled: false,
        twoFactorPin: '199500',
        createdAt: new Date('2024-01-01').toISOString(),
        passwordHash: defaultAdminPasswordHash,
      },
      {
        id: 'usr-tea-01',
        email: 'engr.tariq@jinnahpolytechnic.edu.pk',
        name: 'Engr. Tariq Jamil',
        role: 'TEACHER',
        employeeId: 'EMP-CIV-01',
        department: 'Civil Engineering Technology',
        status: 'Active',
        createdAt: new Date('2024-01-10').toISOString(),
        passwordHash: defaultTeacherPasswordHash,
      },
      {
        id: 'usr-tea-02',
        email: 'engr.kamran@jinnahpolytechnic.edu.pk',
        name: 'Engr. Kamran Asghar',
        role: 'TEACHER',
        employeeId: 'EMP-ELE-02',
        department: 'Electrical Engineering Technology',
        status: 'Active',
        createdAt: new Date('2024-01-15').toISOString(),
        passwordHash: defaultTeacherPasswordHash,
      },
      {
        id: 'usr-stu-01',
        email: 'student.ali@jinnahpolytechnic.edu.pk',
        name: 'Ali Raza',
        role: 'STUDENT',
        rollNumber: 'JPC-2024-CIV-101',
        department: 'Civil Engineering Technology',
        status: 'Active',
        createdAt: new Date('2024-02-01').toISOString(),
        passwordHash: defaultStudentPasswordHash,
      },
      {
        id: 'usr-stu-02',
        email: 'student.hamza@jinnahpolytechnic.edu.pk',
        name: 'Hamza Bilal',
        role: 'STUDENT',
        rollNumber: 'JPC-2024-ELE-202',
        department: 'Electrical Engineering Technology',
        status: 'Active',
        createdAt: new Date('2024-02-01').toISOString(),
        passwordHash: defaultStudentPasswordHash,
      },
    ],
    settings: {
      collegeName: 'JINA POLYTECHNIC COLLEGE',
      shortName: 'JPC',
      urduName: 'جناح پولی ٹیکنک کالج',
      campus: 'Main Faisalabad Campus',
      sinceYear: '1995',
      tagline: 'SINCE 1995',
      affiliation: 'Affiliated with Punjab Board of Technical Education (PBTE), Lahore',
      recognition: 'Recognized by TEVTA (Technical Education & Vocational Training Authority) and NAVTTC',
      registrationNumber: 'PBTE/REG/1995-FSD/402',
      logoUrl: DEFAULT_LOGO_SVG,
      principalName: 'Engr. Sir Usman',
      principalTitle: 'Principal & Chief Administrator',
      principalQualification: 'M.Sc. Civil Engineering (UET), B.Sc. Civil Engg, FIE (Pak)',
      principalMessage:
        'Welcome to Jina Polytechnic College Faisalabad. Since our foundation in 1995, our mission has been to equip youth with cutting-edge technical craftsmanship, practical engineering skills, and moral discipline. Our state-of-the-art workshops, qualified engineers, and dedicated training prepare our diploma graduates to lead in national infrastructure, industrial manufacturing, power generation, and global technologies.',
      principalPhotoUrl: '/uploads/principal-usman.jpg',
      heroHeading: 'Shaping Tomorrow’s Certified Engineers & Technical Leaders',
      heroSubheading:
        'Government Recognized 3-Year DAE (Diploma of Associate Engineering) programs with 100% hands-on laboratory workshops, industry apprenticeships, and direct job placement support.',
      heroBadge: 'Admissions Open for Session 2024-2027 • PBTE Approved',
      aboutHeading: 'A Legacy of Technical Mastery & Industrial Excellence',
      aboutText:
        'Jinnah Polytechnic Institute was established in 1995 with the vision of providing high-caliber technical education to the industrial hub of Faisalabad and across Pakistan. Over the last 30 years, JPC has graduated over 18,500 certified associate engineers who are now serving in prominent national institutions (WAPDA, CPEC Projects, NESPAK, FWO, Descon, Millat Tractors, Packages, Textile giants) and multinational organizations across the Middle East, Europe, and Asia.',
      historyText:
        'Starting with Civil and Electrical technologies in 1995, JPC has continually expanded to incorporate Mechanical Engineering, Computer Information Technology (CIT), Electronics, and modern CNC/Automation labs. Our campus spans across a multi-acre purpose-built facility equipped with specialized heavy machinery, modern computing centers, and hydraulic test benches.',
      visionText:
        'To be Pakistan’s premier institution for technical education, fostering innovation, engineering precision, and socio-economic empowerment through industry-tailored associate engineering diplomas.',
      missionText:
        'To deliver rigorous hands-on technical training, instilling professional ethics, engineering excellence, and problem-solving mindsets that empower our students to immediately succeed in industrial engineering sectors and higher education.',
      qualityPolicy:
        'We adhere strictly to PBTE academic standards and TEVTA quality metrics, ensuring regular curriculum upgrades, industrial advisory oversight, and continuous teacher proficiency enhancement.',
      accreditationDetails:
        'Fully accredited by PBTE (Punjab Board of Technical Education, Lahore). Registered with National Vocational and Technical Training Commission (NAVTTC) and Technical Education & Vocational Training Authority (TEVTA) Punjab.',
      emergencyNotice: 'Admissions Open for DAE 1st Year (Civil, Electrical, Mechanical, CIT) - Limited Merit Seats Available!',
      emergencyNoticeActive: true,
      stats: {
        yearsOfExcellence: 30,
        graduatedStudents: 18500,
        modernLabs: 24,
        employmentRate: 94,
        qualifiedFaculty: 45,
      },
      sectionVisibility: {
        showEmergencyTicker: true,
        showStats: true,
        showPrincipalMessage: true,
        showDepartments: true,
        showNoticesMarquee: true,
        showFacilities: true,
        showEvents: true,
        showGallery: true,
        showVideos: true,
        showTestimonials: true,
        showMap: true,
      },
    },
    principalProfile: {
      id: 'global_principal_profile',
      name: 'Engr. Sir Usman',
      photoUrl: '/uploads/principal-usman.jpg',
      designation: 'Principal & Chief Administrator',
      qualification: 'M.Sc. Civil Engineering (UET), B.Sc. Civil Engg, FIE (Pak)',
      department: 'Engineering & Institutional Administration',
      experience: '28+ Years in Technical Education & Industrial Administration',
      joiningDate: '1995-09-01',
      biography: 'Engr. Sir Usman is an eminent engineering scholar, educational visionary, and Principal Administrator of Jina Polytechnic College. Under his visionary leadership since 1995, the institute has transformed over 18,500 students into certified associate engineers across Pakistan and global industrial sectors.',
      about: 'Jina Polytechnic College stands as a leading institute for technical education in Faisalabad. Our commitment is to deliver top-tier hands-on engineering training, modern lab exposure, and professional discipline.',
      vision: 'To be Pakistan’s premier associate engineering institution, pioneering technical innovation, hands-on skill mastery, and socio-economic empowerment.',
      mission: 'To equip youth with cutting-edge engineering skills, industrial apprenticeships, and problem-solving mindsets that empower our students to immediately succeed in industrial engineering sectors.',
      messageToStudents: 'Dear Students, focus on your practical workshop exercises and daily technical training. Hard work, discipline, and engineering precision guarantee your career success.',
      messageToTeachers: 'Respected Faculty Members, continue to mentor our students with dedication, updated lab experiments, and state-of-the-art technological standards.',
      isPublished: true,
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    principalMessages: [
      {
        id: 'pmsg-01',
        title: 'Welcome Message from the Desk of the Principal (Session 2024-2027)',
        messageBody: 'Welcome to Jina Polytechnic College Faisalabad. Since our foundation in 1995, our mission has been to equip youth with cutting-edge technical craftsmanship, practical engineering skills, and moral discipline. Our state-of-the-art workshops, qualified engineers, and dedicated training prepare our diploma graduates to lead in national infrastructure, industrial manufacturing, power generation, and global technologies.',
        principalName: 'Engr. Sir Usman',
        principalPhotoUrl: '/uploads/principal-usman.jpg',
        audienceType: 'PUBLIC',
        priority: 'Important',
        status: 'PUBLISHED',
        isPublic: true,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pmsg-02',
        title: 'Mandatory Lab Workshop Orientation & Safety Guidelines for DAE Students',
        messageBody: 'All 1st Year DAE students in Civil, Electrical, Mechanical, and CIT must wear safety boots, lab coats, and display identity badges during all laboratory practical sessions starting this Monday.',
        principalName: 'Engr. Sir Usman',
        principalPhotoUrl: '/uploads/principal-usman.jpg',
        audienceType: 'ALL_STUDENTS',
        priority: 'Urgent',
        status: 'PUBLISHED',
        isPublic: false,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pmsg-03',
        title: 'Academic Faculty Advisory: Mid-Term Examination Evaluation & PBTE Submissions',
        messageBody: 'Respected Faculty Members, please ensure mid-term answer sheets, attendance registers, and practical evaluation logs are submitted to the Examination Cell by Friday.',
        principalName: 'Engr. Sir Usman',
        principalPhotoUrl: '/uploads/principal-usman.jpg',
        audienceType: 'ALL_TEACHERS',
        priority: 'High',
        status: 'PUBLISHED',
        isPublic: false,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    heroBanners: [
      {
        id: 'ban-01',
        title: 'DAE Admissions Open Session 2024-2027',
        subtitle: 'PBTE Affiliated 3-Year Associate Engineering Diplomas with Full Workshop Practicals',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
        ctaText: 'Apply For Admission',
        ctaLink: '#apply-now',
        badge: 'Government Recognized',
        active: true,
        order: 1,
      },
      {
        id: 'ban-02',
        title: 'Advanced Mechanical & Electrical Engineering Labs',
        subtitle: 'Equipped with CNC Lathe, PLC Automation, Power Transformers & Hydraulic Test Benches',
        imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80',
        ctaText: 'Explore Technologies',
        ctaLink: '#departments',
        badge: 'Modern Infrastructure',
        active: true,
        order: 2,
      },
      {
        id: 'ban-03',
        title: '30+ Years of Engineering Legacy (Since 1995)',
        subtitle: 'Join over 18,500 proud alumni working across global industries and top engineering universities',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
        ctaText: 'Check Examination Results',
        ctaLink: '#results',
        badge: '100% Practical Training',
        active: true,
        order: 3,
      },
    ],
    phoneNumbers: [
      {
        id: 'ph-01',
        title: 'College Admissions Helpline',
        number: '+92 41 8765432',
        type: 'admission',
        isPrimary: true,
        isPublic: true,
        isWhatsApp: false,
        displayOrder: 1,
      },
      {
        id: 'ph-02',
        title: 'WhatsApp Official Advisory',
        number: '+92 300 7654321',
        type: 'whatsapp',
        isPrimary: false,
        isPublic: true,
        isWhatsApp: true,
        displayOrder: 2,
      },
      {
        id: 'ph-03',
        title: 'Main Reception & General Inquiries',
        number: '+92 41 8765430',
        type: 'general',
        isPrimary: false,
        isPublic: true,
        isWhatsApp: false,
        displayOrder: 3,
      },
      {
        id: 'ph-04',
        title: 'Examination & Verification Branch',
        number: '+92 41 8765435',
        type: 'accounts',
        isPrimary: false,
        isPublic: true,
        isWhatsApp: false,
        displayOrder: 4,
      },
    ],
    emailAddresses: [
      {
        id: 'em-01',
        title: 'General Inquiries',
        email: 'info@jinnahpolytechnic.edu.pk',
        department: 'Main Administration',
        isPrimary: true,
        isPublic: true,
        displayOrder: 1,
      },
      {
        id: 'em-02',
        title: 'Admissions Office',
        email: 'admissions@jinnahpolytechnic.edu.pk',
        department: 'Admissions & Student Affairs',
        isPrimary: false,
        isPublic: true,
        displayOrder: 2,
      },
      {
        id: 'em-03',
        title: 'Examination & Records',
        email: 'exams@jinnahpolytechnic.edu.pk',
        department: 'Controller of Examinations',
        isPrimary: false,
        isPublic: true,
        displayOrder: 3,
      },
    ],
    contactInfo: {
      address: 'Jinnah Polytechnic Institute Campus, Jaranwala Road / Canal Express Way Near Tech Plaza',
      city: 'Faisalabad',
      province: 'Punjab',
      postalCode: '38000',
      country: 'Pakistan',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Faisalabad,Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed',
      openingHours: 'Monday - Saturday: 08:00 AM - 04:00 PM (Friday: 08:00 AM - 12:30 PM)',
      helplineHours: '24/7 WhatsApp & SMS Support Available',
      whatsappNumber: '+923007654321',
      socialLinks: {
        facebook: 'https://facebook.com/JinnahPolytechnicOfficial',
        youtube: 'https://youtube.com/@JinnahPolytechnicOfficial',
        linkedin: 'https://linkedin.com/company/jinnah-polytechnic',
        instagram: 'https://instagram.com/jinnahpolytechnic',
        twitter: 'https://twitter.com/jpc_faisalabad',
        whatsapp: 'https://wa.me/923007654321',
      },
    },
    departments: [
      {
        id: 'dept-civ',
        code: 'CIVIL',
        name: 'Civil Engineering Technology',
        urduName: 'سول انجینئرنگ ٹیکنالوجی',
        degreeType: 'DAE',
        description:
          'Comprehensive practical training in surveying, structural drafting, concrete technology, hydraulics, building construction, highway design, and CAD civil estimation.',
        iconName: 'Building2',
        headOfDepartment: 'Engr. Tariq Jamil (M.Sc. Civil Engg)',
        establishedYear: '1995',
        totalLabs: 5,
        duration: '3 Years (6 Semesters)',
        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?auto=format&fit=crop&w=800&q=80',
        featured: true,
        totalSeats: 120,
        careerOpportunities: [
          'Sub-Divisional Officer (SDO) / Sub-Engineer in C&W, WAPDA, Irrigation',
          'Site Engineer in high-rise building & infrastructure projects',
          'CAD Surveyor & Civil Estimator in NESPAK, FWO, NLC',
          'International Construction Overseer in Gulf & Middle East',
        ],
        keySubjects: [
          'Civil Drafting & AutoCad',
          'Surveying & Total Station Operation',
          'Concrete Technology & Testing',
          'Soil Mechanics & Foundation Engg',
          'Public Health & Environmental Engg',
          'Quantity Surveying & Estimation',
        ],
      },
      {
        id: 'dept-ele',
        code: 'ELECTRICAL',
        name: 'Electrical Engineering Technology',
        urduName: 'الیکٹریکل انجینئرنگ ٹیکنالوجی',
        degreeType: 'DAE',
        description:
          'Deep mastery of AC/DC machinery, industrial power distribution, switchgear protection, electrical wiring, PLC automation, and solar energy installations.',
        iconName: 'Zap',
        headOfDepartment: 'Engr. Kamran Asghar (B.Sc. Electrical Engg)',
        establishedYear: '1995',
        totalLabs: 6,
        duration: '3 Years (6 Semesters)',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        featured: true,
        totalSeats: 120,
        careerOpportunities: [
          'Electrical Sub-Engineer in FESCO, LESCO, GEPCO, WAPDA',
          'Industrial Automation & PLC Technician in Textile Mills',
          'Solar Power Plant Installation Engineer',
          'Grid Station & Substation Maintenance Engineer',
        ],
        keySubjects: [
          'Electrical Circuits & Measurements',
          'AC Machines & Transformers',
          'Power Plant Engineering & Transmission',
          'PLC & Industrial Automation',
          'Solar Photovoltaic Systems',
          'Substation & Switchgear Protection',
        ],
      },
      {
        id: 'dept-mec',
        code: 'MECHANICAL',
        name: 'Mechanical Engineering Technology',
        urduName: 'مکینیکل انجینئرنگ ٹیکنالوجی',
        degreeType: 'DAE',
        description:
          'Hands-on machining, CNC turning and milling, metallurgy, thermodynamics, boiler maintenance, refrigeration, CAD/SolidWorks design, and hydraulic power.',
        iconName: 'Wrench',
        headOfDepartment: 'Engr. Zafar Iqbal (B.Sc. Mechanical Engg)',
        establishedYear: '1998',
        totalLabs: 6,
        duration: '3 Years (6 Semesters)',
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        featured: true,
        totalSeats: 90,
        careerOpportunities: [
          'Mechanical Sub-Engineer in Heavy Mechanical Complex (HMC)',
          'Automotive & Tractor Assembly Engineer (Millat, Atlas Honda)',
          'CNC Lathe & Milling Programmer',
          'HVAC & Boiler Operations Supervisor',
        ],
        keySubjects: [
          'Workshop Technology & Machining Practice',
          'Thermodynamics & Steam Boilers',
          'Applied Mechanics & Strength of Materials',
          'CNC Programming & CAD/CAM',
          'Fluid Power & Hydraulics',
          'Tool Design & Metallurgy',
        ],
      },
      {
        id: 'dept-cit',
        code: 'CIT',
        name: 'Computer Information Technology (CIT)',
        urduName: 'کمپیوٹر انفارمیشن ٹیکنالوجی',
        degreeType: 'DAE',
        description:
          'Modern diploma in software development, computer networking, web engineering, database architecture, cybersecurity, and hardware maintenance.',
        iconName: 'Cpu',
        headOfDepartment: 'Prof. Naveed Akram (M.S. Computer Science)',
        establishedYear: '2001',
        totalLabs: 4,
        duration: '3 Years (6 Semesters)',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        featured: true,
        totalSeats: 60,
        careerOpportunities: [
          'Network Administrator (CCNA / MikroTik) in ISPs and Telecoms',
          'Full Stack Web & Mobile App Developer',
          'Database & Systems Support Officer in Banking / Corporate',
          'Cybersecurity & IT Infrastructure Specialist',
        ],
        keySubjects: [
          'Programming Fundamentals & OOP (C++, Java, Python)',
          'Database Management Systems (SQL)',
          'Computer Hardware & Operating Systems',
          'Data Communication & Computer Networks',
          'Web Technologies & Web Applications',
          'Information Security & Cloud Essentials',
        ],
      },
      {
        id: 'dept-elec',
        code: 'ELECTRONICS',
        name: 'Electronics Engineering Technology',
        urduName: 'الیکٹرانکس انجینئرنگ ٹیکنالوجی',
        degreeType: 'DAE',
        description:
          'Semiconductor devices, embedded microcontrollers, biomedical instrumentation, telecommunication systems, and modern digital signal electronics.',
        iconName: 'Radio',
        headOfDepartment: 'Engr. Shahbaz Ahmed (B.Sc. Electronics)',
        establishedYear: '2003',
        totalLabs: 3,
        duration: '3 Years (6 Semesters)',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        featured: false,
        totalSeats: 60,
        careerOpportunities: [
          'Telecom & Fiber Optics Engineer in PTCL, Jazz, Zong',
          'Biomedical Equipment Technician in Hospitals',
          'Embedded IoT System Developer',
        ],
        keySubjects: [
          'Basic & Digital Electronics',
          'Microprocessors & Microcontrollers (Arduino, ARM)',
          'Communication Systems & Wireless Networks',
          'Industrial Instrumentation & Sensors',
        ],
      },
    ],
    courses: [
      {
        id: 'crs-01',
        departmentId: 'dept-civ',
        departmentName: 'Civil Engineering Technology',
        title: 'DAE in Civil Technology (PBTE Approved)',
        code: 'DAE-CIV-100',
        degreeType: 'DAE',
        durationYears: '3 Years',
        semestersCount: 6,
        eligibility: 'Matriculation with Science (Physics, Chemistry, Math) with minimum 45% marks.',
        description:
          'Full 3-year associate engineering program focused on planning, building estimation, computerized drafting, highway construction, and site supervision.',
        feePerSemester: 'Rs. 18,500 (Scholarships Available for Merit Students)',
        admissionOpen: true,
        syllabus: [
          'Year 1: Applied Chemistry, Applied Physics, Applied Math-I, Civil Drafting-I, Surveying-I',
          'Year 2: Applied Math-II, Civil Drafting-II, Surveying-II, Building Materials & Construction, Quantity Surveying',
          'Year 3: Applied Math-III, Hydraulics & Irrigation, Concrete Technology, Highway & Bridges, Project Estimation',
        ],
        practicalLabs: [
          'Advanced Total Station & GPS Surveying Lab',
          'Concrete Compression Testing & Soil Mechanics Lab',
          'Computer Aided Civil Drafting (AutoCAD/Civil3D) Lab',
          'Public Health & Fluid Mechanics Workshop',
        ],
      },
      {
        id: 'crs-02',
        departmentId: 'dept-ele',
        departmentName: 'Electrical Engineering Technology',
        title: 'DAE in Electrical Technology (PBTE Approved)',
        code: 'DAE-ELE-200',
        degreeType: 'DAE',
        durationYears: '3 Years',
        semestersCount: 6,
        eligibility: 'Matric with Science (Math, Physics, Chemistry) or TSC Certificate.',
        description:
          'Practical training covering power generation, transformer winding, industrial motor controllers, solar PV sizing, and micro-grid architecture.',
        feePerSemester: 'Rs. 18,500 (Installment Options Available)',
        admissionOpen: true,
        syllabus: [
          'Year 1: Basic Electrical Principles, Electronics-I, Applied Math-I, Workshop Practice (Wiring & Soldering)',
          'Year 2: AC Circuits, DC Machines & Transformers, Electronics-II, Electrical Instruments & Measurements',
          'Year 3: AC Machines, Power Plants & Transmission, Switchgear Protection, Industrial Electronics & PLC',
        ],
        practicalLabs: [
          'AC/DC Heavy Machinery & Motor Testing Lab',
          'High Voltage & Transformer Testing Bay',
          'PLC Automation & SCADA Simulator Center',
          'Domestic & Industrial Wiring Workshop',
        ],
      },
      {
        id: 'crs-03',
        departmentId: 'dept-mec',
        departmentName: 'Mechanical Engineering Technology',
        title: 'DAE in Mechanical Technology (PBTE Approved)',
        code: 'DAE-MEC-300',
        degreeType: 'DAE',
        durationYears: '3 Years',
        semestersCount: 6,
        eligibility: 'Matriculation Science (Maths & Sciences)',
        description:
          'Precision machining, workshop practice, metallurgy, thermodynamics, boiler maintenance, and CNC manufacturing skills.',
        feePerSemester: 'Rs. 18,500',
        admissionOpen: true,
        syllabus: [
          'Year 1: Applied Mechanics, Engineering Drawing, Machine Shop Practice, Foundry & Welding Practice',
          'Year 2: Metallurgy, Thermodynamics, Machine Design & Drafting, Heat Engines',
          'Year 3: Fluid Mechanics, Hydraulics & Pneumatics, CNC Programming, Plant Maintenance & Safety',
        ],
        practicalLabs: [
          'CNC Lathe & CNC Milling Workshop',
          'Arc, TIG/MIG Welding & Metal Fabrication Bay',
          'Material Strength & Hardness Testing Lab',
          'Refrigeration & Air Conditioning (RAC) Lab',
        ],
      },
      {
        id: 'crs-04',
        departmentId: 'dept-cit',
        departmentName: 'Computer Information Technology (CIT)',
        title: 'DAE in Computer Information Technology',
        code: 'DAE-CIT-400',
        degreeType: 'DAE',
        durationYears: '3 Years',
        semestersCount: 6,
        eligibility: 'Matric with Science or Computer Science (Min 45% marks)',
        description:
          'Full-stack programming, enterprise networking, Linux systems administration, cloud infrastructure, and database engineering.',
        feePerSemester: 'Rs. 19,500',
        admissionOpen: true,
        syllabus: [
          'Year 1: Computing Fundamentals, C++ Programming, Digital Logic Design, Electronics Fundamentals',
          'Year 2: Data Structures, Web Development (HTML/CSS/JS/Node), Computer Networks & Routing (Cisco)',
          'Year 3: Database Management Systems, Linux Administration, Information Security, Capstone Project',
        ],
        practicalLabs: [
          'Core i7 High-Speed Software Development Lab',
          'Cisco Networking & Server Infrastructure Lab',
          'Cybersecurity & Hardware Troubleshooting Room',
        ],
      },
    ],
    teachers: [
      {
        id: 'tea-01',
        name: 'Engr. Muhammad Tariq Jamil',
        designation: 'Head of Civil Engineering Department & Principal',
        department: 'Civil Engineering Technology',
        qualification: 'M.Sc. Structural Engineering (UET Lahore)',
        experience: '28 Years Industry & Academic Experience',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        subjects: ['Advanced Surveying', 'Structural Concrete', 'Civil Drafting'],
        isPublic: true,
        status: 'Active',
        email: 'engr.tariq@jinnahpolytechnic.edu.pk',
        phone: '+92 300 7654320',
        joinedYear: '1995',
        bio: 'Founding faculty member of Jinnah Polytechnic. Experienced civil engineering consultant on major motorway and water drainage projects in Punjab.',
      },
      {
        id: 'tea-02',
        name: 'Engr. Kamran Asghar',
        designation: 'Head of Electrical Engineering Department',
        department: 'Electrical Engineering Technology',
        qualification: 'B.Sc. Electrical Engineering (UET), PMP Certified',
        experience: '18 Years Teaching & Power Generation',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        subjects: ['AC Machines', 'Power Transmission', 'PLC Automation'],
        isPublic: true,
        status: 'Active',
        email: 'engr.kamran@jinnahpolytechnic.edu.pk',
        phone: '+92 321 8765431',
        joinedYear: '2005',
        bio: 'Specialist in industrial switchgear, motor rewindings, and photovoltaic grid-tie systems.',
      },
      {
        id: 'tea-03',
        name: 'Engr. Zafar Iqbal',
        designation: 'Head of Mechanical Technology',
        department: 'Mechanical Engineering Technology',
        qualification: 'B.Sc. Mechanical Engineering (NUST)',
        experience: '20 Years Manufacturing & Heavy Machining',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
        subjects: ['CNC Machining', 'Thermodynamics', 'Machine Design'],
        isPublic: true,
        status: 'Active',
        email: 'engr.zafar@jinnahpolytechnic.edu.pk',
        phone: '+92 333 4567890',
        joinedYear: '2002',
        bio: 'Expert in precision tool manufacturing, foundry techniques, and hydraulic automation systems.',
      },
      {
        id: 'tea-04',
        name: 'Prof. Naveed Akram',
        designation: 'Head of CIT Department',
        department: 'Computer Information Technology (CIT)',
        qualification: 'M.S. Computer Science (FAST-NUCES)',
        experience: '14 Years Software Architecture & Systems',
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
        subjects: ['Database Systems', 'Network Routing', 'Web Technologies'],
        isPublic: true,
        status: 'Active',
        email: 'prof.naveed@jinnahpolytechnic.edu.pk',
        phone: '+92 345 6789012',
        joinedYear: '2010',
        bio: 'Cisco Certified Academy Instructor and software architect guiding final year industrial projects.',
      },
    ],
    students: [
      {
        id: 'stu-01',
        rollNumber: 'JPC-2024-CIV-101',
        registrationNumber: 'PBTE-2024-FSD-90142',
        name: 'Ali Raza',
        fatherName: 'Muhammad Akram',
        cnic: '33100-1234567-1',
        email: 'student.ali@jinnahpolytechnic.edu.pk',
        phone: '+92 301 2345678',
        department: 'Civil Engineering Technology',
        technology: 'DAE Civil Technology',
        currentSemester: '3rd Semester (2nd Year)',
        session: '2024-2027',
        admissionDate: '2024-09-01',
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        status: 'Active',
      },
      {
        id: 'stu-02',
        rollNumber: 'JPC-2024-ELE-202',
        registrationNumber: 'PBTE-2024-FSD-90185',
        name: 'Hamza Bilal',
        fatherName: 'Bilal Ahmad',
        cnic: '33100-7654321-3',
        email: 'student.hamza@jinnahpolytechnic.edu.pk',
        phone: '+92 302 3456789',
        department: 'Electrical Engineering Technology',
        technology: 'DAE Electrical Technology',
        currentSemester: '3rd Semester (2nd Year)',
        session: '2024-2027',
        admissionDate: '2024-09-01',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        status: 'Active',
      },
      {
        id: 'stu-03',
        rollNumber: 'JPC-2023-MEC-303',
        registrationNumber: 'PBTE-2023-FSD-80511',
        name: 'Usman Farooq',
        fatherName: 'Farooq Sultan',
        cnic: '33100-9988776-5',
        email: 'usman.farooq@student.jpc.edu.pk',
        phone: '+92 303 4567890',
        department: 'Mechanical Engineering Technology',
        technology: 'DAE Mechanical Technology',
        currentSemester: '5th Semester (3rd Year)',
        session: '2023-2026',
        admissionDate: '2023-09-01',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        status: 'Active',
      },
      {
        id: 'stu-04',
        rollNumber: 'JPC-2024-CIT-404',
        registrationNumber: 'PBTE-2024-FSD-90299',
        name: 'Zainab Fatima',
        fatherName: 'Muhammad Tariq',
        cnic: '33100-5544332-6',
        email: 'zainab.fatima@student.jpc.edu.pk',
        phone: '+92 304 5678901',
        department: 'Computer Information Technology (CIT)',
        technology: 'DAE Computer Information Technology',
        currentSemester: '3rd Semester (2nd Year)',
        session: '2024-2027',
        admissionDate: '2024-09-01',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        status: 'Active',
      },
    ],
    results: [
      {
        id: 'res-01',
        studentId: 'stu-01',
        rollNumber: 'JPC-2024-CIV-101',
        registrationNumber: 'PBTE-2024-FSD-90142',
        studentName: 'Ali Raza',
        fatherName: 'Muhammad Akram',
        examination: 'PBTE DAE First Year 2nd Semester Annual Examination 2025',
        academicYear: '2024-2025',
        semester: '2nd Semester',
        department: 'Civil Engineering Technology',
        technology: 'DAE Civil Technology',
        subjects: [
          { subjectCode: 'GEN-111', subjectName: 'Islamiat & Pakistan Studies', totalMarks: 50, obtainedMarks: 44, grade: 'A+', status: 'Pass' },
          { subjectCode: 'MATH-113', subjectName: 'Applied Mathematics-I', totalMarks: 100, obtainedMarks: 88, grade: 'A+', status: 'Pass' },
          { subjectCode: 'PHY-122', subjectName: 'Applied Physics', totalMarks: 100, obtainedMarks: 84, grade: 'A', status: 'Pass' },
          { subjectCode: 'CH-112', subjectName: 'Applied Chemistry', totalMarks: 100, obtainedMarks: 82, grade: 'A', status: 'Pass' },
          { subjectCode: 'CIV-104', subjectName: 'Civil Drafting & Surveying Practical', totalMarks: 150, obtainedMarks: 138, grade: 'A+', status: 'Pass' },
        ],
        totalMarks: 500,
        obtainedMarks: 436,
        percentage: 87.2,
        gpa: '3.88',
        overallGrade: 'A+ (Distinction)',
        resultStatus: 'Passed',
        issueDate: '2025-08-15',
        isPublished: true,
        remarks: 'Excellent practical and theoretical performance.',
      },
      {
        id: 'res-02',
        studentId: 'stu-02',
        rollNumber: 'JPC-2024-ELE-202',
        registrationNumber: 'PBTE-2024-FSD-90185',
        studentName: 'Hamza Bilal',
        fatherName: 'Bilal Ahmad',
        examination: 'PBTE DAE First Year 2nd Semester Annual Examination 2025',
        academicYear: '2024-2025',
        semester: '2nd Semester',
        department: 'Electrical Engineering Technology',
        technology: 'DAE Electrical Technology',
        subjects: [
          { subjectCode: 'GEN-111', subjectName: 'Islamiat & Pak Studies', totalMarks: 50, obtainedMarks: 42, grade: 'A', status: 'Pass' },
          { subjectCode: 'MATH-113', subjectName: 'Applied Mathematics-I', totalMarks: 100, obtainedMarks: 81, grade: 'A', status: 'Pass' },
          { subjectCode: 'PHY-122', subjectName: 'Applied Physics', totalMarks: 100, obtainedMarks: 79, grade: 'B+', status: 'Pass' },
          { subjectCode: 'ET-115', subjectName: 'Principles of Electrical Engineering', totalMarks: 150, obtainedMarks: 129, grade: 'A', status: 'Pass' },
          { subjectCode: 'ET-121', subjectName: 'Basic Electrical Wiring Lab Practice', totalMarks: 100, obtainedMarks: 91, grade: 'A+', status: 'Pass' },
        ],
        totalMarks: 500,
        obtainedMarks: 422,
        percentage: 84.4,
        gpa: '3.75',
        overallGrade: 'A (First Division)',
        resultStatus: 'Passed',
        issueDate: '2025-08-15',
        isPublished: true,
        remarks: 'Cleared all theoretical and workshop modules.',
      },
    ],
    attendance: [
      {
        id: 'att-01',
        date: '2026-09-20',
        department: 'Civil Engineering Technology',
        technology: 'DAE Civil Technology',
        semester: '3rd Semester',
        subject: 'Advanced Surveying & Total Station (CIV-203)',
        teacherId: 'tea-01',
        teacherName: 'Engr. Tariq Jamil',
        studentId: 'stu-01',
        rollNumber: 'JPC-2024-CIV-101',
        studentName: 'Ali Raza',
        status: 'Present',
      },
      {
        id: 'att-02',
        date: '2026-09-21',
        department: 'Civil Engineering Technology',
        technology: 'DAE Civil Technology',
        semester: '3rd Semester',
        subject: 'Advanced Surveying & Total Station (CIV-203)',
        teacherId: 'tea-01',
        teacherName: 'Engr. Tariq Jamil',
        studentId: 'stu-01',
        rollNumber: 'JPC-2024-CIV-101',
        studentName: 'Ali Raza',
        status: 'Present',
      },
      {
        id: 'att-03',
        date: '2026-09-21',
        department: 'Electrical Engineering Technology',
        technology: 'DAE Electrical Technology',
        semester: '3rd Semester',
        subject: 'AC Machines & Transformers (ET-213)',
        teacherId: 'tea-02',
        teacherName: 'Engr. Kamran Asghar',
        studentId: 'stu-02',
        rollNumber: 'JPC-2024-ELE-202',
        studentName: 'Hamza Bilal',
        status: 'Present',
      },
    ],
    events: [
      {
        id: 'evt-01',
        title: '30th Annual Engineering Project & Robotics Exhibition 2026',
        category: 'Exhibition',
        date: '2026-10-15',
        time: '09:30 AM - 04:00 PM',
        location: 'JPC Main Auditorium & Heavy Machinery Hall',
        posterUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        photos: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        ],
        description:
          'Annual project showcase where final year students from Civil, Electrical, Mechanical, and CIT departments display innovative live engineering projects evaluated by industrial CEOs and PBTE chief engineers.',
        isPublished: true,
        targetAudience: 'Public, Students, Industrial Representatives',
        featured: true,
      },
      {
        id: 'evt-02',
        title: 'Industrial Automation & PLC Technical Workshop',
        category: 'Workshops',
        date: '2026-10-02',
        time: '10:00 AM - 01:30 PM',
        location: 'Siemens Automation Lab 3',
        posterUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
        photos: [],
        description: 'Hands-on masterclass in SCADA integration, Siemens S7-1200 ladder logic, and industrial motor drives.',
        isPublished: true,
        targetAudience: 'Electrical & Electronics Students',
        featured: true,
      },
      {
        id: 'evt-03',
        title: 'Annual Sports Gala & Inter-Department Tournament',
        category: 'Sports',
        date: '2026-11-10',
        time: '08:30 AM - 05:00 PM',
        location: 'College Sports Grounds',
        posterUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        photos: [],
        description: 'Cricket, Football, Badminton, Table Tennis, and Athletics competitions between departments.',
        isPublished: true,
        targetAudience: 'All Students & Faculty',
        featured: false,
      },
    ],
    albums: [
      {
        id: 'alb-01',
        name: 'Modern Laboratories & Workshops',
        category: 'Laboratories',
        coverImageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        description: 'Equipped with CNC machinery, high-voltage transformers, digital total stations, and modern test equipment.',
        date: '2026-09-01',
        isPublished: true,
        imagesCount: 6,
      },
      {
        id: 'alb-02',
        name: 'Campus Infrastructure & Green Lawns',
        category: 'Campus',
        coverImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
        description: 'Purpose-built academic blocks, library, auditorium, and botanical walkways.',
        date: '2026-08-20',
        isPublished: true,
        imagesCount: 5,
      },
      {
        id: 'alb-03',
        name: 'Technical Projects & Exhibitions',
        category: 'Student Activities',
        coverImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        description: 'Civil structural models, automated robotics, and electrical smart grid projects by our students.',
        date: '2026-05-15',
        isPublished: true,
        imagesCount: 4,
      },
    ],
    galleryImages: [
      {
        id: 'img-01',
        albumId: 'alb-01',
        albumName: 'Modern Laboratories & Workshops',
        title: 'CNC Lathe & Precision Milling Bay',
        caption: 'Students practicing high-tolerance metal turning in the Mechanical Department.',
        altText: 'Mechanical Engineering Workshop with Lathe Machinery',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
        date: '2026-09-01',
        isPublished: true,
        displayOrder: 1,
      },
      {
        id: 'img-02',
        albumId: 'alb-01',
        albumName: 'Modern Laboratories & Workshops',
        title: 'Electrical Machines & Transformer Test Lab',
        caption: 'Three-phase motor synchronization and power factor correction testing.',
        altText: 'Electrical Engineering Laboratory',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
        date: '2026-09-01',
        isPublished: true,
        displayOrder: 2,
      },
      {
        id: 'img-03',
        albumId: 'alb-01',
        albumName: 'Modern Laboratories & Workshops',
        title: 'Digital Total Station Civil Surveying',
        caption: 'Civil engineering students performing topographic mapping on campus grounds.',
        altText: 'Civil Surveying with Electronic Total Station',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?auto=format&fit=crop&w=1000&q=80',
        date: '2026-09-01',
        isPublished: true,
        displayOrder: 3,
      },
      {
        id: 'img-04',
        albumId: 'alb-02',
        albumName: 'Campus Infrastructure & Green Lawns',
        title: 'Main Academic Block & Clock Tower',
        caption: 'Spacious campus designed for theoretical learning and practical engineering.',
        altText: 'JPC College Main Academic Block',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80',
        date: '2026-08-20',
        isPublished: true,
        displayOrder: 1,
      },
      {
        id: 'img-05',
        albumId: 'alb-02',
        albumName: 'Campus Infrastructure & Green Lawns',
        title: 'Central Engineering Library & Digital Archive',
        caption: 'Over 15,000 engineering handbooks, PBTE past papers, and international technical journals.',
        altText: 'Engineering Library at JPC',
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80',
        date: '2026-08-20',
        isPublished: true,
        displayOrder: 2,
      },
    ],
    videos: [
      {
        id: 'vid-01',
        title: 'JPC Campus Tour & 30 Years Journey Documentary (1995-2025)',
        category: 'Campus Tour',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
        description: 'Explore the modern labs, machine workshops, faculty members, and student life at JPC Faisalabad.',
        duration: '6:45',
        isPublished: true,
        uploadDate: '2026-08-10',
      },
      {
        id: 'vid-02',
        title: 'Electrical Power Distribution & Substation Demonstration',
        category: 'Lab Demonstrations',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        description: 'Practical demonstration of relay testing and circuit breaker trip sequences in our power lab.',
        duration: '8:20',
        isPublished: true,
        uploadDate: '2026-07-25',
      },
    ],
    notices: [
      {
        id: 'not-01',
        title: 'DAE 1st Year Admissions 2024-2027 Schedule & Fee Concession Criteria',
        category: 'Admissions',
        content:
          'Admissions are now open for 3-Year DAE in Civil, Electrical, Mechanical, and CIT technologies. Merit scholarships are available for students securing 75%+ marks in Matric Science. Prospectus and admission forms are available at the admission counter.',
        date: '2026-09-18',
        expiryDate: '2026-10-31',
        priority: 'Urgent_Marquee',
        targetAudience: 'All',
        fileName: 'Admission_Schedule_2024_2027.pdf',
        isPublished: true,
      },
      {
        id: 'not-02',
        title: 'PBTE 2nd Annual Examination 2026 Form Submission Deadline',
        category: 'Exams',
        content:
          'All students with supplementary or fresh examination entries must submit their PBTE examination admission forms along with original fee deposit slips by 5th October 2026 without late fee.',
        date: '2026-09-15',
        expiryDate: '2026-10-10',
        priority: 'High',
        targetAudience: 'Students',
        fileName: 'PBTE_Exam_Circular_2026.pdf',
        isPublished: true,
      },
      {
        id: 'not-03',
        title: 'Orientation Ceremony for Newly Enrolled 1st Year Diploma Students',
        category: 'Academic',
        content:
          'The official orientation session and workshop safety guidelines briefing will be held on Monday at 09:00 AM in the Main College Auditorium. Uniform and ID cards are mandatory.',
        date: '2026-09-10',
        expiryDate: '2026-10-01',
        priority: 'Normal',
        targetAudience: 'Students',
        isPublished: true,
      },
    ],
    documents: [
      {
        id: 'doc-01',
        title: 'Official College Prospectus & Admission Guide',
        category: 'Prospectus',
        description: 'Complete curriculum outlines, rules, lab details, and fee schedules for all DAE diploma technologies.',
        fileUrl: '#download-prospectus',
        fileSize: '4.8 MB',
        uploadDate: '2026-09-01',
        isPublic: true,
        targetRole: 'All',
      },
      {
        id: 'doc-02',
        title: 'DAE Admission Application Form (Printable)',
        category: 'Admission',
        description: 'Fillable admission registration form for session 2024-2027.',
        fileUrl: '#download-admission-form',
        fileSize: '1.2 MB',
        uploadDate: '2026-09-01',
        isPublic: true,
        targetRole: 'All',
      },
      {
        id: 'doc-03',
        title: 'PBTE Academic Calendar & Examination Schedule',
        category: 'Academic_Calendar',
        description: 'Approved annual academic calendar detailing term exams, practical weeks, and gazetted holidays.',
        fileUrl: '#download-academic-calendar',
        fileSize: '850 KB',
        uploadDate: '2026-08-28',
        isPublic: true,
        targetRole: 'All',
      },
    ],
    auditLogs: [
      {
        id: 'aud-01',
        timestamp: new Date('2026-09-21T10:00:00Z').toISOString(),
        actorId: 'usr-admin-01',
        actorName: 'Super Administrator',
        actorRole: 'SUPER_ADMIN',
        action: 'COLLEGE_SETTINGS_UPDATED',
        category: 'Branding & Settings',
        details: 'Updated admissions urgent ticker and verified PBTE accreditation status.',
        ipAddress: '127.0.0.1',
      },
      {
        id: 'aud-02',
        timestamp: new Date('2026-09-20T14:30:00Z').toISOString(),
        actorId: 'usr-admin-01',
        actorName: 'Super Administrator',
        actorRole: 'SUPER_ADMIN',
        action: 'RESULTS_PUBLISHED',
        category: 'Examination Results',
        details: 'Published PBTE DAE 2nd Semester Annual Examination results for session 2024-2027.',
        ipAddress: '127.0.0.1',
      },
    ],
    inquiries: [
      {
        id: 'inq-01',
        name: 'Saad Abdullah',
        email: 'saad.abdullah99@gmail.com',
        phone: '+92 321 9988776',
        subject: 'Inquiry regarding DAE Civil evening shift and hostel facility',
        message: 'Respected admin, what is the eligibility and hostel accommodation charges for Civil technology?',
        technologyInterest: 'Civil Engineering Technology',
        date: '2026-09-21T08:15:00Z',
        status: 'Unread',
      },
    ],
    securitySettings: {
      twoFactorRequiredForAdmin: true,
      sessionTimeoutMinutes: 60,
      maxLoginAttempts: 5,
      lastPasswordChangedDate: '2026-09-01',
      adminTwoFactorPinSet: true,
    },
  };
}

class Database {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = getInitialDatabase();
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...getInitialDatabase(), ...parsed };
        if (!this.data.adminConfig) {
          this.data.adminConfig = getInitialDatabase().adminConfig;
          this.save();
        }
        this.isLoaded = true;
      } else {
        this.save();
        this.isLoaded = true;
      }
    } catch (err) {
      console.error('Error loading database, resetting to defaults:', err);
      this.data = getInitialDatabase();
      this.save();
      this.isLoaded = true;
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public getAdminConfig(): AdminConfig {
    return this.data.adminConfig;
  }

  public claimSuperAdmin(params: {
    userId: string;
    googleSub: string;
    email: string;
    name?: string;
  }): { success: boolean; config?: AdminConfig; error?: string } {
    // Atomic check: If already claimed, reject permanently
    if (this.data.adminConfig && this.data.adminConfig.is_claimed) {
      return {
        success: false,
        error: 'Forbidden: Super Admin has already been claimed permanently. Second admin creation is strictly forbidden.',
      };
    }

    const cleanEmail = params.email.trim().toLowerCase();
    this.data.adminConfig = {
      id: 'global_admin_config',
      admin_user_id: params.userId,
      admin_google_sub: params.googleSub || `google-sub-${Date.now()}`,
      admin_email: cleanEmail,
      admin_name: params.name || 'Super Administrator',
      admin_claimed_at: new Date().toISOString(),
      is_claimed: true,
    };

    // Ensure user record exists and has SUPER_ADMIN role
    let adminUser = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!adminUser) {
      adminUser = {
        id: params.userId,
        email: cleanEmail,
        name: params.name || 'Super Administrator',
        role: 'SUPER_ADMIN',
        status: 'Active',
        isTwoFactorEnabled: false,
        twoFactorPin: '199500',
        createdAt: new Date().toISOString(),
        passwordHash: bcrypt.hashSync('Admin@Jina1995#', 10),
      };
      this.data.users.push(adminUser);
    } else {
      adminUser.role = 'SUPER_ADMIN';
      adminUser.status = 'Active';
    }

    this.save();
    return { success: true, config: this.data.adminConfig };
  }

  public verifyIsSuperAdmin(identifierOrEmail: string, userId?: string): boolean {
    if (!this.data.adminConfig || !this.data.adminConfig.is_claimed) {
      return false;
    }
    const clean = (identifierOrEmail || '').trim().toLowerCase();
    const config = this.data.adminConfig;

    if (clean && clean === config.admin_email.toLowerCase()) {
      return true;
    }
    if (identifierOrEmail && identifierOrEmail === config.admin_google_sub) {
      return true;
    }
    if (userId && userId === config.admin_user_id) {
      return true;
    }

    return false;
  }

  public logAudit(actorId: string, actorName: string, actorRole: any, action: string, category: string, details: string, ipAddress?: string) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId,
      actorName,
      actorRole,
      action,
      category,
      details,
      ipAddress: ipAddress || '127.0.0.1',
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  public getPrincipalProfile(): PrincipalProfile {
    if (!this.data.principalProfile) {
      this.data.principalProfile = getInitialDatabase().principalProfile;
      this.save();
    }
    return this.data.principalProfile;
  }

  public updatePrincipalProfile(profile: Partial<PrincipalProfile>): PrincipalProfile {
    const current = this.getPrincipalProfile();
    this.data.principalProfile = {
      ...current,
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    if (profile.name !== undefined) this.data.settings.principalName = profile.name;
    if (profile.designation !== undefined) this.data.settings.principalTitle = profile.designation;
    if (profile.qualification !== undefined) this.data.settings.principalQualification = profile.qualification;
    if (profile.photoUrl !== undefined) this.data.settings.principalPhotoUrl = profile.photoUrl;

    this.save();
    return this.data.principalProfile;
  }

  public getPrincipalMessages(): PrincipalMessage[] {
    if (!this.data.principalMessages) {
      this.data.principalMessages = getInitialDatabase().principalMessages;
      this.save();
    }
    return this.data.principalMessages.filter((m) => !m.deletedAt);
  }

  public addPrincipalMessage(msgData: Partial<PrincipalMessage>): PrincipalMessage {
    const profile = this.getPrincipalProfile();
    const newMsg: PrincipalMessage = {
      id: `pmsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: msgData.title || 'Principal Message',
      messageBody: msgData.messageBody || '',
      principalName: msgData.principalName || profile.name || 'Engr. Sir Usman',
      principalPhotoUrl: msgData.principalPhotoUrl || profile.photoUrl,
      audienceType: msgData.audienceType || 'ALL_STUDENTS',
      departmentId: msgData.departmentId,
      departmentName: msgData.departmentName,
      programId: msgData.programId,
      programName: msgData.programName,
      semester: msgData.semester,
      className: msgData.className,
      studentId: msgData.studentId,
      studentName: msgData.studentName,
      teacherId: msgData.teacherId,
      teacherName: msgData.teacherName,
      attachmentUrl: msgData.attachmentUrl,
      attachmentName: msgData.attachmentName,
      attachmentType: msgData.attachmentType,
      priority: msgData.priority || 'Normal',
      status: msgData.status || 'PUBLISHED',
      isPublic: msgData.audienceType === 'PUBLIC' || Boolean(msgData.isPublic),
      isPublished: msgData.status === 'PUBLISHED' || msgData.isPublished !== false,
      publishedAt: (msgData.status === 'PUBLISHED' || msgData.isPublished) ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    if (!this.data.principalMessages) {
      this.data.principalMessages = [];
    }
    this.data.principalMessages.unshift(newMsg);
    this.save();
    return newMsg;
  }

  public updatePrincipalMessage(id: string, updates: Partial<PrincipalMessage>): PrincipalMessage | null {
    if (!this.data.principalMessages) {
      this.data.principalMessages = getInitialDatabase().principalMessages;
    }
    const index = this.data.principalMessages.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const current = this.data.principalMessages[index];
    const updatedMsg: PrincipalMessage = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      isPublic: updates.audienceType ? (updates.audienceType === 'PUBLIC') : (updates.isPublic !== undefined ? updates.isPublic : current.isPublic),
      isPublished: updates.status ? (updates.status === 'PUBLISHED') : (updates.isPublished !== undefined ? updates.isPublished : current.isPublished),
    };

    if (updatedMsg.isPublished && !current.isPublished) {
      updatedMsg.publishedAt = new Date().toISOString();
    }

    this.data.principalMessages[index] = updatedMsg;
    this.save();
    return updatedMsg;
  }

  public deletePrincipalMessage(id: string): boolean {
    if (!this.data.principalMessages) return false;
    const index = this.data.principalMessages.findIndex((m) => m.id === id);
    if (index === -1) return false;

    this.data.principalMessages.splice(index, 1);
    this.save();
    return true;
  }
}

export const db = new Database();
