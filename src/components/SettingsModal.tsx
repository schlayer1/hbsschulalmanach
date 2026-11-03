import React, { useState } from 'react';
import { AppSettings } from '../types/almanach';
import { 
  X, 
  Key, 
  Cpu, 
  ShieldCheck, 
  Save, 
  HardDrive, 
  Info,
  Check
} from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      apiKey: apiKey.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/80 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-school-primaryLight text-school-primaryDark dark:bg-sky-950 dark:text-sky-300">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-school-textMain dark:text-white">
              Einstellungen & KI-Architektur
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Status-Banner: Schul-Serverless-Proxy */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">
                Automatischer Schul-Schlüssel aktiv (Vercel Secret)
              </div>
              <p className="text-emerald-800/80 dark:text-emerald-300 leading-relaxed">
                Auf allen Dienst-iPads der Heimbürgeschule ist die KI-Recherche ohne Eingabe eines API-Schlüssels sofort einsatzbereit. Der Schulschlüssel liegt geschützt im Serverless-Proxy auf Vercel.
              </p>
            </div>
          </div>

          {/* Optionaler individueller Key (BYOK) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-school-textMuted dark:text-slate-300">
              Persönlicher Google Gemini API-Key (Optional / Override)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leer lassen für automatischen Schul-Schlüssel..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-school-textMain dark:text-white font-mono placeholder:font-sans"
            />
            <p className="text-[11px] text-slate-400">
              Nur erforderlich, falls du ein eigenes Kontingent nutzen oder offline/lokal ohne Vercel testen möchtest.
            </p>
          </div>

          {/* Verifizierte Flash-Modelle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-school-textMuted dark:text-slate-300">
              <Cpu className="w-4 h-4 text-school-primary" />
              Aktive Modell-Kaskade (gemini-school-api)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Prioritätsreihenfolge: <code>gemini-flash-lite-latest</code> &rarr; <code>gemini-3-flash-preview</code> &rarr; <code>gemini-flash-latest</code>. Veraltete Modelle (1.5, 2.0, 2.5) sind gemäß Schulstandard strikt ausgeschlossen.
            </p>
          </div>

          {/* Offline-Vektorindex Info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-school-textMuted dark:text-slate-300">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              Lokale Wissensdatenbank (Heimbürgeschule)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              12 offizielle Rechtsvorschriften und Richtlinien (ThürSchulG, ThürSchulO, VVOrg, RISU, LAA, Duales Studium, Wanderrichtlinie, ThürLehrAzVO) sind vorindexiert. Paragraphensuchen funktionieren in unter 5 Millisekunden direkt auf dem iPad.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 min-h-[44px]"
            >
              Schließen
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-school-primary text-white hover:bg-school-primaryDark shadow-soft min-h-[44px]"
            >
              {saved ? <Check className="w-4 h-4 text-teal-300" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Gespeichert!' : 'Speichern'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
