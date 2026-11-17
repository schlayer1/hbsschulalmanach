import React, { useState, useMemo, useEffect } from 'react';
import { LegalChunk, LegalDocument } from '../types/almanach';
import { getLoadedCorpusSync } from '../services/corpusLoader';
import { CATEGORIES } from '../data/categories';
import {
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ShieldCheck,
  FolderOpen,
  Building2,
  Layers,
} from 'lucide-react';

interface DocumentExplorerProps {
  onSelectChunk: (chunk: LegalChunk) => void;
  customChunks?: LegalChunk[];
  corpusReady?: boolean;
  initialExpandedDocId?: string | null;
  initialCategory?: string;
}

export const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  onSelectChunk,
  customChunks = [],
  corpusReady = false,
  initialExpandedDocId = null,
  initialCategory = 'all',
}) => {
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(initialExpandedDocId);
  const [chunkFilter, setChunkFilter] = useState<string>('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialCategory) {
      setSelectedCat(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialExpandedDocId) {
      setExpandedDocId(initialExpandedDocId);
      setChunkFilter('');
    }
  }, [initialExpandedDocId]);

  const loaded = getLoadedCorpusSync();
  const documents = loaded.documents;
  const allChunks = useMemo(
    () => [...loaded.chunks, ...customChunks],
    [loaded.chunks, customChunks, corpusReady]
  );

  const totalChunksCount = useMemo(
    () => documents.reduce((sum, d) => sum + (d.chunksCount || 0), 0),
    [documents]
  );

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of documents) {
      map[d.category] = (map[d.category] || 0) + 1;
    }
    return map;
  }, [documents]);

  // Gefilterte Dokumente
  const filteredDocs = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return documents.filter((doc) => {
      if (selectedCat !== 'all' && doc.category !== selectedCat) {
        return false;
      }
      if (!query) return true;

      const matchesDoc =
        doc.title.toLowerCase().includes(query) ||
        doc.shortTitle.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.currentVersion.toLowerCase().includes(query) ||
        doc.tags.some((t) => t.toLowerCase().includes(query));

      if (matchesDoc) return true;

      return allChunks.some(
        (c) =>
          c.docId === doc.id &&
          (c.paragraph.toLowerCase().includes(query) ||
            c.sectionTitle.toLowerCase().includes(query) ||
            c.summary.toLowerCase().includes(query))
      );
    });
  }, [documents, selectedCat, searchFilter, allChunks]);

  // Gruppierung nach den 8 Themenbereichen (in definierter Reihenfolge)
  const groupedSections = useMemo(() => {
    const groups: Array<{
      cat: (typeof CATEGORIES)[string];
      docs: LegalDocument[];
      chunkSum: number;
    }> = [];

    for (const cat of Object.values(CATEGORIES)) {
      const docs = filteredDocs.filter((d) => d.category === cat.id);
      if (docs.length > 0) {
        groups.push({
          cat,
          docs,
          chunkSum: docs.reduce((s, d) => s + (d.chunksCount || 0), 0),
        });
      }
    }
    return groups;
  }, [filteredDocs]);

  const toggleExpandDoc = (docId: string) => {
    setExpandedDocId((prev) => (prev === docId ? null : docId));
    setChunkFilter('');
  };

  const toggleGroup = (catId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-school-textMain dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-school-primary" aria-hidden="true" />
              Kompakte Themenübersicht aller hinterlegten Dokumente
            </h2>
            <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400 mt-1">
              Alle {documents.length} Volltext-Dokumente, Gesetze, Verwaltungsvorschriften und schulinternen Konzepte nach Themen sortiert.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-sky-50 text-school-primary dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {documents.length} Dokumente &middot; {totalChunksCount.toLocaleString('de-DE')} Abschnitte
            </span>
          </div>
        </div>

        {/* Suchleiste im Katalog */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            aria-label="Dokumente oder Paragraphen filtern"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Dokument, Thema oder Paragraph filtern (z. B. '§ 51', 'VVOrg', 'Schutzkonzept', 'RISU', 'Schulkonten')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
          />
        </div>

        {/* Kategorien-Pills mit Dokumentzahl */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all min-h-[36px] ${
              selectedCat === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Alle Dokumente ({documents.length})
          </button>

          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all min-h-[36px] border ${
                selectedCat === cat.id
                  ? `${cat.badgeColor} font-bold shadow-xs ring-2 ring-school-primary/20`
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat.name} ({categoryCounts[cat.id] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Kompakte Themen-Gruppen statt langer Einzelkarten */}
      {groupedSections.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-500">
            Keine Dokumente für diesen Filter gefunden.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedSections.map(({ cat, docs, chunkSum }) => {
            const isGroupCollapsed = Boolean(collapsedGroups[cat.id]) && !searchFilter.trim() && selectedCat === 'all';

            return (
              <section
                key={cat.id}
                aria-label={cat.name}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-school-border/50 shadow-soft overflow-hidden"
              >
                {/* Themenbereich-Kopfzeile */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${cat.badgeColor}`}>
                      {cat.name}
                    </span>
                    <span className="text-xs text-school-textMuted dark:text-slate-400 truncate hidden md:inline">
                      {cat.shortDesc}
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-expanded={!isGroupCollapsed}
                    onClick={() => toggleGroup(cat.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 shrink-0 min-h-[36px]"
                  >
                    <span>
                      {docs.length} Dok. &middot; {chunkSum} Abschn.
                    </span>
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Kompakte Dokumenten-Zeilen */}
                {!isGroupCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {docs.map((doc) => {
                      const docChunks = allChunks.filter((c) => c.docId === doc.id);
                      const isExpanded = expandedDocId === doc.id;
                      const hasOnlineRef = Boolean(doc.officialUrl && doc.officialUrl.startsWith('http'));

                      const visibleChunks =
                        isExpanded && chunkFilter.trim()
                          ? docChunks.filter((c) => {
                              const q = chunkFilter.toLowerCase();
                              return (
                                c.paragraph.toLowerCase().includes(q) ||
                                c.sectionTitle.toLowerCase().includes(q) ||
                                c.text.toLowerCase().includes(q)
                              );
                            })
                          : docChunks;

                      return (
                        <div key={doc.id} className="transition-colors">
                          {/* Kompakte 1-2-zeilige Dokument-Reihe */}
                          <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-sm text-school-textMain dark:text-white">
                                  {doc.title}
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-school-primary dark:text-sky-300">
                                  {doc.shortTitle}
                                </span>
                              </div>
                              <p className="text-xs text-school-textMuted dark:text-slate-400 line-clamp-1">
                                <span className="font-medium text-slate-500 dark:text-slate-300">
                                  {doc.currentVersion}
                                </span>{' '}
                                &middot; {doc.description}
                              </p>
                            </div>

                            {/* Aktionen rechts: Online-Referenz / Schulintern + Abschnitte aufklappen */}
                            <div className="flex items-center gap-2 shrink-0">
                              {hasOnlineRef ? (
                                <a
                                  href={doc.officialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Online-Referenz öffnen: ${doc.shortTitle}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[38px]"
                                >
                                  <span>Online</span>
                                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 min-h-[38px]">
                                  <Building2 className="w-3 h-3" aria-hidden="true" />
                                  <span>Schulintern</span>
                                </span>
                              )}

                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                onClick={() => toggleExpandDoc(doc.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors min-h-[38px] ${
                                  isExpanded
                                    ? 'bg-school-primary text-white border-school-primary'
                                    : 'bg-sky-50 dark:bg-sky-950/60 text-school-primary dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                                }`}
                              >
                                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{docChunks.length || doc.chunksCount} Abschnitte</span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Aufgeklappte Abschnitte */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 p-4 sm:p-5 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-school-textMuted dark:text-slate-400">
                                  Hinterlegte Abschnitte in {doc.shortTitle} ({visibleChunks.length}
                                  {docChunks.length !== visibleChunks.length ? ` von ${docChunks.length}` : ''}):
                                </h3>

                                {docChunks.length > 20 && (
                                  <input
                                    type="text"
                                    value={chunkFilter}
                                    onChange={(e) => setChunkFilter(e.target.value)}
                                    placeholder={`Innerhalb von ${doc.shortTitle} filtern...`}
                                    aria-label={`Abschnitte in ${doc.shortTitle} filtern`}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-school-textMain dark:text-white w-full sm:w-64"
                                  />
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
                                {visibleChunks.map((chunk) => (
                                  <button
                                    key={chunk.id}
                                    type="button"
                                    onClick={() => onSelectChunk(chunk)}
                                    className="text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-school-primary dark:hover:border-sky-500 hover:shadow-soft transition-all flex flex-col justify-between"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-extrabold text-xs text-school-primary dark:text-sky-400 truncate">
                                          {chunk.paragraph}
                                        </span>
                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0">
                                          <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                                          Lesen
                                        </span>
                                      </div>
                                      <div className="font-bold text-xs text-school-textMain dark:text-white line-clamp-1">
                                        {chunk.sectionTitle}
                                      </div>
                                      <p className="text-[11px] text-school-textMuted dark:text-slate-300 line-clamp-2">
                                        {chunk.summary}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
