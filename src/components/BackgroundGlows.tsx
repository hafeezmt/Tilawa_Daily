import React from 'react';

export const BackgroundGlows: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Left Deep Astral Lapis Glow */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-celestial-600/15 rounded-full blur-[140px] animate-pulse-slow" />

      {/* Top Right Royal Gold Orb */}
      <div className="absolute top-10 right-[-10%] w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-[120px] animate-float" />

      {/* Center Subtle Jade Emerald Aura */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-950/20 rounded-full blur-[160px]" />

      {/* Bottom Right Midnight Sapphire Glow */}
      <div className="absolute -bottom-40 -right-20 w-[550px] h-[550px] bg-indigo-900/15 rounded-full blur-[140px]" />

      {/* Glass Grain Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
