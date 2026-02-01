import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoom } from '../hooks';
import { AVATAR_EMOJIS, getRandomEmoji } from '../lib/utils';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

export default function JoinRoom({ setPlayerId, setRoomCode }) {
  const navigate = useNavigate();
  const { code: urlCode } = useParams();
  const { addToast } = useToast();
  const { joinRoom, loading } = useRoom();

  const [code, setCode] = useState(urlCode || '');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(getRandomEmoji());
  const [error, setError] = useState('');

  // Auto-focus code input if no URL code
  useEffect(() => {
    if (urlCode) {
      setCode(urlCode.toUpperCase());
    }
  }, [urlCode]);

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Il codice deve essere di 6 caratteri');
      return;
    }

    if (!nickname.trim()) {
      setError('Inserisci un nickname');
      return;
    }

    if (nickname.trim().length < 2) {
      setError('Il nickname deve avere almeno 2 caratteri');
      return;
    }

    try {
      const { room, player } = await joinRoom(code, nickname.trim(), avatar);

      setPlayerId(player.id);
      setRoomCode(room.code);

      addToast('Ti sei unito alla partita!', 'success');
      navigate(`/lobby/${room.code}`);
    } catch (err) {
      setError(err.message || 'Errore nell\'unirsi alla stanza');
      addToast(err.message || 'Errore', 'error');
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
            <CardTitle>Unisciti a una partita</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Code */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Codice stanza
              </label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="XXXXXX"
                className={cn(
                  'w-full px-4 py-4 rounded-xl text-center',
                  'bg-white/10 border border-white/20',
                  'text-white text-2xl font-mono font-bold tracking-widest',
                  'placeholder-white/30',
                  'focus:border-gold focus:ring-2 focus:ring-gold/50',
                  'transition-all duration-200'
                )}
                maxLength={6}
                autoComplete="off"
                autoCapitalize="characters"
              />
            </div>

            {/* Nickname */}
            <Input
              label="Il tuo nickname"
              placeholder="Come ti chiamano?"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
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

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={code.length !== 6 || !nickname.trim()}
              className="w-full"
              size="lg"
            >
              Unisciti
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
