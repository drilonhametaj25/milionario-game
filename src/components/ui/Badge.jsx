import { cn } from '../../lib/utils';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  gradient,
}) {
  const variants = {
    default: 'bg-white/20 text-white',
    gold: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-game-dark',
    purple: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white',
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
    green: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
    red: 'bg-gradient-to-r from-red-400 to-red-600 text-white',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        gradient ? `bg-gradient-to-r ${gradient}` : variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
