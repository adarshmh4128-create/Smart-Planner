import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimeBudgetCard } from './components/TimeBudgetCard';
import { TaskInputForm } from './components/TaskInputForm';
import { PlanResultsView } from './components/PlanResultsView';
import { FocusTimerView } from './components/FocusTimerView';
import { PromptTester } from './components/PromptTester';
import { SavedPlansView, SavedPlanRecord } from './components/SavedPlansView';
import { FunctionInspectorModal } from './components/FunctionInspectorModal';
import { PRESETS, PlanPreset } from './data/presets';
import { Task, EnergyLevel, DailyPlanResult, ScheduleBlock, generateDailyPlan } from './utils/scheduler';

export default function App() {
  const initialPreset = PRESETS[0]; // BTech CSE 2-Hour Test

  const [activeTab, setActiveTab] = useState<'planner' | 'prompt-tester' | 'timer' | 'saved'>('planner');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);

  // Planning state
  const [availableMinutes, setAvailableMinutes] = useState<number>(initialPreset.availableMinutes);
  const [breakMinutes, setBreakMinutes] = useState<number>(initialPreset.breakMinutes);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(initialPreset.energyLevel);
  const [startTime, setStartTime] = useState<string>('10:00');
  const [studentContext, setStudentContext] = useState<string>(initialPreset.studentContext);
  const [tasks, setTasks] = useState<Task[]>(initialPreset.tasks);

  // Active generated plan
  const [currentPlan, setCurrentPlan] = useState<DailyPlanResult>(() =>
    generateDailyPlan({
      availableMinutes: initialPreset.availableMinutes,
      tasks: initialPreset.tasks,
      breakMinutes: initialPreset.breakMinutes,
      energyLevel: initialPreset.energyLevel,
      startTime: '10:00',
      studentContext: initialPreset.studentContext,
    })
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavedInSession, setIsSavedInSession] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Timer State
  const [activeTimerBlock, setActiveTimerBlock] = useState<ScheduleBlock | null>(() =>
    currentPlan.schedule.length > 0 ? currentPlan.schedule[0] : null
  );

  // Saved Plans
  const [savedPlans, setSavedPlans] = useState<SavedPlanRecord[]>(() => {
    try {
      const stored = localStorage.getItem('lifeos_saved_plans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Automatically recalculate plan when key parameters change in Planner tab
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setIsSavedInSession(false);

    try {
      // Check if server-side Gemini generation is available
      const res = await fetch('/api/generate_daily_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableMinutes,
          tasks,
          breakMinutes,
          energyLevel,
          studentContext,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.source === 'gemini-ai' && json.data) {
          // If Gemini generated, sync with local structure
          const aiData = json.data;
          const localFallback = generateDailyPlan({
            availableMinutes,
            tasks,
            breakMinutes,
            energyLevel,
            startTime,
            studentContext,
          });

          // Enrich plan with AI insights
          setCurrentPlan({
            ...localFallback,
            analysisText: aiData.analysis || localFallback.analysisText,
            explanation: aiData.simpleExplanation || localFallback.explanation,
          });
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // Gracefully fall back to deterministic local engine
    }

    // Deterministic local optimization
    const plan = generateDailyPlan({
      availableMinutes,
      tasks,
      breakMinutes,
      energyLevel,
      startTime,
      studentContext,
    });

    setCurrentPlan(plan);
    setIsGenerating(false);
  };

  const handleSelectPreset = (preset: PlanPreset) => {
    setSelectedPresetId(preset.id);
    setAvailableMinutes(preset.availableMinutes);
    setBreakMinutes(preset.breakMinutes);
    setEnergyLevel(preset.energyLevel);
    setStudentContext(preset.studentContext);
    setTasks(preset.tasks);
    setIsSavedInSession(false);

    const plan = generateDailyPlan({
      availableMinutes: preset.availableMinutes,
      tasks: preset.tasks,
      breakMinutes: preset.breakMinutes,
      energyLevel: preset.energyLevel,
      startTime,
      studentContext: preset.studentContext,
    });

    setCurrentPlan(plan);
    if (plan.schedule.length > 0) {
      setActiveTimerBlock(plan.schedule[0]);
    }
  };

  const handleStartFocusTimer = (block: ScheduleBlock) => {
    setActiveTimerBlock(block);
    setActiveTab('timer');
  };

  const handleBlockComplete = (blockId: string) => {
    setCurrentPlan((prev) => ({
      ...prev,
      schedule: prev.schedule.map((b) => (b.id === blockId ? { ...b, completed: true } : b)),
    }));
  };

  const handleSavePlan = () => {
    const record: SavedPlanRecord = {
      id: `plan-${Date.now()}`,
      savedAt: new Date().toISOString(),
      plan: currentPlan,
    };
    const updated = [record, ...savedPlans];
    setSavedPlans(updated);
    try {
      localStorage.setItem('lifeos_saved_plans', JSON.stringify(updated));
    } catch {}
    setIsSavedInSession(true);
  };

  const handleDeleteSavedPlan = (id: string) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    try {
      localStorage.setItem('lifeos_saved_plans', JSON.stringify(updated));
    } catch {}
  };

  const handleClearAllSaved = () => {
    setSavedPlans([]);
    try {
      localStorage.removeItem('lifeos_saved_plans');
    } catch {}
  };

  const handleLoadPlanFromAnywhere = (plan: DailyPlanResult) => {
    setCurrentPlan(plan);
    setAvailableMinutes(plan.availableMinutes);
    setIsSavedInSession(false);
    if (plan.schedule.length > 0) {
      setActiveTimerBlock(plan.schedule[0]);
    }
    setActiveTab('planner');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        savedPlansCount={savedPlans.length}
        isTimerRunning={false}
        activeBlockTitle={activeTimerBlock?.title}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'planner' && (
          <div className="space-y-6">
            {/* Top row: Budget & Task Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                <TimeBudgetCard
                  availableMinutes={availableMinutes}
                  setAvailableMinutes={setAvailableMinutes}
                  breakMinutes={breakMinutes}
                  setBreakMinutes={setBreakMinutes}
                  energyLevel={energyLevel}
                  setEnergyLevel={setEnergyLevel}
                  startTime={startTime}
                  setStartTime={setStartTime}
                  studentContext={studentContext}
                  setStudentContext={setStudentContext}
                />
              </div>

              <div className="lg:col-span-6 space-y-6">
                <TaskInputForm
                  tasks={tasks}
                  setTasks={setTasks}
                  onGeneratePlan={handleGeneratePlan}
                  isGenerating={isGenerating}
                />
              </div>
            </div>

            {/* Bottom: Results View */}
            <PlanResultsView
              plan={currentPlan}
              onStartFocusTimer={handleStartFocusTimer}
              onSavePlan={handleSavePlan}
              onOpenInspector={() => setIsInspectorOpen(true)}
              isSaved={isSavedInSession}
            />
          </div>
        )}

        {activeTab === 'prompt-tester' && (
          <PromptTester onLoadPlanIntoPlanner={handleLoadPlanFromAnywhere} />
        )}

        {activeTab === 'timer' && (
          <FocusTimerView
            schedule={currentPlan.schedule}
            activeBlock={activeTimerBlock}
            setActiveBlock={setActiveTimerBlock}
            onBlockComplete={handleBlockComplete}
          />
        )}

        {activeTab === 'saved' && (
          <SavedPlansView
            savedPlans={savedPlans}
            onLoadPlan={handleLoadPlanFromAnywhere}
            onDeletePlan={handleDeleteSavedPlan}
            onClearAll={handleClearAllSaved}
          />
        )}
      </main>

      {/* Function Inspector Modal */}
      <FunctionInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        plan={currentPlan}
      />
    </div>
  );
}
