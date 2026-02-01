import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ROLES } from '../../lib/roles';
import Button from '../ui/Button';

export default function RoleReveal({ roleId, onComplete, rolesMap = null }) {
  const [stage, setStage] = useState(0); // 0: waiting, 1: revealing, 2: revealed
  // Use custom rolesMap if provided (for database roles), otherwise fallback to ROLES
  const role = rolesMap ? rolesMap[roleId] : ROLES[roleId];

  useEffect(() => {
    // Auto-advance through stages
    const timer1 = setTimeout(() => setStage(1), 500);
    const timer2 = setTimeout(() => setStage(2), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="max-w-md w-full">
        {/* Card back / revealing animation */}
        {stage < 2 && (
          <div
            className={cn(
              'glass rounded-3xl p-8 text-center',
              stage === 1 && 'animate-reveal'
            )}
          >
            <div className="emoji-2xl mb-4">🎭</div>
            <p className="text-xl text-white/80">
              {stage === 0 ? 'Scopri il tuo ruolo...' : 'Rivelazione...'}
            </p>
          </div>
        )}

        {/* Revealed role */}
        {stage === 2 && (
          <div className="animate-bounce-in">
            <div
              className={cn(
                'rounded-3xl p-6 text-center',
                `bg-gradient-to-br ${role.color}`
              )}
            >
              <div className="emoji-2xl mb-4 animate-float">{role.emoji}</div>
              <h2 className="text-3xl font-bold text-white mb-2">{role.name}</h2>
              <div className="glass-dark rounded-xl p-4 mt-4 text-left">
                <p className="text-white/90 text-sm whitespace-pre-line">
                  {role.description}
                </p>
              </div>
            </div>

            <Button
              onClick={onComplete}
              className="w-full mt-6"
              size="lg"
            >
              Ho capito, iniziamo!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
