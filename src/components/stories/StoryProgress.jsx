import { cn } from '../../lib/utils';

/**
 * Barra di progresso per le storie completate dal gruppo
 * @param {{
 *   played: number,
 *   total: number,
 *   className?: string,
 *   showLabel?: boolean,
 *   size?: 'sm' | 'md' | 'lg'
 * }} props
 */
export default function StoryProgress({
  played,
  total,
  className = '',
  showLabel = true,
  size = 'md'
}) {
  const percentage = total > 0 ? Math.round((played / total) * 100) : 0;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-white/60">
            Storie completate
          </span>
          <span className="text-white font-medium">
            {played}/{total}
          </span>
        </div>
      )}

      {/* Progress bar container */}
      <div className={cn(
        'w-full bg-white/10 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        {/* Progress fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            percentage === 100
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-amber-400 to-amber-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage label */}
      {showLabel && percentage > 0 && (
        <div className="mt-1 text-right">
          <span className={cn(
            'text-xs',
            percentage === 100 ? 'text-green-400' : 'text-amber-400'
          )}>
            {percentage}% completato
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Versione compatta per header/navigation
 */
export function StoryProgressCompact({ played, total, className = '' }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-300"
          style={{ width: `${total > 0 ? (played / total) * 100 : 0}%` }}
        />
      </div>
      <span className="text-xs text-white/60">
        {played}/{total}
      </span>
    </div>
  );
}

/**
 * Badge circolare con conteggio
 */
export function StoryProgressBadge({ played, total, className = '' }) {
  const percentage = total > 0 ? Math.round((played / total) * 100) : 0;
  const circumference = 2 * Math.PI * 18; // radius = 18

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* SVG Circle Progress */}
      <svg className="w-12 h-12 -rotate-90">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className={percentage === 100 ? 'text-green-400' : 'text-amber-400'}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference - (percentage / 100) * circumference,
            transition: 'stroke-dashoffset 0.5s ease-out'
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">
          {played}
        </span>
      </div>
    </div>
  );
}
