import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Home({ playerId, roomCode, clearSession }) {
  const navigate = useNavigate();

  // Check if player still exists in room
  useEffect(() => {
    const checkSession = async () => {
      if (!playerId || !roomCode) return;

      try {
        // Check if player exists
        const { data: player, error: playerError } = await supabase
          .from('players')
          .select('*, rooms!inner(status, code)')
          .eq('id', playerId)
          .single();

        if (playerError || !player) {
          clearSession();
          return;
        }

        // Redirect based on room status
        const status = player.rooms?.status;
        const code = player.rooms?.code;

        if (status && code) {
          switch (status) {
            case 'lobby':
              navigate(`/lobby/${code}`);
              break;
            case 'playing':
              navigate(`/game/${code}`);
              break;
            case 'voting':
              navigate(`/voting/${code}`);
              break;
            case 'reveal':
              navigate(`/reveal/${code}`);
              break;
            default:
              clearSession();
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        clearSession();
      }
    };

    checkSession();
  }, [playerId, roomCode, navigate, clearSession]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="emoji-2xl mb-4 animate-float">💰</div>
          <h1 className="text-4xl font-bold text-gold-gradient mb-2">
            Chi è il Milionario?
          </h1>
          <p className="text-white/70">
            Il gioco sociale per cene tra amici
          </p>
        </div>

        {/* Main Card */}
        <Card className="space-y-4">
          <Button
            onClick={() => navigate('/create')}
            className="w-full"
            size="lg"
          >
            Crea Partita
          </Button>

          <Button
            onClick={() => navigate('/join')}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            Unisciti
          </Button>
        </Card>

        {/* How to play */}
        <Card className="text-center">
          <h3 className="font-bold text-white mb-2">Come si gioca?</h3>
          <p className="text-white/70 text-sm">
            Un giocatore vince segretamente alla lotteria.
            <br />
            Tutti gli altri devono scoprire chi è!
            <br />
            <span className="text-gold">Minimo 6 giocatori</span>
          </p>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs">
          Versione 1.0 - Fatto con ❤️ per le cene divertenti
        </p>
      </div>
    </div>
  );
}
