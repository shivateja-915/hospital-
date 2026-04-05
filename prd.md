================================================================================
PRODUCT REQUIREMENTS DOCUMENT (PRD)
Hospital Appointment Booking Web Application
Version 1.0
================================================================================

--------------------------------------------------------------------------------
TECH STACK
--------------------------------------------------------------------------------

Frontend        : Next.js 14 (App Router)
Styling         : Tailwind CSS
Backend         : Supabase (PostgreSQL database + Auth + Storage)
Authentication  : Supabase Auth (Google OAuth + Email/Password)
Email Alerts    : Supabase Edge Functions + Resend (free tier)
Deployment      : Vercel (free tier)
Language        : JavaScript (no TypeScript, keeps it simple for beginners)

--------------------------------------------------------------------------------
PROJECT OVERVIEW
--------------------------------------------------------------------------------

Name            : MediBook (or choose your own name)
Goal            : A web app where patients can find doctors and book appointments,
                  and doctors can manage their schedule and appointments.
Users           : Two types — Patients and Doctors
Authentication  : Single login page, user selects role during registration

--------------------------------------------------------------------------------
ROLE SELECTION (REGISTRATION ENTRY POINT)
--------------------------------------------------------------------------------

When a new user visits the site, they see a "Who are you?" screen with two options:
  - I am a Patient
  - I am a Doctor

Based on selection, they are taken to the correct registration form.
After login, the app checks the user role from the database and redirects:
  - Patient -> /patient/dashboard
  - Doctor  -> /doctor/dashboard

--------------------------------------------------------------------------------
TECH STACK EXPLANATION (SIMPLE)
--------------------------------------------------------------------------------

Next.js 14     : This is your frontend framework. It handles all your pages
                 and routing. Think of it as the skeleton of your website.

Tailwind CSS   : This helps you style your pages quickly using simple class
                 names directly in your HTML. No separate CSS files needed.

Supabase       : This is your entire backend. It gives you:
                 - A PostgreSQL database to store all your data
                 - Authentication (login/signup) out of the box
                 - Storage for doctor profile photos
                 - No need to build a separate backend server

Vercel         : This is where you deploy (host) your Next.js app for free.
                 Connect your GitHub repo and it auto-deploys on every push.

Resend         : A free email service to send confirmation and reminder emails.

--------------------------------------------------------------------------------
DATABASE SCHEMA (SUPABASE TABLES)
--------------------------------------------------------------------------------

TABLE: users
  id              uuid PRIMARY KEY (auto by Supabase Auth)
  email           text NOT NULL
  full_name       text
  role            text NOT NULL  -- values: 'patient' or 'doctor'
  created_at      timestamp DEFAULT now()

TABLE: patients
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id         uuid REFERENCES users(id)
  age             integer
  gender          text
  blood_group     text
  phone           text
  created_at      timestamp DEFAULT now()

TABLE: doctors
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id         uuid REFERENCES users(id)
  specialization  text
  experience_years integer
  consultation_fee integer
  bio             text
  photo_url       text
  license_number  text
  is_active       boolean DEFAULT true
  created_at      timestamp DEFAULT now()

TABLE: availability
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  doctor_id       uuid REFERENCES doctors(id)
  day_of_week     text   -- values: 'Monday', 'Tuesday', etc.
  start_time      time
  end_time        time
  slot_duration   integer DEFAULT 30  -- in minutes

TABLE: appointments
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  patient_id      uuid REFERENCES patients(id)
  doctor_id       uuid REFERENCES doctors(id)
  appointment_date date
  appointment_time time
  reason          text
  status          text DEFAULT 'pending'
                  -- values: 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
  created_at      timestamp DEFAULT now()

TABLE: reviews
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  appointment_id  uuid REFERENCES appointments(id)
  patient_id      uuid REFERENCES patients(id)
  doctor_id       uuid REFERENCES doctors(id)
  rating          integer  -- 1 to 5
  comment         text
  created_at      timestamp DEFAULT now()

--------------------------------------------------------------------------------
PAGES & ROUTES
--------------------------------------------------------------------------------

PUBLIC PAGES (no login needed)
  /                        Landing page with app intro and call to action
  /register                Role selection screen (Patient or Doctor)
  /register/patient        Patient registration form
  /register/doctor         Doctor registration form
  /login                   Login page (email or Google)

