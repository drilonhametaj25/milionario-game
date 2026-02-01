import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks';
import { AVATAR_EMOJIS, getRandomEmoji } from '../lib/utils';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

export default function CreateRoom({ setPlayerId, setRoomCode }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { createRoom, loading } = useRoom();

  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(getRandomEmoji());
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('Inserisci un nickname');
      return;
    }

    if (nickname.trim().length < 2) {
      setError('Il nickname deve avere almeno 2 caratteri');
      return;
    }

    try {
      const { room, player, code } = await createRoom(
        nickname.trim(),
        avatar,
        { useAccomplice: true }
      );

      setPlayerId(player.id);
      setRoomCode(code);

      addToast('Stanza creata!', 'success');
      navigate(`/lobby/${code}`);
    } catch (err) {
      setError(err.message || 'Errore nella creazione della stanza');
      addToast('Errore nella creazione', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Indietro
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Crea una nuova partita</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname */}
            <Input
              label="Il tuo nickname"
              placeholder="Come ti chiamano?"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              error={error}
            />

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Scegli il tuo avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                      'transition-all duration-200 hover:scale-110',
                      avatar === emoji
                        ? 'bg-gold ring-2 ring-gold'
                        : 'bg-white/10 hover:bg-white/20'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center gap-3 p-4 glass rounded-xl">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl border-2 border-gold">
                {avatar}
              </div>
              <div>
                <p className="text-white font-medium">
                  {nickname || 'Il tuo nickname'}
                </p>
                <p className="text-white/60 text-sm flex items-center gap-1">
                  <span>👑</span> Host
                </p>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={!nickname.trim()}
              className="w-full"
              size="lg"
            >
              Crea Partita
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
