import { useState } from 'react';
import ObjectiveCard from './ObjectiveCard';
import DiscoveryPicker from './DiscoveryPicker';
import { cn } from '../../lib/utils';

export default function ObjectiveList({
  role,
  objectivesStatus = {},
  players = [],
  currentPlayerId,
  onUpdateObjective,
  onTagPlayer,
}) {
  const [expandedSection, setExpandedSection] = useState('personal');
  const [discoveryObjective, setDiscoveryObjective] = useState(null);

  if (!role) return null;

  const sections = [
    {
      id: 'personal',
      title: 'Obiettivi Personali',
      emoji: '🎯',
      objectives: role.objectives.personal || [],
    },
    {
      id: 'discovery',
      title: 'Discovery',
      emoji: '🔍',
      objectives: role.objectives.discovery || [],
    },
    {
      id: 'interaction',
      title: 'Interazione',
      emoji: '🤝',
      objectives: role.objectives.interaction || [],
    },
  ].filter(s => s.objectives.length > 0);

  const getCompletedCount = (objectives) => {
    return objectives.filter(o => objectivesStatus[o.id]?.completed).length;
  };

  const handleTagPlayerOpen = (objective) => {
    setDiscoveryObjective(objective);
  };

  const handleTagPlayerSelect = (playerId) => {
    if (discoveryObjective) {
      onTagPlayer(discoveryObjective.id, playerId);
      setDiscoveryObjective(null);
    }
  };

  // Filter out current player from list
  const otherPlayers = players.filter(p => p.id !== currentPlayerId);

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <div key={section.id} className="glass rounded-xl overflow-hidden">
          {/* Section Header */}
          <button
            className={cn(
              'w-full flex items-center justify-between p-4',
              'hover:bg-white/5 transition-colors'
            )}
            onClick={() =>
              setExpandedSection(expandedSection === section.id ? null : section.id)
            }
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{section.emoji}</span>
              <span className="font-semibold text-white">{section.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">
                {getCompletedCount(section.objectives)}/{section.objectives.length}
              </span>
              <svg
                className={cn(
                  'w-5 h-5 text-white/60 transition-transform',
                  expandedSection === section.id && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {/* Section Content */}
          {expandedSection === section.id && (
            <div className="p-4 pt-0 space-y-3">
              {section.objectives.map(objective => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  status={objectivesStatus[objective.id]}
                  allObjectivesStatus={objectivesStatus}
                  onToggle={(id, completed) => onUpdateObjective(id, completed)}
                  onTagPlayer={handleTagPlayerOpen}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Discovery Picker Modal */}
      <DiscoveryPicker
        isOpen={!!discoveryObjective}
        onClose={() => setDiscoveryObjective(null)}
        onSelect={handleTagPlayerSelect}
        players={otherPlayers}
        objective={discoveryObjective}
      />
    </div>
  );
}
