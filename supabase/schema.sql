-- ==============================================================================
-- JINA POLYTECHNIC COLLEGE (SINCE 1995)
-- Production Supabase PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. ENUM TYPES
create type user_role as enum ('SUPER_ADMIN', 'STUDENT', 'TEACHER', 'STAFF', 'PUBLIC_VISITOR');
create type attendance_status as enum ('Present', 'Absent', 'Late', 'Excused');
create type notice_priority as enum ('Normal', 'High', 'Urgent', 'Urgent_Marquee');

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role user_role not null default 'STUDENT',
  full_name text not null,
  avatar_url text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3b. IMMUTABLE SINGLE-OWNER SUPER ADMIN CONFIGURATION
create table if not exists public.admin_config (
  id text primary key default 'global_admin_config',
  admin_user_id text not null,
  admin_google_sub text not null,
  admin_email text not null,
  admin_name text default 'Super Administrator',
  admin_claimed_at timestamptz not null default now(),
  is_claimed boolean not null default true,
  constraint single_admin_row check (id = 'global_admin_config')
);

-- 4. SITE SETTINGS & BRANDING (Only 1 active row managed by SUPER_ADMIN)
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  college_name text not null default 'Jina Polytechnic College',
  tagline text not null default 'SINCE 1995',
  urdu_title text default 'جناح پولی ٹیکنک کالج',
  logo_url text not null,
  favicon_url text,
  principal_name text,
  principal_designation text,
  principal_qualification text,
  principal_photo_url text,
  principal_message text,
  campus_address text,
  primary_phone text,
  primary_email text,
  whatsapp_number text,
  admission_helpline text,
  office_hours text,
  stats jsonb default '{"graduatedStudents": 18500, "yearsOfExcellence": 30, "modernLabs": 24, "employmentRate": 94}'::jsonb,
  section_visibility jsonb default '{"showHeroSlider": true, "showStatsRibbon": true, "showDepartments": true, "showNotices": true, "showEvents": true, "showGallery": true}'::jsonb,
  social_links jsonb default '{"facebook": "", "youtube": "", "linkedin": "", "twitter": ""}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 5. DEPARTMENTS TABLE
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  head_of_department text,
  description text,
  duration text default '3 Years (6 Semesters)',
  total_labs integer default 4,
  total_seats integer default 60,
  image_url text,
  syllabus jsonb default '[]'::jsonb,
  facilities jsonb default '[]'::jsonb,
  career_opportunities jsonb default '[]'::jsonb,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 6. PROGRAMS / COURSES
create table if not exists public.programs (
  id uuid primary key default uuid_generate_v4(),
  department_id uuid references public.departments(id) on delete set null,
  title text not null,
  code text not null,
  degree_level text default 'Diploma of Associate Engineer (DAE)',
  duration_years integer default 3,
  eligibility_criteria text default 'Matriculation with Science (Physics, Chemistry, Math)',
  curriculum_details text,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- 7. SUBJECTS TABLE
create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid references public.programs(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  subject_code text not null,
  subject_name text not null,
  semester integer not null, -- 1 to 6
  theory_hours integer default 2,
  practical_hours integer default 3,
  total_marks integer default 100,
  is_active boolean default true
);

-- 8. TEACHERS TABLE
create table if not exists public.teachers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  employee_id text not null unique,
  full_name text not null,
  email text not null,
  phone text,
  department text not null,
  designation text not null,
  qualification text not null,
  specialization text,
  joining_date date,
  profile_picture text,
  bio text,
  subjects jsonb default '[]'::jsonb,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- 9. STUDENTS TABLE
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null, -- Linked Google User
  roll_number text not null unique,
  registration_number text not null unique,
  full_name text not null,
  father_name text not null,
  mother_name text,
  date_of_birth date,
  gender text default 'Male',
  phone text,
  email text,
  google_email text,
  address text,
  department text not null,
  program text default 'DAE',
  session text not null, -- e.g. '2022-2025'
  current_semester integer not null default 1,
  section text default 'A',
  admission_date date default current_date,
  profile_picture text,
  status text not null default 'Active',
  academic_info jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 10. EXAMS TABLE
create table if not exists public.exams (
  id uuid primary key default uuid_generate_v4(),
  exam_title text not null, -- e.g. "PBTE Annual Examination 2024"
  exam_type text not null,  -- "Annual", "Supplementary", "Midterm"
  academic_year text not null, -- "2024"
  is_published boolean default false,
  publish_date timestamptz,
  created_at timestamptz default now()
);

-- 11. RESULTS TABLE
create table if not exists public.results (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete set null,
  roll_number text not null,
  registration_number text not null,
  student_name text not null,
  department text not null,
  technology text not null,
  semester integer not null,
  exam_title text not null,
  academic_year text not null,
  subjects jsonb not null default '[]'::jsonb, -- Array of { code, name, theoryMarks, practicalMarks, totalMarks, grade }
  total_marks integer not null default 0,
  obtained_marks integer not null default 0,
  percentage numeric(5,2) not null default 0,
  grade text not null,
  gpa numeric(4,2) default 0,
  status text not null default 'Pass', -- 'Pass', 'Fail', 'Supply', 'Withheld'
  remarks text,
  is_published boolean not null default true,
  created_at timestamptz default now()
);

-- 12. ATTENDANCE RECORDS TABLE
create table if not exists public.attendance_records (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  roll_number text not null,
  student_name text not null,
  department text not null,
  semester integer not null,
  date date not null,
  subject text not null,
  teacher_name text,
  status attendance_status not null default 'Present',
  remarks text,
  created_at timestamptz default now()
);

-- 13. EVENTS TABLE
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  date date not null,
  time text,
  location text,
  department text,
  organizer text,
  poster_url text,
  photos jsonb default '[]'::jsonb,
  videos jsonb default '[]'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz default now()
);

