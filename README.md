# GMA School Website System

A comprehensive school management platform built with React, Node.js, Express, and MongoDB.

## Project Structure

```
SCH WEB/
├── frontend/          # React application (Vite)
├── backend/           # Express.js API server
├── package.json       # Root package.json for scripts
├── README.md          # Workspace overview
└── ENHANCEMENTS.md    # Additional implementation notes
```

## Tech Stack

- Frontend: React 18 + Vite
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Styling: Plain CSS with CSS Variables
- Authentication: JWT + bcrypt

## Getting Started

### Clone the Repository

To clone this project from GitHub on another computer, run:

```bash
git clone https://github.com/sunmolagoodness06-sketch/GMA-School-Web.git
cd GMA-School-Web
```

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (local or Atlas) if the backend uses database features

### Installation

1. Install all dependencies:
   ```bash
   npm run install-all
   ```

2. Set up environment variables:
   - Create or update backend environment files with your secret values
   - Keep real credentials out of version control

3. Start the development servers:
   ```bash
   npm run dev
   ```

   This runs the frontend and backend together.

### Useful Commands

- Frontend only: `npm run client`
- Backend only: `npm run server`
- Frontend build: `npm run build`

## Workspace Overview

- Public website pages for home, about, academics, admissions, careers, and contact
- Backend routes for public forms, authentication, student access, and admin features
- Planning and enhancement documents for future phases

## Security Notes

- Never commit real `.env` files
- Store secrets such as JWT keys, database URLs, and API credentials locally
- Use example environment files as templates only

## Contributing

1. Follow the existing code style
2. Keep UI changes consistent with the established design system
3. Test forms and API routes before submitting changes
4. Ensure sensitive configuration remains local only

## License

MIT License - GMA School Website System
