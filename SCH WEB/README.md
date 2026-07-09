# GMA School Website System

A comprehensive school management platform built with React, Node.js, Express, and MongoDB.

## Project Structure

```
gma-school-system/
├── frontend/          # React application (Vite)
├── backend/           # Express.js API server
├── package.json       # Root package.json for scripts
└── README.md
```

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Styling**: Plain CSS with CSS Variables
- **Authentication**: JWT + bcrypt (Phase 2)

## Design System

- **Colors**: Navy (#0A1F44), Gold (#C9A84C), White (#FFFFFF)
- **Typography**: Cormorant Garamond (display) + DM Sans (body)
- **Premium Apple-like UI with warm, parent-friendly tone**

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   - Copy `backend/.env` and update with your MongoDB connection string
   - Update JWT secret and other configuration

3. **Start development servers:**
   ```bash
   npm run dev
   ```

   This runs both frontend (http://localhost:5173) and backend (http://localhost:5000) concurrently.

### Individual Commands

- **Frontend only**: `npm run client`
- **Backend only**: `npm run server`
- **Build frontend**: `npm run build`

## Phase 1 Features (Current)

### Public Website (Complete)
- [x] Modern responsive design with GMA branding
- [x] Hero section with animations
- [x] Navigation with mobile menu
- [x] Home page with features and divisions
- [x] About page
- [x] Academics page with program details
- [x] Admissions page with application form
- [x] Careers page with job application
- [x] Contact page with contact form
- [x] Footer with links and contact info

### Backend API (Complete)
- [x] Express.js server setup
- [x] CORS and middleware configuration
- [x] Public routes for forms (contact, admissions, careers)
- [x] Input validation with express-validator
- [x] Health check endpoint

## API Endpoints

### Public Routes
- `POST /api/public/contact` - Contact form submission
- `POST /api/public/apply` - Student application submission
- `POST /api/public/careers/apply` - Career application submission
- `GET /api/health` - Health check

## Development

### Frontend Development
- Built with Vite for fast development
- CSS Variables for consistent design system
- Intersection Observer for scroll animations
- React Router for navigation

### Backend Development
- Express.js with ES6 modules
- Input validation and sanitization
- Error handling middleware
- Environment-based configuration

## Upcoming Phases

### Phase 2: Authentication & Student Portal
- User authentication system
- Student dashboard
- Report card management
- Fee payment integration
- Admin console

### Phase 3: CBT Exam System
- Online exam builder
- Timed exam engine
- Anti-cheat measures
- Results management

## Contributing

1. Follow the existing code style
2. Use the established CSS design system
3. Test forms with the backend API
4. Ensure responsive design works on mobile

## License

MIT License - GMA School Website System