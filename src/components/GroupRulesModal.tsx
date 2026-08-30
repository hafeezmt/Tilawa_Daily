import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserX, 
  HeartHandshake, 
  BookOpen, 
  ShieldAlert, 
  Sparkles, 
  Moon, 
  Languages,
  CheckCircle2
} from 'lucide-react';
import { GROUP_RULES } from '../data/groupRules';
import { Logo } from './Logo';

interface GroupRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupRulesModal: React.FC<GroupRulesModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'ha' | 'en'>('ha');

  if (!isOpen) return null;

  const getRuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserX': return <UserX className="w-5 h-5 text-rose-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-gold-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-celestial-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emeraldGlow-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-celestial-400" />;
      case 'Moon': return <Moon className="w-5 h-5 text-gold-400" />;
      default: return <CheckCircle2 className="w-5 h-5 text-gold-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-midnight-950/85 backdrop-blur-xl animate-fadeIn">
      {/* Outer Click Boundary */}
      <div 
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-glass-lg flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-celestial-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {lang === 'ha' ? 'Dokokin Group na Tilawa Daily' : 'Tilawa Daily Group Guidelines & Rules'}
              </h3>
              <p className="text-xs text-gold-400 font-medium">
                {lang === 'ha' ? 'Manufarmu ita ce Tilawa da ilmantar da juna' : 'Our purpose is Quran recitation & mutual learning'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ha' ? 'en' : 'ha')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border border-white/10 text-xs font-bold text-slate-200 hover:border-gold-500/40"
            >
              <Languages className="w-3.5 h-3.5 text-gold-400" />
              <span>{lang === 'ha' ? 'English' : 'Hausa'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-card border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rules Feed (Scrollable) */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2 relative z-10">
          {GROUP_RULES.map((rule) => {
            const isSafety = rule.category === 'safety';
            return (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl glass-card border transition-all flex items-start gap-3.5 ${
                  isSafety 
                    ? 'border-rose-500/30 bg-rose-950/15' 
                    : 'border-white/10 hover:border-gold-500/30'
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  isSafety ? 'bg-rose-500/20 border border-rose-500/30' : 'bg-gold-500/10 border border-gold-500/20'
                }`}>
                  {getRuleIcon(rule.iconName)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Rule #{rule.id}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSafety ? 'bg-rose-500/20 text-rose-300' : 'bg-gold-500/20 text-gold-300'
                    }`}>
                      {rule.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {lang === 'ha' ? rule.hausaText : rule.englishText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          <p className="text-xs text-gold-300 font-arabic font-bold">
            الله يتقبل منا ومنكم صالح الأعمال • Ameen
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-midnight-950 font-bold text-xs shadow-gold-glow transition-all"
          >
            {lang === 'ha' ? 'Na Fahimta (I Understand)' : 'I Understand & Agree'}
          </button>
        </div>

      </div>
    </div>
  );
};
