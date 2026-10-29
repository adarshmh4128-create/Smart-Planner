import React from 'react';
import { BookmarkCheck, Trash2, Calendar, Clock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DailyPlanResult, ScheduleBlock } from '../utils/scheduler';

export interface SavedPlanRecord {
  id: string;
  savedAt: string;
  plan: DailyPlanResult;
}

interface SavedPlansViewProps {
  savedPlans: SavedPlanRecord[];
  onLoadPlan: (plan: DailyPlanResult) => void;
  onDeletePlan: (id: string) => void;
  onClearAll: () => void;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  savedPlans,
  onLoadPlan,
  onDeletePlan,
  onClearAll,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Saved Daily Schedules</h2>
              <p className="text-xs text-slate-400">
                Plans you explicitly approved and committed to your study log
              </p>
            </div>
          </div>

          {savedPlans.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 transition-all font-medium"
            >
              Clear All Saved Plans
            </button>
          )}
        </div>

        {savedPlans.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
            <BookmarkCheck className="w-8 h-8 mx-auto text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">No saved plans yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              generate_daily_plan creates proposed schedules that are never automatically saved.
              When you are satisfied with a proposal, click &quot;Commit &amp; Save Plan&quot;!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPlans.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-400">
                      Saved {new Date(item.savedAt).toLocaleDateString()} at{' '}
                      {new Date(item.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {item.plan.availableMinutes}m Budget
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onLoadPlan(item.plan)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      <span>Load into Planner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePlan(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                      title="Delete saved plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {item.plan.schedule.map((b, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg border font-medium ${
                        b.type === 'break'
                          ? 'bg-amber-950/30 border-amber-500/20 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      {b.title} ({b.duration}m)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
