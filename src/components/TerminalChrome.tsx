import React from 'react';
import { TerminalWidth, TerminalTheme, ActiveScreen } from '../types/contract';
import { 
  Monitor, 
  Palette, 
  HelpCircle, 
  Sliders, 
  Maximize2, 
  FileCode2, 
  ShieldAlert, 
  Terminal as TerminalIcon 
} from 'lucide-react';

interface TerminalChromeProps {
  children: React.ReactNode;
  width: TerminalWidth;
  setWidth: (width: TerminalWidth) => void;
  theme: TerminalTheme;
  setTheme: (theme: TerminalTheme) => void;
  noColor: boolean;
  setNoColor: (noColor: boolean) => void;
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  onOpenDocs: () => void;
  commandInput: string;
  setCommandInput: (val: string) => void;
  onExecuteCommand: (cmd: string) => void;
}

export const TerminalChrome: React.FC<TerminalChromeProps> = ({
  children,
  width,
  setWidth,
  theme,
  setTheme,
  noColor,
  setNoColor,
  activeScreen,
  setActiveScreen,
  onOpenDocs,
  commandInput,
  setCommandInput,
  onExecuteCommand,
}) => {
  const getWidthClass = () => {
    switch (width) {
      case "very-narrow":
        return "max-w-[560px]"; // ~60 cols
      case "narrow":
        return "max-w-[720px]"; // ~80 cols
      case "standard":
        return "max-w-[980px]"; // ~100 cols
      case "wide":
      default:
        return "max-w-[1240px]"; // >120 cols
    }
  };

  const getThemeClass = () => {
    if (noColor) {
      return "bg-black text-zinc-100 border-zinc-700 font-mono";
    }
    switch (theme) {
      case "amber-crt":
        return "bg-zinc-950 text-amber-400 border-amber-900/60 font-mono shadow-[0_0_30px_rgba(245,158,11,0.15)]";
      case "matrix-green":
        return "bg-zinc-950 text-emerald-400 border-emerald-900/60 font-mono shadow-[0_0_30px_rgba(16,185,129,0.15)]";
      case "paper-light":
        return "bg-zinc-100 text-zinc-900 border-zinc-300 font-mono shadow-xl";
      case "terminal-dark":
      default:
        return "bg-[#0b0e14] text-zinc-200 border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)]";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onExecuteCommand(commandInput);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 transition-all duration-200">
      {/* Top Prototype Control Deck (External to terminal simulation) */}
      <header className="w-full max-w-6xl mb-3 flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-400 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-zinc-200 tracking-wide">
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            CodeGuardian G00 CLI Prototype
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
            PROTOTYPE / DEMO ONLY
          </span>
        </div>

        {/* Viewport Width and Mode Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Terminal Width Selector */}
          <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
            <Monitor className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500 mr-1">Cols:</span>
            <button
              onClick={() => setWidth("wide")}
              className={`px-1.5 py-0.5 rounded transition ${width === 'wide' ? 'bg-cyan-500 text-black font-bold' : 'hover:text-zinc-200'}`}
              title="Wide terminal (>120 cols)"
            >
              120+
            </button>
            <button
              onClick={() => setWidth("standard")}
              className={`px-1.5 py-0.5 rounded transition ${width === 'standard' ? 'bg-cyan-500 text-black font-bold' : 'hover:text-zinc-200'}`}
              title="Standard terminal (100 cols)"
            >
              100
            </button>
            <button
              onClick={() => setWidth("narrow")}
              className={`px-1.5 py-0.5 rounded transition ${width === 'narrow' ? 'bg-cyan-500 text-black font-bold' : 'hover:text-zinc-200'}`}
              title="Narrow terminal (80 cols)"
            >
              80 (Narrow)
            </button>
            <button
              onClick={() => setWidth("very-narrow")}
              className={`px-1.5 py-0.5 rounded transition ${width === 'very-narrow' ? 'bg-cyan-500 text-black font-bold' : 'hover:text-zinc-200'}`}
              title="Very narrow terminal (60 cols)"
            >
              60
            </button>
          </div>

          {/* NO_COLOR Accessibility Switch */}
          <button
            onClick={() => setNoColor(!noColor)}
            className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center gap-1 transition ${
              noColor 
                ? 'bg-zinc-200 text-zinc-900 border-zinc-100 font-bold' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Toggle NO_COLOR mode (Accessibility test for monochrome terminal without ANSI colors)"
          >
            NO_COLOR: {noColor ? 'ON' : 'OFF'}
          </button>

          {/* Theme Switcher */}
          {!noColor && (
            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as TerminalTheme)}
                aria-label="Terminal Color Theme"
                className="bg-transparent text-zinc-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="terminal-dark" className="bg-zinc-900 text-zinc-100">Dark Modern</option>
                <option value="amber-crt" className="bg-zinc-900 text-amber-400">Amber CRT</option>
                <option value="matrix-green" className="bg-zinc-900 text-emerald-400">Phosphor Green</option>
                <option value="paper-light" className="bg-zinc-100 text-zinc-900">Light Paper</option>
              </select>
            </div>
          )}

          {/* Ink Handoff & Specs Button */}
          <button
            onClick={onOpenDocs}
            className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 font-medium flex items-center gap-1 text-[11px] transition shadow-sm"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            Ink Specs & Codex Handoff
          </button>
        </div>
      </header>

      {/* Main Simulated Terminal Frame */}
      <div 
        className={`w-full ${getWidthClass()} border rounded-lg overflow-hidden flex flex-col transition-all duration-200 ${getThemeClass()}`}
      >
        {/* Terminal Window Header Bar */}
        <div className={`px-3 py-2 flex items-center justify-between border-b ${noColor ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800/80 bg-zinc-900/90'} text-xs select-none`}>
          <div className="flex items-center gap-2">
            {/* Terminal Window Dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block border border-red-600/50"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/50"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/50"></span>
            </div>
            <span className="ml-2 font-mono text-zinc-400 text-[11px] truncate">
              codeguardian@devbox: ~/workspace/CodeGuardian (bash)
            </span>
          </div>

          {/* Width column indicator */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
            <span>{width === 'very-narrow' ? '60x24' : width === 'narrow' ? '80x24' : width === 'standard' ? '100x30' : '124x36'}</span>
            <span className="hidden sm:inline">UTF-8</span>
          </div>
        </div>

        {/* Persistent, Unmissable DEMO ONLY Indicator Banner */}
        <div className={`w-full py-1.5 px-3 text-center text-xs font-bold tracking-wider uppercase border-b flex items-center justify-center gap-2 ${
          noColor 
            ? 'bg-zinc-800 text-zinc-100 border-zinc-600' 
            : theme === 'amber-crt'
            ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            : theme === 'matrix-green'
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
            : theme === 'paper-light'
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : 'bg-amber-950/70 text-amber-300 border-amber-900/60'
        }`}>
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span>CODEGUARDIAN — DEMO ONLY • MOCK SIMULATION • NO GITHUB OR AI CALLS</span>
        </div>

        {/* Interactive Screen Container */}
        <main className="p-3 sm:p-5 flex-1 min-h-[460px] overflow-y-auto">
          {children}
        </main>

        {/* Command Line Input Simulator */}
        <div className={`p-2.5 border-t ${noColor ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-800/80 bg-zinc-950/80'} flex items-center gap-2 text-xs font-mono`}>
          <span className="text-cyan-400 font-bold select-none">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type CLI command (e.g., 'codeguardian review https://github.com/example/demo/pull/42 --demo') or press [H]"
            className={`flex-1 bg-transparent border-none outline-none text-xs font-mono placeholder:text-zinc-600 ${
              noColor ? 'text-zinc-100' : 'text-zinc-200'
            }`}
          />
          <button
            onClick={() => onExecuteCommand(commandInput)}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] border border-zinc-700 transition"
          >
            Enter ↵
          </button>
        </div>

        {/* Bottom Screen Navigation Bar & Quick Keys */}
        <div className={`px-3 py-2 border-t ${noColor ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-900 bg-black/40'} text-[11px] flex flex-wrap items-center justify-between gap-1 text-zinc-400 select-none`}>
          <div className="flex items-center flex-wrap gap-1">
            <span className="text-zinc-500 mr-1 text-[10px]">SCREENS:</span>
            {[
              { id: 'welcome', key: '1', label: 'Welcome' },
              { id: 'auth', key: '2', label: 'Auth' },
              { id: 'pr_input', key: '3', label: 'PR Input' },
              { id: 'inspection', key: '4', label: 'Inspection' },
              { id: 'multi_agent', key: '5', label: 'Workers' },
              { id: 'validation', key: '6', label: 'Validation' },
              { id: 'report', key: '7', label: 'Report' },
              { id: 'publish', key: '8', label: 'Publish' },
              { id: 'scenarios', key: '9', label: 'Scenarios' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScreen(s.id as ActiveScreen)}
                className={`px-1.5 py-0.5 rounded font-mono transition text-[11px] ${
                  activeScreen === s.id
                    ? noColor ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                [{s.key}] {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
            <span>[Tab] Nav</span>
            <span>[Esc] Clear</span>
            <span>[?] Help</span>
          </div>
        </div>
      </div>
    </div>
  );
};
