import React from 'react';
import { 
  Scale, 
  Search, 
  BookOpen, 
  BookmarkCheck, 
  Settings2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'search' | 'explorer' | 'bookmarks' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarksCount: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  bookmarksCount,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-school-border/40 shadow-xs">
      <div className="w-full max-w-[2100px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & School Title */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('search')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-school-primary to-school-primaryDark text-white flex items-center justify-center shadow-soft shrink-0 cursor-pointer transform active:scale-95 transition-transform"
            >
              <Scale className="w-6 h-6 text-teal-300" />
            </div>
            <div className="cursor-pointer" onClick={() => setActiveTab('search')}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-school-primary dark:text-sky-400">
                  Heimbürgeschule Kahla
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  Thüringer Regelschulrecht
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-school-textMain dark:text-white tracking-tight flex items-center gap-1.5">
                Schulalmanach
                <span className="text-xs font-medium text-school-textMuted dark:text-slate-400 hidden md:inline">
                  &middot; RAG & RISU-Recherche
                </span>
              </h1>
            </div>
          </div>

          {/* Navigation Bar (iPad fluid Touch-Pan) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 min-h-[44px] ${
                activeTab === 'search'
                  ? 'bg-school-primary text-white shadow-soft'
                  : 'text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>KI-Recherche</span>
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 min-h-[44px] ${
                activeTab === 'explorer'
                  ? 'bg-school-primary text-white shadow-soft'
                  : 'text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Gesetzeskatalog</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 min-h-[44px] relative ${
                activeTab === 'bookmarks'
                  ? 'bg-school-primary text-white shadow-soft'
                  : 'text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Merkzettel</span>
              {bookmarksCount > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'bookmarks' ? 'bg-white text-school-primary' : 'bg-school-primary text-white'
                }`}>
                  {bookmarksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 min-h-[44px] ${
                activeTab === 'admin'
                  ? 'bg-school-primary text-white shadow-soft'
                  : 'text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Schul-Pflege</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Einstellungen & API-Status"
              className="p-2.5 rounded-xl text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center ml-1"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
