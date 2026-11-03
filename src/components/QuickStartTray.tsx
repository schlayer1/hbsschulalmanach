import React, { useState } from 'react';
import { 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Scale, 
  ShieldAlert, 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  FileText, 
  Clock, 
  Lock, 
  Eye, 
  ArrowUpRight 
} from 'lucide-react';
import { QUICK_PROMPTS, CATEGORIES } from '../data/categories';
import { QuickPrompt } from '../types/almanach';

interface QuickStartTrayProps {
  onSelectPrompt: (promptText: string, category: string) => void;
  isLoading: boolean;
}

// Icon mapper
const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-5 h-5" />,
  Scale: <Scale className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Lock: <Lock className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
};

export const QuickStartTray: React.FC<QuickStartTrayProps> = ({
  onSelectPrompt,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-school-border/50 shadow-soft overflow-hidden">
      {/* Header with Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-3.5 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <span className="font-bold text-sm sm:text-base text-school-textMain dark:text-white">
            Schnellstart für den Schulalltag
          </span>
          <span className="text-xs text-school-textMuted dark:text-slate-400 hidden sm:inline">
            (Häufige Praxisfragen im Regelschulalltag)
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-school-textMuted">
          <span>{isOpen ? 'Ausblenden' : 'Anzeigen'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Grid of Bento Cards */}
      {isOpen && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3.5">
            {QUICK_PROMPTS.map((item) => {
              const cat = CATEGORIES[item.category] || CATEGORIES.schulrecht;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onSelectPrompt(item.prompt, item.category)}
                  className="group text-left p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-school-primary dark:hover:border-sky-500 hover:shadow-soft transition-all flex flex-col justify-between active:scale-[0.98] disabled:opacity-50"
                >
                  <div>
                    {/* Top Badge & Icon */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.badgeColor}`}>
                        {item.badge}
                      </span>
                      <div className="text-school-primary dark:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="font-bold text-xs sm:text-sm text-school-textMain dark:text-slate-100 group-hover:text-school-primary transition-colors line-clamp-1 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-school-textMuted dark:text-slate-400 line-clamp-2 leading-tight">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-1.5 text-[11px] font-semibold text-school-primary dark:text-sky-400">
                    {ICON_MAP[item.icon] || <BookOpen className="w-3.5 h-3.5" />}
                    <span>Jetzt abrufen</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
