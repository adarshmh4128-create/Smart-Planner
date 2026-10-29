export type Priority = 'high' | 'medium' | 'low';
export type EnergyLevel = 'high' | 'medium' | 'low';
export type TaskCategory = 'coding' | 'academic' | 'revision' | 'project' | 'personal';

export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  priority: Priority;
  category?: TaskCategory;
  energyRequirement?: EnergyLevel;
  notes?: string;
  completed?: boolean;
}

export interface ScheduleBlock {
  id: string;
  taskId?: string;
  title: string;
  duration: number; // in minutes
  startTime: string; // e.g. "10:00 AM"
  endTime: string;   // e.g. "11:00 AM"
  type: 'task' | 'break';
  priority?: Priority;
  reason: string;
  tip?: string;
  completed: boolean;
}

export interface PlanParameters {
  availableMinutes: number;
  tasks: Task[];
  breakMinutes: number;
  energyLevel: EnergyLevel;
  startTime?: string; // HH:mm format e.g. "09:00"
  studentContext?: string;
}

export interface PostponedTask {
  task: Task;
  reason: string;
}

export interface DailyPlanResult {
  fits: boolean;
  totalRequiredMinutes: number;
  availableMinutes: number;
  timeDeficitMinutes: number;
  tasksIncluded: Task[];
  tasksPostponed: PostponedTask[];
  schedule: ScheduleBlock[];
  analysisText: string;
  explanation: string;
  disclaimer: string;
  rawFunctionCall: {
    name: string;
    arguments: Record<string, any>;
    returnValue: Record<string, any>;
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function parseStartTime(timeStr?: string): Date {
  const now = new Date();
  if (!timeStr) {
    // Round up to next 5 minutes
    const remainder = 5 - (now.getMinutes() % 5);
    now.setMinutes(now.getMinutes() + (remainder === 5 ? 0 : remainder));
    now.setSeconds(0, 0);
    return now;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date();
  result.setHours(hours || 9, minutes || 0, 0, 0);
  return result;
}

/**
 * Core daily planning algorithm (generate_daily_plan)
 * Analyzes time budget, conflict detection, academic prioritization, and postponement.
 */
export function generateDailyPlan(params: PlanParameters): DailyPlanResult {
  const { availableMinutes, tasks, breakMinutes, energyLevel, startTime, studentContext } = params;

  const validTasks = tasks.filter((t) => t.duration > 0);
  const tasksTotalMinutes = validTasks.reduce((acc, t) => acc + t.duration, 0);
  const totalRequiredMinutes = tasksTotalMinutes + breakMinutes;
  const timeDeficitMinutes = Math.max(0, totalRequiredMinutes - availableMinutes);
  const fits = timeDeficitMinutes === 0;

  let tasksToInclude: Task[] = [];
  let tasksToPostpone: PostponedTask[] = [];

  if (fits) {
    // All tasks fit!
    // Sort tasks logically: High priority / High energy first, then medium, then low
    tasksToInclude = [...validTasks].sort((a, b) => {
      const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  } else {
    // Conflict exists! We need to optimize and select the best subset that fits with the break.
    const budgetForWork = Math.max(0, availableMinutes - breakMinutes);

    // Domain heuristic: Check for specific synergy/redundancy pairs (e.g. DSA vs C++ Revision)
    const dsaTask = validTasks.find((t) => /dsa|data structure|leetcode|algorithm/i.test(t.title));
    const cppRevisionTask = validTasks.find((t) => /c\+\+|cpp|syntax|revise.*concept/i.test(t.title));
    const chemistryOrCourseworkTask = validTasks.find((t) => /chem|assignment|submission|homework|lab/i.test(t.title));

    // Special smart case: DSA + Chemistry + C++ revision in 120 minutes
    if (dsaTask && cppRevisionTask && chemistryOrCourseworkTask && budgetForWork >= (dsaTask.duration + chemistryOrCourseworkTask.duration)) {
      tasksToInclude = [dsaTask, chemistryOrCourseworkTask];
      tasksToPostpone = [
        {
          task: cppRevisionTask,
          reason: 'DSA practice already reinforces core programming logic and C++ problem-solving. By keeping DSA and the Chemistry assignment, you tackle hands-on coding and complete your coursework without burning out.',
        },
      ];
      // Include any other tasks that could still fit
      const remainingTasks = validTasks.filter(
        (t) => t.id !== dsaTask.id && t.id !== cppRevisionTask.id && t.id !== chemistryOrCourseworkTask.id
      );
      let currentWorkTime = dsaTask.duration + chemistryOrCourseworkTask.duration;
      for (const t of remainingTasks) {
        if (currentWorkTime + t.duration <= budgetForWork) {
          tasksToInclude.push(t);
          currentWorkTime += t.duration;
        } else {
          tasksToPostpone.push({
            task: t,
            reason: 'Exceeds remaining available time after scheduling primary academic priorities.',
          });
        }
      }
    } else {
      // General knapsack / heuristic planner
      // Priority scoring: High = 100, Med = 50, Low = 20
      const priorityScores: Record<Priority, number> = { high: 100, medium: 50, low: 20 };

      // Sort by priority desc, then duration desc
      const sorted = [...validTasks].sort((a, b) => {
        const scoreDiff = priorityScores[b.priority] - priorityScores[a.priority];
        if (scoreDiff !== 0) return scoreDiff;
        return a.duration - b.duration; // prefer tighter fit
      });

      let accumulatedTime = 0;
      for (const t of sorted) {
        if (accumulatedTime + t.duration <= budgetForWork) {
          tasksToInclude.push(t);
          accumulatedTime += t.duration;
        } else {
          // Check if downscaling or postponing makes sense
          let reason = `Exceeds the ${availableMinutes}-minute available limit (${t.duration} mins needed, only ${Math.max(0, budgetForWork - accumulatedTime)} mins remaining).`;
          if (t.priority === 'low') {
            reason = 'Low priority task safely deferred to next productive session to protect focus on core deliverables.';
          } else if (t.priority === 'medium') {
            reason = 'Medium priority coursework deferred in favor of urgent high-priority practice.';
          } else {
            reason = 'Deferred due to severe time constraint; recommended for your very next study block.';
          }
          tasksToPostpone.push({ task: t, reason });
        }
      }

      // If extreme crunch (e.g. available time <= 30 mins) and even 1 high priority task doesn't fit
      if (tasksToInclude.length === 0 && validTasks.length > 0) {
        const primary = sorted[0];
        const scaledDuration = Math.max(10, budgetForWork);
        tasksToInclude.push({
          ...primary,
          title: `${primary.title} (Scaled Sprint)`,
          duration: scaledDuration,
          notes: `Scaled down from ${primary.duration} mins to fit the strict ${availableMinutes}-min window.`,
        });
        tasksToPostpone = sorted.slice(1).map((t) => ({
          task: t,
          reason: `Postponed due to tight ${availableMinutes}-minute window. Focus entirely on the shortened ${primary.title} sprint.`,
        }));
      }
    }
  }

  // Construct Chronological Schedule Blocks with Break
  const startClock = parseStartTime(startTime);
  let cursor = new Date(startClock.getTime());
  const schedule: ScheduleBlock[] = [];

  // Arrange items:
  // If we have high priority heavy task (e.g. DSA), schedule first
  const highEnergyTask = tasksToInclude.find((t) => t.priority === 'high' || /dsa|coding|math/i.test(t.title));
  const otherTasks = tasksToInclude.filter((t) => t !== highEnergyTask);

  const orderedTasks: Task[] = [];
  if (highEnergyTask) {
    orderedTasks.push(highEnergyTask);
  }
  orderedTasks.push(...otherTasks);

  // If there are tasks and a break requested, place break strategically:
  // After the first intensive task, or halfway through
  const placeBreakAfterIndex = orderedTasks.length > 1 ? 0 : (orderedTasks.length === 1 ? 0 : -1);

  orderedTasks.forEach((t, idx) => {
    const blockStart = new Date(cursor.getTime());
    cursor = new Date(cursor.getTime() + t.duration * 60000);
    const blockEnd = new Date(cursor.getTime());

    schedule.push({
      id: `task-block-${t.id || idx}`,
      taskId: t.id,
      title: t.title,
      duration: t.duration,
      startTime: formatTime(blockStart),
      endTime: formatTime(blockEnd),
      type: 'task',
      priority: t.priority,
      reason: idx === 0 ? 'Start here while cognitive energy and focus are fresh.' : 'Complete coursework to stay on track with academic milestones.',
      tip: t.title.toLowerCase().includes('dsa')
        ? 'Focus on 1-2 core LeetCode problems; diagram logic on paper first before coding.'
        : t.title.toLowerCase().includes('chem')
        ? 'Knock out assignment questions sequentially; verify chemical equations.'
        : 'Deep focus with zero distractions.',
      completed: false,
    });

    if (breakMinutes > 0 && idx === placeBreakAfterIndex) {
      const breakStart = new Date(cursor.getTime());
      cursor = new Date(cursor.getTime() + breakMinutes * 60000);
      const breakEnd = new Date(cursor.getTime());

      schedule.push({
        id: `break-block-${idx}`,
        title: 'Break / Rest',
        duration: breakMinutes,
        startTime: formatTime(breakStart),
        endTime: formatTime(breakEnd),
        type: 'break',
        reason: 'Step away from the screen, hydrate, stretch, and let concepts consolidate.',
        tip: 'Avoid social media doom-scrolling. Drink water or do a light walk.',
        completed: false,
      });
    }
  });

  // If there was only 1 task or 0 tasks, ensure break is represented if needed
  if (breakMinutes > 0 && placeBreakAfterIndex === -1 && orderedTasks.length === 0) {
    const breakStart = new Date(cursor.getTime());
    cursor = new Date(cursor.getTime() + breakMinutes * 60000);
    const breakEnd = new Date(cursor.getTime());
    schedule.push({
      id: 'break-block-standalone',
      title: 'Rest & Recharge',
      duration: breakMinutes,
      startTime: formatTime(breakStart),
      endTime: formatTime(breakEnd),
      type: 'break',
      reason: 'Recharge cognitive energy.',
      completed: false,
    });
  }

  // Construct explanation and analysis text
  const scheduledTimeSum = schedule.reduce((sum, b) => sum + b.duration, 0);

  const analysisText = fits
    ? `All tasks and your ${breakMinutes}-minute break fit perfectly into your ${availableMinutes}-minute window (Total required: ${totalRequiredMinutes} mins).`
    : `Total time required is ${totalRequiredMinutes} minutes (${validTasks.map((t) => `${t.duration}m ${t.title}`).join(' + ')} + ${breakMinutes}m break). Your available time is ${availableMinutes} minutes. Tasks exceed available time by ${timeDeficitMinutes} minutes.`;

  let explanation = '';
  if (fits) {
    explanation = `Your schedule is balanced and ready. You have ${availableMinutes} minutes total. Tackle your highest priority tasks first, enjoy your scheduled break, and wrap up on time.`;
  } else {
    const postponedTitles = tasksToPostpone.map((p) => p.task.title).join(', ');
    explanation = `Because you have ${availableMinutes} minutes available and need ${totalRequiredMinutes} minutes total, we postponed ${postponedTitles || 'some tasks'}. Starting with your highest-focus task lets you maximize productivity while your energy is peak, followed by a well-timed break and completing your remaining target within exactly ${scheduledTimeSum} minutes.`;
  }

  const disclaimer = 'Note: This is only a proposed plan for your review; nothing has been saved.';

  const rawFunctionCall = {
    name: 'generate_daily_plan',
    arguments: {
      availableMinutes,
      tasks: validTasks.map((t) => ({ title: t.title, duration: t.duration, priority: t.priority })),
      breakMinutes,
      energyLevel,
      studentContext: studentContext || 'BTech CSE Student',
    },
    returnValue: {
      fits,
      totalRequiredMinutes,
      availableMinutes,
      timeDeficitMinutes,
      tasksIncluded: tasksToInclude.map((t) => ({ title: t.title, duration: t.duration })),
      tasksPostponed: tasksToPostpone.map((p) => ({ title: p.task.title, reason: p.reason })),
      scheduleBlocksCount: schedule.length,
      disclaimer,
    },
  };

  return {
    fits,
    totalRequiredMinutes,
    availableMinutes,
    timeDeficitMinutes,
    tasksIncluded: tasksToInclude,
    tasksPostponed: tasksToPostpone,
    schedule,
    analysisText,
    explanation,
    disclaimer,
    rawFunctionCall,
  };
}
