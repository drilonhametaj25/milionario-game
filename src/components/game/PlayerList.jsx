import PlayerAvatar from './PlayerAvatar';
import { cn } from '../../lib/utils';

export default function PlayerList({
  players,
  selectedPlayerId,
  onPlayerClick,
  showOnline = false,
  excludePlayerId,
  className = '',
}) {
  const filteredPlayers = excludePlayerId
    ? players.filter(p => p.id !== excludePlayerId)
    : players;

  return (
    <div
      className={cn(
        'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4',
        className
      )}
    >
      {filteredPlayers.map(player => (
        <PlayerAvatar
          key={player.id}
          player={player}
          selected={selectedPlayerId === player.id}
          onClick={onPlayerClick ? () => onPlayerClick(player) : undefined}
          showOnline={showOnline}
        />
      ))}
    </div>
  );
}
