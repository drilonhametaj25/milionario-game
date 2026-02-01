import Modal, { ModalHeader, ModalTitle, ModalBody } from '../ui/Modal';
import PlayerAvatar from './PlayerAvatar';
import { cn } from '../../lib/utils';

export default function DiscoveryPicker({
  isOpen,
  onClose,
  onSelect,
  players,
  objective,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Chi pensi sia?</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {objective && (
          <p className="text-white/70 mb-4 text-sm">
            {objective.text}
          </p>
        )}

        <div className="grid grid-cols-3 gap-4">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className={cn(
                'p-3 rounded-xl glass hover:bg-white/20 transition-all',
                'flex flex-col items-center gap-2'
              )}
            >
              <PlayerAvatar
                player={player}
                size="md"
                showName={false}
                showHost={false}
              />
              <span className="text-sm text-white/80 truncate max-w-full">
                {player.nickname}
              </span>
            </button>
          ))}
        </div>

        {players.length === 0 && (
          <p className="text-center text-white/50 py-8">
            Nessun altro giocatore disponibile
          </p>
        )}
      </ModalBody>
    </Modal>
  );
}
