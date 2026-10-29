import React from 'react';
import { Clock, Coffee, Battery, BatteryMedium, BatteryCharging, User, Zap } from 'lucide-react';
import { EnergyLevel } from '../utils/scheduler';

interface TimeBudgetCardProps {
  availableMinutes: number;
  setAvailableMinutes: (mins: number) => void;
  breakMinutes: number;
  setBreakMinutes: (mins: number) => void;
  energyLevel: EnergyLevel;
  setEnergyLevel: (level: EnergyLevel) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  studentContext: string;
  setStudentContext: (ctx: string) => void;
}

export const TimeBudgetCard: React.FC<TimeBudgetCardProps> = ({
  availableMinutes,
  setAvailableMinutes,
  breakMinutes,
  setBreakMinutes,
  energyLevel,
  setEnergyLevel,
  startTime,
  setStartTime,
  studentContext,
  setStudentContext,
}) => {
  const quickTimeButtons = [30, 60, 90, 120, 150, 180, 240];
  const quickBreakButtons = [0, 10, 15, 20, 30];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Time Budget &amp; Parameters</h2>
            <p className="text-xs text-slate-400">Configure your daily constraints for generate_daily_plan</p>
          </div>
        </div>

        {/* Visual Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          {availableMinutes} min ({Math.floor(availableMinutes / 60)}h {availableMinutes % 60 ? `${availableMinutes % 60}m` : ''}) window
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Available Minutes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Available Time for Productive Work</span>
            </label>
            <span className="text-xs font-mono font-bold text-indigo-400">{availableMinutes} minutes</span>
          </div>

          <input
            type="range"
            min="15"
            max="360"
            step="15"
            value={availableMinutes}
            onChange={(e) => setAvailableMinutes(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickTimeButtons.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setAvailableMinutes(time)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  availableMinutes === time
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {time < 60 ? `${time}m` : `${time / 60}h${time % 60 ? ` ${time % 60}m` : ''}`}
              </button>
            ))}
          </div>
        </div>

        {/* Break Minutes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Break Duration</span>
            </label>
            <span className="text-xs font-mono font-bold text-amber-400">{breakMinutes} minutes</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickBreakButtons.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBreakMinutes(b)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  breakMinutes === b
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-slate-800/80 text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {b === 0 ? 'No Break' : `${b} min break`}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            LifeOS strategically places breaks after high-cognitive load tasks to prevent cognitive fatigue.
          </p>
        </div>

        {/* Energy Level */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>Current Energy Level</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { level: 'low', label: 'Low', icon: Battery, color: 'text-amber-400' },
                { level: 'medium', label: 'Medium', icon: BatteryMedium, color: 'text-cyan-400' },
                { level: 'high', label: 'High', icon: BatteryCharging, color: 'text-emerald-400' },
              ] as const
            ).map(({ level, label, icon: Icon, color }) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergyLevel(level)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  energyLevel === level
                    ? 'bg-slate-800 border-indigo-500/50 text-white shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Time & Student Context */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Schedule Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Student / Persona</span>
              </label>
              <input
                type="text"
                value={studentContext}
                onChange={(e) => setStudentContext(e.target.value)}
                placeholder="e.g. 1st year BTech CSE"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
