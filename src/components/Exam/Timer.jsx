import React, { useEffect, useState } from 'react';
import { Timer as TimerIcon } from 'lucide-react';
import clsx from 'clsx';

export const Timer = ({ 
  initialSeconds = 9000, // 150 minutes default
  onTimeUp,
  onThresholdWarning,
  thresholdSeconds = 300 // 5 minutes warning
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next === thresholdSeconds && onThresholdWarning) {
          onThresholdWarning();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, thresholdSeconds, onThresholdWarning, onTimeUp]);

  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const isLowTime = secondsLeft < thresholdSeconds;

  return (
    <div 
      className={clsx(
        "p-2 px-4 rounded-xl border flex items-center gap-2 transition-all timer-glow duration-300",
        isLowTime 
          ? "bg-error/10 border-error/50 text-error animate-pulse" 
          : "bg-surface dark:bg-surface-dim border-outline-variant/30 text-primary dark:text-primary-fixed"
      )}
    >
      <TimerIcon className={clsx("w-5 h-5", isLowTime ? "text-error" : "text-primary dark:text-primary-fixed")} />
      <span className="font-h4 text-base md:text-lg font-mono font-bold tracking-wider tabular-nums">
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
};
export default Timer;
