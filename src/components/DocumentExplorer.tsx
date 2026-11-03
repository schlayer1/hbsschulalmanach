import React, { useState, useMemo } from 'react';
import { LegalDocument, LegalChunk } from '../types/almanach';
import { LEGAL_DOCUMENTS, LEGAL_CHUNKS } from '../data/legalCorpus';
import { CATEGORIES } from '../data/categories';
import { 
  Search, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Scale, 
  FileCheck, 
  Calendar, 
  ShieldCheck,
  FolderOpen
} from 'lucide-react';

interface DocumentExplorerProps {
  onSelectChunk: (chunk: LegalChunk) => void;
  customChunks?: LegalChunk[];
}

export const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  onSelectChunk,
  customChunks = [],
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const allChunks = useMemo(() => [...LEGAL_CHUNKS, ...customChunks], [customChunks]);

  // Gefilterte Dokumente
  const filteredDocs = useMemo(() => {
    return LEGAL_DOCUMENTS.filter((doc) => {
      // 1. Kategorie-Filter
      if (selectedCat !== 'all' && doc.category !== selectedCat) {
        return false;
      }

      // 2. Textsuche
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesDoc = 
          doc.title.toLowerCase().includes(query) ||
          doc.shortTitle.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags.some(t => t.toLowerCase().includes(query));

        // Treffer in Paragraphen dieses Dokuments prüfen
        const matchesAnyChunk = allChunks.some(
          c => c.docId === doc.id && (
            c.paragraph.toLowerCase().includes(query) ||
            c.sectionTitle.toLowerCase().includes(query) ||
            c.summary.toLowerCase().includes(query)
          )
        );

        return matchesDoc || matchesAnyChunk;
      }

      return true;
    });
  }, [selectedCat, searchFilter, allChunks]);

  const toggleExpand = (docId: string) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Search & Filter Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-school-textMain dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-school-primary" />
            Systematischer Thüringer Gesetzes- & Dokumentenkatalog
          </h2>
          <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400 mt-1">
            Alle für staatliche Regelschulen bindenden Gesetze, Verordnungen, Rundschreiben und schulinternen Ordnungen im Überblick.
          </p>
        </div>

        {/* Suchleiste im Explorer */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Gesetze oder Paragraphen filtern (z. B. '§ 51', 'VVOrg', 'Klassenfahrt', 'RISU', '26 Stunden')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary"
          />
        </div>

        {/* Kategorien-Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all min-h-[36px] ${
              selectedCat === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Alle Dokumente ({LEGAL_DOCUMENTS.length})
          </button>

          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all min-h-[36px] border ${
                selectedCat === cat.id
                  ? `${cat.badgeColor} font-bold shadow-xs ring-2 ring-school-primary/20`
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dokumentenliste */}
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">
              Keine Rechtsdokumente für diesen Filter gefunden.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const cat = CATEGORIES[doc.category] || CATEGORIES.schulrecht;
            const docChunks = allChunks.filter(c => c.docId === doc.id);
            const isExpanded = expandedDocId === doc.id;

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-school-border/50 shadow-soft overflow-hidden transition-all"
              >
                {/* Document Header Card */}
                <div 
                  onClick={() => toggleExpand(doc.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cat.badgeColor}`}>
                        {cat.name}
                      </span>
                      <span className="text-xs font-extrabold text-school-primary dark:text-sky-400">
                        {doc.shortTitle}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Geprüft: {doc.lastCheckedDate}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-school-textMain dark:text-white">
                      {doc.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-300 line-clamp-2">
                      {doc.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doc.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {doc.officialUrl && doc.officialUrl !== '#' && (
                      <a
                        href={doc.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl text-slate-400 hover:text-school-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Im Thüringer Landesrecht öffnen"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-bold text-school-primary dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800">
                      <span>{docChunks.length} Paragraphen</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Paragraphs List */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-school-textMuted dark:text-slate-400 mb-2">
                      Hinterlegte Paragraphen & Auszüge:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {docChunks.map((chunk) => (
                        <div
                          key={chunk.id}
                          onClick={() => onSelectChunk(chunk)}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-school-primary dark:hover:border-sky-500 hover:shadow-soft transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs sm:text-sm text-school-primary dark:text-sky-400">
                                {chunk.paragraph}
                              </span>
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3" />
                                Gültig
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-school-textMain dark:text-white line-clamp-1">
                              {chunk.sectionTitle}
                            </h5>
                            <p className="text-[11px] text-school-textMuted dark:text-slate-300 line-clamp-2">
                              {chunk.summary}
                            </p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Volltext anzeigen</span>
                            <ChevronRight className="w-3.5 h-3.5 text-school-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
