import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SVGIcon from './icons/SVGIcon';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: 'building' },
    { path: '/about', label: 'About', icon: 'heart' },
    { path: '/academics', label: 'Academics', icon: 'graduation' },
    { path: '/admissions', label: 'Admissions', icon: 'user' },
    { path: '/careers', label: 'Careers', icon: 'briefcase' },
    { path: '/contact', label: 'Contact', icon: 'phone' }
  ];

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <SVGIcon name="graduation" size={32} />
            </div>
            <div className="logo-text">
              <span className="logo-main">GMA</span>
              <span className="logo-sub">School</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
              >
                <SVGIcon name={link.icon} size={16} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="header-actions">
            <Link to="/register" className="btn btn-outline btn-sm">
              <SVGIcon name="user" size={16} />
              Register
            </Link>
            <Link to="/login" className="btn btn-outline btn-sm">
              <SVGIcon name="log-in" size={16} />
              Login
            </Link>
            <Link to="/contact" className="btn btn-primary btn-sm">
              <SVGIcon name="calendar" size={16} />
              Book Tour
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-btn ${isMenuOpen ? 'mobile-menu-btn-open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <SVGIcon name={isMenuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`nav-mobile ${isMenuOpen ? 'nav-mobile-open' : ''}`}>
          <div className="nav-mobile-content">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-mobile-link ${location.pathname === link.path ? 'nav-mobile-link-active' : ''}`}
              >
                <SVGIcon name={link.icon} size={20} />
                <span>{link.label}</span>
                <SVGIcon name="chevronRight" size={16} />
              </Link>
            ))}
            <div className="nav-mobile-actions">
              <Link to="/login" className="btn btn-outline">
                <SVGIcon name="log-in" size={16} />
                Portal Login
              </Link>
              <Link to="/admissions" className="btn btn-outline">
                <SVGIcon name="arrowRight" size={16} />
                Apply Now
              </Link>
              <Link to="/contact" className="btn btn-primary">
                <SVGIcon name="calendar" size={16} />
                Book Tour
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;