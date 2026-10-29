import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Volume2, VolumeX, Coffee, Sparkles } from 'lucide-react';
import { ScheduleBlock } from '../utils/scheduler';
import { playChime } from '../utils/sound';

interface FocusTimerViewProps {
  schedule: ScheduleBlock[];
  activeBlock: ScheduleBlock | null;
  setActiveBlock: (block: ScheduleBlock) => void;
  onBlockComplete: (blockId: string) => void;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  schedule,
  activeBlock,
  setActiveBlock,
  onBlockComplete,
}) => {
  const currentBlock = activeBlock || schedule[0];

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    return (currentBlock?.duration || 25) * 60;
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // When active block changes, reset timer
  useEffect(() => {
    if (currentBlock) {
      setTimeLeft(currentBlock.duration * 60);
      setIsRunning(false);
    }
  }, [currentBlock?.id]);

  // Countdown loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (soundEnabled) {
              playChime(currentBlock?.type === 'break' ? 'break' : 'complete');
            }
            if (currentBlock) {
              onBlockComplete(currentBlock.id);
            }
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, currentBlock, soundEnabled, onBlockComplete]);

  if (!currentBlock) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
        <Sparkles className="w-8 h-8 mx-auto text-indigo-400" />
        <h3 className="text-base font-bold text-white">No active schedule loaded</h3>
        <p className="text-xs">
          Generate or select a proposed schedule from the Planner or Prompt Tester first!
        </p>
      </div>
    );
  }

  const totalSeconds = (currentBlock.duration || 1) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleTogglePlay = () => {
    if (!isRunning && soundEnabled && timeLeft === totalSeconds) {
      playChime('start');
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  const handleNextBlock = () => {
    const currentIndex = schedule.findIndex((b) => b.id === currentBlock.id);
    if (currentIndex >= 0 && currentIndex < schedule.length - 1) {
      setActiveBlock(schedule[currentIndex + 1]);
    }
  };

  const isBreak = currentBlock.type === 'break';

  return (
    <div className="space-y-6">
      {/* Active Focus Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isBreak ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
        />

        {/* Top Info */}
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isBreak
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
            }`}
          >
            {isBreak ? 'Break Block' : `${currentBlock.priority || 'Standard'} Priority Task`}
          </span>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Block Title & Timestamps */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentBlock.title}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Scheduled: {currentBlock.startTime} — {currentBlock.endTime} ({currentBlock.duration} mins)
          </p>
        </div>

        {/* Digital Countdown Clock */}
        <div className="py-2">
          <div className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tighter text-white drop-shadow-md">
            {formattedTime}
          </div>
          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isBreak ? 'bg-amber-400' : 'bg-indigo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Reason / Tip */}
        <div className="max-w-md mx-auto bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
          <p>{currentBlock.reason}</p>
          {currentBlock.tip && (
            <p className="text-[11px] text-amber-300/90 mt-1 font-medium">Tip: {currentBlock.tip}</p>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-lg transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{timeLeft < totalSeconds ? 'Resume' : 'Start Focus Session'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onBlockComplete(currentBlock.id);
              handleNextBlock();
            }}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-all cursor-pointer"
            title="Mark completed &amp; next"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextBlock}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Skip to next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedule Step-through list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Full Daily Flow</h3>
        <div className="space-y-2">
          {schedule.map((b, idx) => {
            const isCurrent = b.id === currentBlock.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveBlock(b)}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40'
                    : b.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      b.completed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {b.completed ? '✓' : idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{b.title}</span>
                    <span className="text-xs font-mono text-slate-400 ml-2">({b.duration}m)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {b.startTime} - {b.endTime}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
