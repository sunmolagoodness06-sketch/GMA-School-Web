import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SVGIcon from './icons/SVGIcon';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail);
    if (!isValidEmail) {
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('success');
    setNewsletterEmail('');
  };

  const quickLinks = [
    { path: '/', label: 'Home', icon: 'building' },
    { path: '/about', label: 'About Us', icon: 'heart' },
    { path: '/academics', label: 'Academic Programs', icon: 'graduation' },
    { path: '/admissions', label: 'Admissions', icon: 'user' },
    { path: '/careers', label: 'Careers', icon: 'briefcase' },
    { path: '/contact', label: 'Contact', icon: 'phone' }
  ];

  const academicDivisions = [
    { path: '/academics#nursery', label: 'Nursery & Early Years', icon: 'lightbulb' },
    { path: '/academics#primary', label: 'Primary School', icon: 'bookOpen' },
    { path: '/academics#secondary', label: 'Secondary School', icon: 'graduation' },
    { path: '/academics#college', label: 'College / Sixth Form', icon: 'award' }
  ];

  const socialLinks = [
    { href: '#', label: 'Facebook', icon: 'facebook' },
    { href: '#', label: 'Twitter', icon: 'twitter' },
    { href: '#', label: 'Instagram', icon: 'instagram' },
    { href: '#', label: 'LinkedIn', icon: 'linkedin' }
  ];

  const contactInfo = [
    { 
      icon: 'mapPin', 
      content: 'Plot 16, Goshen Str, Off Odo-Ona kekere, Ibadan',
      type: 'address'
    },
    { 
      icon: 'phone', 
      content: '+234 (0) 703 297 7267',
      type: 'phone'
    },
    { 
      icon: 'mail', 
      content: 'goodnessandmercyschool@gmail.com',
      type: 'email'
    },
    { 
      icon: 'clock', 
      content: 'Mon-Fri: 8:00 AM - 4:00 PM',
      type: 'hours'
    }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">
                <SVGIcon name="graduation" size={32} />
              </div>
              <div className="logo-text">
                <span className="logo-main">GMA</span>
                <span className="logo-sub">School</span>
              </div>
            </div>
            <p className="footer-description">
              Goodness and Mercy Academy (GMA) — Excellence in Education, Character in Life.
              Nurturing young minds for global success since 2014 with world-class
              facilities and dedicated educators.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="social-link" 
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SVGIcon name={social.icon} size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>
              <SVGIcon name="arrowRight" size={16} />
              Quick Links
            </h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>
                    <SVGIcon name={link.icon} size={16} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Divisions */}
          <div className="footer-section">
            <h4>
              <SVGIcon name="graduation" size={16} />
              Academic Divisions
            </h4>
            <ul className="footer-links">
              {academicDivisions.map((division, index) => (
                <li key={index}>
                  <Link to={division.path}>
                    <SVGIcon name={division.icon} size={16} />
                    {division.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>
              <SVGIcon name="phone" size={16} />
              Contact Info
            </h4>
            <div className="contact-info">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-icon">
                    <SVGIcon name={info.icon} size={18} />
                  </div>
                  <div className="contact-content">
                    {info.type === 'email' ? (
                      <a href={`mailto:${info.content}`}>{info.content}</a>
                    ) : info.type === 'phone' ? (
                      <a href={`tel:${info.content.replace(/\s/g, '')}`}>{info.content}</a>
                    ) : (
                      <span>{info.content}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>
                <SVGIcon name="mail" size={20} />
                Stay Updated
              </h3>
              <p>Get the latest news, events, and updates from GMA School delivered to your inbox.</p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit} noValidate>
              <div className="input-group">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    setNewsletterStatus(null);
                  }}
                  placeholder="Enter your email address"
                  className="newsletter-input"
                  aria-invalid={newsletterStatus === 'error'}
                />
                <button type="submit" className="btn btn-secondary">
                  <SVGIcon name="arrowRight" size={16} />
                  Subscribe
                </button>
              </div>
              {newsletterStatus === 'success' && (
                <p className="newsletter-feedback newsletter-feedback-success">
                  <SVGIcon name="checkCircle" size={14} />
                  Thanks for subscribing! Watch your inbox for updates.
                </p>
              )}
              {newsletterStatus === 'error' && (
                <p className="newsletter-feedback newsletter-feedback-error">
                  <SVGIcon name="alert-circle" size={14} />
                  Please enter a valid email address.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <SVGIcon name="checkCircle" size={16} />
              <span>&copy; {currentYear} GMA School. All rights reserved.</span>
            </div>
            <div className="footer-bottom-links">
              <Link to="/privacy">
                <SVGIcon name="shield" size={14} />
                Privacy Policy
              </Link>
              <Link to="/terms">
                <SVGIcon name="book" size={14} />
                Terms of Service
              </Link>
              <Link to="/sitemap">
                <SVGIcon name="globe" size={14} />
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;