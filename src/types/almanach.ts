// Typdefinitionen für den HBS Schulalmanach (Heimbürgeschule Kahla)

export type DocumentCategory = 
  | 'schulrecht'
  | 'organisation'
  | 'ausbildung'
  | 'fahrten'
  | 'sicherheit'
  | 'dienstrecht'
  | 'datenschutz'
  | 'hbs_intern';

export interface CategoryMeta {
  id: DocumentCategory;
  name: string;
  shortDesc: string;
  icon: string;
  badgeColor: string;
  borderHover: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  shortTitle: string;
  legalBasis: string;
  category: DocumentCategory;
  currentVersion: string;
  lastCheckedDate: string;
  officialUrl: string;
  description: string;
  chunksCount: number;
  tags: string[];
  isInternal?: boolean;
}

export interface LegalChunk {
  id: string;
  docId: string;
  docShortTitle: string;
  category: DocumentCategory;
  paragraph: string; // z. B. "§ 51 Abs. 2 ThürSchulG"
  sectionTitle: string;
  text: string;
  summary: string;
  keyTakeaways: string[];
  officialAnchorUrl: string;
  tags: string[];
  embedding?: number[];
}

export interface SearchResult {
  chunk: LegalChunk;
  score: number;
  matchType: 'exact_paragraph' | 'semantic' | 'keyword' | 'hybrid';
  highlightedText?: string;
}

export interface ActionStep {
  stepNumber: number;
  title: string;
  description: string;
  role: 'Lehrkraft' | 'Klassenleitung' | 'Schulleitung' | 'Fachlehrer' | 'Mentor';
  warning?: string;
}

export interface VerifiedCitation {
  id: string;
  paragraph: string;
  docTitle: string;
  quote: string;
  context: string;
  officialUrl: string;
  relevanceScore: number;
  chunkId: string;
}

export interface AiAnswer {
  query: string;
  quickConclusion: string; // 1-2 Sätze Schnellfazit
  actionSteps: ActionStep[];
  exceptionsAndRules: string[];
  citations: VerifiedCitation[];
  category: DocumentCategory;
  confidenceScore: number;
  usedModel: string;
  isOfflineFallback?: boolean;
  timestamp: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  createdAt: string;
  notes?: string;
  type: 'answer' | 'paragraph';
  data: AiAnswer | LegalChunk;
}

export interface CustomDocument {
  id: string;
  title: string;
  shortTitle: string;
  category: DocumentCategory;
  uploadedAt: string;
  content: string;
  summary: string;
  tags: string[];
  fileName?: string;
}

export interface AppSettings {
  apiKey: string;
  activeModel: string;
  temperature: number;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'normal' | 'large';
  enableOfflineSearch: boolean;
}

export interface QuickPrompt {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  category: DocumentCategory;
  icon: string;
  badge: string;
}
