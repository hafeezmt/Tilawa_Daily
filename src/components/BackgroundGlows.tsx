import React from 'react';

export const BackgroundGlows: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Left Sapphire Astral Glow */}
      <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-celestial-500/15 rounded-full blur-[150px] animate-pulse-slow" />

      {/* Top Right Warm Champagne Gold Orb */}
      <div className="absolute top-0 right-[-5%] w-[550px] h-[550px] bg-gold-400/12 rounded-full blur-[140px] animate-float" />

      {/* Center Subtle Emerald Aura */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[700px] bg-emeraldGlow-500/10 rounded-full blur-[180px]" />

      {/* Bottom Right Midnight Royal Glow */}
      <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[160px]" />

      {/* Fine Glass Grain Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
