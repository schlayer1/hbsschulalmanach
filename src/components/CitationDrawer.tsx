import React, { useState, useEffect, useRef } from 'react';
import { LegalChunk, VerifiedCitation } from '../types/almanach';
import { getNeighborChunks } from '../services/corpusLoader';
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
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Building2,
} from 'lucide-react';

interface CitationDrawerProps {
  citation: VerifiedCitation | null;
  chunk: LegalChunk | null;
  onClose: () => void;
  onBookmarkChunk: (chunk: LegalChunk) => void;
  isBookmarked: boolean;
  onNavigateChunk?: (chunk: LegalChunk) => void;
  onOpenDocument?: (docId: string) => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({
  citation,
  chunk,
  onClose,
  onBookmarkChunk,
  isBookmarked,
  onNavigateChunk,
  onOpenDocument,
}) => {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  const isOpen = Boolean(citation || chunk);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Fallback for browsers without native dialog `closedby="any"` (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      onClose();
    };
    dialog.addEventListener('close', handleClose);

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const outside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onDown = (e: PointerEvent) => {
        pressedOutside = outside(e);
      };
      const onUp = (e: PointerEvent) => {
        if (pressedOutside && outside(e)) dialog.close();
      };
      dialog.addEventListener('pointerdown', onDown);
      dialog.addEventListener('pointerup', onUp);
      return () => {
        dialog.removeEventListener('close', handleClose);
        dialog.removeEventListener('pointerdown', onDown);
        dialog.removeEventListener('pointerup', onUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  useEffect(() => {
    if (scrollBodyRef.current) {
      scrollBodyRef.current.scrollTop = 0;
    }
  }, [chunk?.id]);

  if (!isOpen) return null;

  const currentParagraph = chunk?.paragraph || citation?.paragraph || 'Fundstelle';
  const currentTitle = chunk?.sectionTitle || citation?.context || 'Rechtsgrundlage';
  const currentDoc = chunk?.docShortTitle || citation?.docTitle || 'Thüringer Schulrecht';
  const fullText = chunk?.text || citation?.quote || '';
  const officialUrl = chunk?.officialAnchorUrl || citation?.officialUrl || '#';
  const pageLabel = chunk?.pageLabel || citation?.pageLabel;
  const keyTakeaways = chunk?.keyTakeaways || [];
  const hasOnlineRef = Boolean(officialUrl && officialUrl.startsWith('http'));

  const neighbors = getNeighborChunks(chunk);

  const handleCopy = () => {
    const refLine = hasOnlineRef ? `\n\nOnline-Referenz: ${officialUrl}` : '\n\nQuelle: Schulinternes HBS-Dokument';
    const textToCopy = `${currentParagraph} (${currentDoc}${pageLabel ? `, ${pageLabel}` : ''}):\n${fullText}${refLine}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="drawer-paragraph-title"
      {...({ closedby: 'any' } as any)}
      className="m-0 ml-auto mr-0 h-[100dvh] max-h-[100dvh] w-full max-w-2xl bg-white dark:bg-slate-900 text-school-textMain dark:text-slate-100 shadow-2xl border-l border-slate-200 dark:border-slate-800 p-0 open:flex flex-col"
    >
      {/* Drawer Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-start justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-school-primaryLight text-school-primaryDark dark:bg-sky-950 dark:text-sky-300">
              {currentDoc}
            </span>
            {pageLabel && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {pageLabel}
              </span>
            )}
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Verifizierter Originaltext
            </span>
          </div>
          <h2
            id="drawer-paragraph-title"
            data-testid="drawer-paragraph-title"
            className="text-lg sm:text-xl font-extrabold text-school-textMain dark:text-white"
          >
            {currentParagraph}
          </h2>
          <p data-testid="drawer-section-title" className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400">
            {currentTitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Reader schließen"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Im-Dokument-Navigation (Vorheriger / Nächster Abschnitt + Katalog-Sprung) */}
      {chunk && neighbors.total > 0 && (
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!neighbors.prev}
              onClick={() => neighbors.prev && onNavigateChunk?.(neighbors.prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-school-textMain dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Vorheriger</span>
            </button>

            <span className="text-[11px] font-semibold text-school-textMuted dark:text-slate-400 px-1.5">
              Abschnitt {neighbors.position} / {neighbors.total}
            </span>

            <button
              type="button"
              disabled={!neighbors.next}
              onClick={() => neighbors.next && onNavigateChunk?.(neighbors.next)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-school-textMain dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
            >
              <span>Nächster</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {onOpenDocument && (
            <button
              type="button"
              onClick={() => {
                const docId = chunk.docId;
                dialogRef.current?.close();
                onOpenDocument(docId);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-school-primary dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 min-h-[36px]"
            >
              <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Alle Abschnitte im Dokument</span>
            </button>
          )}
        </div>
      )}

      {/* Scrollable Content */}
      <div ref={scrollBodyRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {keyTakeaways.length > 0 && (
          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-school-primary dark:text-sky-300">
              <Scale className="w-4 h-4" aria-hidden="true" />
              Einordnung & Fundstelle
            </div>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1 pl-1">
              {keyTakeaways.map((point, idx) => (
                <li key={idx} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Authentischer Volltext */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-school-textMuted dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-school-primary" aria-hidden="true" />
            Wortlaut aus dem Dokument:
          </span>
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm text-school-textMain dark:text-slate-200 font-sans leading-relaxed whitespace-pre-line shadow-xs">
            {fullText}
          </div>
        </div>

        {/* Offizieller Verweis / Interner Hinweis */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {hasOnlineRef ? (
            <>
              <div className="min-w-0">
                <div className="text-xs font-bold text-school-textMain dark:text-white">
                  Offizielle Online-Referenz:
                </div>
                <div className="text-[11px] text-school-textMuted dark:text-slate-400 truncate max-w-sm">
                  {officialUrl}
                </div>
              </div>
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-school-primary text-white hover:bg-school-primaryDark transition-colors shrink-0 min-h-[44px]"
              >
                <span>Online-Referenz öffnen</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </>
          ) : (
            <div className="flex items-center gap-2.5 text-xs text-teal-800 dark:text-teal-300">
              <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                <strong>Schulinternes HBS-Dokument:</strong> Vollständig im lokalen Schulalmanach hinterlegt (keine externe Website).
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-school-textMain dark:text-slate-200 hover:bg-slate-100 transition-colors min-h-[44px]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            <span>{copied ? 'Kopiert!' : 'Text kopieren'}</span>
          </button>

          {chunk && (
            <button
              type="button"
              onClick={() => onBookmarkChunk(chunk)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors min-h-[44px] ${
                isBookmarked
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-school-textMain dark:text-slate-200 hover:bg-slate-100'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" /> : <Bookmark className="w-4 h-4" aria-hidden="true" />}
              <span>{isBookmarked ? 'Gemerkt' : 'Merken'}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors min-h-[44px]"
        >
          Schließen
        </button>
      </div>
    </dialog>
  );
};
