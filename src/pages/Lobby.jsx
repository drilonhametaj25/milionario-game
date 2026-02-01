import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks';
import { copyToClipboard, generateShareUrl } from '../lib/utils';
import { GameLayout } from '../components/layout';
import { PlayerList } from '../components/game';
import { Button, Spinner, Card } from '../components/ui';
import { useToast } from '../components/ui/Toast';

export default function Lobby({ playerId, clearSession }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    room,
    players,
    player,
    loading,
    error,
    isHost,
    isConnected,
    startGame,
    handleLeave,
  } = useGame(code, playerId);

  // Redirect to home if not valid
  useEffect(() => {
    if (!loading && (!room || !player)) {
      clearSession();
      navigate('/');
    }
  }, [loading, room, player, clearSession, navigate]);

  // Redirect when game starts
  useEffect(() => {
    if (room?.status === 'playing') {
      navigate(`/game/${code}`);
    }
  }, [room?.status, code, navigate]);

  const handleShare = async () => {
    const shareUrl = generateShareUrl(code);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chi è il Milionario?',
          text: `Unisciti alla partita! Codice: ${code}`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          await copyToClipboard(shareUrl);
          addToast('Link copiato!', 'success');
        }
      }
    } else {
      await copyToClipboard(shareUrl);
      addToast('Link copiato!', 'success');
    }
  };

  const handleStart = async () => {
    if (players.length < 6) {
      addToast('Servono almeno 6 giocatori', 'warning');
      return;
    }
    await startGame();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <div className="emoji-xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {error || 'Stanza non trovata'}
          </h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Torna alla Home
          </Button>
        </Card>
      </div>
    );
  }

  const canStart = isHost && players.length >= 6;

  return (
    <GameLayout roomCode={code} title="Sala d'attesa">
      <div className="space-y-6">
        {/* Connection status */}
        {!isConnected && (
          <div className="glass bg-yellow-500/20 border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
            <Spinner size="sm" />
            <span className="text-yellow-200">Riconnessione in corso...</span>
          </div>
        )}

        {/* Share Section */}
        <Card className="text-center">
          <h2 className="text-lg font-bold text-white mb-2">
            Invita i tuoi amici!
          </h2>
          <p className="text-white/60 text-sm mb-4">
            Condividi il codice o il link per unirsi alla partita
          </p>

          <div className="flex justify-center gap-3">
            <Button onClick={handleShare} variant="secondary">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Condividi
            </Button>
          </div>
        </Card>

        {/* Players Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              Giocatori ({players.length})
            </h3>
            <span className={`text-sm ${players.length >= 6 ? 'text-green-400' : 'text-yellow-400'}`}>
              {players.length >= 6 ? 'Pronti!' : `Minimo 6 (${6 - players.length} mancanti)`}
            </span>
          </div>

          <PlayerList
            players={players}
            showOnline={true}
          />
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {isHost ? (
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="w-full"
              size="lg"
            >
              {players.length < 6
                ? `Aspetta altri ${6 - players.length} giocatori`
                : 'Inizia la Partita!'}
            </Button>
          ) : (
            <Card className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-white/70">
                <Spinner size="sm" />
                <span>In attesa che l'host inizi la partita...</span>
              </div>
            </Card>
          )}

          <Button
            onClick={handleLeave}
            variant="ghost"
            className="w-full text-red-400 hover:text-red-300"
          >
            Esci dalla partita
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}
