import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame, useValidation } from '../hooks';
import { ROLES, getAllObjectives } from '../lib/roles';
import { cn } from '../lib/utils';
import { GameLayout } from '../components/layout';
import { PlayerAvatar, ValidationCard, ValidationProgress } from '../components/game';
import { Button, Spinner, Card, Badge } from '../components/ui';
import { useToast } from '../components/ui/Toast';

export default function Validation({ playerId }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    room,
    players,
    player,
    loading: gameLoading,
    error: gameError,
    isConnected,
    isHost,
  } = useGame(code, playerId);

  const {
    validations,
    loading: validationLoading,
    fetchValidations,
    setupRealtimeSubscription,
    voteObjective,
    nextObjective,
    hasVotedForObjective,
    getPlayerVote,
    getApprovalForObjective,
  } = useValidation(code, playerId);

  const [voting, setVoting] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  // Initialize validation data when room loads
  useEffect(() => {
    if (room?.id) {
      fetchValidations(room.id);
      const cleanup = setupRealtimeSubscription(room.id);
      return cleanup;
    }
  }, [room?.id, fetchValidations, setupRealtimeSubscription]);

  // Redirect based on room status
  useEffect(() => {
    if (!gameLoading && room) {
      if (room.status === 'reveal') {
        navigate(`/reveal/${code}`);
      } else if (room.status === 'voting') {
        navigate(`/voting/${code}`);
      } else if (room.status === 'playing') {
        navigate(`/game/${code}`);
      } else if (room.status === 'lobby') {
        navigate(`/lobby/${code}`);
      }
    }
  }, [gameLoading, room, code, navigate]);

  // Sort players by join time
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) =>
      new Date(a.joined_at) - new Date(b.joined_at)
    );
  }, [players]);

  // Current player being validated
  const currentPlayerIndex = room?.validation_player_index || 0;
  const currentObjectiveIndex = room?.validation_objective_index || 0;
  const targetPlayer = sortedPlayers[currentPlayerIndex];

  // Get target player's role and objectives
  const targetRole = targetPlayer ? ROLES[targetPlayer.role_id] : null;
  const targetObjectives = targetRole ? getAllObjectives(targetRole) : [];
  const currentObjective = targetObjectives[currentObjectiveIndex];

  // Get vote status
  const hasVoted = targetPlayer && currentObjective
    ? hasVotedForObjective(targetPlayer.id, currentObjective.id)
    : false;
  const playerVote = targetPlayer && currentObjective
    ? getPlayerVote(targetPlayer.id, currentObjective.id)
    : undefined;

  // Get approval stats
  const approvalStats = targetPlayer && currentObjective
    ? getApprovalForObjective(targetPlayer.id, currentObjective.id, players.length)
    : { votesReceived: 0, totalVoters: players.length, allVoted: false };

  const handleVote = async (approved) => {
    if (!room || !targetPlayer || !currentObjective || voting) return;

    setVoting(true);
    try {
      const success = await voteObjective(
        room.id,
        targetPlayer.id,
        currentObjective.id,
        approved
      );
      if (success) {
        addToast(
          approved ? 'Votato: Completato' : 'Votato: Non completato',
          'success'
        );
      }
    } catch (err) {
      addToast('Errore nel voto', 'error');
    } finally {
      setVoting(false);
    }
  };

  const handleAdvance = async () => {
    if (!isHost || advancing) return;

    setAdvancing(true);
    try {
      await nextObjective(room, players);
    } catch (err) {
      addToast('Errore nell\'avanzamento', 'error');
    } finally {
      setAdvancing(false);
    }
  };

  const loading = gameLoading || validationLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (gameError || !room || !player) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <div className="emoji-xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {gameError || 'Partita non trovata'}
          </h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Torna alla Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!targetPlayer || !targetRole || !currentObjective) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <Spinner size="lg" />
          <p className="text-white mt-4">Caricamento validazione...</p>
        </Card>
      </div>
    );
  }

  return (
    <GameLayout roomCode={code} title="Validazione" showCode={false}>
      <div className="space-y-6">
        {/* Connection status */}
        {!isConnected && (
          <div className="glass bg-yellow-500/20 border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
            <Spinner size="sm" />
            <span className="text-yellow-200">Riconnessione in corso...</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Validazione Obiettivi
          </h1>
          <p className="text-white/70">
            Verifica se i giocatori hanno completato i loro obiettivi
          </p>
        </div>

        {/* Progress */}
        <ValidationProgress
          currentPlayerIndex={currentPlayerIndex}
          totalPlayers={sortedPlayers.length}
          currentObjectiveIndex={currentObjectiveIndex}
          totalObjectives={targetObjectives.length}
          votesReceived={approvalStats.votesReceived}
          totalVoters={players.length}
        />

        {/* Current Player Card */}
        <Card
          className={cn(
            'text-center',
            `bg-gradient-to-br ${targetRole.color}`,
            'border-2 border-white/20'
          )}
        >
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl border-3 border-white/30">
              {targetPlayer.avatar_emoji}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {targetPlayer.nickname}
            </h2>
            <Badge
              size="lg"
              className="bg-black/30 text-white"
            >
              {targetRole.emoji} {targetRole.name}
            </Badge>
          </div>
        </Card>

        {/* Current Objective */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">
              Obiettivo {currentObjectiveIndex + 1}/{targetObjectives.length}
            </h3>
          </div>
          <ValidationCard
            objective={currentObjective}
            hasVoted={hasVoted}
            playerVote={playerVote}
            onVote={handleVote}
            disabled={voting || targetPlayer.id === playerId}
          />

          {/* Can't vote on yourself */}
          {targetPlayer.id === playerId && (
            <div className="mt-3 glass rounded-xl p-4 text-center">
              <p className="text-white/70">
                Non puoi votare per i tuoi obiettivi
              </p>
            </div>
          )}
        </div>

        {/* Voting Status */}
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 text-white/70">
            {approvalStats.allVoted ? (
              <>
                <span className="text-green-400 text-xl">✓</span>
                <span>Tutti hanno votato!</span>
              </>
            ) : (
              <>
                <Spinner size="sm" />
                <span>In attesa di voti... ({approvalStats.votesReceived}/{players.length})</span>
              </>
            )}
          </div>

          {/* Vote results when all voted */}
          {approvalStats.allVoted && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="glass rounded-lg p-3 bg-green-500/20">
                <span className="text-2xl block mb-1">✅</span>
                <span className="text-white font-bold">{approvalStats.approvals}</span>
                <span className="text-white/60 text-sm block">approvato</span>
              </div>
              <div className="glass rounded-lg p-3 bg-red-500/20">
                <span className="text-2xl block mb-1">❌</span>
                <span className="text-white font-bold">{approvalStats.rejections}</span>
                <span className="text-white/60 text-sm block">non approvato</span>
              </div>
            </div>
          )}
        </Card>

        {/* Host controls */}
        {isHost && (
          <div className="pt-4">
            <Button
              onClick={handleAdvance}
              disabled={!approvalStats.allVoted || advancing}
              loading={advancing}
              className="w-full"
              size="lg"
            >
              {currentObjectiveIndex + 1 >= targetObjectives.length
                ? currentPlayerIndex + 1 >= sortedPlayers.length
                  ? 'Vai alla Classifica'
                  : 'Prossimo Giocatore'
                : 'Prossimo Obiettivo'
              }
            </Button>
            {!approvalStats.allVoted && (
              <p className="text-white/50 text-sm text-center mt-2">
                Aspetta che tutti votino per continuare
              </p>
            )}
          </div>
        )}

        {/* Non-host waiting message */}
        {!isHost && approvalStats.allVoted && (
          <div className="text-center">
            <p className="text-white/60">
              In attesa che l'host avanzi...
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
