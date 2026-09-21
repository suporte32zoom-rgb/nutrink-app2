import React, { useState } from 'react';

interface NutriaAvatarProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
}

export const NutriaAvatar: React.FC<NutriaAvatarProps> = ({
  className = '',
  size = 'md',
  alt = 'NÚTRIA Copiloto'
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    custom: ''
  };

  const currentSizeClass = size === 'custom' ? '' : sizeClasses[size];

  if (!imgError) {
    return (
      <img
        src="/nutria-avatar.jpg"
        alt={alt}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 border border-fuchsia-400/40 shadow-sm ${currentSizeClass} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Vector female doctor avatar fallback with white lab coat (jaleco branco) & stethoscope
  return (
    <svg
      viewBox="0 0 100 100"
      className={`rounded-full shrink-0 border border-fuchsia-400/40 shadow-sm ${currentSizeClass} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="50" fill="url(#nutria-doc-grad)" />
      <defs>
        <linearGradient id="nutria-doc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B0764" />
          <stop offset="50%" stopColor="#701A75" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
      
      {/* Hair back */}
      <path d="M28 42 C28 20 72 20 72 42 C72 58 68 65 68 65 L32 65 C32 65 28 58 28 42 Z" fill="#451A03" />
      
      {/* Face & Neck */}
      <path d="M44 55 L44 65 L56 65 L56 55 Z" fill="#FBBF24" opacity="0.85" />
      <ellipse cx="50" cy="42" rx="16" ry="18" fill="#FDE68A" />
      
      {/* Hair front */}
      <path d="M34 36 C34 26 44 24 50 24 C58 24 66 26 66 36 C66 38 64 34 58 32 C52 30 42 30 34 36 Z" fill="#78350F" />
      <path d="M34 36 C32 44 32 50 36 54 C36 50 35 44 37 38 Z" fill="#78350F" />
      <path d="M66 36 C68 44 68 50 64 54 C64 50 65 44 63 38 Z" fill="#78350F" />
      
      {/* Eyes & Smile */}
      <circle cx="44" cy="42" r="2" fill="#1E293B" />
      <circle cx="56" cy="42" r="2" fill="#1E293B" />
      <path d="M46 48 Q50 52 54 48" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />

      {/* White Lab Coat (Jaleco Branco) */}
      <path d="M22 100 L34 65 L66 65 L78 100 Z" fill="#FFFFFF" />
      {/* Inner scrub shirt */}
      <path d="M42 65 L50 78 L58 65 Z" fill="#D946EF" />
      {/* Lapels */}
      <path d="M34 65 L46 86 L41 87 L31 72 Z" fill="#F1F5F9" />
      <path d="M66 65 L54 86 L59 87 L69 72 Z" fill="#F1F5F9" />
      
      {/* Stethoscope around neck */}
      <path d="M38 66 C38 78 43 83 48 83 C53 83 58 78 62 66" stroke="#94A3B8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="85" r="3.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
    </svg>
  );
};
