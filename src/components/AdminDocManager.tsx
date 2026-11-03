import React, { useState } from 'react';
import { CustomDocument, DocumentCategory } from '../types/almanach';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Sparkles, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  BookOpen, 
  School,
  Terminal
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { createBackupJson, restoreBackupJson } from '../services/storageService';

interface AdminDocManagerProps {
  customDocs: CustomDocument[];
  onSaveDoc: (doc: Omit<CustomDocument, 'id' | 'uploadedAt'>) => void;
  onDeleteDoc: (id: string) => void;
  onRefresh: () => void;
}

export const AdminDocManager: React.FC<AdminDocManagerProps> = ({
  customDocs,
  onSaveDoc,
  onDeleteDoc,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('hbs_intern');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSaveDoc({
      title: title.trim(),
      shortTitle: shortTitle.trim() || title.trim().slice(0, 20),
      category,
      content: content.trim(),
      summary: summary.trim() || content.trim().slice(0, 150) + '...',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });

    setTitle('');
    setShortTitle('');
    setContent('');
    setSummary('');
    setTags('');
    setShowAddModal(false);
    setStatusMsg('Schulinternes Dokument erfolgreich hinzugefügt und in die Suche aufgenommen!');
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleExport = () => {
    const jsonStr = createBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hbs-almanach-schulbackup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contentStr = event.target?.result as string;
      const res = restoreBackupJson(contentStr);
      setStatusMsg(res.message);
      if (res.success) {
        onRefresh();
      }
      setTimeout(() => setStatusMsg(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                Schulleitung & Redaktion
              </span>
              <span className="text-xs text-school-textMuted dark:text-slate-400">
                Heimbürgeschule Kahla
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-school-textMain dark:text-white flex items-center gap-2">
              <School className="w-5 h-5 text-school-primary" />
              Schul-Pflegebereich & Dokumenten-Manager
            </h2>
            <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-400 mt-1">
              Ergänze schulinterne Ordnungen, Beschlüsse der Lehrerkonferenz und Handreichungen, die sofort durchsuchbar sind.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-school-primary text-white hover:bg-school-primaryDark transition-all shadow-soft shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Neues Dokument hinterlegen</span>
          </button>
        </div>

        {statusMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Antigravity Update-Skript Info-Kachel */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-6 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-sm sm:text-base tracking-wide">
              Halbjährliches Antigravity-Update (2× pro Schuljahr)
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
            Automatisierter Abgleich
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Um den Gesetzesbestand (neue VVOrg für das kommende Schuljahr, Novellen des ThürSchulG oder neue UKT-RISU-Vorschriften) aktuell zu halten, führe einfach im Projektverzeichnis folgenden Befehl aus:
        </p>

        <div className="p-3 rounded-xl bg-black/60 font-mono text-xs text-teal-300 border border-slate-700/80 flex items-center justify-between">
          <span>npm run update-almanach</span>
          <span className="text-[11px] text-slate-400 font-sans">Prüft Änderungen & regeneriert Vektoren</span>
        </div>
      </div>

      {/* Liste der schulinternen Dokumente */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft space-y-4">
        <h3 className="font-bold text-base text-school-textMain dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-school-primary" />
          Hinterlegte schulinterne Dokumente ({customDocs.length})
        </h3>

        {customDocs.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Aktuell sind noch keine zusätzlichen schulinternen Dokumente hinterlegt.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Nutze den Button oben, um z. B. das Vertretungskonzept oder die Hausordnung hochzuladen.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {customDocs.map((doc) => (
              <div key={doc.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      Schulintern
                    </span>
                    <span className="text-xs font-bold text-school-primary">
                      {doc.shortTitle}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(doc.uploadedAt).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-school-textMain dark:text-white">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-school-textMuted dark:text-slate-300 line-clamp-2">
                    {doc.summary}
                  </p>
                </div>

                <button
                  onClick={() => onDeleteDoc(doc.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  title="Dokument löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MDM Tablet-Reset Schutz Sektion */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-school-textMain dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            Schulweites Daten-Backup (MDM-Schutz)
          </h3>
          <p className="text-xs text-school-textMuted dark:text-slate-400 mt-1">
            Exportiere alle Lesezeichen und schulinternen Dokumente als Sicherheitskopie vor einem MDM-Tablet-Reset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-school-textMain dark:text-slate-200 hover:bg-slate-200 transition-colors min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>Backup exportieren</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-school-textMain dark:text-slate-200 hover:bg-slate-200 transition-colors min-h-[40px] cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Backup importieren</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Modal: Neues Dokument anlegen */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 shrink-0 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-school-textMain dark:text-white">
                Schulinternes Dokument hinterlegen
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-school-textMuted dark:text-slate-300 mb-1">
                  Vollständiger Titel des Dokuments *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z. B. Beschluss der Lehrerkonferenz zur Handynutzung"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-school-textMuted dark:text-slate-300 mb-1">
                    Kurztitel (für Zitate)
                  </label>
                  <input
                    type="text"
                    value={shortTitle}
                    onChange={(e) => setShortTitle(e.target.value)}
                    placeholder="z. B. HBS LK-Beschluss 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-school-textMuted dark:text-slate-300 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white"
                  >
                    {Object.values(CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-school-textMuted dark:text-slate-300 mb-1">
                  Kurzzusammenfassung (Fazit)
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Kernregelung in 1-2 Sätzen..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-school-textMuted dark:text-slate-300 mb-1">
                  Volltext / Regelungsinhalt *
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Füge hier den Text der internen Handreichung oder des Beschlusses ein..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-school-textMuted dark:text-slate-300 mb-1">
                  Schlagworte (kommagetrennt)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="z. B. Handy, Pausen, Lehrerkonferenz, Beschluss"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 min-h-[44px]"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-school-primary text-white hover:bg-school-primaryDark shadow-soft min-h-[44px]"
                >
                  Speichern & Indexieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
