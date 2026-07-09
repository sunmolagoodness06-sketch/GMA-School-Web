# GMA School Website — Full Project Plan

---

## Project Overview

**Project Name:** GMA School Website System  
**Goal:** One unified, premium international school platform covering public marketing, student portal, CBT exam engine, and admin console  
**Brand Tone:** Elite, warm, parent-friendly — Apple-like UI  
**Color System:** Navy `#0A1F44` · Gold `#C9A84C` · White `#FFFFFF`  
**Typography:** Cormorant Garamond (display) + DM Sans (body)  
**Domain Structure:** Single domain, all divisions  

---

## Objectives

- Increase student admissions through conversion-focused pages
- Build trust with parents via premium branding and social proof
- Recruit qualified teachers and staff
- Support online and blended learning
- Accept and manage applications fully online
- Showcase student achievements and school culture
- Establish GMA as a recognized educational brand
- Enable secure student portal access (bills, results, school info)
- Run computer-based tests (CBT) online with integrity controls

---

## Site Architecture

```
gmaschool.edu.ng/
├── Public Website
│   ├── Home
│   ├── About
│   ├── Admissions
│   ├── Academics
│   │   ├── Nursery & Early Years
│   │   ├── Primary
│   │   ├── Secondary
│   │   └── College / Sixth Form
│   ├── Careers (Teacher & Staff Recruitment)
│   └── Contact
│
├── Student Portal         /portal
│   ├── Dashboard
│   ├── Report Card
│   ├── Bills & Payments
│   ├── School Notices
│   └── Learning Resources
│
├── CBT Exam Portal        /exam
│   ├── Student Login
│   ├── Active Exam View
│   ├── Results Viewer
│   └── Exam History
│
└── Admin Console          /admin
    ├── Student Management
    ├── Staff Management
    ├── Report Card Upload
    ├── Fee & Billing Manager
    ├── Application Review
    ├── Exam Builder
    └── Notifications
```

---

## Pages — Public Website

### Home
- Full-screen hero with motion entrance animation
- Tagline + CTA: "Apply Now" and "Book a Tour"
- Why Choose GMA section (trust signals, stats, pillars)
- Division overview (Nursery → College)
- Student success wall (photos, achievements, testimonials)
- Parent testimonials with name and child's grade
- News & events strip
- Footer with contact, social links, quick nav

### About
- School mission and vision
- History and founding story
- Core values
- Leadership team (Principal, Vice Principals)
- Accreditations and affiliations
- Photo/video gallery of campus

### Admissions
- Step-by-step admissions process
- Requirements by division
- Fees overview (optional: gated behind inquiry)
- Online Application Form (full form → stores to database)
- Application status check (email + application ID)
- FAQ section
- CTA: "Start Your Application"

### Academics
- Curriculum overview (NERDC / Cambridge / IB — specify)
- Division-specific pages with subjects, schedule overview
- Co-curricular activities
- E-learning support mention
- Achievements and exam results highlight

### Careers
- Open positions listing
- Application form for teachers and staff
- Why work at GMA section
- HR contact details

### Contact
- Interactive map (Google Maps embed)
- Contact form
- Phone, email, address
- Office hours
- Social media links

---

## Student Portal — Feature Spec

**Access:** Login with Student ID + Password  
**Roles:** Student, Parent (view-only linked account)

| Feature | Description |
|---|---|
| Dashboard | Welcome card, quick stats, upcoming events |
| Report Card | PDF view per term, download option |
| Bills & Payments | Outstanding fees, payment history, due dates |
| Payment Gateway | Integrate Paystack or Flutterwave |
| School Notices | Admin-published announcements, sorted by date |
| Learning Resources | Upload links to materials, video lessons, past questions |
| Profile | Student photo, class, division, session info |

---

## CBT Exam Portal — Feature Spec

**Access:** Separate login or same credentials as portal  
**Admin sets exams; students take them**

| Feature | Description |
|---|---|
| Exam Lobby | Shows scheduled/available exams for the student |
| Timed Exam Engine | Countdown timer, auto-submit on expiry |
| Question Types | MCQ (auto-scored), Short Answer, Essay |
| Progress Saving | Auto-saves every 30s (survives refresh) |
| Anti-Cheat | Tab-switch detection, full-screen enforcement, copy-paste block |
| Results View | Score, grade, per-question breakdown (if admin enables) |
| Exam History | List of past exams and scores |

**Admin Side (Exam Builder):**
- Create exam: title, duration, division, class, date/time window
- Add questions manually or bulk upload (CSV)
- Set scoring rules per question
- Publish / unpublish exams
- View all student submissions and scores
- Export results to CSV

