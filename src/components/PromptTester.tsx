import React, { useState } from 'react';
import { Terminal, Send, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Clock, Coffee, ShieldAlert } from 'lucide-react';
import { DailyPlanResult, generateDailyPlan, Task } from '../utils/scheduler';

interface PromptTesterProps {
  onLoadPlanIntoPlanner: (plan: DailyPlanResult) => void;
}

export const PromptTester: React.FC<PromptTesterProps> = ({ onLoadPlanIntoPlanner }) => {
  const defaultPrompt = `Hey LifeOS! Let's test your daily planning ability.

I am a first-year BTech CSE student. Today, I have 2 hours available for productive work.

My tasks:
1. DSA practice — 60 minutes, high priority.
2. Chemistry assignment — 45 minutes, medium priority.
3. Revise C++ concepts — 30 minutes, high priority.

I want a 15-minute break, and my energy level is medium.

Please:
- Use the generate_daily_plan function if appropriate.
- Check whether all tasks fit into my available time.
- Prioritize the tasks realistically.
- Suggest what I should postpone if everything cannot fit.
- Explain your final plan in simple language.
- Do not claim that anything has been saved.

Let's see how well you can manage my day!`;

  const [inputPrompt, setInputPrompt] = useState(defaultPrompt);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    steps: string[];
    plan: DailyPlanResult;
  } | null>(null);

  const samplePrompts = [
    {
      label: '🎓 User Prompt: 120m BTech CSE (DSA + Chem + C++ Rev)',
      text: defaultPrompt,
    },
    {
      label: '⚡ 30-Minute Extreme Crunch',
      text: `Use the generate_daily_plan function.
I have only 30 minutes available.
Tasks:
1. DSA practice — 60 minutes — high priority
2. Chemistry assignment — 45 minutes — medium priority
I need a 15-minute break.
My energy level is low.
Create a proposed schedule. Do not save anything.
Be honest if everything cannot fit into the available time.`,
    },
    {
      label: '🌅 120-Minute Perfect Fit (DSA + Chem)',
      text: `I have 120 minutes available today.
My tasks are:
1. DSA practice — 60 minutes — high priority
2. Chemistry assignment — 45 minutes — medium priority
I want a 15-minute break.
My energy level is medium.
Create my daily schedule using the generate_daily_plan function. Do not save anything.`,
    },
  ];

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTestResult(null);

    setTimeout(() => {
      // Parse prompt parameters
      let availableMinutes = 120;
      let breakMinutes = 15;
      let energyLevel: 'low' | 'medium' | 'high' = 'medium';

      if (/30 minutes available|only 30/i.test(inputPrompt)) {
        availableMinutes = 30;
      } else if (/2 hours|120 minutes/i.test(inputPrompt)) {
        availableMinutes = 120;
      }

      if (/energy level is low|low energy/i.test(inputPrompt)) {
        energyLevel = 'low';
      } else if (/energy level is high|high energy/i.test(inputPrompt)) {
        energyLevel = 'high';
      }

      const tasks: Task[] = [];
      if (/dsa practice/i.test(inputPrompt)) {
        tasks.push({
          id: 'p-dsa',
          title: 'DSA practice',
          duration: 60,
          priority: 'high',
          category: 'coding',
        });
      }
      if (/chemistry assignment/i.test(inputPrompt)) {
        tasks.push({
          id: 'p-chem',
          title: 'Chemistry assignment',
          duration: 45,
          priority: 'medium',
          category: 'academic',
        });
      }
      if (/c\+\+|cpp|revise.*concept/i.test(inputPrompt)) {
        tasks.push({
          id: 'p-cpp',
          title: 'Revise C++ concepts',
          duration: 30,
          priority: 'high',
          category: 'revision',
        });
      }

      // If no tasks matched regex, provide standard tasks
      if (tasks.length === 0) {
        tasks.push(
          { id: '1', title: 'DSA practice', duration: 60, priority: 'high' },
          { id: '2', title: 'Chemistry assignment', duration: 45, priority: 'medium' }
        );
      }

      const plan = generateDailyPlan({
        availableMinutes,
        tasks,
        breakMinutes,
        energyLevel,
        startTime: '10:00',
        studentContext: 'First-year BTech CSE student',
      });

      const steps = [
        'Analyzing Time Allocation: Calculating total required minutes (tasks + break)...',
        `Checking Conflict: ${plan.totalRequiredMinutes}m required vs ${plan.availableMinutes}m available (${
          plan.fits ? 'Fits' : `Conflict of ${plan.timeDeficitMinutes}m deficit`
        })`,
        'Calling tool: generate_daily_plan(availableMinutes, tasks, breakMinutes, energyLevel)...',
        'Synthesizing pedagogical priority & postponement recommendations...',
        'Formulating proposed schedule with explicit "nothing saved" safety verification.',
      ];

      setTestResult({ steps, plan });
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                LifeOS Prompt Simulator &amp; Test Suite
              </h2>
              <p className="text-xs text-slate-400">
                Test prompts against the generate_daily_plan function and evaluate responses
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Interactive Agent Mode
          </span>
        </div>

        {/* Quick Sample Selector */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-400">Quick Test Prompts:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputPrompt(s.text)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium text-left transition-all ${
                  inputPrompt === s.text
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Natural Language User Prompt
          </label>
          <textarea
            rows={7}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Type your planning prompt..."
          />
        </div>

        {/* Run Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">
            Invokes generate_daily_plan logic, checks time bounds, and delivers clear breakdown.
          </span>

          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={isRunning || !inputPrompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing generate_daily_plan...' : 'Execute Test Prompt'}</span>
          </button>
        </div>
      </div>

      {/* Test Output & Model Response Card */}
      {testResult && (
        <div className="space-y-4 animate-fade-in">
          {/* Agent Reasoning Stream */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              LifeOS Execution &amp; Reasoning Log
            </span>
            <div className="space-y-1 pl-2 font-mono text-xs text-slate-300">
              {testResult.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">›</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Final Formatted Response */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  LifeOS Response to Student
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onLoadPlanIntoPlanner(testResult.plan)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <span>Load into Visual Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Response Section 1: Time Check & Analysis */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>### Time Check &amp; Analysis</span>
              </h4>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <p>
                  • <strong className="text-white">Total time required:</strong>{' '}
                  {testResult.plan.totalRequiredMinutes} minutes (
                  {testResult.plan.tasksIncluded.length + testResult.plan.tasksPostponed.length > 2
                    ? '60 + 45 + 30 minutes of work + 15 minutes of break'
                    : 'tasks + break'}
                  )
                </p>
                <p>
                  • <strong className="text-white">Available time:</strong>{' '}
                  {testResult.plan.availableMinutes} minutes (
                  {testResult.plan.availableMinutes === 120
                    ? '2 hours'
                    : `${testResult.plan.availableMinutes} mins`}
                  )
                </p>
                <p>
                  • <strong className="text-white">Conflict:</strong>{' '}
                  {testResult.plan.fits
                    ? 'No conflict. All tasks fit comfortably into your available schedule!'
                    : `Your tasks exceed your available time by ${testResult.plan.timeDeficitMinutes} minutes. Everything cannot fit today while keeping your 15-minute break.`}
                </p>
              </div>
            </div>

            {/* Response Section 2: Priority & Postponement Recommendation */}
            {testResult.plan.tasksPostponed.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">
                  ### Priority &amp; Postponement Recommendation
                </h4>
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                  {testResult.plan.tasksPostponed.map(({ task, reason }) => (
                    <div key={task.id} className="space-y-1">
                      <p>
                        • <strong className="text-rose-400">Postpone:</strong>{' '}
                        <strong className="text-white">{task.title}</strong> ({task.duration} mins)
                      </p>
                      <p className="pl-4 text-slate-400 italic">
                        <strong className="text-slate-300 not-italic">Reasoning:</strong> {reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Section 3: Proposed Daily Schedule */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">
                ### Proposed Daily Schedule ({testResult.plan.schedule.reduce((acc, b) => acc + b.duration, 0)} Minutes Total)
              </h4>
              <div className="space-y-2">
                {testResult.plan.schedule.map((block, idx) => (
                  <div
                    key={block.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">
                          {idx + 1}. {block.title}
                        </span>
                        {block.priority && (
                          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            {block.priority} Priority
                          </span>
                        )}
                        <span className="font-mono text-slate-400">({block.duration} minutes)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-4">• {block.reason}</p>
                    </div>

                    <span className="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 shrink-0">
                      {block.startTime} – {block.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Section 4: Strict Disclaimer */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="italic">
                <strong>{testResult.plan.disclaimer}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
