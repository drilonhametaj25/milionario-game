import { cn } from '../../lib/utils';

export default function ValidationProgress({
  currentPlayerIndex,
  totalPlayers,
  currentObjectiveIndex,
  totalObjectives,
  votesReceived,
  totalVoters,
}) {
  const playerPercentage = totalPlayers > 0
    ? Math.round(((currentPlayerIndex + 1) / totalPlayers) * 100)
    : 0;

  const objectivePercentage = totalObjectives > 0
    ? Math.round(((currentObjectiveIndex + 1) / totalObjectives) * 100)
    : 0;

  const votePercentage = totalVoters > 0
    ? Math.round((votesReceived / totalVoters) * 100)
    : 0;

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      {/* Player progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Giocatore</span>
          <span className="text-white font-bold">
            {currentPlayerIndex + 1}/{totalPlayers}
          </span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
            style={{ width: `${playerPercentage}%` }}
          />
        </div>
      </div>

      {/* Objective progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Obiettivo</span>
          <span className="text-white font-bold">
            {currentObjectiveIndex + 1}/{totalObjectives}
          </span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
            style={{ width: `${objectivePercentage}%` }}
          />
        </div>
      </div>

      {/* Votes progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Voti ricevuti</span>
          <span className="text-white font-bold">
            {votesReceived}/{totalVoters}
          </span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              votesReceived === totalVoters
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : 'bg-gradient-to-r from-gold to-amber-500'
            )}
            style={{ width: `${votePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
