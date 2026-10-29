import { Task, EnergyLevel } from '../utils/scheduler';

export interface PlanPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  availableMinutes: number;
  breakMinutes: number;
  energyLevel: EnergyLevel;
  studentContext: string;
  tasks: Task[];
}

export const PRESETS: PlanPreset[] = [
  {
    id: 'btech-cse-test',
    name: 'BTech CSE 2-Hour Test',
    description: 'First-year BTech student with 120 mins: DSA (60m), Chem (45m), C++ Revision (30m) & 15m break',
    badge: 'Prompt Scenario',
    availableMinutes: 120,
    breakMinutes: 15,
    energyLevel: 'medium',
    studentContext: 'First-year BTech CSE student with mid-term coursework and LeetCode goals',
    tasks: [
      {
        id: 't-1',
        title: 'DSA practice',
        duration: 60,
        priority: 'high',
        category: 'coding',
        energyRequirement: 'high',
        notes: 'Solve 1-2 medium problems on arrays / linked lists',
      },
      {
        id: 't-2',
        title: 'Chemistry assignment',
        duration: 45,
        priority: 'medium',
        category: 'academic',
        energyRequirement: 'medium',
        notes: 'Complete module 3 stoichiometry homework submission',
      },
      {
        id: 't-3',
        title: 'Revise C++ concepts',
        duration: 30,
        priority: 'high',
        category: 'revision',
        energyRequirement: 'medium',
        notes: 'Review pointers, memory management, and OOP references',
      },
    ],
  },
  {
    id: 'crunch-30m',
    name: '30-Minute Extreme Crunch',
    description: 'Only 30 mins available: DSA (60m) & Chem (45m) with 15m break request',
    badge: 'Time Crunch',
    availableMinutes: 30,
    breakMinutes: 15,
    energyLevel: 'low',
    studentContext: 'Quick afternoon gap between lectures',
    tasks: [
      {
        id: 'c-1',
        title: 'DSA practice',
        duration: 60,
        priority: 'high',
        category: 'coding',
        energyRequirement: 'high',
      },
      {
        id: 'c-2',
        title: 'Chemistry assignment',
        duration: 45,
        priority: 'medium',
        category: 'academic',
        energyRequirement: 'medium',
      },
    ],
  },
  {
    id: 'balanced-120m-fit',
    name: '120-Minute Perfect Fit',
    description: 'DSA practice (60m) + Chemistry assignment (45m) + 15m break = 120m clean fit',
    badge: 'Exact Fit',
    availableMinutes: 120,
    breakMinutes: 15,
    energyLevel: 'medium',
    studentContext: 'Evening study routine',
    tasks: [
      {
        id: 'f-1',
        title: 'DSA practice',
        duration: 60,
        priority: 'high',
        category: 'coding',
        energyRequirement: 'high',
      },
      {
        id: 'f-2',
        title: 'Chemistry assignment',
        duration: 45,
        priority: 'medium',
        category: 'academic',
        energyRequirement: 'medium',
      },
    ],
  },
  {
    id: 'weekend-deep-work',
    name: 'Weekend Deep Work (4 Hours)',
    description: 'Major project sprint, DSA contest practice, and math problem set with 2 breaks',
    badge: 'Deep Work',
    availableMinutes: 240,
    breakMinutes: 30,
    energyLevel: 'high',
    studentContext: 'Saturday morning deep work block',
    tasks: [
      {
        id: 'w-1',
        title: 'Full-stack semester project',
        duration: 90,
        priority: 'high',
        category: 'project',
        energyRequirement: 'high',
      },
      {
        id: 'w-2',
        title: 'Competitive DSA Practice',
        duration: 60,
        priority: 'high',
        category: 'coding',
        energyRequirement: 'high',
      },
      {
        id: 'w-3',
        title: 'Discrete Mathematics Set',
        duration: 60,
        priority: 'medium',
        category: 'academic',
        energyRequirement: 'medium',
      },
    ],
  },
];