PATIENT PAGES (login required, role = patient)
  /patient/dashboard       Welcome screen, upcoming appointments summary
  /patient/profile         View and edit basic profile
  /patient/doctors         Browse and search all doctors
  /patient/doctors/[id]    Doctor profile with available slots
  /patient/book/[id]       Booking form (date, slot, reason)
  /patient/book/confirm    Booking confirmation screen
  /patient/appointments    List of upcoming and past appointments
  /patient/appointments/[id]  Appointment detail + cancel/reschedule option
  /patient/review/[id]     Leave rating and review after appointment

DOCTOR PAGES (login required, role = doctor)
  /doctor/dashboard        Stats + today's appointments + upcoming list
  /doctor/profile          Edit profile, bio, fee, photo
  /doctor/availability     Set weekly working days and time slots
  /doctor/appointments     All appointments (upcoming + past)
  /doctor/appointments/[id]  Appointment detail, accept/reject, mark complete
  /doctor/reviews          View all patient reviews and ratings

--------------------------------------------------------------------------------
FEATURE DETAILS — PATIENT SIDE
--------------------------------------------------------------------------------

ONBOARDING
  - User visits /register and picks "I am a Patient"
  - Fills form: full name, email, password (or Google signup)
  - After signup, redirected to fill profile: age, gender, blood group, phone number
  - Profile saved to patients table linked to users table
  - Redirected to /patient/dashboard

FIND A DOCTOR
  - /patient/doctors shows a grid of all active doctors
  - Each card shows: photo, name, specialization, experience, fee, star rating
  - Filter bar at top: filter by specialization (dropdown)
  - Search bar: search by doctor name or department
  - Click a doctor card to go to their full profile page

DOCTOR PROFILE PAGE (/patient/doctors/[id])
  - Shows: photo, name, specialization, bio, experience, fee, average rating
  - Shows available time slots for the next 7 days
  - Already booked slots are greyed out
  - Click an available slot to go to booking page

BOOKING (/patient/book/[id])
  - Step 1: Date and time slot are pre-filled from previous selection
  - Step 2: Patient adds reason for visit / symptoms (text area)
  - Step 3: Summary screen showing doctor name, date, time, fee
  - Step 4: Confirm button creates the appointment in the database
  - Confirmation screen shown with appointment ID
  - Confirmation email sent to patient

MY APPOINTMENTS (/patient/appointments)
  - Two tabs: Upcoming and Past
  - Upcoming tab shows all confirmed/pending appointments
  - Past tab shows completed and cancelled appointments
  - Each card shows: doctor name, date, time, status badge
  - Click appointment to see full details

APPOINTMENT DETAIL (/patient/appointments/[id])
  - Shows full appointment info
  - If upcoming: show Cancel button and Reschedule button
  - Reschedule opens a new slot picker for same doctor
  - If past and completed: show "Leave a Review" button

REVIEW (/patient/review/[id])
  - Star rating selector (1 to 5 stars)
  - Short comment text box
  - Submit saves to reviews table
  - Can only review once per appointment

--------------------------------------------------------------------------------
FEATURE DETAILS — DOCTOR SIDE
--------------------------------------------------------------------------------

ONBOARDING
  - User visits /register and picks "I am a Doctor"
  - Fills form: full name, email, password (or Google signup)
  - After signup, redirected to fill doctor profile:
    name, specialization, license number, experience years, fee, bio, photo
  - Profile saved to doctors table
  - Doctor is immediately active (no admin approval in v1)
  - Redirected to /doctor/dashboard

AVAILABILITY SETUP (/doctor/availability)
  - Doctor selects which days of the week they work
  - For each active day, sets start time and end time
  - Slot duration is fixed at 30 minutes
  - System auto-generates time slots between start and end time
  - Saved to availability table

DASHBOARD (/doctor/dashboard)
  - Top cards showing:
    - Today's total appointments
    - Total patients seen (all time)
    - Pending appointment requests count
  - List of today's appointments with patient name, time, status
  - List of next 7 days upcoming appointments

APPOINTMENT MANAGEMENT (/doctor/appointments)
  - Two tabs: Upcoming and Past
  - Upcoming shows pending and confirmed appointments
  - Each card shows: patient name, date, time, status, reason preview
  - Click to open full appointment detail

APPOINTMENT DETAIL (/doctor/appointments/[id])
  - Shows: patient name, age, gender, blood group, phone
  - Shows: date, time, reason for visit
  - Action buttons based on status:
    - If pending: Accept button and Reject button
    - If confirmed: Mark as Completed button and Mark as No-show button
  - Accept changes status to confirmed, sends confirmation email to patient
  - Reject changes status to cancelled, sends cancellation email to patient

