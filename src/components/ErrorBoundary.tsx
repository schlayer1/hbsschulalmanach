import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary abgefangen:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleHardReload = async () => {
    try {
      // 1. Service Worker Caches leeren
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // 2. Registrierte Service Worker deregistrieren
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
    } catch (e) {
      console.warn('Cache-Bereinigung fehlgeschlagen:', e);
    }
    // Hard Reload
    window.location.reload();
  };

  handleResetStorageAndReload = async () => {
    if (window.confirm('Möchtest du den lokalen Browser-Speicher der App wirklich zurücksetzen? (Gespeicherte Lesezeichen werden gelöscht)')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        await this.handleHardReload();
      } catch (e) {
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-school-surface text-school-textMain flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-school-border/60 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-soft">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-school-primary dark:text-sky-400">
                Staatliche Regelschule Heimbürgeschule Kahla
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-school-textMain dark:text-white">
                Anzeige wird aktualisiert
              </h1>
              <p className="text-xs sm:text-sm text-school-textMuted dark:text-slate-300 leading-relaxed">
                Nach dem Update lag noch ein veralteter Stand im Browser-Cache deines Geräts. Klicke einfach auf den Button unten, um den aktuellen Stand direkt neu zu laden.
              </p>
            </div>

            {/* Error Message Details (Collapsible) */}
            {this.state.error && (
              <div className="text-left bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-mono text-slate-600 dark:text-slate-400 max-h-32 overflow-y-auto">
                <div className="font-bold text-rose-600 dark:text-rose-400 mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </div>
              </div>
            )}

            {/* Recovery Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleHardReload}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-extrabold bg-school-primary hover:bg-school-primaryDark text-white shadow-soft transition-all min-h-[48px]"
              >
                <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                <span>Cache leeren & App neu laden</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorageAndReload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Speicher komplett zurücksetzen</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>HBS Schulalmanach &middot; Verifizierte Offline-Architektur</span>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
