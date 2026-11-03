import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, ArrowRight, Sparkles, History, Filter } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

interface SearchBarProps {
  onSearch: (query: string, category: string) => void;
  isLoading: boolean;
  recentQueries: string[];
  initialQuery?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading,
  recentQueries,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Click outside to close history
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;
    setShowHistory(false);
    onSearch(query.trim(), selectedCategory);
  };

  // Spracheingabe via Web Speech API (iPad Safari & Chrome)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Spracherkennung wird von diesem Browser leider nicht direkt unterstützt.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          setIsListening(false);
          // Automatisch fokussieren
          if (inputRef.current) inputRef.current.focus();
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSelectRecent = (q: string) => {
    setQuery(q);
    setShowHistory(false);
    onSearch(q, selectedCategory);
  };

  return (
    <div ref={containerRef} className="w-full space-y-3">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-soft border-2 border-school-border/50 focus-within:border-school-primary focus-within:ring-4 focus-within:ring-school-primary/10 transition-all">
          
          {/* Left Icon */}
          <div className="pl-4 sm:pl-5 text-school-primary dark:text-sky-400 shrink-0">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (recentQueries.length > 0 && !query) setShowHistory(true);
            }}
            placeholder="Frag das Thüringer Schulrecht (z. B. 'Darf ich einen Schüler suspendieren?', 'Klassenarbeit 2 Tage')"
            className="w-full py-4 sm:py-5 px-3 sm:px-4 text-base sm:text-lg text-school-textMain dark:text-white bg-transparent outline-none placeholder:text-slate-400"
            disabled={isLoading}
          />

          {/* Action Buttons inside Input */}
          <div className="flex items-center gap-1.5 pr-2 sm:pr-3 shrink-0">
            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Eingabe löschen"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Zuhören beenden' : 'Mit Stimme fragen'}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-school-primary hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Submit / Search Button */}
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={`flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base text-white transition-all min-h-[44px] ${
                query.trim() && !isLoading
                  ? 'bg-school-primary hover:bg-school-primaryDark active:scale-95 shadow-soft cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Recherchieren</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* History Dropdown */}
        {showHistory && recentQueries.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-float border border-school-border/50 p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs font-bold text-school-textMuted uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Zuletzt gefragt (auf diesem iPad)
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {recentQueries.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectRecent(item)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-school-textMain dark:text-slate-200 hover:bg-school-primaryLight/50 dark:hover:bg-slate-700/70 flex items-center justify-between group transition-colors"
                >
                  <span className="truncate pr-2">{item}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-school-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Category Filter Pills (Fluid scroll on iPad) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        <span className="text-xs font-semibold text-school-textMuted dark:text-slate-400 pl-1 pr-2 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          Thema:
        </span>

        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all min-h-[36px] flex items-center ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-school-textMuted hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
          }`}
        >
          Alle Bereiche
        </button>

        {Object.values(CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all min-h-[36px] flex items-center gap-1.5 border ${
              selectedCategory === cat.id
                ? `${cat.badgeColor} font-bold shadow-xs ring-2 ring-school-primary/20`
                : 'bg-white dark:bg-slate-800 text-school-textMuted hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