---

## Admin Console — Feature Spec

**Access:** Admin login (separate from student portal)  
**Roles:** Super Admin, Class Teacher, Bursar, HR

| Module | Features |
|---|---|
| Students | Add, edit, deactivate students; assign to class/division |
| Staff | Staff directory, roles, contact info |
| Report Cards | Upload PDF per student per term; bulk upload |
| Billing | Create fee schedules, mark payments, send reminders |
| Applications | Review online applications, approve/reject, send offer letter email |
| Exam Manager | Build exams, view results, export |
| Announcements | Post notices to student portal |
| Settings | School info, branding, academic session setup |

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | React 18 | Component-based UI with hooks |
| Backend | Node.js + Express.js | RESTful API server |
| Database | MongoDB + Mongoose | NoSQL document database with ODM |
| Authentication | JWT + bcrypt | Token-based auth with password hashing |
| Styling | Plain CSS + CSS Variables | Custom design tokens (navy/gold/white) |
| Animation | CSS Transitions + Intersection Observer | Smooth animations, scroll reveals |
| File Storage | GridFS or Cloudinary | Report card PDFs, student photos |
| Payments | Paystack API | Nigerian payment gateway |
| Email | Nodemailer | Application confirmations, fee alerts |
| Hosting Frontend | Netlify or Vercel | Static hosting for React build |
| Hosting Backend | Railway, Render, or DigitalOcean | Node.js API hosting |
| Database Hosting | MongoDB Atlas | Cloud MongoDB hosting |
| Domain | Any Nigerian registrar | `.edu.ng` or `.sch.ng` |

---

## Build Phases

### Phase 1 — Public Website & Brand Foundation
**Duration: Weeks 1–4**

- [ ] Set up React project with Create React App or Vite
- [ ] Set up Express.js API server with basic routing
- [ ] Create CSS variables system (navy, gold, white, spacing, typography)
- [ ] Build reusable React components (Button, Card, Hero, etc.)
- [ ] Home page — hero, Why GMA, divisions, testimonials
- [ ] About page
- [ ] Admissions page + online application form (React form → Express API)
- [ ] Academics page (all divisions)
- [ ] Careers page
- [ ] Contact page with embedded map
- [ ] Responsive design with CSS Grid/Flexbox
- [ ] CSS animations and scroll reveals (Intersection Observer)
- [ ] SEO setup (React Helmet for meta tags)
- [ ] Deploy frontend to Netlify/Vercel, backend to Railway/Render

**Deliverable:** Live, brandable public website accepting applications

---

### Phase 2 — Authentication & Student Portal
**Duration: Weeks 5–9**

- [ ] MongoDB Atlas setup or local MongoDB installation
- [ ] Mongoose ODM setup with schema definitions
- [ ] User authentication system (JWT tokens, bcrypt password hashing)
- [ ] Express.js middleware for auth protection and role-based access
- [ ] MongoDB collections design (users, students, reportCards, etc.)
- [ ] Student portal React components — dashboard, profile
- [ ] Report card module — admin upload API, student view/download
- [ ] Bills module — fee schedule display, payment status
- [ ] Paystack integration — generate payment links via API
- [ ] School notices module (CRUD operations)
- [ ] Learning resources module (file upload with GridFS)
- [ ] Admin console React app — student management, staff management
- [ ] Admin console — application review module
- [ ] Billing management panel for Bursar role

**Deliverable:** Fully functional student portal + core admin console

---

### Phase 3 — CBT Exam System
**Duration: Weeks 10–14**

- [ ] Exam builder React components in admin console
- [ ] Question bank API endpoints (manual entry + CSV upload processing)
- [ ] Exam scheduling API (date/time window per class)
- [ ] Student exam lobby React component
- [ ] Timed exam engine (JavaScript countdown, auto-submit)
- [ ] Answer auto-saving (setInterval to POST answers every 30s)
- [ ] Anti-cheat: JavaScript tab-switch detection, fullscreen API
- [ ] MCQ auto-scoring logic in Express.js
- [ ] Results page React components for students
- [ ] Results export API (CSV generation) for admin
- [ ] Exam history view with pagination

**Deliverable:** Fully operational online CBT system

---

## Database Schema (Core Collections)

