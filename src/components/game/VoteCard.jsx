import { cn } from '../../lib/utils';
import PlayerAvatar from './PlayerAvatar';

export default function VoteCard({
  player,
  selected = false,
  disabled = false,
  onClick,
  showVotes = false,
  voteCount = 0,
  totalVotes = 0,
}) {
  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  return (
    <button
      onClick={() => !disabled && onClick?.(player)}
      disabled={disabled}
      className={cn(
        'relative glass rounded-2xl p-4 transition-all duration-200',
        'flex flex-col items-center gap-2 touch-target',
        selected && 'ring-2 ring-gold bg-gold/20',
        !disabled && !selected && 'hover:bg-white/15 hover:scale-105',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <PlayerAvatar
        player={player}
        size="lg"
        showName={false}
        showHost={false}
      />

      <span className="text-white font-medium truncate max-w-full">
        {player.nickname}
      </span>

      {/* Vote results bar */}
      {showVotes && (
        <div className="w-full mt-2">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-amber-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-white/60 mt-1 text-center">
            {voteCount} voti ({percentage}%)
          </p>
        </div>
      )}

      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2 bg-gold rounded-full p-1">
          <svg
            className="w-4 h-4 text-game-dark"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
