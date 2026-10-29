import React from 'react';
import { Calendar, Sparkles, Terminal, Play, BookmarkCheck, Clock, ShieldCheck } from 'lucide-react';
import { PRESETS, PlanPreset } from '../data/presets';

interface HeaderProps {
  activeTab: 'planner' | 'prompt-tester' | 'timer' | 'saved';
  setActiveTab: (tab: 'planner' | 'prompt-tester' | 'timer' | 'saved') => void;
  selectedPresetId: string;
  onSelectPreset: (preset: PlanPreset) => void;
  savedPlansCount: number;
  isTimerRunning: boolean;
  activeBlockTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedPresetId,
  onSelectPreset,
  savedPlansCount,
  isTimerRunning,
  activeBlockTitle,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">LifeOS</h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Daily Planning Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Academic schedule optimizer &amp; realistic conflict solver
              </p>
            </div>
          </div>

          {/* Quick preset selector for mobile */}
          <div className="md:hidden">
            <select
              aria-label="Select test preset"
              value={selectedPresetId}
              onChange={(e) => {
                const found = PRESETS.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center / Right Presets & Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Chips (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Presets:
            </span>
            {PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('prompt-tester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'prompt-tester'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>LifeOS Chat / Prompt Tester</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all relative ${
                activeTab === 'timer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Focus Timer</span>
              {isTimerRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Saved Plans</span>
              {savedPlansCount > 0 && (
                <span className="bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                  {savedPlansCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