-- 14. GALLERY ALBUMS TABLE
create table if not exists public.gallery_albums (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  description text,
  cover_image text,
  is_published boolean not null default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- 15. MEDIA TABLE (Photos & Videos)
create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid references public.gallery_albums(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  description text,
  media_type text not null default 'image', -- 'image' or 'video'
  url text not null,
  thumbnail_url text,
  caption text,
  alt_text text,
  storage_path text,
  is_published boolean not null default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- 16. NOTICES & CIRCULARS TABLE
create table if not exists public.notices (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  category text not null default 'General',
  priority notice_priority not null default 'Normal',
  target_audience text not null default 'All', -- 'All', 'Students', 'Teachers', 'Public'
  date date not null default current_date,
  expiry_date date,
  file_name text,
  file_attachment_url text,
  is_published boolean not null default true,
  created_at timestamptz default now()
);

-- 17. DOCUMENTS TABLE (Public & Private)
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade, -- if student private document
  title text not null,
  category text not null,
  file_name text not null,
  file_url text not null,
  file_size text,
  file_type text,
  is_public boolean not null default false,
  target_role text default 'All',
  created_at timestamptz default now()
);

-- 18. CONTACT NUMBERS & HELPLINES
create table if not exists public.contact_numbers (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  phone_number text not null,
  category text default 'General',
  is_whatsapp boolean default false,
  is_primary boolean default false,
  is_public boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- 19. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null,
  actor_role text not null,
  action text not null,
  category text not null,
  target_resource text,
  details text not null,
  ip_address text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 20. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.departments enable row level security;
alter table public.programs enable row level security;
alter table public.subjects enable row level security;
alter table public.teachers enable row level security;
alter table public.students enable row level security;
alter table public.exams enable row level security;
alter table public.results enable row level security;
alter table public.attendance_records enable row level security;
alter table public.events enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.media enable row level security;
alter table public.notices enable row level security;
alter table public.documents enable row level security;
alter table public.contact_numbers enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admin_config enable row level security;

-- Helper function: Check if current authenticated user is Super Admin
create or replace function public.is_super_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'SUPER_ADMIN' and is_active = true
  );
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------
-- A. SUPER ADMIN POLICIES (Full CRUD everywhere)
-- ----------------------------------------------------
create policy "Super Admin can do all on profiles" on public.profiles for all using (public.is_super_admin());
create policy "Super Admin can do all on site_settings" on public.site_settings for all using (public.is_super_admin());
create policy "Super Admin can do all on departments" on public.departments for all using (public.is_super_admin());
create policy "Super Admin can do all on programs" on public.programs for all using (public.is_super_admin());
create policy "Super Admin can do all on subjects" on public.subjects for all using (public.is_super_admin());
create policy "Super Admin can do all on teachers" on public.teachers for all using (public.is_super_admin());
create policy "Super Admin can do all on students" on public.students for all using (public.is_super_admin());
create policy "Super Admin can do all on exams" on public.exams for all using (public.is_super_admin());
create policy "Super Admin can do all on results" on public.results for all using (public.is_super_admin());
create policy "Super Admin can do all on attendance_records" on public.attendance_records for all using (public.is_super_admin());
create policy "Super Admin can do all on events" on public.events for all using (public.is_super_admin());
create policy "Super Admin can do all on gallery_albums" on public.gallery_albums for all using (public.is_super_admin());
create policy "Super Admin can do all on media" on public.media for all using (public.is_super_admin());
create policy "Super Admin can do all on notices" on public.notices for all using (public.is_super_admin());
create policy "Super Admin can do all on documents" on public.documents for all using (public.is_super_admin());
create policy "Super Admin can do all on contact_numbers" on public.contact_numbers for all using (public.is_super_admin());
create policy "Super Admin can do all on audit_logs" on public.audit_logs for all using (public.is_super_admin());
create policy "Super Admin can do all on admin_config" on public.admin_config for all using (public.is_super_admin());

-- ----------------------------------------------------
-- B. PUBLIC READ-ONLY POLICIES
-- ----------------------------------------------------
create policy "Public can read site_settings" on public.site_settings for select using (true);
create policy "Public can read active departments" on public.departments for select using (is_active = true);
create policy "Public can read published programs" on public.programs for select using (is_published = true);
create policy "Public can read active subjects" on public.subjects for select using (is_active = true);
create policy "Public can read public teachers" on public.teachers for select using (is_public = true);
create policy "Public can read published events" on public.events for select using (is_published = true);
create policy "Public can read published gallery_albums" on public.gallery_albums for select using (is_published = true);
create policy "Public can read published media" on public.media for select using (is_published = true);
create policy "Public can read published notices" on public.notices for select using (is_published = true and (target_audience = 'All' or target_audience = 'Public'));
create policy "Public can read public documents" on public.documents for select using (is_public = true);
create policy "Public can read public contact_numbers" on public.contact_numbers for select using (is_public = true);

-- ----------------------------------------------------
-- C. STUDENT READ-ONLY POLICIES (Only their own records!)
-- ----------------------------------------------------
-- Students can read their own profile
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);

