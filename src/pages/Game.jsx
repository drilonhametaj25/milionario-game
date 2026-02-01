import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame, useRoomStory } from '../hooks';
import { GameLayout } from '../components/layout';
import { RoleReveal, RoleCard, ObjectiveList, PlayerList } from '../components/game';
import { Button, Spinner, Card, Modal, ModalHeader, ModalTitle, ModalBody } from '../components/ui';
import { useToast } from '../components/ui/Toast';

export default function Game({ playerId }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    room,
    players,
    player,
    role,
    loading,
    error,
    isHost,
    isConnected,
    otherPlayers,
    startVoting,
    updateObjectiveStatus,
    tagPlayerForDiscovery,
    handleLeave,
  } = useGame(code, playerId);

  // Load story data for dynamic roles
  const { rolesMap, loading: storyLoading } = useRoomStory(room);

  // Get role from rolesMap if available, otherwise use the one from useGame
  const effectiveRole = useMemo(() => {
    if (player?.role_id && rolesMap) {
      return rolesMap[player.role_id] || role;
    }
    return role;
  }, [player?.role_id, rolesMap, role]);

  const [showRoleReveal, setShowRoleReveal] = useState(true);
  const [roleCollapsed, setRoleCollapsed] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  // Redirect if not in playing state
  useEffect(() => {
    if (!loading && room) {
      if (room.status === 'voting') {
        navigate(`/voting/${code}`);
      } else if (room.status === 'reveal') {
        navigate(`/reveal/${code}`);
      } else if (room.status === 'lobby') {
        navigate(`/lobby/${code}`);
      }
    }
  }, [loading, room, code, navigate]);

  // Handle objective update
  const handleUpdateObjective = async (objectiveId, completed) => {
    const success = await updateObjectiveStatus(objectiveId, completed);
    if (success) {
      addToast(completed ? 'Obiettivo completato!' : 'Obiettivo rimosso', 'success');
    }
  };

  // Handle discovery tag
  const handleTagPlayer = async (objectiveId, targetPlayerId) => {
    const targetPlayer = players.find(p => p.id === targetPlayerId);
    const success = await tagPlayerForDiscovery(objectiveId, targetPlayerId);
    if (success && targetPlayer) {
      addToast(`Hai taggato ${targetPlayer.nickname}!`, 'success');
    }
  };

  // Handle start voting
  const handleStartVoting = async () => {
    await startVoting();
    addToast('Votazione avviata!', 'info');
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

  // Show role reveal animation
  if (showRoleReveal && player.role_id) {
    return (
      <RoleReveal
        roleId={player.role_id}
        rolesMap={rolesMap}
        onComplete={() => setShowRoleReveal(false)}
      />
    );
  }

  return (
    <GameLayout
      roomCode={code}
      headerRight={
        <button
          onClick={() => setShowPlayersModal(true)}
          className="p-2 text-white/60 hover:text-white transition-colors touch-target"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      }
    >
      <div className="space-y-6 pb-20">
        {/* Connection status */}
        {!isConnected && (
          <div className="glass bg-yellow-500/20 border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
            <Spinner size="sm" />
            <span className="text-yellow-200">Riconnessione in corso...</span>
          </div>
        )}

        {/* Role Card */}
        {effectiveRole && (
          <RoleCard
            roleId={player.role_id}
            rolesMap={rolesMap}
            collapsed={roleCollapsed}
            onToggle={() => setRoleCollapsed(!roleCollapsed)}
          />
        )}

        {/* Objectives */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> I tuoi obiettivi
          </h2>
          <ObjectiveList
            role={effectiveRole}
            objectivesStatus={player.objectives_status || {}}
            players={players}
            currentPlayerId={playerId}
            onUpdateObjective={handleUpdateObjective}
            onTagPlayer={handleTagPlayer}
          />
        </div>

        {/* Host: Start Voting Button */}
        {isHost && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-game-dark via-game-dark to-transparent">
            <div className="max-w-2xl mx-auto">
              <Button
                onClick={handleStartVoting}
                className="w-full"
                size="lg"
              >
                Avvia Votazione
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Players Modal */}
      <Modal
        isOpen={showPlayersModal}
        onClose={() => setShowPlayersModal(false)}
      >
        <ModalHeader>
          <ModalTitle>Chi è in gioco? ({players.length})</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <PlayerList
            players={players}
            showOnline={true}
          />
        </ModalBody>
      </Modal>
    </GameLayout>
  );
}
