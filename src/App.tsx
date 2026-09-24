/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { publicApi } from './lib/api.js';
import {
  CollegeSettings,
  Department,
  Course,
  Teacher,
  Notice,
  CollegeEvent,
  GalleryAlbum,
  GalleryImage,
  PhoneNumber,
  EmailAddress,
  ContactInfo,
} from './types.js';

import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';

// Public Pages
import { HomePage } from './pages/public/HomePage.js';
import { AboutPage } from './pages/public/AboutPage.js';
import { PrincipalPage } from './pages/public/PrincipalPage.js';
import { DepartmentsPage } from './pages/public/DepartmentsPage.js';
import { FacultyPage } from './pages/public/FacultyPage.js';
import { ResultVerificationPage } from './pages/public/ResultVerificationPage.js';
import { EventsPage } from './pages/public/EventsPage.js';
import { GalleryPage } from './pages/public/GalleryPage.js';
import { NoticesPage } from './pages/public/NoticesPage.js';
import { FacilitiesPage } from './pages/public/FacilitiesPage.js';
import { ContactPage } from './pages/public/ContactPage.js';

// Auth Pages
import { AdminLoginPage } from './pages/auth/AdminLoginPage.js';
import { StudentLoginPage } from './pages/auth/StudentLoginPage.js';
import { TeacherLoginPage } from './pages/auth/TeacherLoginPage.js';

// Private Dashboards
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard.js';

const MainApp: React.FC = () => {
  const { user, isSuperAdmin, isStudent, isTeacher } = useAuth();

  // Route State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });

  // Public Datasets
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Teacher[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [emailAddresses, setEmailAddresses] = useState<EmailAddress[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoadingPublic, setIsLoadingPublic] = useState<boolean>(true);

  // Sync hash with route
  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial public website data
  const fetchPublicData = async () => {
    setIsLoadingPublic(true);
    try {
      const [
        setRes,
        deptRes,
        facRes,
        notRes,
        evtRes,
        galRes,
        phoneRes,
        emailRes,
        contactRes,
      ] = await Promise.all([
        publicApi.getSettings(),
        publicApi.getDepartments(),
        publicApi.getFaculty(),
        publicApi.getNotices(),
        publicApi.getEvents(),
        publicApi.getGallery(),
        publicApi.getPhoneNumbers(),
        publicApi.getEmailAddresses(),
        publicApi.getContactInfo(),
      ]);

      setSettings(setRes.settings);
      setDepartments(deptRes.departments || []);
      setCourses(deptRes.courses || []);
      setFaculty(facRes.faculty || []);
      setNotices(notRes.notices || []);
      setEvents(evtRes.events || []);
      setGalleryAlbums(galRes.albums || []);
      setGalleryImages(galRes.images || []);
      setPhoneNumbers(phoneRes.phoneNumbers || []);
      setEmailAddresses(emailRes.emailAddresses || []);
      setContactInfo(contactRes.contactInfo);
    } catch (err) {
      console.error('Failed to load public website data:', err);
    } finally {
      setIsLoadingPublic(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
    const handleUpdate = () => fetchPublicData();
    window.addEventListener('college-data-updated', handleUpdate);
    return () => window.removeEventListener('college-data-updated', handleUpdate);
  }, []);

  // Refetch latest saved data whenever navigating between views
  useEffect(() => {
    fetchPublicData();
  }, [currentRoute]);

  // Fallback defaults if loading
  const safeSettings: CollegeSettings = settings || {
    collegeName: 'Jina Polytechnic College',
    urduName: 'جناح پولی ٹیکنک کالج',
    tagline: 'SINCE 1995',
    sinceYear: '1995',
    logoUrl: '',
    announcementBarEnabled: true,
    announcementText: 'Admissions Open for 2024-2025 DAE Batches. PBTE & TEVTA Approved Programs.',
    vision: 'To be the center of excellence in associate engineering and practical polytechnic education.',
    mission: 'To impart modern, hands-on technical skills and ethical engineering craftsmanship.',
    aboutHistory: 'Established in 1995 in Faisalabad, Jina Polytechnic College has trained thousands of associate engineers.',
  };

  const safeContactInfo: ContactInfo = contactInfo || {
    address: 'Main College Road, Near Technical Board Center, Faisalabad, Punjab, Pakistan',
    postalCode: '38000',
    primaryPhone: '0300-1234567',
    primaryEmail: 'info@jpc.edu.pk',
    admissionsHelpline: '0321-9876543',
    examinationOffice: '(041) 876-5432',
    officeHours: 'Mon - Sat: 8:00 AM - 3:00 PM',
  };

  // Admin Portal Access Guard
  if (
    currentRoute === 'admin-dashboard' ||
    currentRoute === 'admin-login' ||
    currentRoute === 'secure-admin' ||
    currentRoute === 'private-admin-panel'
  ) {
    if (isSuperAdmin) {
      return <AdminDashboard onNavigate={navigate} />;
    }
    return <AdminLoginPage settings={safeSettings} onNavigate={navigate} />;
  }

  // Redirect legacy student/teacher routes to home
  if (
    currentRoute === 'student-login' ||
    currentRoute === 'teacher-login' ||
    currentRoute === 'student-dashboard' ||
    currentRoute === 'teacher-dashboard'
  ) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Header
          settings={safeSettings}
          currentRoute="home"
          onNavigate={navigate}
          phoneNumbers={phoneNumbers}
          emailAddresses={emailAddresses}
        />
        <main className="flex-1">
          <HomePage
            settings={safeSettings}
            departments={departments}
            notices={notices}
            events={events}
            onNavigate={navigate}
          />
        </main>
        <Footer
          settings={safeSettings}
          contactInfo={safeContactInfo}
          phoneNumbers={phoneNumbers}
          emailAddresses={emailAddresses}
          onNavigate={navigate}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <Header
        settings={safeSettings}
        currentRoute={currentRoute}
        onNavigate={navigate}
        phoneNumbers={phoneNumbers}
        emailAddresses={emailAddresses}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage
            settings={safeSettings}
            departments={departments}
            notices={notices}
            events={events}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'about' && (
          <AboutPage settings={safeSettings} onNavigate={navigate} />
        )}

        {currentRoute === 'principal' && (
          <PrincipalPage onNavigate={navigate} />
        )}

        {currentRoute === 'departments' && (
          <DepartmentsPage
            departments={departments}
            courses={courses}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'faculty' && <FacultyPage faculty={faculty} />}

        {currentRoute === 'results' && (
          <ResultVerificationPage settings={safeSettings} />
        )}

        {currentRoute === 'events' && <EventsPage events={events} />}

        {currentRoute === 'gallery' && (
          <GalleryPage albums={galleryAlbums} images={galleryImages} />
        )}

        {currentRoute === 'notices' && <NoticesPage notices={notices} />}

        {currentRoute === 'facilities' && <FacilitiesPage />}

        {currentRoute === 'contact' && (
          <ContactPage
            contactInfo={safeContactInfo}
            phoneNumbers={phoneNumbers}
            emailAddresses={emailAddresses}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        settings={safeSettings}
        contactInfo={safeContactInfo}
        phoneNumbers={phoneNumbers}
        emailAddresses={emailAddresses}
        onNavigate={navigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
