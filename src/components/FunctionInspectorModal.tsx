import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, FileCode2 } from 'lucide-react';
import { DailyPlanResult } from '../utils/scheduler';

interface FunctionInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DailyPlanResult;
}

export const FunctionInspectorModal: React.FC<FunctionInspectorModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const functionCallDefinition = {
    name: 'generate_daily_plan',
    description:
      'Analyzes tasks, time constraints, and cognitive load to generate a prioritized daily schedule with conflict detection and postponement suggestions.',
    parameters: {
      type: 'object',
      properties: {
        availableMinutes: { type: 'number', description: 'Total productive minutes available today' },
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              duration: { type: 'number', description: 'Duration in minutes' },
              priority: { type: 'string', enum: ['high', 'medium', 'low'] },
            },
            required: ['title', 'duration', 'priority'],
          },
        },
        breakMinutes: { type: 'number', description: 'Target rest/break duration' },
        energyLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['availableMinutes', 'tasks', 'breakMinutes'],
    },
    callArguments: plan.rawFunctionCall.arguments,
    toolExecutionResult: plan.rawFunctionCall.returnValue,
  };

  const jsonString = JSON.stringify(functionCallDefinition, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                generate_daily_plan Function Inspector
              </h3>
              <p className="text-xs text-slate-400 font-mono">Tool Call &amp; JSON Payload</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JSON Viewer */}
        <div className="p-4 overflow-y-auto font-mono text-xs text-cyan-300 bg-slate-950 flex-1 leading-relaxed">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Deterministic execution + optional Gemini AI reasoning
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
