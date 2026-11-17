import React, { useEffect, useRef, useState } from 'react';
import { Download, Upload, X, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBackupJson, restoreBackupJson } from '../services/storageService';

interface BackupModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onRefresh }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (dlg && !dlg.open) {
      dlg.showModal();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleExport = () => {
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
    setStatusMsg({ text: 'JSON-Backup erfolgreich heruntergeladen.', isError: false });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contentStr = event.target?.result as string;
      const res = restoreBackupJson(contentStr);
      setStatusMsg({ text: res.message, isError: !res.success });
      if (res.success) {
        onRefresh();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      onClick={handleBackdropClick}
      aria-labelledby="backup-modal-title"
      className="backdrop:bg-slate-900/60 backdrop:backdrop-blur-xs bg-transparent p-0 m-auto max-w-md w-[calc(100%-2rem)] rounded-2xl shadow-2xl overscroll-contain"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-school-primaryLight text-school-primaryDark dark:bg-sky-950 dark:text-sky-300">
              <Database className="w-4 h-4" aria-hidden="true" />
            </div>
            <h2 id="backup-modal-title" className="font-extrabold text-base text-school-textMain dark:text-white">
              Backup (.json)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Backup-Dialog schließen"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-300 leading-relaxed">
            Sichere deine gemerkten Fundstellen und deinen Suchverlauf als <code>.json</code>-Datei oder spiele eine bestehende Sicherung wieder ein.
          </p>

          {statusMsg && (
            <div
              role="status"
              className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                statusMsg.isError
                  ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              }`}
            >
              {statusMsg.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-school-primary text-white hover:bg-school-primaryDark transition-colors shadow-soft min-h-[46px]"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Backup exportieren (.json)</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="hidden"
              aria-label="Backup-JSON-Datei auswählen"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-700 text-school-textMain dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors min-h-[46px]"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Backup einspielen (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
