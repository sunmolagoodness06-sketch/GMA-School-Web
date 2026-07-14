import React from 'react';

const SchoolCrest = ({ size = 96, className = '' }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 240 260"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Goodness and Mercy Schools crest"
    >
      {/* White backing disc so the crest reads on both light and dark surfaces */}
      <circle cx="120" cy="108" r="96" fill="#FFFFFF" />

      {/* Outer double ring */}
      <circle cx="120" cy="108" r="94" fill="none" stroke="#0A1F44" strokeWidth="2.5" />
      <circle cx="120" cy="108" r="86" fill="none" stroke="#0A1F44" strokeWidth="1" />

      {/* Arced school name — both halves share the same radius so text never
          crosses the outer ring (r=94) or the inner content ring (r=52) */}
      <defs>
        <path id="crestTopArc" d="M 51,108 A 69,69 0 0 1 189,108" />
        <path id="crestBottomArc" d="M 44,108 A 74,74 0 0 0 196,108" />
      </defs>
      <text fontFamily="Georgia, 'Cormorant Garamond', serif" fontSize="15" fontWeight="700" fill="#0A1F44" letterSpacing="1">
        <textPath href="#crestTopArc" startOffset="50%" textAnchor="middle">
          GOODNESS &amp; MERCY
        </textPath>
      </text>
      <text fontFamily="Georgia, 'Cormorant Garamond', serif" fontSize="17" fontWeight="700" fill="#0A1F44" letterSpacing="2">
        <textPath href="#crestBottomArc" startOffset="50%" textAnchor="middle">
          SCHOOLS
        </textPath>
      </text>

      {/* Inner content ring */}
      <circle cx="120" cy="108" r="52" fill="none" stroke="#0A1F44" strokeWidth="1.5" />

      {/* Three-way divider — short hint lines near the center only, so they
          never run into the icons that occupy the outer two-thirds of each wedge */}
      <line x1="120" y1="108" x2="120" y2="86" stroke="#0A1F44" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="120" y1="108" x2="139.0" y2="120" stroke="#0A1F44" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="120" y1="108" x2="101.0" y2="120" stroke="#0A1F44" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="120" cy="108" r="2.5" fill="#0A1F44" />

      {/* Graduation cap (top segment) — tilted so the tassel clears the vertical divider line */}
      <g transform="translate(120 78) rotate(-20) scale(1.15)">
        <polygon points="-24,-2 0,-13 24,-2 0,9" fill="#0A1F44" />
        <rect x="-9" y="-2" width="18" height="9" rx="2" fill="#0A1F44" />
        <line x1="20" y1="-3" x2="20" y2="13" stroke="#0A1F44" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="16" r="2.5" fill="#0A1F44" />
      </g>

      {/* Diploma scroll (bottom-left segment) — flat, matching the book's
          orientation so both icons sit level with each other */}
      <g transform="translate(80 130) scale(1.1)">
        <rect x="-19" y="-5" width="38" height="10" rx="5" fill="none" stroke="#0A1F44" strokeWidth="2" />
        <line x1="-5" y1="-5" x2="-5" y2="5" stroke="#0A1F44" strokeWidth="1.5" />
        <line x1="5" y1="-5" x2="5" y2="5" stroke="#0A1F44" strokeWidth="1.5" />
      </g>

      {/* Open book (bottom-right segment) — translate-y nudged +1.1 to
          compensate for the path's own top/bottom curve asymmetry, so its
          rendered visual center truly matches the diploma's (verified via
          getBoundingClientRect, not just the shared transform origin) */}
      <g transform="translate(160 131.1) scale(1.1)">
        <path d="M -19,-8 C -12,-12 -5,-12 0,-8 L 0,9 C -5,5 -12,5 -19,9 Z" fill="none" stroke="#0A1F44" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 19,-8 C 12,-12 5,-12 0,-8 L 0,9 C 5,5 12,5 19,9 Z" fill="none" stroke="#0A1F44" strokeWidth="2" strokeLinejoin="round" />
      </g>

      {/* Motto ribbon */}
      <polygon points="18,210 48,210 48,238 18,238 33,224" fill="#b8963d" />
      <polygon points="222,210 192,210 192,238 222,238 207,224" fill="#b8963d" />
      <rect x="42" y="210" width="156" height="28" fill="#C9A84C" />
      <text
        x="120"
        y="228"
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#0A1F44"
        letterSpacing="1"
      >
        EXCELLENCE &amp; INTEGRITY
      </text>
    </svg>
  );
};

export default SchoolCrest;