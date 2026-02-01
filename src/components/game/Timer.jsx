import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export default function Timer({
  endTime,
  onComplete,
  className = '',
}) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);
      return Math.floor(diff / 1000);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  if (!endTime) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft <= 60;
  const isCritical = timeLeft <= 10;

  return (
    <div
      className={cn(
        'glass rounded-xl px-4 py-2 flex items-center gap-2',
        isUrgent && 'bg-yellow-500/20 border-yellow-500/30',
        isCritical && 'bg-red-500/20 border-red-500/30 animate-pulse',
        className
      )}
    >
      <svg
        className={cn(
          'w-5 h-5',
          isCritical ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-white/60'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <span
        className={cn(
          'font-mono font-bold text-lg',
          isCritical ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-white'
        )}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
