import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 44, className = '', showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div 
        style={{ width: size, height: size }} 
        className="relative flex-shrink-0 group cursor-pointer transition-transform duration-300 hover:scale-105"
      >
        {/* Ambient Glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold-500/30 via-celestial-500/20 to-gold-400/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
        
        <svg 
          viewBox="0 0 400 400" 
          className="relative w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="logoDisc" cx="50%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#1C2D4E" />
              <stop offset="60%" stopColor="#0B1323" />
              <stop offset="100%" stopColor="#050812" />
            </radialGradient>
            <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE8B3" />
              <stop offset="50%" stopColor="#E5B25D" />
              <stop offset="100%" stopColor="#996E20" />
            </linearGradient>
            <linearGradient id="logoRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#E5B25D" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Outer Border with Precision Concentric Geometry */}
          <circle cx="200" cy="200" r="190" fill="none" stroke="url(#logoRing)" strokeWidth="3" opacity="0.6" />
          <circle cx="200" cy="200" r="184" fill="url(#logoDisc)" stroke="url(#logoGold)" strokeWidth="6" />
          <circle cx="200" cy="200" r="168" fill="none" stroke="url(#logoGold)" strokeWidth="2" strokeDasharray="8 4" opacity="0.8" />
          <circle cx="200" cy="200" r="158" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

          {/* Quran Badge Enclosure */}
          <circle cx="200" cy="140" r="54" fill="rgba(14, 26, 51, 0.85)" stroke="url(#logoGold)" strokeWidth="3" />

          {/* Open Quran Graphic */}
          <g transform="translate(200, 140) scale(1.15)">
            <path d="M 0,-22 L 0,16" stroke="url(#logoGold)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 0,16 L -3,24 L 0,22 L 3,24 Z" fill="url(#logoGold)" />
            
            {/* Left Page */}
            <path d="M 0,-18 C -14,-22 -26,-18 -32,-16 C -34,-15 -35,-13 -35,-10 L -35,14 C -35,16 -34,17 -32,16 C -24,14 -12,18 0,20 Z" 
                  fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M -8,-10 C -16,-12 -24,-9 -27,-8" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M -8,-2 C -16,-4 -24,-1 -27,0" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M -8,6 C -16,4 -24,7 -27,8" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" />

            {/* Right Page */}
            <path d="M 0,-18 C 14,-22 26,-18 32,-16 C 34,-15 35,-13 35,-10 L 35,14 C 35,16 34,17 32,16 C 24,14 12,18 0,20 Z" 
                  fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M 8,-10 C 16,-12 24,-9 27,-8" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M 8,-2 C 16,-4 24,-1 27,0" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M 8,6 C 16,4 24,7 27,8" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Tilawa_Daily Text */}
          <text x="200" y="248" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="34" fontWeight="800" fill="#FFFFFF" letterSpacing="0.5">
            Tilawa_Daily
          </text>
          
          <line x1="120" y1="268" x2="280" y2="268" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="200" cy="268" r="3.5" fill="url(#logoGold)" />

          {/* Arabic Calligraphy */}
          <text x="200" y="324" textAnchor="middle" fontFamily="'Amiri', serif" fontSize="40" fontWeight="700" fill="url(#logoGold)">
            تِلَاوَةٌ يَوْمِيَّة
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-gold-200">
              Tilawa Daily
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/30 rounded-full">
              Halaqah
            </span>
          </div>
          <span className="text-xs font-arabic text-gold-400/90 font-medium">
            تلاوة يومية • 5 أحزاب
          </span>
        </div>
      )}
    </div>
  );
};
