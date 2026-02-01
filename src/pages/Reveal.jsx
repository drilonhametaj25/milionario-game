import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame, useRoomStory } from '../hooks';
import { ROLES } from '../lib/roles';
import { cn } from '../lib/utils';
import { GameLayout } from '../components/layout';
import { VotingResults, ScoreBoard, PlayerAvatar } from '../components/game';
import { Button, Spinner, Card, Badge } from '../components/ui';

export default function Reveal({ playerId, clearSession }) {
  const { code } = useParams();
  const navigate = useNavigate();

  const {
    room,
    players,
    player,
    loading,
    error,
    isHost,
    millionaire,
    voteResults,
    scores,
    handleNewGame,
  } = useGame(code, playerId);

  // Load story data for dynamic roles
  const { rolesMap, loading: storyLoading } = useRoomStory(room);

  // Helper to get role from rolesMap or fallback to ROLES
  const getRole = (roleId) => {
    if (rolesMap && rolesMap[roleId]) {
      return rolesMap[roleId];
    }
    return ROLES[roleId];
  };

  const [revealStage, setRevealStage] = useState(0);
  // Stages: 0 = suspense, 1 = millionaire reveal, 2 = vote results, 3 = all roles, 4 = scoreboard

  // Redirect if not in reveal state
  useEffect(() => {
    if (!loading && room) {
      if (room.status === 'validating') {
        navigate(`/validation/${code}`);
      } else if (room.status === 'voting') {
        navigate(`/voting/${code}`);
      } else if (room.status === 'playing') {
        navigate(`/game/${code}`);
      } else if (room.status === 'lobby') {
        navigate(`/lobby/${code}`);
      }
    }
  }, [loading, room, code, navigate]);

  useEffect(() => {
    // Auto-advance through reveal stages
    const timers = [];

    timers.push(setTimeout(() => setRevealStage(1), 2000));  // Reveal millionaire
    timers.push(setTimeout(() => setRevealStage(2), 5000));  // Show votes
    timers.push(setTimeout(() => setRevealStage(3), 8000));  // Show all roles
    timers.push(setTimeout(() => setRevealStage(4), 11000)); // Show scoreboard

    return () => timers.forEach(clearTimeout);
  }, []);

  const handlePlayAgain = async () => {
    await handleNewGame();
  };

  const handleGoHome = () => {
    clearSession();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !room || !player) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <div className="emoji-xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {error || 'Partita non trovata'}
          </h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Torna alla Home
          </Button>
        </Card>
      </div>
    );
  }

  const millionaireRole = getRole('millionaire');
  const votesForMillionaire = voteResults.find(r => r.player?.id === millionaire?.id);
  const millionaireCaught = (votesForMillionaire?.percentage || 0) > 60;

  return (
    <GameLayout roomCode={code} title="Rivelazione" showCode={false}>
      <div className="space-y-6">
        {/* Stage 0: Suspense */}
        {revealStage === 0 && (
          <div className="text-center py-20 animate-pulse">
            <div className="emoji-2xl mb-4">🥁</div>
            <h1 className="text-3xl font-bold text-white">
              E il Milionario è...
            </h1>
          </div>
        )}

        {/* Stage 1: Millionaire Reveal */}
        {revealStage >= 1 && millionaire && (
          <Card
            className={cn(
              'text-center animate-bounce-in',
              'bg-gradient-to-br from-yellow-400/20 to-amber-500/20',
              'border-2 border-gold'
            )}
          >
            <div className="emoji-2xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-gold mb-4">
              Il Milionario era...
            </h2>
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-5xl border-4 border-white/30">
                {millionaire.avatar_emoji}
              </div>
              <h3 className="text-3xl font-bold text-white">
                {millionaire.nickname}
              </h3>
              {revealStage >= 2 && votesForMillionaire && (
                <div className="mt-2">
                  <Badge
                    variant={millionaireCaught ? 'danger' : 'success'}
                    size="lg"
                  >
                    {millionaireCaught ? '🎯 SCOPERTO!' : '🎉 NON SCOPERTO!'}
                    {' '}({votesForMillionaire.percentage}% dei voti)
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Stage 2: Vote Results */}
        {revealStage >= 2 && voteResults.length > 0 && (
          <div className="animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🗳️</span> Risultati Votazione
            </h3>
            <VotingResults
              results={voteResults}
              millionaireId={millionaire?.id}
            />
          </div>
        )}

        {/* Stage 3: All Roles */}
        {revealStage >= 3 && (
          <div className="animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🎭</span> Tutti i Ruoli
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map((p) => {
                const role = getRole(p.role_id);
                return (
                  <Card
                    key={p.id}
                    className={cn(
                      'p-3 text-center',
                      p.id === millionaire?.id && 'ring-2 ring-gold'
                    )}
                  >
                    <PlayerAvatar
                      player={p}
                      size="sm"
                      showName={false}
                      showHost={false}
                    />
                    <p className="text-white font-medium text-sm mt-2 truncate">
                      {p.nickname}
                    </p>
                    {role && (
                      <Badge
                        size="sm"
                        gradient={role.color}
                        className="mt-1 text-white text-xs"
                      >
                        {role.emoji} {role.name}
                      </Badge>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 4: Scoreboard */}
        {revealStage >= 4 && (
          <div className="animate-slide-up">
            <ScoreBoard players={players} scores={scores} rolesMap={rolesMap} />

            {/* Actions */}
            <div className="mt-8 space-y-3">
              {isHost && (
                <Button
                  onClick={handlePlayAgain}
                  className="w-full"
                  size="lg"
                >
                  Nuova Partita
                </Button>
              )}

              <Button
                onClick={handleGoHome}
                variant="ghost"
                className="w-full"
              >
                Torna alla Home
              </Button>
            </div>
          </div>
        )}

        {/* Manual skip button */}
        {revealStage < 4 && (
          <div className="text-center">
            <button
              onClick={() => setRevealStage(4)}
              className="text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              Salta animazione →
            </button>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
