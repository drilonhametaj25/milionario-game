import { cn } from '../../lib/utils';

export default function PlayerAvatar({
  player,
  size = 'md',
  showName = true,
  showHost = true,
  showOnline = false,
  selected = false,
  onClick,
  className = '',
}) {
  const sizes = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-24 h-24 text-5xl',
  };

  const nameSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="relative">
        <div
          className={cn(
            'rounded-full flex items-center justify-center',
            'bg-white/10 border-2 transition-all duration-200',
            selected ? 'border-gold scale-110' : 'border-white/20',
            onClick && 'hover:border-gold/50 hover:scale-105',
            sizes[size]
          )}
        >
          <span>{player.avatar_emoji}</span>
        </div>

        {/* Host indicator */}
        {showHost && player.is_host && (
          <div className="absolute -top-1 -right-1 text-lg" title="Host">
            👑
          </div>
        )}

        {/* Online indicator */}
        {showOnline && (
          <div
            className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-game-dark',
              player.is_connected ? 'bg-green-500' : 'bg-gray-500'
            )}
          />
        )}
      </div>

      {showName && (
        <span
          className={cn(
            'text-white/80 font-medium truncate max-w-[80px]',
            nameSizes[size]
          )}
        >
          {player.nickname}
        </span>
      )}
    </div>
  );
}
