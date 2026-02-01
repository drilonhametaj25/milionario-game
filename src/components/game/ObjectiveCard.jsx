import { useState } from 'react';
import { cn } from '../../lib/utils';
import { canCompleteObjective } from '../../lib/roles';
import Badge from '../ui/Badge';

export default function ObjectiveCard({
  objective,
  status,
  allObjectivesStatus,
  onToggle,
  onTagPlayer,
  disabled = false,
}) {
  const [showHint, setShowHint] = useState(false);
  const isCompleted = status?.completed || false;
  const canComplete = canCompleteObjective(objective, allObjectivesStatus);
  const isDiscovery = !!objective.targetRole;
  const needsTagging = isDiscovery && !status?.tagged_player_id;

  const handleClick = () => {
    if (disabled) return;

    if (isDiscovery && needsTagging) {
      // Open player picker for discovery
      onTagPlayer?.(objective);
    } else if (canComplete) {
      onToggle(objective.id, !isCompleted);
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'high':
        return <Badge variant="danger" size="sm">Alto rischio</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medio rischio</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Basso rischio</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'glass rounded-xl p-4 transition-all duration-200',
        isCompleted && 'bg-green-500/20 border-green-500/30',
        !canComplete && !isCompleted && 'opacity-50',
        !disabled && canComplete && 'cursor-pointer hover:bg-white/15'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => {}}
            disabled={disabled || !canComplete}
            className="checkbox-gold"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p
            className={cn(
              'text-white',
              isCompleted && 'line-through text-white/60'
            )}
          >
            {objective.text}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="gold" size="sm">
              +{objective.points} punti
            </Badge>

            {objective.risk && getRiskBadge(objective.risk)}

            {isDiscovery && (
              <Badge variant="purple" size="sm">
                Discovery
              </Badge>
            )}

            {objective.requiresDiscovery && !canComplete && (
              <Badge variant="default" size="sm">
                Richiede discovery
              </Badge>
            )}

            {status?.tagged_player_id && (
              <Badge variant="blue" size="sm">
                Giocatore taggato
              </Badge>
            )}
          </div>

          {/* Hint */}
          {objective.hint && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                className="text-xs text-gold hover:text-gold-light transition-colors"
              >
                {showHint ? 'Nascondi suggerimento' : 'Mostra suggerimento'}
              </button>
              {showHint && (
                <p className="text-sm text-white/60 mt-1 italic">
                  {objective.hint}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
