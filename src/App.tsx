import React, { useState, useEffect } from 'react';
import { 
  AiAnswer, 
  LegalChunk, 
  SearchResult,
  VerifiedCitation, 
  BookmarkItem, 
  CustomDocument, 
  AppSettings,
  SchoolTypeScope
} from './types/almanach';
import {
  searchCorpus,
  customDocsToChunks,
  fetchQueryEmbeddingDetailed,
  expandWithSiblingChunks,
} from './services/searchEngine';
import { contextualizeQuery } from './services/queryContextualizer';
import { generateLegalAnswer } from './services/geminiService';
import { loadCorpus, getLoadedCorpusSync } from './services/corpusLoader';
import { 
  getBookmarks, 
  saveBookmark, 
  removeBookmark, 
  getCustomDocuments, 
  getAppSettings, 
  saveAppSettings, 
  getQueryHistory, 
  addQueryHistory 
} from './services/storageService';

// Components
import { Header, ActiveTab } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { QuickStartTray } from './components/QuickStartTray';
import { KnowledgeOverviewBanner } from './components/KnowledgeOverviewBanner';
import { AnswerView } from './components/AnswerView';
import { DirectMatchesList } from './components/DirectMatchesList';
import { CitationDrawer } from './components/CitationDrawer';
import { DocumentExplorer } from './components/DocumentExplorer';
import { BookmarksView } from './components/BookmarksView';
import { PrintReportModal } from './components/PrintReportModal';
import { SettingsModal } from './components/SettingsModal';
import { BackupModal } from './components/BackupModal';

