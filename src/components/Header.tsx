import React from 'react';
import {
  Search,
  BookOpen,
  BookmarkCheck,
  Settings2,
  Database,
  Download,
} from 'lucide-react';

export type ActiveTab = 'search' | 'explorer' | 'bookmarks';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookmarksCount: number;
  onOpenBackup: () => void;
  onOpenSettings: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  bookmarksCount,
  onOpenBackup,
  onOpenSettings,
  canInstallPwa = false,
  onInstallPwa,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-school-border/40 shadow-xs">
      <div className="w-full max-w-[2100px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          {/* Logo & School Title */}
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-3 text-left group shrink-0"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-soft shrink-0 transition-transform group-active:scale-95 border border-[#0B7BA7]/25 bg-white">
              <img
                src="/app-logo.png"
                alt="HBS Schulalmanach Logo mit Schulsiegel"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="block text-xs font-bold tracking-wider uppercase text-school-primary dark:text-sky-400">
                Heimbürgeschule Kahla
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-school-textMain dark:text-white tracking-tight">
                Schulalmanach
              </h1>
            </div>
          </button>

          {/* Navigation Bar (iPad fluid Touch-Pan) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 min-h-[44px] ${
                activeTab === 'search'
                  ? 'bg-school-primary text-white shadow-soft'
                  : 'text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>KI-Recherche</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 min-h-[44px] ${
                activeTab === 'explorer'
                  ? 'bg-school-primary text-white shadow-soft'
                  : 'text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Gesetzeskatalog</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 min-h-[44px] relative ${
                activeTab === 'bookmarks'
                  ? 'bg-school-primary text-white shadow-soft'
                  : 'text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
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
              type="button"
              onClick={onOpenBackup}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 min-h-[44px] text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Database className="w-4 h-4 text-school-primary" aria-hidden="true" />
              <span>Backup</span>
            </button>

            {canInstallPwa && onInstallPwa && (
              <button
                type="button"
                onClick={onInstallPwa}
                title="Als App (PWA) installieren"
                aria-label="HBS Schulalmanach als App installieren"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] bg-sky-50 text-school-primary border border-sky-200 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span className="hidden xl:inline">App installieren</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSettings}
              title="Einstellungen"
              aria-label="Einstellungen öffnen"
              className="p-2.5 rounded-xl text-school-textMuted hover:text-school-textMain hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center ml-1"
            >
              <Settings2 className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
