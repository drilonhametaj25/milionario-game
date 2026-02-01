import { cn } from '../../lib/utils';
import PlayerAvatar from './PlayerAvatar';

export default function VotingResults({ results, millionaireId }) {
  return (
    <div className="space-y-3">
      {results.map((result, index) => {
        const isMillionaire = result.player?.id === millionaireId;

        return (
          <div
            key={result.player?.id}
            className={cn(
              'glass rounded-xl p-4 flex items-center gap-4',
              isMillionaire && 'ring-2 ring-gold bg-gold/10'
            )}
          >
            {/* Rank */}
            <div className="text-2xl font-bold text-white/60 w-8">
              #{index + 1}
            </div>

            {/* Player */}
            <PlayerAvatar
              player={result.player}
              size="sm"
              showName={false}
              showHost={false}
            />

            {/* Name and indicator */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {result.player?.nickname}
                </span>
                {isMillionaire && (
                  <span className="text-lg">💰</span>
                )}
              </div>
              <p className="text-sm text-white/60">
                {result.votes} voti
              </p>
            </div>

            {/* Percentage */}
            <div className="text-right">
              <div
                className={cn(
                  'text-2xl font-bold',
                  isMillionaire ? 'text-gold' : 'text-white'
                )}
              >
                {result.percentage}%
              </div>
            </div>
          </div>
        );
      })}

      {results.length === 0 && (
        <p className="text-center text-white/50 py-8">
          Nessun voto registrato
        </p>
      )}
    </div>
  );
}