```javascript
// schools collection
{
  _id: ObjectId,
  name: String,
  divisions: [String], // ['nursery', 'primary', 'secondary', 'college']
  logoUrl: String,
  createdAt: Date
}

// users collection
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  role: String, // 'student', 'parent', 'staff', 'admin'
  division: String,
  isActive: Boolean,
  createdAt: Date
}

// students collection
{
  _id: ObjectId,
  userId: ObjectId, // ref to users
  fullName: String,
  regNumber: String,
  class: String,
  division: String,
  photoUrl: String,
  session: String, // '2024/2025'
  parentInfo: {
    name: String,
    email: String,
    phone: String
  },
  createdAt: Date
}

// reportCards collection
{
  _id: ObjectId,
  studentId: ObjectId,
  term: String, // 'first', 'second', 'third'
  session: String,
  fileUrl: String,
  uploadedAt: Date,
  uploadedBy: ObjectId
}

// feeSchedules collection
{
  _id: ObjectId,
  division: String,
  term: String,
  session: String,
  amount: Number,
  description: String,
  dueDate: Date
}

// invoices collection
{
  _id: ObjectId,
  studentId: ObjectId,
  feeScheduleId: ObjectId,
  amountDue: Number,
  amountPaid: Number,
  dueDate: Date,
  status: String, // 'pending', 'paid', 'overdue'
  paystackReference: String
}

// applications collection
{
  _id: ObjectId,
  applicantName: String,
  divisionApplied: String,
  parentName: String,
  email: String,
  phone: String,
  status: String, // 'pending', 'approved', 'rejected'
  documents: [String], // file URLs
  createdAt: Date
}

// exams collection
{
  _id: ObjectId,
  title: String,
  division: String,
  class: String,
  durationMinutes: Number,
  startTime: Date,
  endTime: Date,
  published: Boolean,
  questions: [{
    questionText: String,
    type: String, // 'mcq', 'short', 'essay'
    options: [String], // for MCQ
    correctAnswer: String,
    marks: Number
  }]
}

// submissions collection
{
  _id: ObjectId,
  examId: ObjectId,
  studentId: ObjectId,
  startedAt: Date,
  submittedAt: Date,
  answers: [{
    questionIndex: Number,
    answer: String
  }],
  score: Number,
  status: String // 'in_progress', 'submitted', 'graded'
}

// notices collection
{
  _id: ObjectId,
  title: String,
  body: String,
  division: String, // or 'all'
  createdBy: ObjectId,
  createdAt: Date,
  isActive: Boolean
}
```

---

## Key Build Risks & Mitigations

| Risk | Mitigation |
|---|---|
| CBT timer lost on page refresh | Store `started_at` in DB; derive remaining time on load |
| Students sharing login credentials | Enforce one active session per user; log IP and device |
| PDF report cards at scale | Use Supabase Storage with signed URLs; never expose direct file paths |
| Multi-division data leakage | Add `division_id` to all queries; enforce via RLS (Supabase Row Level Security) |
| Low mobile performance | Lazy-load images, use Next.js Image, test on low-end Android |
| Payment disputes | Log every Paystack webhook event; don't mark paid until webhook confirms |
| Admin mistakes (delete student) | Soft-delete only (add `deleted_at` column); never hard delete |

---

## Design System Summary

| Token | Value |
|---|---|
| Primary Navy | `#0A1F44` |
| Gold Accent | `#C9A84C` |
| White | `#FFFFFF` |
| Light Surface | `#F7F6F2` |
| Body Text | `#1A1A1A` |
| Muted Text | `#6B6B6B` |
| Display Font | Cormorant Garamond (Bold, Italic) |
| Body Font | DM Sans (Regular, Medium) |
| Border Radius | 8px (cards), 4px (inputs), 999px (pills) |
| Transition | `0.3s ease` on all interactive elements |

---

## Content Needed From School

Before development starts, gather the following:

- [ ] School name, tagline, mission statement
- [ ] Logo (SVG or high-res PNG)
- [ ] Division structure and class list
- [ ] Staff photos and bios (Principal, key teachers)
- [ ] Student success stories / testimonials (with parent permission)
- [ ] Campus photos and video
- [ ] Fee schedule per division (for billing module)
- [ ] Curriculum type (NERDC / Cambridge / IB / Hybrid)
- [ ] Social media handles
- [ ] Contact details (address, phone, email)
- [ ] Accreditation certificates or affiliations to display

---

## Go-Live Checklist

- [ ] All pages reviewed on mobile and desktop
- [ ] Application form tested end-to-end (submission → admin sees it)
- [ ] Student portal login tested with real student account
- [ ] Paystack test mode payments confirmed working
- [ ] CBT exam completed full run (create → take → auto-score → results)
- [ ] Report card upload and student download tested
- [ ] All admin roles tested (bursar, teacher, super admin)
- [ ] SSL certificate active (HTTPS)
- [ ] Google Analytics or Plausible installed
- [ ] 404 and error pages styled
- [ ] Backup and restore process documented

---

*Plan version 1.0 — GMA School Website System*
