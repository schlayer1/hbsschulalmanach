import React from 'react';
import { LegalChunk, SearchResult } from '../types/almanach';
import { BookOpen, ExternalLink, Sparkles, Search, ShieldCheck, Building2, AlertTriangle } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

interface DirectMatchesListProps {
  query: string;
  results: SearchResult[];
  usedSemanticEmbeddings: boolean;
  onOpenInDocument: (chunk: LegalChunk) => void;
  compact?: boolean;
  contextSummary?: string;
  embeddingWarning?: string;
}

export const DirectMatchesList: React.FC<DirectMatchesListProps> = ({
  query,
  results,
  usedSemanticEmbeddings,
  onOpenInDocument,
  compact = false,
  contextSummary,
  embeddingWarning,
}) => {
  if (!results || results.length === 0) {
    return (
      <section
        aria-label="Direkte Dokumententreffer"
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-school-border/50 shadow-soft text-center space-y-2"
      >
        <Search className="w-8 h-8 text-slate-300 mx-auto" />
        <h3 className="font-bold text-sm sm:text-base text-school-textMain dark:text-white">
          Keine direkten Treffer für „{query}“ gefunden
        </h3>
        <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400">
          Versuche es mit einer anderen Formulierung in Alltagssprache oder setze den Kategoriefilter auf „Alle Bereiche“.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Passende Fundstellen in den Originaldokumenten"
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-100 text-school-primary dark:bg-sky-950/60 dark:text-sky-300 shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-school-textMain dark:text-white">
              Direkte Fundstellen in den Dokumenten
            </h3>
            <p className="text-xs text-school-textMuted dark:text-slate-400">
              {usedSemanticEmbeddings
                ? 'Semantische KI-Embeddingsuche (gemini-embedding-001) über alle Volltexte & Schulkonzepte'
                : 'Lokaler Hybrid-Index (Paragraphen- & Stichwortsuche)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
              usedSemanticEmbeddings
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            {usedSemanticEmbeddings ? 'KI-Embedding aktiv' : 'Offline-Suche'}
          </span>
          <span className="text-xs font-bold text-school-primary dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
            Top {results.length}
          </span>
        </div>
      </div>

      {contextSummary && (
        <div className="flex items-center gap-2 text-xs text-sky-800 dark:text-sky-200 bg-sky-50/80 dark:bg-sky-950/40 px-3 py-2 rounded-xl border border-sky-200/70 dark:border-sky-800/70">
          <Sparkles className="w-3.5 h-3.5 text-school-primary shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-bold">Suchkontext:</strong> {contextSummary}
          </span>
        </div>
      )}

      {embeddingWarning && (
        <div
          role="status"
          className="flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{embeddingWarning}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? '' : 'lg:grid-cols-2'} gap-3.5`}>
        {results.map((result, idx) => {
          const { chunk, semanticSimilarity, matchType } = result;
          const cat = CATEGORIES[chunk.category] || CATEGORIES.schulrecht;
          const hasOnlineRef = Boolean(chunk.officialAnchorUrl && chunk.officialAnchorUrl.startsWith('http'));
          const simPercent =
            typeof semanticSimilarity === 'number' && semanticSimilarity > 0
              ? Math.min(99, Math.max(1, Math.round(semanticSimilarity * 100)))
              : null;

          const matchBadgeLabel =
            matchType === 'exact_paragraph'
              ? 'Exakter §-Treffer'
              : simPercent
              ? `${simPercent} % Relevanz`
              : 'Stichwort-Treffer';

          return (
            <article
              key={`${chunk.id}-${idx}`}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 hover:border-school-primary/60 dark:hover:border-sky-500/60 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                {/* Top Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-school-primaryLight text-school-primaryDark dark:bg-sky-950 dark:text-sky-300">
                      #{idx + 1} · {chunk.docShortTitle}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.badgeColor}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      matchType === 'exact_paragraph'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    }`}
                  >
                    {matchBadgeLabel}
                  </span>
                </div>

                {/* Paragraph & Section Title */}
                <div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className="font-extrabold text-sm sm:text-base text-school-textMain dark:text-white">
                      {chunk.paragraph}
                    </h4>
                    {chunk.pageLabel && !chunk.paragraph.includes(chunk.pageLabel) && (
                      <span className="text-[11px] font-semibold text-school-textMuted dark:text-slate-400">
                        ({chunk.pageLabel})
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-school-primary dark:text-sky-400 mt-0.5">
                    {chunk.sectionTitle}
                  </p>
                </div>

                {/* Text Snippet */}
                <div className="bg-white/80 dark:bg-slate-800/70 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {chunk.text}
                  </p>
                </div>
              </div>

              {/* Dual Link Footer: In-Document + Online Reference */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenInDocument(chunk)}
                  aria-label={`Im Dokument öffnen: ${chunk.paragraph} (${chunk.sectionTitle})`}
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-school-primary text-white hover:bg-school-primaryDark transition-colors min-h-[44px] shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Im Dokument öffnen</span>
                </button>

                {hasOnlineRef ? (
                  <a
                    href={chunk.officialAnchorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Online-Referenz öffnen: ${chunk.paragraph} (${chunk.docShortTitle})`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-school-textMain dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
                  >
                    <span>Online-Referenz</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 min-h-[44px]">
                    <Building2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Schulintern (HBS)</span>
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
