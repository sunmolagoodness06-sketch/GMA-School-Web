import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import SchoolCrest from '../components/SchoolCrest';
import SVGIcon from '../components/icons/SVGIcon';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." />
      <div className="container not-found-container">
        <SchoolCrest size={88} className="not-found-crest" />
        <p className="not-found-code">404</p>
        <h1>Page Not Found</h1>
        <p className="not-found-message">
          The page you're looking for doesn't exist, may have moved, or the link might be mistyped.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <SVGIcon name="home" size={18} />
            Back to Home
          </Link>
          <Link to="/contact" className="btn btn-outline">
            <SVGIcon name="mail" size={18} />
            Contact Us
          </Link>
        </div>

        <div className="not-found-links">
          <p>You might be looking for:</p>
          <div className="not-found-links-grid">
            <Link to="/admissions">Admissions</Link>
            <Link to="/academics">Academics</Link>
            <Link to="/about">About Us</Link>
            <Link to="/login">Portal Login</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
