import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Languages, 
  Sparkles,
  BookOpen,
  UserX,
  HeartHandshake,
  ShieldAlert,
  Moon,
  CheckCircle2
} from 'lucide-react';
import { GROUP_RULES } from '../data/groupRules';
import { GroupRuleItem } from '../types';

interface GroupRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupRulesModal: React.FC<GroupRulesModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'ha' | 'en'>('ha');

  if (!isOpen) return null;

  const getRuleIcon = (iconName?: string) => {
    switch (iconName) {
      case 'UserX': return <UserX className="w-5 h-5 text-rose-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-amber-600" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-amber-600" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      case 'Moon': return <Moon className="w-5 h-5 text-amber-600" />;
      default: return <CheckCircle2 className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {lang === 'ha' ? 'Dokokin Zauren Tilawa' : 'Tilawa Daily Group Regulations'}
              </h3>
              <p className="text-xs text-amber-700 font-bold">
                {lang === 'ha' ? 'Dokoki 8 Na Kula Da Zaure' : '8 Golden Code of Conduct Rules'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Switcher Bar */}
        <div className="flex items-center justify-between my-4 relative z-10">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {lang === 'ha' ? 'An rubuta da harshen Hausa da Turanci' : 'Available in Hausa & English'}
          </span>

          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setLang('ha')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition-all ${
                lang === 'ha' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Harshen Hausa
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition-all ${
                lang === 'en' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Rules Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2 relative z-10">
          {GROUP_RULES.map((rule: GroupRuleItem) => {
            const isSafety = rule.category === 'safety';

            return (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isSafety 
                    ? 'border-rose-200 bg-rose-50/50' 
                    : 'border-slate-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  isSafety ? 'bg-rose-100 border border-rose-200' : 'bg-amber-50 border border-amber-200'
                }`}>
                  {getRuleIcon(rule.iconName)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Rule #{rule.id}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSafety ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rule.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {lang === 'ha' ? rule.hausaText : rule.englishText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
          <p className="text-xs text-slate-500">
            {lang === 'ha' ? 'Kiyaye dokoki yana kawo albarkar tilawa' : 'Compliance maintains the sanctity of recitation'}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
          >
            {lang === 'ha' ? 'Na Fahimta' : 'Understood'}
          </button>
        </div>

      </div>
    </div>
  );
};
