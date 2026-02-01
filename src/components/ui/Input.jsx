import { cn } from '../../lib/utils';

export default function Input({
  label,
  error,
  className = '',
  maxLength,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl',
          'bg-white/10 border border-white/20',
          'text-white placeholder-white/50',
          'focus:border-gold focus:ring-2 focus:ring-gold/50',
          'transition-all duration-200',
          'touch-target',
          error && 'border-red-500 shake',
          className
        )}
        maxLength={maxLength}
        {...props}
      />
      {maxLength && (
        <div className="text-xs text-white/50 mt-1 text-right">
          {props.value?.length || 0}/{maxLength}
        </div>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
