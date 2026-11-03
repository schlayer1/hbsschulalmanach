import React from 'react';
import { AiAnswer } from '../types/almanach';
import { X, Printer, CheckCircle, Scale, ShieldCheck } from 'lucide-react';

interface PrintReportModalProps {
  answer: AiAnswer | null;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  answer,
  onClose,
}) => {
  if (!answer) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-w-none print:max-h-none print:h-auto">
        
        {/* Screen Header (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-school-primary" />
            <h3 className="font-extrabold text-base text-school-textMain">
              Druckansicht: DIN-A4 Aktennotiz
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-school-primary text-white hover:bg-school-primaryDark transition-all shadow-soft"
            >
              <Printer className="w-4 h-4" />
              <span>Jetzt drucken</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable DIN A4 Document Content */}
        <div 
          id="printable-output"
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-slate-800 print:p-0 print:overflow-visible text-sm"
        >
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Staatliche Regelschule Heimbürgeschule Kahla
              </div>
              <h1 className="text-xl font-black text-slate-900 mt-1">
                Schulrechtliche Auskunft & Aktennotiz
              </h1>
              <div className="text-xs text-slate-500 mt-0.5">
                Digitaler Schulalmanach &middot; Verifizierte Thüringer Rechtsrecherche
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div><strong>Datum:</strong> {currentDate}</div>
              <div><strong>Status:</strong> Rechtsstand 2026</div>
              <div><strong>Referenz:</strong> HBS-ALM-{Date.now().toString().slice(-6)}</div>
            </div>
          </div>

          {/* Fragestellung */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
              Gegenstand der rechtlichen Prüfung:
            </span>
            <p className="font-bold text-base text-slate-900">
              „{answer.query}“
            </p>
          </div>

          {/* 1. Kernaussage / Schnellfazit */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              1. Rechtliches Fazit
            </h2>
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 font-bold text-emerald-950 text-sm leading-relaxed">
              {answer.quickConclusion}
            </div>
          </div>

          {/* 2. Handlungsschritte & Zuständigkeiten */}
          {answer.actionSteps && answer.actionSteps.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                2. Handlungsschritte & Verfahrensablauf
              </h2>
              <div className="space-y-2">
                {answer.actionSteps.map((step) => (
                  <div key={step.stepNumber} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 text-xs">{step.title}</strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                          {step.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Ausnahmen & Fristen */}
          {answer.exceptionsAndRules && answer.exceptionsAndRules.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                3. Wichtige Fristen & Formvorschriften
              </h2>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                {answer.exceptionsAndRules.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Fundstellen & Paragraphen */}
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-600" />
              4. Gesetzliche Grundlagen & Paragraphen
            </h2>
            <div className="space-y-2">
              {answer.citations.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{c.paragraph} &middot; {c.docTitle}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{c.context}</span>
                  </div>
                  <blockquote className="border-l-2 border-slate-400 pl-2 text-slate-700 italic">
                    „{c.quote}“
                  </blockquote>
                  <div className="text-[10px] text-slate-400 truncate">
                    Fundstelle: {c.officialUrl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unterschriftenfeld für Schülerakte / Schulleitung */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <div className="h-10 border-b border-slate-400 mb-1" />
              <span>Datum, Unterschrift bearbeitende Lehrkraft / Klassenleitung</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mb-1" />
              <span>Gesehen / Genehmigt Schulleitung Heimbürgeschule Kahla</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
