import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SVGIcon from './icons/SVGIcon';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
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
    setOpenSubmenu(null);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setOpenSubmenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleSubmenu = (path) => {
    setOpenSubmenu((prev) => (prev === path ? null : path));
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: 'building' },
    { path: '/about', label: 'About', icon: 'heart' },
    {
      path: '/academics',
      label: 'Academics',
      icon: 'graduation',
      children: [
        { path: '/academics#nursery', label: 'Nursery & Early Years' },
        { path: '/academics#primary', label: 'Primary School' },
        { path: '/academics#secondary', label: 'Secondary School' },
        { path: '/academics#college', label: 'College / Sixth Form' }
      ]
    },
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
              <div
                key={link.path}
                className={`nav-item ${link.children ? 'nav-item-has-children' : ''}`}
              >
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
                >
                  <SVGIcon name={link.icon} size={16} />
                  {link.label}
                  {link.children && (
                    <SVGIcon name="chevronDown" size={14} className="nav-link-chevron" />
                  )}
                </Link>

                {link.children && (
                  <div className="nav-dropdown-panel">
                    {link.children.map((child) => (
                      <Link key={child.path} to={child.path} className="nav-dropdown-link">
                        <SVGIcon name="chevronRight" size={14} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
            aria-expanded={isMenuOpen}
          >
            <SVGIcon name={isMenuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>

        {/* Mobile Navigation Backdrop */}
        {isMenuOpen && <div className="nav-mobile-backdrop" onClick={closeMenu} />}

        {/* Mobile Navigation */}
        <nav className={`nav-mobile ${isMenuOpen ? 'nav-mobile-open' : ''}`}>
          <div className="nav-mobile-content">
            {navLinks.map((link) => (
              <div key={link.path} className="nav-mobile-item">
                <div className="nav-mobile-link-row">
                  <Link
                    to={link.path}
                    className={`nav-mobile-link ${location.pathname === link.path ? 'nav-mobile-link-active' : ''}`}
                  >
                    <SVGIcon name={link.icon} size={20} />
                    <span>{link.label}</span>
                  </Link>
                  {link.children ? (
                    <button
                      type="button"
                      className={`nav-mobile-toggle ${openSubmenu === link.path ? 'nav-mobile-toggle-open' : ''}`}
                      onClick={() => toggleSubmenu(link.path)}
                      aria-expanded={openSubmenu === link.path}
                      aria-label={`Toggle ${link.label} submenu`}
                    >
                      <SVGIcon name="chevronDown" size={18} />
                    </button>
                  ) : (
                    <SVGIcon name="chevronRight" size={16} className="nav-mobile-arrow" />
                  )}
                </div>

                {link.children && (
                  <div
                    className={`nav-mobile-submenu ${openSubmenu === link.path ? 'nav-mobile-submenu-open' : ''}`}
                  >
                    {link.children.map((child) => (
                      <Link key={child.path} to={child.path} className="nav-mobile-sublink">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="nav-mobile-actions">
              <Link to="/register" className="btn btn-outline">
                <SVGIcon name="user" size={16} />
                Register
              </Link>
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
