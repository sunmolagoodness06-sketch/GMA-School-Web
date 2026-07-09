import React from 'react';
import './HeroIllustration.css';

const HeroIllustration = () => {
  return (
    <svg
      className="hero-illustration"
      viewBox="0 0 440 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a diploma and graduation cap"
    >
      <defs>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heroCard" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a3a5c" />
          <stop offset="100%" stopColor="#0A1F44" />
        </linearGradient>
        <linearGradient id="heroGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4b866" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="220" cy="220" r="190" fill="url(#heroGlow)" />

      {/* Decorative rotating ring */}
      <circle
        className="hero-illustration-ring"
        cx="220"
        cy="220"
        r="165"
        stroke="#C9A84C"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeDasharray="4 12"
        strokeLinecap="round"
      />

      {/* Diploma card */}
      <g transform="rotate(-8 220 230)">
        <rect x="90" y="140" width="260" height="180" rx="20" fill="url(#heroCard)" />
        <rect x="90" y="140" width="260" height="180" rx="20" stroke="#C9A84C" strokeOpacity="0.4" />
        <rect x="120" y="175" width="140" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.9" />
        <rect x="120" y="200" width="170" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.6" />
        <rect x="120" y="225" width="110" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.4" />

        {/* Seal */}
        <circle cx="140" cy="292" r="26" fill="url(#heroGold)" />
        <path
          d="M140 280l4.5 9.2 10.1 1.5-7.3 7.1 1.7 10-9-4.7-9 4.7 1.7-10-7.3-7.1 10.1-1.5z"
          fill="#0A1F44"
        />
        <polygon points="128,312 140,330 134,330 126,318" fill="#b8963d" />
        <polygon points="152,312 140,330 146,330 154,318" fill="#b8963d" />
      </g>

      {/* Graduation cap */}
      <g className="hero-illustration-cap" transform="translate(300 108) rotate(8)">
        <polygon points="0,-26 60,-2 0,22 -60,-2" fill="url(#heroGold)" />
        <rect x="-22" y="-2" width="44" height="20" rx="6" fill="#0A1F44" />
        <line x1="46" y1="-6" x2="46" y2="34" stroke="#0A1F44" strokeWidth="3" strokeLinecap="round" />
        <circle cx="46" cy="40" r="6" fill="#0A1F44" />
      </g>

      {/* Floating accents */}
      <g className="hero-illustration-orbit hero-illustration-orbit-1">
        <path
          d="M78 92l3.3 6.8 7.5 1.1-5.4 5.3 1.3 7.5-6.7-3.5-6.7 3.5 1.3-7.5-5.4-5.3 7.5-1.1z"
          fill="#C9A84C"
        />
      </g>
      <g className="hero-illustration-orbit hero-illustration-orbit-2">
        <circle cx="366" cy="330" r="22" fill="#FFFFFF" />
        <path d="M357 330l6 6 12-13" stroke="#0A1F44" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      <circle className="hero-illustration-orbit hero-illustration-orbit-3" cx="70" cy="300" r="6" fill="#C9A84C" fillOpacity="0.7" />
      <circle className="hero-illustration-orbit hero-illustration-orbit-4" cx="380" cy="130" r="5" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
};

export default HeroIllustration;
