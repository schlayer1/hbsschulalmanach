import React, { useState } from 'react';
import { LegalChunk, VerifiedCitation } from '../types/almanach';
import { 
  X, 
  ExternalLink, 
  BookOpen, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  Scale, 
  ShieldCheck, 
  Share2 
} from 'lucide-react';

interface CitationDrawerProps {
  citation: VerifiedCitation | null;
  chunk: LegalChunk | null;
  onClose: () => void;
  onBookmarkChunk: (chunk: LegalChunk) => void;
  isBookmarked: boolean;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({
  citation,
  chunk,
  onClose,
  onBookmarkChunk,
  isBookmarked,
}) => {
  const [copied, setCopied] = useState(false);

  if (!citation && !chunk) return null;

  const currentParagraph = citation?.paragraph || chunk?.paragraph || 'Fundstelle';
  const currentTitle = chunk?.sectionTitle || citation?.context || 'Rechtsgrundlage';
  const currentDoc = citation?.docTitle || chunk?.docShortTitle || 'Thüringer Schulrecht';
  const fullText = chunk?.text || citation?.quote || '';
  const officialUrl = citation?.officialUrl || chunk?.officialAnchorUrl || '#';
  const keyTakeaways = chunk?.keyTakeaways || [];

  const handleCopy = () => {
    const textToCopy = `${currentParagraph} (${currentDoc}):\n${fullText}\n\nFundstelle: ${officialUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-start justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-school-primaryLight text-school-primaryDark dark:bg-sky-950 dark:text-sky-300">
                {currentDoc}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Geltende Rechtsfassung
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-school-textMain dark:text-white">
              {currentParagraph}
            </h2>
            <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400">
              {currentTitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Kernpunkte / Takeaways */}
          {keyTakeaways.length > 0 && (
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-school-primary dark:text-sky-300">
                <Scale className="w-4 h-4" />
                Wesentliche Kernaussagen:
              </div>
              <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1 pl-1">
                {keyTakeaways.map((point, idx) => (
                  <li key={idx} className="leading-relaxed">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Der authentische Paragraphentext */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-school-textMuted dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-school-primary" />
              Verifizierter Gesetzestext:
            </span>
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm text-school-textMain dark:text-slate-200 font-sans leading-relaxed whitespace-pre-line shadow-xs">
              {fullText}
            </div>
          </div>

          {/* Offizieller Verweis */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-school-textMain dark:text-white">
                Offizielle Fundstelle im Landesrecht:
              </div>
              <div className="text-[11px] text-school-textMuted dark:text-slate-400 truncate max-w-sm">
                {officialUrl}
              </div>
            </div>

            {officialUrl && officialUrl !== '#' && (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-school-primary text-white hover:bg-school-primaryDark transition-colors shrink-0 min-h-[44px]"
              >
                <span>Im Landesrecht öffnen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

        </div>

        {/* Footer Actions (Easy Thumb Action on iPads) */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-school-textMain dark:text-slate-200 hover:bg-slate-100 transition-colors min-h-[44px]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopiert!' : 'Text kopieren'}</span>
            </button>

            {chunk && (
              <button
                onClick={() => onBookmarkChunk(chunk)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors min-h-[44px] ${
                  isBookmarked
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-school-textMain dark:text-slate-200 hover:bg-slate-100'
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
                <span>{isBookmarked ? 'Gemerkt' : 'Paragraph merken'}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors min-h-[44px]"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