export const App: React.FC = () => {
  // Navigation & State
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [searchMode, setSearchMode] = useState<'ai' | 'docs'>('ai');
  const [schoolScope, setSchoolScope] = useState<SchoolTypeScope>('regelschule');
  const [lastCategory, setLastCategory] = useState<string>('all');
  const [activeQueryText, setActiveQueryText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [corpusReady, setCorpusReady] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<AiAnswer | null>(null);
  const [liveMatches, setLiveMatches] = useState<{
    query: string;
    results: SearchResult[];
    usedSemanticEmbeddings: boolean;
    contextSummary?: string;
    embeddingWarning?: string;
  } | null>(null);
  const [explorerDocId, setExplorerDocId] = useState<string | null>(null);
  const [explorerCategory, setExplorerCategory] = useState<string>('all');
  
  // Storage State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [customDocs, setCustomDocs] = useState<CustomDocument[]>([]);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());

  // Modals, Drawers & PWA Install Prompt
  const [selectedCitation, setSelectedCitation] = useState<VerifiedCitation | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<LegalChunk | null>(null);
  const [showCitationDrawer, setShowCitationDrawer] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printAnswer, setPrintAnswer] = useState<AiAnswer | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // Initial Load from Storage, Corpus & PWA Install Listener
  useEffect(() => {
    setBookmarks(getBookmarks());
    setCustomDocs(getCustomDocuments());
    setRecentQueries(getQueryHistory());
    setSettings(getAppSettings());
    loadCorpus().then(() => setCorpusReady(true));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } finally {
      setDeferredInstallPrompt(null);
    }
  };

  // Custom Chunks aus schulinternen Dokumenten
  const customChunks = React.useMemo(() => {
    return customDocsToChunks(customDocs);
  }, [customDocs]);

  // Recherche ausführen (2-stufige Kontextualisierung + Embedding + Geschwister-Chunks + KI-Synthese)
  const handlePerformSearch = async (searchQuery: string, category: string, modeOverride?: 'ai' | 'docs') => {
    if (!searchQuery.trim() || isLoading) return;

    const effectiveMode = modeOverride || searchMode;
    setIsLoading(true);
    setCurrentAnswer(null);
    setLiveMatches(null);
    setActiveTab('search');
    setLastCategory(category);
    setActiveQueryText(searchQuery);
    addQueryHistory(searchQuery);
    setRecentQueries(getQueryHistory());

    try {
      const corpus = await loadCorpus();
      setCorpusReady(true);

      // 1. Zweistufige Kontextualisierung (Umgangssprache -> Schulrechtsbegriffe + Schulart)
      const ctx = await contextualizeQuery(searchQuery, schoolScope, settings.apiKey);

      // 2. Echten 768-dim Query-Vektor auf Basis der kontextualisierten Anfrage anfordern
      const embedRes = await fetchQueryEmbeddingDetailed(ctx.embeddingQuery, settings.apiKey);
      const queryEmbedding = embedRes.embedding;
      const usedSemantic = Boolean(queryEmbedding && corpus.vectors);

      // 3. Semantische Vektor- + Paragraphen- + Schulart-/Primärnorm-Suche
      const searchResults = searchCorpus(searchQuery, {
        categoryFilter: category,
        customChunks,
        queryEmbedding,
        corpus,
        limit: 10,
        expandedTerms: ctx.expandedTerms,
        schoolScope: ctx.effectiveSchoolScope,
      });

      // Direkte Fundstellen sofort anzeigen (inkl. Suchkontext & evtl. Quota-Hinweis)
      setLiveMatches({
        query: searchQuery,
        results: searchResults,
        usedSemanticEmbeddings: usedSemantic,
        contextSummary: ctx.contextSummary,
        embeddingWarning: embedRes.errorReason,
      });

      if (effectiveMode === 'docs') {
        setIsLoading(false);
        return;
      }

      const retrievedChunks = expandWithSiblingChunks(
        searchResults.slice(0, 5).map((r) => r.chunk),
        corpus,
        9
      );
      const finalChunks =
        retrievedChunks.length > 0
          ? retrievedChunks
          : category !== 'all'
          ? corpus.chunks.filter((c) => c.category === category).slice(0, 4)
          : corpus.chunks.slice(0, 4);

      // 4. KI-Synthese durch Gemini-Schul-Proxy auf Basis vollständiger Paragraphen
      const answer = await generateLegalAnswer({
        query: searchQuery,
        relevantChunks: finalChunks,
        userApiKey: settings.apiKey,
        customModel: settings.activeModel,
        schoolScope: ctx.effectiveSchoolScope,
        contextualizedSummary: ctx.contextSummary,
        clarifyingQuestions: ctx.clarifyingQuestions,
        embeddingWarning: embedRes.errorReason,
      });

      setCurrentAnswer({
        ...answer,
        directMatches: searchResults,
        usedSemanticEmbeddings: usedSemantic,
      });
    } catch (err: any) {
      console.error('Fehler bei der Recherche:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Zitat öffnen (Drawer)
  const handleOpenCitation = (citation: VerifiedCitation) => {
    const allAvailableChunks = [...getLoadedCorpusSync().chunks, ...customChunks];
    let matchedChunk = allAvailableChunks.find(c => c.id === citation.chunkId);
    if (!matchedChunk && citation.paragraph) {
      const pLower = citation.paragraph.toLowerCase().trim();
      matchedChunk = allAvailableChunks.find(c => c.paragraph.toLowerCase() === pLower)
                  || allAvailableChunks.find(c => pLower.includes(c.paragraph.toLowerCase()))
                  || allAvailableChunks.find(c => c.paragraph.toLowerCase().includes(pLower));
    }
    setSelectedCitation(citation);
    setSelectedChunk(matchedChunk || null);
    setShowCitationDrawer(true);
  };

  // Paragraphen aus dem Explorer oder der Trefferliste öffnen
  const handleSelectChunkFromExplorer = (chunk: LegalChunk) => {
    setSelectedChunk(chunk);
    setSelectedCitation({
      id: `cit-exp-${chunk.id}`,
      paragraph: chunk.paragraph,
      docTitle: chunk.docShortTitle,
      quote: chunk.summary,
      context: chunk.sectionTitle,
      officialUrl: chunk.officialAnchorUrl,
      pageLabel: chunk.pageLabel,
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
        onOpenBackup={() => setShowBackup(true)}
        onOpenSettings={() => setShowSettings(true)}
        canInstallPwa={Boolean(deferredInstallPrompt)}
        onInstallPwa={handleInstallPwa}
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
                initialQuery={activeQueryText}
                searchMode={searchMode}
                onChangeSearchMode={setSearchMode}
                schoolScope={schoolScope}
                onChangeSchoolScope={setSchoolScope}
              />
            </div>

            {/* Schnellstart-Kacheln & Wissensdatenbank-Übersicht auf der Startseite */}
            {!currentAnswer && !liveMatches && !isLoading && (
              <div className="max-w-5xl mx-auto w-full pt-2 space-y-5">
                <KnowledgeOverviewBanner
                  corpusReady={corpusReady}
                  onOpenCatalog={(catId = 'all') => {
                    setExplorerDocId(null);
                    setExplorerCategory(catId);
                    setActiveTab('explorer');
                  }}
                />
                <QuickStartTray
                  onSelectPrompt={handlePerformSearch}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="max-w-4xl mx-auto w-full p-6 sm:p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-school-border/50 shadow-soft space-y-3 animate-pulse">
                <div className="w-10 h-10 border-4 border-school-primary/20 border-t-school-primary rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base sm:text-lg text-school-textMain dark:text-white">
                    {liveMatches
                      ? 'Erstelle strukturierte KI-Antwort auf Basis der Fundstellen...'
                      : 'Durchsuche alle schulrechtlichen Dokumente per KI-Embedding...'}
                  </h3>
                  <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400">
                    {liveMatches
                      ? 'Die direkten Dokumententreffer unten kannst du bereits jetzt öffnen.'
                      : 'Vergleiche deine Frage semantisch mit über 3.000 Abschnitten aus Gesetzen, Verordnungen & HBS-Konzepten.'}
                  </p>
                </div>
              </div>
            )}

            {/* Direkte Fundstellen (sofort im Modus "Nur Embeddingsuche" oder als Live-Vorschau während KI lädt) */}
            {liveMatches && !currentAnswer && (
              <div className="max-w-5xl mx-auto w-full">
                <DirectMatchesList
                  query={liveMatches.query}
                  results={liveMatches.results}
                  usedSemanticEmbeddings={liveMatches.usedSemanticEmbeddings}
                  contextSummary={liveMatches.contextSummary}
                  embeddingWarning={liveMatches.embeddingWarning}
                  onOpenInDocument={handleSelectChunkFromExplorer}
                />
              </div>
            )}

            {/* 3-Stufen-Antwortansicht inkl. direkter Fundstellen */}
            {currentAnswer && !isLoading && (
              <div className="max-w-5xl mx-auto w-full">
                <AnswerView
                  answer={currentAnswer}
                  onOpenCitation={handleOpenCitation}
                  onOpenInDocument={handleSelectChunkFromExplorer}
                  onSaveBookmark={handleSaveAnswerBookmark}
                  isBookmarked={bookmarks.some(b => b.title === currentAnswer.query)}
                  onPrintReport={handleOpenPrint}
                  onSelectClarifyingQuery={(refined) => handlePerformSearch(refined, lastCategory)}
                  onResetSearch={() => {
                    setCurrentAnswer(null);
                    setLiveMatches(null);
                  }}
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
              corpusReady={corpusReady}
              initialExpandedDocId={explorerDocId}
              initialCategory={explorerCategory}
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

      </main>

      {/* 3. In-App Paragraphen-Reader (Slide-Over Drawer) */}
      {showCitationDrawer && (
        <CitationDrawer
          citation={selectedCitation}
          chunk={selectedChunk}
          onClose={() => setShowCitationDrawer(false)}
          onBookmarkChunk={handleSaveChunkBookmark}
          isBookmarked={bookmarks.some(b => b.title.includes(selectedChunk?.paragraph || ''))}
          onNavigateChunk={handleSelectChunkFromExplorer}
          onOpenDocument={(docId) => {
            setExplorerCategory('all');
            setExplorerDocId(docId);
            setActiveTab('explorer');
          }}
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

      {/* 6. Backup (.json) Modal */}
      {showBackup && (
        <BackupModal
          onClose={() => setShowBackup(false)}
          onRefresh={() => {
            setCustomDocs(getCustomDocuments());
            setBookmarks(getBookmarks());
            setRecentQueries(getQueryHistory());
          }}
        />
      )}

      {/* 7. Footer */}
      <footer className="border-t border-school-border/40 bg-white/70 dark:bg-slate-900/70 py-4 mt-8 print:hidden">
        <div className="w-full max-w-[2100px] mx-auto px-4 sm:px-6 text-center text-xs font-medium text-school-textMuted dark:text-slate-400">
          Semantische Schulrechtssuche
        </div>
      </footer>

    </div>
  );
};
export default App;
