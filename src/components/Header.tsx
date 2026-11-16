import React from 'react';
import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetAll }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <a
          href="#overview"
          className="font-display text-lg font-bold tracking-tight text-sky-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
        >
          AQUA CARE
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#overview"
            className="hover:text-sky-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="#ph-testing"
            className="hover:text-sky-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            pH Testing
          </a>
          <a
            href="#algae-detection"
            className="hover:text-sky-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Algae Scan
          </a>
          <a
            href="#results"
            className="hover:text-sky-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Results
          </a>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 active:bg-sky-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>New Check</span>
          </button>
        </div>
      </div>
    </header>
  );
};
