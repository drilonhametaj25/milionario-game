import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks';
import { GameLayout } from '../components/layout';
import { VoteCard } from '../components/game';
import { Button, Spinner, Card, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../components/ui';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

export default function Voting({ playerId }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    room,
    players,
    player,
    loading,
    error,
    isConnected,
    otherPlayers,
    votingProgress,
    castVote,
  } = useGame(code, playerId);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [voting, setVoting] = useState(false);

  // Redirect if not in voting state
  useEffect(() => {
    if (!loading && room) {
      if (room.status === 'validating') {
        navigate(`/validation/${code}`);
      } else if (room.status === 'reveal') {
        navigate(`/reveal/${code}`);
      } else if (room.status === 'playing') {
        navigate(`/game/${code}`);
      } else if (room.status === 'lobby') {
        navigate(`/lobby/${code}`);
      }
    }
  }, [loading, room, code, navigate]);

  const handleSelectPlayer = (player) => {
    if (voting) return;
    setSelectedPlayer(player);
    setShowConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedPlayer || voting) return;

    setVoting(true);
    try {
      const success = await castVote(selectedPlayer.id);
      if (success) {
        addToast('Voto registrato!', 'success');
      }
    } catch (err) {
      addToast('Errore nel voto', 'error');
    } finally {
      setVoting(false);
      setShowConfirmModal(false);
    }
  };

  const hasVoted = player?.has_voted;

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

  return (
    <GameLayout roomCode={code} title="Votazione" showCode={false}>
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
          <div className="emoji-xl mb-2 animate-float">💰</div>
          <h1 className="text-2xl font-bold text-gold-gradient mb-2">
            Chi è il Milionario?
          </h1>
          <p className="text-white/70">
            {hasVoted
              ? 'Hai votato! Aspetta gli altri...'
              : 'Vota chi pensi abbia vinto alla lotteria'}
          </p>
        </div>

        {/* Progress */}
        <Card className="text-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60">Voti registrati</span>
            <span className="text-white font-bold">
              {votingProgress.voted}/{votingProgress.total}
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-amber-500 transition-all duration-500"
              style={{ width: `${votingProgress.percentage}%` }}
            />
          </div>
        </Card>

        {/* Vote Grid */}
        {hasVoted ? (
          <Card className="text-center py-8">
            <div className="emoji-xl mb-4">✅</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Il tuo voto è stato registrato!
            </h3>
            <p className="text-white/60">
              Aspetta che tutti votino per vedere il risultato
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-white/50">
              <Spinner size="sm" />
              <span>In attesa...</span>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {otherPlayers.map((p) => (
              <VoteCard
                key={p.id}
                player={p}
                selected={selectedPlayer?.id === p.id}
                onClick={handleSelectPlayer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Vote Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !voting && setShowConfirmModal(false)}
        showClose={!voting}
      >
        <ModalHeader>
          <ModalTitle>Conferma il tuo voto</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {selectedPlayer && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center text-4xl border-2 border-gold mb-4">
                {selectedPlayer.avatar_emoji}
              </div>
              <p className="text-white text-lg mb-2">
                Stai votando per
              </p>
              <p className="text-gold text-xl font-bold">
                {selectedPlayer.nickname}
              </p>
              <p className="text-white/60 text-sm mt-4">
                ⚠️ Non puoi cambiare il voto dopo la conferma!
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowConfirmModal(false)}
            disabled={voting}
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirmVote}
            loading={voting}
          >
            Conferma Voto
          </Button>
        </ModalFooter>
      </Modal>
    </GameLayout>
  );
}
