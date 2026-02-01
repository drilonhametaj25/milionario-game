import { cn } from '../../lib/utils';

export default function Card({
  children,
  className = '',
  gradient = false,
  glow = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-6',
        gradient && 'gradient-border',
        glow && 'animate-pulse-gold',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-xl font-bold text-white', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={cn('text-white/70 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-white/10', className)}>
      {children}
    </div>
  );
}
