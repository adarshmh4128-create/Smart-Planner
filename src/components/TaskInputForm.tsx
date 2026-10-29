import React, { useState } from 'react';
import { Plus, Trash2, ListChecks, Code, BookOpen, RefreshCw, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { Task, Priority, TaskCategory } from '../utils/scheduler';

interface TaskInputFormProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

export const TaskInputForm: React.FC<TaskInputFormProps> = ({
  tasks,
  setTasks,
  onGeneratePlan,
  isGenerating,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newPriority, setNewPriority] = useState<Priority>('high');
  const [newCategory, setNewCategory] = useState<TaskCategory>('coding');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      duration: Math.max(5, newDuration),
      priority: newPriority,
      category: newCategory,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTitle('');
    setNewDuration(30);
  };

  const handleRemoveTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateDuration = (id: string, delta: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, duration: Math.max(5, t.duration + delta) } : t))
    );
  };

  const handleUpdatePriority = (id: string, priority: Priority) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
  };

  const totalTaskMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);

  const getCategoryIcon = (cat?: TaskCategory) => {
    switch (cat) {
      case 'coding':
        return <Code className="w-3.5 h-3.5 text-indigo-400" />;
      case 'academic':
        return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'revision':
        return <RefreshCw className="w-3.5 h-3.5 text-amber-400" />;
      case 'project':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <ListChecks className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Today's Tasks ({tasks.length})</h2>
            <p className="text-xs text-slate-400">Sum of work: {totalTaskMinutes} minutes</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGeneratePlan}
          disabled={tasks.length === 0 || isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Running generate_daily_plan...' : 'Generate Daily Plan'}</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            No tasks added yet. Add tasks below or pick a preset from the top bar!
          </div>
        ) : (
          tasks.map((task, index) => {
            const priorityColors = {
              high: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
              medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
              low: 'bg-slate-800 text-slate-300 border-slate-700',
            };

            return (
              <div
                key={task.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all gap-2"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-slate-500 w-5">
                    {index + 1}.
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{task.title}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {getCategoryIcon(task.category)}
                        <span className="capitalize">{task.category || 'general'}</span>
                      </span>
                    </div>
                    {task.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{task.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-8 sm:pl-0">
                  {/* Duration Buttons */}
                  <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleUpdateDuration(task.id, -15)}
                      className="text-xs text-slate-400 hover:text-white px-1 font-mono"
                      title="Decrease by 15 mins"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-200 px-1 min-w-[40px] text-center">
                      {task.duration}m
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateDuration(task.id, 15)}
                      className="text-xs text-slate-400 hover:text-white px-1 font-mono"
                      title="Increase by 15 mins"
                    >
                      +
                    </button>
                  </div>

                  {/* Priority Pill Selector */}
                  <div className="flex items-center gap-1">
                    {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleUpdatePriority(task.id, p)}
                        className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border transition-all ${
                          task.priority === p
                            ? priorityColors[p]
                            : 'bg-transparent text-slate-500 border-transparent hover:text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(task.id)}
                    aria-label={`Remove task ${task.title}`}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Quick Form */}
      <form onSubmit={handleAddTask} className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>Add Custom Task</span>
          <span className="text-[10px] text-slate-500">e.g. Lab report, LeetCode, Concept revision</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task name (e.g. OS revision or Math assignment)"
            className="sm:col-span-5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="sm:col-span-3 flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
            <span className="text-[11px] text-slate-500">Duration:</span>
            <input
              type="number"
              min="5"
              max="240"
              step="5"
              value={newDuration}
              onChange={(e) => setNewDuration(Number(e.target.value))}
              className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">m</span>
          </div>

          <div className="sm:col-span-2">
            <select
              aria-label="Select Priority"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="sm:col-span-2 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 rounded-xl py-1.5 px-3 text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add</span>
          </button>
        </div>
      </form>
    </div>
  );
};
