import React, { useMemo } from 'react';
import { Database, ArrowRight, Layers } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { getLoadedCorpusSync } from '../services/corpusLoader';

interface KnowledgeOverviewBannerProps {
  corpusReady: boolean;
  onOpenCatalog: (categoryId?: string) => void;
}

export const KnowledgeOverviewBanner: React.FC<KnowledgeOverviewBannerProps> = ({
  corpusReady,
  onOpenCatalog,
}) => {
  const loaded = getLoadedCorpusSync();
  const documents = loaded.documents;

  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalChunks = documents.reduce((sum, d) => sum + (d.chunksCount || 0), 0);
    const byCategory = Object.values(CATEGORIES).map((cat) => {
      const catDocs = documents.filter((d) => d.category === cat.id);
      const catChunks = catDocs.reduce((sum, d) => sum + (d.chunksCount || 0), 0);
      return {
        cat,
        docCount: catDocs.length,
        chunkCount: catChunks,
      };
    }).filter((entry) => entry.docCount > 0);

    return { totalDocs, totalChunks, byCategory };
  }, [documents, corpusReady]);

  return (
    <section
      aria-label="Bestandsübersicht der Wissensdatenbank"
      className="bg-white dark:bg-slate-800/80 rounded-2xl border border-school-border/50 shadow-soft p-4 sm:p-5 space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-100 text-school-primary dark:bg-sky-950/60 dark:text-sky-300 shrink-0">
            <Database className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-school-textMain dark:text-white">
              Durchsuchbare Wissensdatenbank: {stats.totalDocs} Dokumente &middot;{' '}
              {stats.totalChunks.toLocaleString('de-DE')} Abschnitte
            </h2>
            <p className="text-xs text-school-textMuted dark:text-slate-400">
              Alle Volltexte sind per KI-Embedding durchsuchbar. Klicke auf ein Thema für die Gesamtübersicht:
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenCatalog('all')}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-school-primary dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors shrink-0 min-h-[38px]"
        >
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Kompakte Themenübersicht</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {stats.byCategory.map(({ cat, docCount, chunkCount }) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onOpenCatalog(cat.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:shadow-xs min-h-[36px] ${cat.badgeColor}`}
          >
            <span>{cat.name}</span>
            <span className="opacity-75 font-bold">
              ({docCount} &middot; {chunkCount})
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
