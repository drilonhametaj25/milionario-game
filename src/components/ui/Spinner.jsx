import { cn } from '../../lib/utils';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        className={cn('animate-spin text-gold', sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function FullPageSpinner({ message = 'Caricamento...' }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-game-dark via-game-mid to-game-light">
      <Spinner size="xl" />
      <p className="mt-4 text-white/70 animate-pulse">{message}</p>
    </div>
  );
}
