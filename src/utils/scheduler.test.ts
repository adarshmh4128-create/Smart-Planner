import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDailyPlan, Task } from './scheduler';

test('Scenario 1: BTech CSE Student with 120 min budget, 3 tasks + 15 min break', () => {
  const tasks: Task[] = [
    { id: '1', title: 'DSA practice', duration: 60, priority: 'high', category: 'coding' },
    { id: '2', title: 'Chemistry assignment', duration: 45, priority: 'medium', category: 'academic' },
    { id: '3', title: 'Revise C++ concepts', duration: 30, priority: 'high', category: 'revision' },
  ];

  const plan = generateDailyPlan({
    availableMinutes: 120,
    tasks,
    breakMinutes: 15,
    energyLevel: 'medium',
    startTime: '10:00',
  });

  // Total required = 60 + 45 + 30 + 15 = 150 mins
  assert.equal(plan.totalRequiredMinutes, 150);
  assert.equal(plan.availableMinutes, 120);
  assert.equal(plan.fits, false);
  assert.equal(plan.timeDeficitMinutes, 30);

  // Postponement check: Revise C++ concepts should be postponed
  assert.equal(plan.tasksPostponed.length, 1);
  assert.equal(plan.tasksPostponed[0].task.title, 'Revise C++ concepts');
  assert.match(plan.tasksPostponed[0].reason, /DSA practice already reinforces/i);

  // Tasks included should be DSA practice and Chemistry assignment
  assert.equal(plan.tasksIncluded.length, 2);
  const titles = plan.tasksIncluded.map((t) => t.title);
  assert.ok(titles.includes('DSA practice'));
  assert.ok(titles.includes('Chemistry assignment'));

  // Proposed schedule must contain DSA (60m), Break (15m), and Chemistry (45m) = 120 mins total
  const totalScheduleDuration = plan.schedule.reduce((acc, b) => acc + b.duration, 0);
  assert.equal(totalScheduleDuration, 120);

  // Verify disclaimer is explicitly stated
  assert.match(plan.disclaimer, /nothing has been saved/i);
});

test('Scenario 2: Exact fit scenario with 120 min available (DSA 60m + Chem 45m + 15m break)', () => {
  const tasks: Task[] = [
    { id: '1', title: 'DSA practice', duration: 60, priority: 'high' },
    { id: '2', title: 'Chemistry assignment', duration: 45, priority: 'medium' },
  ];

  const plan = generateDailyPlan({
    availableMinutes: 120,
    tasks,
    breakMinutes: 15,
    energyLevel: 'medium',
  });

  assert.equal(plan.totalRequiredMinutes, 120);
  assert.equal(plan.timeDeficitMinutes, 0);
  assert.equal(plan.fits, true);
  assert.equal(plan.tasksPostponed.length, 0);
  assert.equal(plan.tasksIncluded.length, 2);
});

test('Scenario 3: Extreme crunch (30 min available)', () => {
  const tasks: Task[] = [
    { id: '1', title: 'DSA practice', duration: 60, priority: 'high' },
    { id: '2', title: 'Chemistry assignment', duration: 45, priority: 'medium' },
  ];

  const plan = generateDailyPlan({
    availableMinutes: 30,
    tasks,
    breakMinutes: 15,
    energyLevel: 'low',
  });

  assert.equal(plan.fits, false);
  assert.equal(plan.timeDeficitMinutes, 90); // 60 + 45 + 15 = 120; 120 - 30 = 90
  assert.ok(plan.schedule.length > 0);
  assert.match(plan.disclaimer, /nothing has been saved/i);
});
