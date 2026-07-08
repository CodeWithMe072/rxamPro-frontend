import React from 'react';
import { HelpCircle, Grid } from 'lucide-react';
import clsx from 'clsx';

export const QuestionPalette = ({
  currentQuestionIndex = 0,
  states = {}, // questionId -> 'unvisited' | 'visited' | 'marked' | 'answered' | 'missed'
  questions = [],
  onQuestionSelect,
  onShowInstructions
}) => {
  const getStatusClass = (q, index) => {
    const isCurrent = index === currentQuestionIndex;
    const state = states[q.id] || 'unvisited';

    if (isCurrent) {
      return 'bg-primary-container text-on-primary-container border-2 border-primary font-bold';
    }

    switch (state) {
      case 'answered':
        return 'bg-secondary text-on-secondary shadow-sm hover:scale-105';
      case 'marked':
        return 'bg-tertiary text-on-tertiary shadow-sm hover:scale-105';
      case 'missed':
        return 'bg-error text-on-error shadow-sm hover:scale-105';
      case 'visited':
        return 'bg-surface-dim border border-outline shadow-sm hover:scale-105';
      case 'unvisited':
      default:
        return 'bg-surface-dim border border-outline-variant/50 text-on-surface-variant hover:scale-105';
    }
  };

  return (
    <div className="glass-card p-6 rounded-[20px] shadow-lg">
      <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/30 pb-3">
        <Grid className="w-5 h-5 text-primary" />
        <h2 className="font-h4 text-lg font-bold text-on-surface">Navigator</h2>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-surface-dim border border-outline-variant/50"></div>
          <span className="text-on-surface-variant">Unvisited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary"></div>
          <span className="text-on-surface-variant">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-tertiary"></div>
          <span className="text-on-surface-variant">Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-error"></div>
          <span className="text-on-surface-variant">Missed</span>
        </div>
      </div>

      {/* Questions Numbers Grid */}
      <div className="grid grid-cols-5 gap-3 max-h-[320px] overflow-y-auto pr-1">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => onQuestionSelect(index)}
            className={clsx(
              "w-full aspect-square rounded-lg flex items-center justify-center font-button text-xs transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40",
              getStatusClass(q, index)
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Instructions Action */}
      {onShowInstructions && (
        <div className="mt-6 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onShowInstructions}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-button text-xs font-bold"
          >
            <HelpCircle className="w-4 h-4" />
            Exam Instructions
          </button>
        </div>
      )}
    </div>
  );
};
export default QuestionPalette;
