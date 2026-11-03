import React, { useState, useEffect } from 'react';
import { 
  AiAnswer, 
  LegalChunk, 
  VerifiedCitation, 
  BookmarkItem, 
  CustomDocument, 
  AppSettings 
} from './types/almanach';
import { searchCorpus, customDocsToChunks } from './services/searchEngine';
import { generateLegalAnswer } from './services/geminiService';
import { 
  getBookmarks, 
  saveBookmark, 
  removeBookmark, 
  getCustomDocuments, 
  saveCustomDocument, 
  deleteCustomDocument, 
  getAppSettings, 
  saveAppSettings, 
  getQueryHistory, 
  addQueryHistory 
} from './services/storageService';
import { LEGAL_CHUNKS } from './data/legalCorpus';

// Components
import { Header, ActiveTab } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { QuickStartTray } from './components/QuickStartTray';
import { AnswerView } from './components/AnswerView';
import { CitationDrawer } from './components/CitationDrawer';
import { DocumentExplorer } from './components/DocumentExplorer';
import { BookmarksView } from './components/BookmarksView';
import { AdminDocManager } from './components/AdminDocManager';
import { PrintReportModal } from './components/PrintReportModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // Navigation & State
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<AiAnswer | null>(null);
  
  // Storage State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [customDocs, setCustomDocs] = useState<CustomDocument[]>([]);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());

  // Modals & Drawers
  const [selectedCitation, setSelectedCitation] = useState<VerifiedCitation | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<LegalChunk | null>(null);
  const [showCitationDrawer, setShowCitationDrawer] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printAnswer, setPrintAnswer] = useState<AiAnswer | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Initial Load from Storage
  useEffect(() => {
    setBookmarks(getBookmarks());
    setCustomDocs(getCustomDocuments());
    setRecentQueries(getQueryHistory());
    setSettings(getAppSettings());
  }, []);

  // Custom Chunks aus schulinternen Dokumenten
  const customChunks = React.useMemo(() => {
    return customDocsToChunks(customDocs);
  }, [customDocs]);

  // Recherche ausführen (RAG Pipeline)
  const handlePerformSearch = async (searchQuery: string, category: string) => {
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    setActiveTab('search');
    addQueryHistory(searchQuery);
    setRecentQueries(getQueryHistory());

    try {
      // 1. Lokales semantisches & Paragraphen-Matching
      const searchResults = searchCorpus(searchQuery, {
        categoryFilter: category,
        customChunks,
        limit: 5,
      });

      const retrievedChunks = searchResults.map(r => r.chunk);

      // Falls keine exakten Chunks matchen, Fallback auf Top-Chunks der Kategorie oder Gesamtkorpus
      const finalChunks = retrievedChunks.length > 0 
        ? retrievedChunks 
        : (category !== 'all' 
            ? LEGAL_CHUNKS.filter(c => c.category === category).slice(0, 4) 
            : LEGAL_CHUNKS.slice(0, 4));

      // 2. Synthese durch Gemini 3 Flash / Schul-Serverless-Proxy
      const answer = await generateLegalAnswer({
        query: searchQuery,
        relevantChunks: finalChunks,
        userApiKey: settings.apiKey,
        customModel: settings.activeModel,
      });

      setCurrentAnswer(answer);
    } catch (err: any) {
      console.error('Fehler bei der Recherche:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Zitat öffnen (Drawer)
  const handleOpenCitation = (citation: VerifiedCitation) => {
    const matchedChunk = [...LEGAL_CHUNKS, ...customChunks].find(c => c.id === citation.chunkId);
    setSelectedCitation(citation);
    setSelectedChunk(matchedChunk || null);
    setShowCitationDrawer(true);
  };

  // Paragraphen aus dem Explorer öffnen
  const handleSelectChunkFromExplorer = (chunk: LegalChunk) => {
    setSelectedChunk(chunk);
    setSelectedCitation({
      id: `cit-exp-${chunk.id}`,
      paragraph: chunk.paragraph,
      docTitle: chunk.docShortTitle,
      quote: chunk.summary,
      context: chunk.sectionTitle,
      officialUrl: chunk.officialAnchorUrl,
      relevanceScore: 1.0,
      chunkId: chunk.id,
    });
    setShowCitationDrawer(true);
  };

  // Bookmark speichern
  const handleSaveAnswerBookmark = (answer: AiAnswer) => {
    const isAlready = bookmarks.some(b => b.title === answer.query);
    if (isAlready) {
      const existing = bookmarks.find(b => b.title === answer.query);
      if (existing) removeBookmark(existing.id);
      setBookmarks(getBookmarks());
      return;
    }
    saveBookmark(answer.query, answer, 'answer');
    setBookmarks(getBookmarks());
  };

  const handleSaveChunkBookmark = (chunk: LegalChunk) => {
    const title = `${chunk.paragraph} - ${chunk.sectionTitle}`;
    const isAlready = bookmarks.some(b => b.title === title);
    if (isAlready) {
      const existing = bookmarks.find(b => b.title === title);
      if (existing) removeBookmark(existing.id);
      setBookmarks(getBookmarks());
      return;
    }
    saveBookmark(title, chunk, 'paragraph');
    setBookmarks(getBookmarks());
  };

  const handleOpenBookmarkItem = (bm: BookmarkItem) => {
    if (bm.type === 'answer') {
      setCurrentAnswer(bm.data as AiAnswer);
      setActiveTab('search');
    } else {
      handleSelectChunkFromExplorer(bm.data as LegalChunk);
    }
  };

  // Drucken
  const handleOpenPrint = (answer: AiAnswer) => {
    setPrintAnswer(answer);
    setShowPrintModal(true);
  };

  return (
    <div className="min-h-screen bg-school-surface text-school-textMain flex flex-col font-sans selection:bg-school-primaryLight selection:text-school-primaryDark">
      
      {/* 1. Header (Sticky & iPad-friendly) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookmarksCount={bookmarks.length}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* 2. Main Fluid Container (nach responsive-school-apps Standard) */}
      <main className="flex-1 w-full max-w-[2100px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-5 sm:py-6 space-y-6">
        
        {/* TAB: SEARCH & AI ASSISTANT */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            
            {/* Prominente Suchleiste */}
            <div className="max-w-4xl mx-auto w-full pt-2 sm:pt-4">
              <SearchBar
                onSearch={handlePerformSearch}
                isLoading={isLoading}
                recentQueries={recentQueries}
              />
            </div>

            {/* Schnellstart-Kacheln für den Schulalltag */}
            {!currentAnswer && !isLoading && (
              <div className="max-w-5xl mx-auto w-full pt-2">
                <QuickStartTray
                  onSelectPrompt={handlePerformSearch}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="max-w-4xl mx-auto w-full p-8 sm:p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-school-border/50 shadow-soft space-y-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-school-primary/20 border-t-school-primary rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base sm:text-lg text-school-textMain dark:text-white">
                    Recherchiere im Thüringer Schulrecht & Sicherheitsvorschriften...
                  </h3>
                  <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400">
                    Gleiche Paragraphen aus ThürSchulG, ThürSchulO, VVOrg und RISU ab & erstelle verifizierte Fundstellen.
                  </p>
                </div>
              </div>
            )}

            {/* 3-Stufen-Antwortansicht */}
            {currentAnswer && !isLoading && (
              <div className="max-w-5xl mx-auto w-full">
                <AnswerView
                  answer={currentAnswer}
                  onOpenCitation={handleOpenCitation}
                  onSaveBookmark={handleSaveAnswerBookmark}
                  isBookmarked={bookmarks.some(b => b.title === currentAnswer.query)}
                  onPrintReport={handleOpenPrint}
                  onResetSearch={() => setCurrentAnswer(null)}
                />
              </div>
            )}

          </div>
        )}

        {/* TAB: DOKUMENTEN-EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="max-w-5xl mx-auto w-full">
            <DocumentExplorer
              onSelectChunk={handleSelectChunkFromExplorer}
              customChunks={customChunks}
            />
          </div>
        )}

        {/* TAB: MERKZETTEL & AKTENNOTIZEN */}
        {activeTab === 'bookmarks' && (
          <div className="max-w-5xl mx-auto w-full">
            <BookmarksView
              bookmarks={bookmarks}
              onRemoveBookmark={(id) => {
                removeBookmark(id);
                setBookmarks(getBookmarks());
              }}
              onOpenItem={handleOpenBookmarkItem}
              onPrintItem={handleOpenPrint}
              onRefreshBookmarks={() => setBookmarks(getBookmarks())}
            />
          </div>
        )}

        {/* TAB: SCHUL-PFLEGEBEREICH & DOKUMENTEN-MANAGER */}
        {activeTab === 'admin' && (
          <div className="max-w-5xl mx-auto w-full">
            <AdminDocManager
              customDocs={customDocs}
              onSaveDoc={(doc) => {
                saveCustomDocument(doc);
                setCustomDocs(getCustomDocuments());
              }}
              onDeleteDoc={(id) => {
                deleteCustomDocument(id);
                setCustomDocs(getCustomDocuments());
              }}
              onRefresh={() => {
                setCustomDocs(getCustomDocuments());
                setBookmarks(getBookmarks());
              }}
            />
          </div>
        )}

      </main>

      {/* 3. In-App Paragraphen-Reader (Slide-Over Drawer) */}
      {showCitationDrawer && (
        <CitationDrawer
          citation={selectedCitation}
          chunk={selectedChunk}
          onClose={() => setShowCitationDrawer(false)}
          onBookmarkChunk={handleSaveChunkBookmark}
          isBookmarked={bookmarks.some(b => b.title.includes(selectedChunk?.paragraph || ''))}
        />
      )}

      {/* 4. Druckmodal DIN A4 Aktennotiz */}
      {showPrintModal && (
        <PrintReportModal
          answer={printAnswer}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* 5. Einstellungen & API-Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSaveSettings={(newSettings) => {
            const updated = saveAppSettings(newSettings);
            setSettings(updated);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 6. Footer */}
      <footer className="border-t border-school-border/40 bg-white/70 dark:bg-slate-900/70 py-4 mt-8 print:hidden">
        <div className="w-full max-w-[2100px] mx-auto px-4 sm:px-6 text-center text-xs text-school-textMuted dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Staatliche Regelschule Heimbürgeschule Kahla</strong> &middot; Schulalmanach mit RAG & RISU-Recherche
          </div>
          <div>
            Rechtsstand: 2026 &middot; Vercel Secret Proxy aktiv &middot; PWA Ready für iPads
          </div>
        </div>
      </footer>

    </div>
  );
};
export default App;
