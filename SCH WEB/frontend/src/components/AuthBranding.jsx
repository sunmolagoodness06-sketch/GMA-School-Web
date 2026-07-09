import React from 'react';
import { Link } from 'react-router-dom';
import SVGIcon from './icons/SVGIcon';
import HeroIllustration from './HeroIllustration';

const AuthBranding = ({ title, description }) => {
  return (
    <div className="login-branding">
      <Link to="/" className="login-branding-logo">
        <SVGIcon name="graduation-cap" size={32} />
        <span>GMA School</span>
      </Link>

      <div className="login-branding-content">
        <HeroIllustration />
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <Link to="/" className="login-branding-back">
        <SVGIcon name="arrow-left" size={16} />
        Back to website
      </Link>
    </div>
  );
};

export default AuthBranding;
