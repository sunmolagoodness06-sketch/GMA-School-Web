import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './styles/portal.css';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './components/PortalLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Admissions from './pages/Admissions';
import Academics from './pages/Academics';
import Careers from './pages/Careers';
import Contact from './pages/Contact';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Portal Pages
import Dashboard from './pages/portal/Dashboard';

// Layout component for public pages
const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes with Header/Footer */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/admissions" element={<PublicLayout><Admissions /></PublicLayout>} />
            <Route path="/academics" element={<PublicLayout><Academics /></PublicLayout>} />
            <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Portal Routes */}
            <Route path="/portal" element={
              <ProtectedRoute allowedRoles={['student', 'parent', 'staff', 'admin']}>
                <PortalLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<div>Profile Page - Coming Soon</div>} />
              <Route path="report-cards" element={<div>Report Cards - Coming Soon</div>} />
              <Route path="bills" element={<div>Bills & Payments - Coming Soon</div>} />
              <Route path="notices" element={<div>Notices - Coming Soon</div>} />
              <Route path="resources" element={<div>Learning Resources - Coming Soon</div>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <div>Admin Panel - Coming Soon</div>
              </ProtectedRoute>
            } />

            {/* 404 Page */}
            <Route path="*" element={
              <PublicLayout>
                <div className="not-found">
                  <h1>Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              </PublicLayout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;