-- Students can read only their own student record
create policy "Student can view own record" on public.students for select using (
  user_id = auth.uid() or
  email = (select email from public.profiles where id = auth.uid()) or
  google_email = (select email from public.profiles where id = auth.uid())
);

-- Students can read only their own results
create policy "Student can view own results" on public.results for select using (
  is_published = true and (
    student_id in (
      select id from public.students
      where user_id = auth.uid() or email = (select email from public.profiles where id = auth.uid())
    )
  )
);

-- Students can read only their own attendance
create policy "Student can view own attendance" on public.attendance_records for select using (
  student_id in (
    select id from public.students
    where user_id = auth.uid() or email = (select email from public.profiles where id = auth.uid())
  )
);

-- Students can read only their own documents or public documents
create policy "Student can view own documents" on public.documents for select using (
  is_public = true or
  student_id in (
    select id from public.students
    where user_id = auth.uid() or email = (select email from public.profiles where id = auth.uid())
  )
);

-- ----------------------------------------------------
-- D. PRINCIPAL PROFILE & PRINCIPAL MESSAGES TABLES & POLICIES
-- ----------------------------------------------------
create table if not exists public.principal_profile (
  id text primary key default 'global_principal_profile',
  name text not null default 'Engr. Sir Usman',
  photo_url text default 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  designation text default 'Principal & Chief Administrator',
  qualification text default 'M.Sc. Civil Engineering (UET), B.Sc. Civil Engg, FIE (Pak)',
  department text default 'Engineering & Institutional Administration',
  experience text default '28+ Years in Technical Education & Industrial Administration',
  joining_date text default '1995-09-01',
  biography text,
  about text,
  vision text,
  mission text,
  message_to_students text,
  message_to_teachers text,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.principal_profile enable row level security;
create policy "Public can read published principal_profile" on public.principal_profile for select using (is_published = true);
create policy "Super Admin full control on principal_profile" on public.principal_profile for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'SUPER_ADMIN')
);

create table if not exists public.principal_messages (
  id uuid primary key default uuid_generate_v4(),
  principal_id text default 'global_principal_profile',
  title text not null,
  message_body text not null,
  principal_name text default 'Engr. Sir Usman',
  principal_photo_url text,
  audience_type text not null default 'ALL_STUDENTS',
  department_id text,
  department_name text,
  program_id text,
  program_name text,
  semester text,
  class_name text,
  student_id text,
  student_name text,
  teacher_id text,
  teacher_name text,
  attachment_url text,
  attachment_name text,
  attachment_type text,
  priority text default 'Normal',
  status text default 'PUBLISHED',
  is_public boolean default false,
  is_published boolean default true,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

alter table public.principal_messages enable row level security;

create policy "Public can view public principal_messages" on public.principal_messages for select using (
  is_published = true and (is_public = true or audience_type = 'PUBLIC') and status = 'PUBLISHED' and deleted_at is null
);

create policy "Super Admin full control on principal_messages" on public.principal_messages for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'SUPER_ADMIN')
);

