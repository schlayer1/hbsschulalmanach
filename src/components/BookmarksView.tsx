import React, { useState } from 'react';
import { BookmarkItem, AiAnswer, LegalChunk } from '../types/almanach';
import { 
  Bookmark, 
  Trash2, 
  Printer, 
  Download, 
  Upload, 
  BookOpen, 
  Scale, 
  Calendar, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { createBackupJson, restoreBackupJson } from '../services/storageService';

interface BookmarksViewProps {
  bookmarks: BookmarkItem[];
  onRemoveBookmark: (id: string) => void;
  onOpenItem: (item: BookmarkItem) => void;
  onPrintItem: (answer: AiAnswer) => void;
  onRefreshBookmarks: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onRemoveBookmark,
  onOpenItem,
  onPrintItem,
  onRefreshBookmarks,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportBackup = () => {
    const jsonStr = createBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hbs-almanach-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = restoreBackupJson(content);
      setImportStatus(res.message);
      if (res.success) {
        onRefreshBookmarks();
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Backup Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-school-textMain dark:text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-school-primary" />
              Persönlicher Merkzettel & Aktennotizen
            </h2>
            <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400 mt-1">
              Gespeicherte Rechtsfälle, Paragraphen und Notizen. Bleibt 100% lokal auf diesem iPad gespeichert.
            </p>
          </div>

          {/* Backup Action Buttons (MDM-Protection) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportBackup}
              title="Alle Lesezeichen und Notizen als JSON sichern"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-school-textMain dark:text-slate-200 hover:bg-slate-200 transition-colors min-h-[40px]"
            >
              <Download className="w-4 h-4 text-school-primary" />
              <span>Backup sichern</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-school-textMain dark:text-slate-200 hover:bg-slate-200 transition-colors min-h-[40px] cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Wiederherstellen</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-school-textMain dark:text-white">
            Noch keine Einträge auf dem Merkzettel
          </h3>
          <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400 mt-1 max-w-md mx-auto">
            Klicke bei einer Recherche oder in einem Gesetz auf „Auf Merkzettel“, um wichtige Auskünfte und Paragraphen für später festzuhalten.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bm) => {
            const isAnswer = bm.type === 'answer';
            const answerData = isAnswer ? (bm.data as AiAnswer) : null;
            const chunkData = !isAnswer ? (bm.data as LegalChunk) : null;

            return (
              <div
                key={bm.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-school-border/50 shadow-soft space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isAnswer 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {isAnswer ? 'KI-Recherchefall' : 'Paragraph'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(bm.createdAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-school-textMain dark:text-white">
                      {bm.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isAnswer && answerData && (
                      <button
                        onClick={() => onPrintItem(answerData)}
                        className="p-2 rounded-xl text-slate-400 hover:text-school-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Als Aktennotiz drucken"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveBookmark(bm.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Lesezeichen entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content snippet */}
                {isAnswer && answerData && (
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-school-textMain dark:text-slate-200 font-semibold bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/80">
                      Fazit: {answerData.quickConclusion || 'Rechtliche Auswertung hinterlegt.'}
                    </p>
                    {Array.isArray(answerData.citations) && answerData.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {answerData.citations.map((c, idx) => (
                          <span key={idx} className="text-[11px] font-bold text-school-primary dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                            {c.paragraph}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isAnswer && chunkData && (
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-school-textMain dark:text-slate-200 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      {chunkData.summary}
                    </p>
                    <div className="text-[11px] font-bold text-school-primary dark:text-sky-400">
                      {chunkData.paragraph} &middot; {chunkData.docShortTitle}
                    </div>
                  </div>
                )}

                {/* Open Button */}
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => onOpenItem(bm)}
                    className="text-xs font-bold text-school-primary dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Vollständig anzeigen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
