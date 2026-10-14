import React from 'react';

interface QuotexLogoProps {
  size?: number;
  className?: string;
}

/**
 * Official Quotex Emblem Logo (As shown in Screenshot Red Circle 1)
 * Shield contour with 4 vertical white bars
 */
export const QuotexEmblem: React.FC<QuotexLogoProps> = ({ size = 26, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Outer Shield Outline */}
      <path
        d="M16 2.5L27 6.5V16C27 22.8 22.3 27.5 16 29.5C9.7 27.5 5 22.8 5 16V6.5L16 2.5Z"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 4 Vertical Bars inside forming Quotex symbol */}
      {/* Bar 1 (left short) */}
      <line x1="10" y1="12" x2="10" y2="18.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      {/* Bar 2 (center-left tall) */}
      <line x1="14" y1="9" x2="14" y2="22.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      {/* Bar 3 (center-right tall) */}
      <line x1="18" y1="9" x2="18" y2="22.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      {/* Bar 4 (right short) */}
      <line x1="22" y1="12" x2="22" y2="18.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

export const QuotexAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return <QuotexEmblem size={size} className={className} />;
};
