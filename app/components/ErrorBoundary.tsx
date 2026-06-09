"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { WifiOff, RotateCcw } from "lucide-react";
import { getTranslation } from "../hooks/useTranslation";
import { useProgressStore } from "../lib/store";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryContent extends Component<Props & { language: string }, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Optionnel : Forcer un petit re-render ou recharger la page si c'est un ChunkLoadError
    if (this.state.error?.name === 'ChunkLoadError' || this.state.error?.message.includes('Loading chunk')) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.name === 'ChunkLoadError' || this.state.error?.message.includes('Loading chunk');
      
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <WifiOff size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isChunkError ? "Connexion perdue" : "Oups ! Une erreur est survenue"}
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            {isChunkError 
              ? "Impossible de charger l'exercice à cause d'une perte de connexion réseau." 
              : "Un problème inattendu a empêché l'affichage de cet exercice."}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={20} />
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper for using Zustand hooks in class component
export function ErrorBoundary({ children }: Props) {
  const language = useProgressStore(state => state.language);
  return <ErrorBoundaryContent language={language}>{children}</ErrorBoundaryContent>;
}
