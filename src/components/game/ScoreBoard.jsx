import { useMemo } from 'react';
import { cn, getMedalEmoji, sortByScore } from '../../lib/utils';
import { ROLES } from '../../lib/roles';
import PlayerAvatar from './PlayerAvatar';
import Badge from '../ui/Badge';

export default function ScoreBoard({ players, scores }) {
  const sortedPlayers = useMemo(() => {
    return sortByScore(players, scores);
  }, [players, scores]);

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🏆</span> Classifica Finale
      </h3>

      {sortedPlayers.map((player, index) => {
        const score = scores[player.id] || 0;
        const role = ROLES[player.role_id];
        const medal = getMedalEmoji(index);

        return (
          <div
            key={player.id}
            className={cn(
              'glass rounded-xl p-4 flex items-center gap-4',
              index === 0 && 'ring-2 ring-gold bg-gold/10',
              index === 1 && 'ring-2 ring-gray-400 bg-gray-400/10',
              index === 2 && 'ring-2 ring-amber-600 bg-amber-600/10'
            )}
          >
            {/* Rank */}
            <div className="text-2xl font-bold w-10 flex justify-center">
              {medal || <span className="text-white/40">#{index + 1}</span>}
            </div>

            {/* Player */}
            <PlayerAvatar
              player={player}
              size="sm"
              showName={false}
              showHost={false}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-medium truncate">
                  {player.nickname}
                </span>
                {role && (
                  <Badge
                    size="sm"
                    gradient={role.color}
                    className="text-white"
                  >
                    {role.emoji} {role.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div
                className={cn(
                  'text-2xl font-bold',
                  index === 0 ? 'text-gold' : 'text-white'
                )}
              >
                {score}
              </div>
              <p className="text-xs text-white/60">punti</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
