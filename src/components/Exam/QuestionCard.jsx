import React from 'react';
import clsx from 'clsx';
import { LayoutGrid } from 'lucide-react';

export const QuestionCard = ({
  question,
  selectedAnswer, // string (e.g. 'A') or array of strings (e.g. ['A', 'B'])
  onAnswerSelect,
  onShowNavigator,
  totalQuestions = 1
}) => {
  if (!question) return null;

  const isMultiple = question.type === 'multiple';

  const handleOptionChange = (optionId) => {
    if (isMultiple) {
      const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      let newAnswers;
      if (currentAnswers.includes(optionId)) {
        newAnswers = currentAnswers.filter(id => id !== optionId);
      } else {
        newAnswers = [...currentAnswers, optionId];
      }
      onAnswerSelect(newAnswers);
    } else {
      onAnswerSelect(optionId);
    }
  };

  const isChecked = (optionId) => {
    if (isMultiple) {
      return Array.isArray(selectedAnswer) && selectedAnswer.includes(optionId);
    }
    return selectedAnswer === optionId;
  };

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 rounded-[20px] shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <span className="font-h4 text-lg font-bold text-primary">
            Question {question.number} of {totalQuestions}
          </span>
          {onShowNavigator && (
            <button 
              onClick={onShowNavigator}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl border border-primary/20 transition-all active:scale-95 cursor-pointer ml-4"
            >
              <LayoutGrid className="w-4 h-4" /> Navigator
            </button>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-full border border-outline-variant/20">
            {isMultiple ? 'Multiple Choice' : 'Single Choice'}
          </span>
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-semibold rounded-full border border-outline-variant/20">
            +{question.marks.toFixed(1)} Marks
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="font-body text-base text-on-surface mb-6 leading-relaxed">
          {question.text}
        </p>

        {question.schematic && (
          <div className="w-full bg-surface-container-low dark:bg-surface-dim rounded-2xl overflow-hidden border border-outline-variant/20 p-6 flex justify-center items-center relative min-h-[260px] mb-6">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#004ac6 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            <img 
              className="max-w-full max-h-[300px] object-contain rounded-xl shadow-sm border border-outline-variant/10 bg-white" 
              alt="Scientific Schematic" 
              src={question.schematic}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {question.options.map((option) => {
          const checked = isChecked(option.id);
          return (
            <label 
              key={option.id}
              className="group block relative cursor-pointer"
            >
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={`question-${question.id}`}
                checked={checked}
                onChange={() => handleOptionChange(option.id)}
                className="sr-only"
              />
              <div 
                className={clsx(
                  "p-3.5 sm:p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 hover:scale-[1.01] min-h-[48px]",
                  checked
                    ? "border-primary bg-primary-container/10 dark:bg-primary-container/5"
                    : "border-outline-variant/30 bg-surface dark:bg-surface-dim hover:border-primary/50"
                )}
              >
                <div 
                  className={clsx(
                    "w-6 h-6 border-2 flex items-center justify-center transition-colors flex-shrink-0",
                    isMultiple ? "rounded-md" : "rounded-full",
                    checked ? "border-primary bg-primary" : "border-outline-variant"
                  )}
                >
                  {checked && (
                    <div 
                      className={clsx(
                        isMultiple 
                          ? "w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -translate-y-[1px]" 
                          : "w-2 h-2 rounded-full bg-white"
                      )}
                    />
                  )}
                </div>
                <span className="font-body text-sm md:text-base text-on-surface">
                  {option.text}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
export default QuestionCard;
