import { BookmarkItem, CustomDocument, AppSettings, AiAnswer, LegalChunk } from '../types/almanach';

const STORAGE_KEYS = {
  BOOKMARKS: 'hbs_almanach_bookmarks_v1',
  CUSTOM_DOCS: 'hbs_almanach_custom_docs_v1',
  SETTINGS: 'hbs_almanach_settings_v1',
  HISTORY: 'hbs_almanach_query_history_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  activeModel: 'gemini-flash-lite-latest',
  temperature: 0.1,
  theme: 'system',
  fontSize: 'normal',
  enableOfflineSearch: true,
};

// 1. Bookmarks & Aktennotizen
export function getBookmarks(): BookmarkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Fehler beim Laden der Lesezeichen:', e);
    return [];
  }
}

export function saveBookmark(title: string, data: AiAnswer | LegalChunk, type: 'answer' | 'paragraph', notes?: string): BookmarkItem {
  const bookmarks = getBookmarks();
  const newItem: BookmarkItem = {
    id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    createdAt: new Date().toISOString(),
    notes,
    type,
    data,
  };
  bookmarks.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  return newItem;
}

export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

// 2. Custom Documents (Schul-Pflegebereich)
export function getCustomDocuments(): CustomDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_DOCS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Fehler beim Laden schulinterner Dokumente:', e);
    return [];
  }
}

export function saveCustomDocument(doc: Omit<CustomDocument, 'id' | 'uploadedAt'>): CustomDocument {
  const docs = getCustomDocuments();
  const newDoc: CustomDocument = {
    ...doc,
    id: `custom-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  };
  docs.unshift(newDoc);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_DOCS, JSON.stringify(docs));
  return newDoc;
}

export function deleteCustomDocument(id: string): void {
  const docs = getCustomDocuments().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_DOCS, JSON.stringify(docs));
}

// 3. Settings
export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

// 4. Suchverlauf (rein lokal auf dem iPad)
export function getQueryHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addQueryHistory(query: string): void {
  if (!query || query.trim().length === 0) return;
  const history = getQueryHistory().filter(q => q.toLowerCase() !== query.toLowerCase());
  history.unshift(query.trim());
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 15)));
}

export function clearQueryHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

// 5. MDM-Resilienz: Backup Export & Import (JSON)
export function createBackupJson(): string {
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    school: 'Staatliche Regelschule Heimbürgeschule Kahla',
    bookmarks: getBookmarks(),
    customDocuments: getCustomDocuments(),
    queryHistory: getQueryHistory(),
  };
  return JSON.stringify(backup, null, 2);
}

export function restoreBackupJson(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !data.version) {
      return { success: false, message: 'Ungültige Backup-Datei: Kein gültiges Almanach-Format.' };
    }

    if (Array.isArray(data.bookmarks)) {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
    }
    if (Array.isArray(data.customDocuments)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DOCS, JSON.stringify(data.customDocuments));
    }
    if (Array.isArray(data.queryHistory)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.queryHistory));
    }

    return { 
      success: true, 
      message: `Erfolgreich wiederhergestellt: ${data.bookmarks?.length || 0} Lesezeichen und ${data.customDocuments?.length || 0} Dokumente.` 
    };
  } catch (err: any) {
    return { success: false, message: `Wiederherstellungsfehler: ${err.message || 'Defektes JSON'}` };
  }
}
