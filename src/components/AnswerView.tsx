import React from 'react';
import { 
  AiAnswer, 
  VerifiedCitation 
} from '../types/almanach';
import { 
  CheckCircle2, 
  ListChecks, 
  AlertTriangle, 
  Scale, 
  Bookmark, 
  BookmarkCheck, 
  Printer, 
  ExternalLink, 
  Sparkles, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';

interface AnswerViewProps {
  answer: AiAnswer;
  onOpenCitation: (citation: VerifiedCitation) => void;
  onSaveBookmark: (answer: AiAnswer) => void;
  isBookmarked: boolean;
  onPrintReport: (answer: AiAnswer) => void;
  onResetSearch: () => void;
}

export const AnswerView: React.FC<AnswerViewProps> = ({
  answer,
  onOpenCitation,
  onSaveBookmark,
  isBookmarked,
  onPrintReport,
  onResetSearch,
}) => {
  const cat = CATEGORIES[answer.category] || CATEGORIES.schulrecht;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      
      {/* Top Header Card: Original Question & Meta */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${cat.badgeColor}`}>
              {cat.name}
            </span>
            <span className="text-xs text-school-textMuted dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-school-primary" />
              {answer.usedModel}
            </span>
            {answer.isOfflineFallback && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Offline-Index
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveBookmark(answer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                isBookmarked
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-school-textMain dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
              <span>{isBookmarked ? 'Gemerkt' : 'Auf Merkzettel'}</span>
            </button>

            <button
              onClick={() => onPrintReport(answer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-school-textMain dark:text-slate-200 hover:bg-slate-200 transition-all min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              <span>Aktennotiz drucken</span>
            </button>

            <button
              onClick={onResetSearch}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Neue Frage stellen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The User Question */}
        <div>
          <span className="text-xs uppercase font-bold text-school-textMuted tracking-wider">
            Rechtsanfrage des Kollegiums:
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-school-textMain dark:text-white mt-1">
            „{answer.query}“
          </h2>
        </div>
      </div>

      {/* STUFE 1: 🟢 SCHNELL-FAZIT (1-2 Sätze) */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/30 rounded-2xl p-4 sm:p-6 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Stufe 1 &middot; Schnelles Praxis-Fazit
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                (Sofortige Handlungssicherheit im Schulalltag)
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-school-textMain dark:text-emerald-50 leading-snug">
              {answer.quickConclusion}
            </p>
          </div>
        </div>
      </div>

      {/* STUFE 2: 📋 HANDLUNGSSCHRITTE & ZUSTÄNDIGKEITEN */}
      {answer.actionSteps && answer.actionSteps.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-school-textMain dark:text-white">
                Stufe 2 &middot; Konkrete Praxisschritte & Zuständigkeiten
              </h3>
              <p className="text-xs text-school-textMuted dark:text-slate-400">
                Wer muss was in welcher Reihenfolge tun?
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {answer.actionSteps.map((step) => {
              const roleColors: Record<string, string> = {
                Lehrkraft: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300',
                Klassenleitung: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300',
                Schulleitung: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300',
                Fachlehrer: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border-teal-300',
                Mentor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300',
              };

              return (
                <div 
                  key={step.stepNumber}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex items-start gap-3.5"
                >
                  <div className="w-7 h-7 rounded-full bg-school-primary text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-school-textMain dark:text-slate-100">
                        {step.title}
                      </h4>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${roleColors[step.role] || roleColors.Lehrkraft}`}>
                        Zuständig: {step.role}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                    {step.warning && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold pt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {step.warning}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AUSNAHMEN, FRISTEN & FORMREGELN */}
      {answer.exceptionsAndRules && answer.exceptionsAndRules.length > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl p-4 sm:p-5 border border-amber-300/80 dark:border-amber-800/60 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Wichtige Ausnahmen, Formvorschriften & Fristen:</span>
          </div>
          <ul className="list-disc list-inside text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 space-y-1 pl-1">
            {answer.exceptionsAndRules.map((rule, idx) => (
              <li key={idx} className="leading-relaxed">{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* STUFE 3: ⚖️ VERIFIZIERTE FUNDSTELLEN & ZITATE */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-school-border/50 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-school-textMain dark:text-white">
                Stufe 3 &middot; Verifizierte Fundstellen & Originalzitate
              </h3>
              <p className="text-xs text-school-textMuted dark:text-slate-400">
                Klicke auf ein Zitat, um den Gesetzestext direkt im In-App-Reader zu verifizieren
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-school-primary dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
            {(answer.citations || []).length} Fundstellen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {(answer.citations || []).map((citation) => (
            <div
              key={citation.id}
              onClick={() => onOpenCitation(citation)}
              className="group text-left p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/70 hover:border-school-primary dark:hover:border-sky-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-soft transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs sm:text-sm text-school-primary dark:text-sky-400 group-hover:underline flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    {citation.paragraph}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                    Öffnen <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                <div className="text-[11px] font-medium text-school-textMuted dark:text-slate-400 line-clamp-1">
                  {citation.docTitle}
                </div>

                {/* Zitatbox */}
                <blockquote className="border-l-2 border-school-primary/60 dark:border-sky-400 pl-2.5 text-xs text-school-textMain dark:text-slate-200 italic line-clamp-3 bg-white/70 dark:bg-slate-900/40 p-2 rounded-r-lg">
                  „{citation.quote}“
                </blockquote>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 truncate pr-2">
                  {citation.context}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                  Verifiziert
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
