import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coffee,
  Code2,
  CalendarCheck,
  ChevronRight,
  Flame,
  Info,
  Play,
  RotateCcw,
  Sparkles,
  Share2,
  BookOpen,
  Code,
  ShieldAlert,
} from 'lucide-react';
import { DailyPlanResult, ScheduleBlock } from '../utils/scheduler';

interface PlanResultsViewProps {
  plan: DailyPlanResult;
  onStartFocusTimer: (block: ScheduleBlock) => void;
  onSavePlan: () => void;
  onOpenInspector: () => void;
  isSaved: boolean;
}

export const PlanResultsView: React.FC<PlanResultsViewProps> = ({
  plan,
  onStartFocusTimer,
  onSavePlan,
  onOpenInspector,
  isSaved,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const text = `### Time Check & Analysis\n* Total time required: ${plan.totalRequiredMinutes} minutes\n* Available time: ${plan.availableMinutes} minutes\n* Conflict: ${
      plan.fits ? 'None (All tasks fit)' : `Tasks exceed available time by ${plan.timeDeficitMinutes} minutes`
    }\n\n${
      plan.tasksPostponed.length > 0
        ? `### Priority & Postponement Recommendation\n${plan.tasksPostponed
            .map((p) => `* **Postpone:** ${p.task.title} (${p.task.duration} mins)\n  * Reasoning: ${p.reason}`)
            .join('\n')}\n\n`
        : ''
    }### Proposed Daily Schedule (${plan.schedule.reduce((acc, b) => acc + b.duration, 0)} Minutes Total)\n${plan.schedule
      .map(
        (b, i) =>
          `${i + 1}. **${b.title}** (${b.duration} mins, ${b.startTime} - ${b.endTime}): ${b.reason}`
      )
      .join('\n')}\n\n*${plan.disclaimer}*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scheduledTotalDuration = plan.schedule.reduce((acc, b) => acc + b.duration, 0);

  return (
    <div className="space-y-6">
      {/* 1. Time Conflict & Analysis Overview */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          plan.fits
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                plan.fits
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {plan.fits ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {plan.fits ? 'Schedule Fits Perfectly' : 'Time Conflict Detected'}
              </h3>
              <p className="text-xs text-slate-300">
                {plan.fits
                  ? `All planned tasks fit into your ${plan.availableMinutes}-minute window.`
                  : `Your planned tasks exceed available time by ${plan.timeDeficitMinutes} minutes.`}
              </p>
            </div>
          </div>

          {/* Time metrics pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">Required</span>
              <span className="font-mono font-bold text-white">{plan.totalRequiredMinutes}m</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">Available</span>
              <span className="font-mono font-bold text-indigo-400">{plan.availableMinutes}m</span>
            </div>
            {!plan.fits && (
              <div className="bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30 text-xs">
                <span className="text-rose-400 block text-[10px]">Deficit</span>
                <span className="font-mono font-bold text-rose-300">+{plan.timeDeficitMinutes}m</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <strong className="text-white font-semibold">Analysis: </strong>
          {plan.analysisText}
        </p>
      </div>

      {/* 2. Priority & Postponement Recommendation (when tasks exceed time) */}
      {plan.tasksPostponed.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Priority &amp; Postponement Recommendation
              </h3>
              <p className="text-xs text-slate-400">
                Intelligently filtered to prevent burnout and protect academic grades
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {plan.tasksPostponed.map(({ task, reason }) => (
              <div
                key={task.id}
                className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Postpone
                    </span>
                    <span className="text-xs font-bold text-slate-100">{task.title}</span>
                    <span className="text-xs font-mono text-slate-400">({task.duration} mins)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    Priority: {task.priority}
                  </span>
                </div>

                <div className="text-xs text-slate-300 pl-2 border-l-2 border-indigo-500/50 space-y-1">
                  <p>
                    <strong className="text-indigo-300">Reasoning: </strong>
                    {reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Proposed Daily Schedule (Chronological Timeline) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Proposed Daily Schedule ({scheduledTotalDuration} Minutes Total)
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                Optimized Sequence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{plan.explanation}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all"
              title="Copy plan to clipboard"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Plan'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenInspector}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium rounded-xl transition-all"
              title="Inspect raw function payload"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Function Call</span>
            </button>
          </div>
        </div>

        {/* Schedule Blocks */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {plan.schedule.map((block, idx) => {
            const isBreak = block.type === 'break';
            const isDsa = block.title.toLowerCase().includes('dsa');

            return (
              <div key={block.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[30px] top-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                    isBreak
                      ? 'bg-amber-950 border-amber-500 text-amber-400'
                      : isDsa
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-400'
                      : 'bg-blue-950 border-blue-500 text-blue-400'
                  }`}
                >
                  {isBreak ? <Coffee className="w-3 h-3" /> : idx + 1}
                </div>

                {/* Block Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isBreak
                      ? 'bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40'
                      : isDsa
                      ? 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/50'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-white tracking-tight">
                        {block.title}
                      </span>
                      {block.priority && (
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            block.priority === 'high'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {block.priority} Priority
                        </span>
                      )}
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        ({block.duration} mins)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-medium text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {block.startTime} — {block.endTime}
                      </span>

                      <button
                        type="button"
                        onClick={() => onStartFocusTimer(block)}
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-indigo-600/20"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Focus</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{block.reason}</p>

                  {block.tip && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-start gap-1.5 text-[11px] text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{block.tip}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Strict "Nothing Has Been Saved" Banner */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-300">
              <strong className="text-amber-400 font-semibold">{plan.disclaimer}</strong>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review and adjust as needed. When you are ready to begin, click &quot;Commit &amp; Save Plan&quot; to lock it into your active session.
            </p>
          </div>

          <button
            type="button"
            onClick={onSavePlan}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              isSaved
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Plan Saved' : 'Commit & Save Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
