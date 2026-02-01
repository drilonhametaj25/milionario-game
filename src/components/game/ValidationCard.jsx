import { cn } from '../../lib/utils';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function ValidationCard({
  objective,
  hasVoted,
  playerVote,
  onVote,
  disabled = false,
}) {
  const handleVote = (approved) => {
    if (!disabled && !hasVoted) {
      onVote(approved);
    }
  };

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      {/* Objective text */}
      <div className="space-y-3">
        <p className="text-white text-lg leading-relaxed">
          "{objective.text}"
        </p>

        {/* Points badge */}
        <Badge variant="gold" size="md">
          +{objective.points} punti
        </Badge>
      </div>

      {/* Vote buttons */}
      <div className="pt-2">
        {hasVoted ? (
          <div
            className={cn(
              'rounded-xl p-4 text-center',
              playerVote
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-red-500/20 border border-red-500/30'
            )}
          >
            <span className="text-2xl mb-2 block">
              {playerVote ? '✅' : '❌'}
            </span>
            <p className="text-white font-medium">
              Hai votato: {playerVote ? 'Completato' : 'Non completato'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/70 text-center">
              Ha completato questo obiettivo?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleVote(true)}
                disabled={disabled}
                className="py-4 text-lg bg-green-600 hover:bg-green-500"
              >
                <span className="mr-2">✅</span> Sì
              </Button>
              <Button
                onClick={() => handleVote(false)}
                disabled={disabled}
                variant="secondary"
                className="py-4 text-lg bg-red-600/80 hover:bg-red-500"
              >
                <span className="mr-2">❌</span> No
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
