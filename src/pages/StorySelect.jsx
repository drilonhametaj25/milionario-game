import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStories, useGroup } from '../hooks';
import { StoryCard, StoryProgress, StoryDetail } from '../components/stories';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

export default function StorySelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/create';

  const { stories, loading, progress, refresh } = useStories();
  const {
    group,
    hasGroup,
    loading: groupLoading,
    createNewGroup,
    joinExistingGroup,
    leaveGroup
  } = useGroup();

  const [selectedStory, setSelectedStory] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Mostra modal gruppo se non ne ha uno
  useEffect(() => {
    if (!groupLoading && !hasGroup) {
      setShowGroupModal(true);
    }
  }, [groupLoading, hasGroup]);

  const handleSelectStory = (story) => {
    setSelectedStory(story);
  };

  const handleConfirmStory = () => {
    if (!selectedStory) return;

    // Naviga a create con lo storyId
    navigate(`/create?storyId=${selectedStory.id}`);
  };

  const handleCreateGroup = async () => {
    if (isCreatingGroup) return;

    setIsCreatingGroup(true);
    try {
      await createNewGroup(groupName || null);
      setShowGroupModal(false);
      setGroupName('');
    } catch (err) {
      console.error('Error creating group:', err);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinGroupId.trim() || isCreatingGroup) return;

    setIsCreatingGroup(true);
    try {
      const joined = await joinExistingGroup(joinGroupId.trim());
      if (joined) {
        setShowGroupModal(false);
        setJoinGroupId('');
      } else {
        alert('Gruppo non trovato');
      }
    } catch (err) {
      console.error('Error joining group:', err);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  if (loading || groupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </button>

          {/* Group info */}
          {hasGroup && (
            <button
              onClick={() => setShowGroupModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
              <span className="text-white/60">Gruppo:</span>
              <span className="text-white font-medium truncate max-w-[150px]">
                {group?.name || 'Senza nome'}
              </span>
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">
            Scegli una Storia
          </h1>
          <p className="text-white/60">
            Ogni storia ha ruoli e obiettivi unici
          </p>
        </div>

        {/* Progress bar */}
        {progress.total > 0 && (
          <StoryProgress
            played={progress.played}
            total={progress.total}
            className="max-w-md mx-auto"
          />
        )}

        {/* Selected story detail */}
        {selectedStory && (
          <Card className="border-2 border-amber-400/30">
            <StoryDetail
              story={selectedStory}
              played={stories.find(s => s.story.id === selectedStory.id)?.played}
              onSelect={handleConfirmStory}
              onBack={() => setSelectedStory(null)}
            />
          </Card>
        )}

        {/* Story list */}
        {!selectedStory && (
          <div className="space-y-3">
            {stories.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-white/60">
                  Nessuna storia disponibile.
                </p>
                <p className="text-white/40 text-sm mt-2">
                  Esegui la migrazione per popolare il database.
                </p>
              </Card>
            ) : (
              stories.map(({ story, played }) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  played={played}
                  onClick={() => handleSelectStory(story)}
                  selected={selectedStory?.id === story.id}
                />
              ))
            )}
          </div>
        )}

        {/* Quick action button if story selected */}
        {selectedStory && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-2xl mx-auto">
              <Button
                onClick={handleConfirmStory}
                size="lg"
                className="w-full"
              >
                Gioca "{selectedStory.title}"
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Group Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => hasGroup && setShowGroupModal(false)}
        title={hasGroup ? 'Gestisci Gruppo' : 'Crea o Unisciti a un Gruppo'}
      >
        <div className="space-y-6">
          {hasGroup ? (
            // Group management view
            <>
              <div className="glass rounded-xl p-4">
                <div className="text-sm text-white/60 mb-1">Gruppo corrente</div>
                <div className="text-lg font-bold text-white">
                  {group?.name || 'Senza nome'}
                </div>
                <div className="text-xs text-white/40 mt-2 break-all">
                  ID: {group?.id}
                </div>
              </div>

              <StoryProgress
                played={progress.played}
                total={progress.total}
              />

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(group?.id || '');
                    alert('ID gruppo copiato!');
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Copia ID Gruppo
                </Button>

                <Button
                  onClick={() => {
                    leaveGroup();
                    setShowGroupModal(false);
                  }}
                  variant="ghost"
                  className="w-full text-red-400 hover:text-red-300"
                >
                  Lascia Gruppo
                </Button>
              </div>
            </>
          ) : (
            // Create/Join view
            <>
              <p className="text-white/70 text-sm">
                I gruppi permettono di tracciare quali storie avete già giocato insieme.
              </p>

              {/* Create new group */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Crea nuovo gruppo</h3>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nome gruppo (opzionale)"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50"
                />
                <Button
                  onClick={handleCreateGroup}
                  disabled={isCreatingGroup}
                  className="w-full"
                >
                  {isCreatingGroup ? 'Creazione...' : 'Crea Gruppo'}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/40 text-sm">oppure</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Join existing group */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Unisciti a gruppo esistente</h3>
                <input
                  type="text"
                  value={joinGroupId}
                  onChange={(e) => setJoinGroupId(e.target.value)}
                  placeholder="Incolla ID gruppo"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 font-mono text-sm"
                />
                <Button
                  onClick={handleJoinGroup}
                  disabled={!joinGroupId.trim() || isCreatingGroup}
                  variant="secondary"
                  className="w-full"
                >
                  {isCreatingGroup ? 'Unione...' : 'Unisciti'}
                </Button>
              </div>

              {/* Skip option */}
              <button
                onClick={() => {
                  handleCreateGroup();
                }}
                className="w-full text-center text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                Continua senza gruppo
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