PROFILE MANAGEMENT (/doctor/profile)
  - Edit: name, specialization, bio, experience years, consultation fee
  - Upload profile photo (saved to Supabase Storage)
  - Changes saved to doctors table

REVIEWS (/doctor/reviews)
  - List of all reviews received from patients
  - Shows: patient name, star rating, comment, date
  - Shows average rating at the top

--------------------------------------------------------------------------------
NOTIFICATIONS
--------------------------------------------------------------------------------

Patient receives email when:
  - Appointment is booked successfully (confirmation)
  - Doctor accepts the appointment
  - Doctor rejects the appointment
  - Appointment is 1 day away (reminder)

Doctor receives email when:
  - A new appointment is booked with them (new request)
  - Appointment is 1 day away (reminder)

Use Supabase Edge Functions + Resend API to send emails.
Resend free tier allows 3000 emails per month which is enough for v1.

--------------------------------------------------------------------------------
ROW LEVEL SECURITY (RLS) — SUPABASE
--------------------------------------------------------------------------------

Enable RLS on all tables. Basic rules:

users table
  - Users can only read and update their own row

patients table
  - Patients can read and update their own row
  - Doctors can read patient rows for their appointments only

doctors table
  - Doctors can read and update their own row
  - Patients can read all active doctor rows (for browsing)

availability table
  - Doctors can read, insert, update their own availability
  - Patients can read all availability (to see open slots)

appointments table
  - Patients can read their own appointments
  - Patients can insert new appointments
  - Doctors can read appointments where they are the doctor
  - Doctors can update status of their own appointments

reviews table
  - Patients can insert and read their own reviews
  - Doctors can read reviews where they are the doctor
  - Everyone can read reviews (for doctor profile ratings)

--------------------------------------------------------------------------------
ENVIRONMENT VARIABLES (.env.local)
--------------------------------------------------------------------------------

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key

--------------------------------------------------------------------------------
FOLDER STRUCTURE (Next.js 14 App Router)
--------------------------------------------------------------------------------

/app
  /page.js                        Landing page
  /login/page.js
  /register/page.js
  /register/patient/page.js
  /register/doctor/page.js
  /patient
    /dashboard/page.js
    /profile/page.js
    /doctors/page.js
    /doctors/[id]/page.js
    /book/[id]/page.js
    /book/confirm/page.js
    /appointments/page.js
    /appointments/[id]/page.js
    /review/[id]/page.js
  /doctor
    /dashboard/page.js
    /profile/page.js
    /availability/page.js
    /appointments/page.js
    /appointments/[id]/page.js
    /reviews/page.js
/components
  /ui                             Reusable UI components (buttons, cards, etc.)
  /patient                        Patient-specific components
  /doctor                         Doctor-specific components
/lib
  /supabase.js                    Supabase client setup
  /utils.js                       Helper functions
/public
  /images

--------------------------------------------------------------------------------
BUILD ORDER FOR BEGINNERS
--------------------------------------------------------------------------------

Step 1   Set up Next.js project
         Run: npx create-next-app@latest hospital-app
         Choose: JavaScript, Tailwind CSS, App Router

Step 2   Connect Supabase
         Create project on supabase.com
         Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
         Install: npm install @supabase/supabase-js

Step 3   Create all database tables
         Go to Supabase dashboard -> SQL Editor
         Paste and run the CREATE TABLE statements from this PRD

Step 4   Set up Supabase Auth
         Enable Email and Google providers in Supabase Auth settings
         Build /login and /register pages

Step 5   Build role selection and registration forms
         Patient and Doctor registration forms
         Save role to users table on signup

Step 6   Build doctor listing and profile pages
         Fetch doctors from Supabase
         Add search and filter

Step 7   Build booking flow
         Slot availability logic
         Create appointment in database

Step 8   Build patient appointments page
         View, cancel, reschedule logic

Step 9   Build doctor dashboard and appointment management
         Accept, reject, complete, no-show actions

Step 10  Add RLS policies in Supabase

Step 11  Set up email notifications with Resend

Step 12  Deploy to Vercel
         Push code to GitHub
         Connect repo to Vercel
         Add environment variables in Vercel dashboard

--------------------------------------------------------------------------------
END OF PRD — Version 1.0
Hospital Appointment Booking Web Application
================================================================================