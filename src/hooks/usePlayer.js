import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ROLES, canCompleteObjective } from '../lib/roles';

export default function usePlayer(playerId) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const heartbeatRef = useRef(null);
  const channelRef = useRef(null);

  // Fetch player data
  const fetchPlayer = useCallback(async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Giocatore non trovato');
          setPlayer(null);
        } else {
          throw fetchError;
        }
      } else {
        setPlayer(data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching player:', err);
      setError('Errore nel caricamento del giocatore');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  // Setup realtime subscription for player
  useEffect(() => {
    if (!playerId) return;

    fetchPlayer();

    // Subscribe to player changes
    const channel = supabase
      .channel(`player:${playerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `id=eq.${playerId}`,
        },
        (payload) => {
          setPlayer(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'players',
          filter: `id=eq.${playerId}`,
        },
        () => {
          setPlayer(null);
          setError('Sei stato rimosso dalla partita');
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [playerId, fetchPlayer]);

  // Heartbeat to update last_seen_at
  useEffect(() => {
    if (!playerId) return;

    const updateLastSeen = async () => {
      try {
        await supabase
          .from('players')
          .update({
            last_seen_at: new Date().toISOString(),
            is_connected: true
          })
          .eq('id', playerId);
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    };

    // Initial update
    updateLastSeen();

    // Update every 30 seconds
    heartbeatRef.current = setInterval(updateLastSeen, 30000);

    // Mark as disconnected on unmount
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      // Mark player as disconnected
      supabase
        .from('players')
        .update({ is_connected: false })
        .eq('id', playerId)
        .then(() => {});
    };
  }, [playerId]);

  // Get role data
  const role = player?.role_id ? ROLES[player.role_id] : null;

  // Update objective status
  const updateObjectiveStatus = useCallback(async (objectiveId, completed, taggedPlayerId = null) => {
    if (!player) return;

    try {
      const currentStatus = player.objectives_status || {};

      // Check if objective can be completed
      const objective = getAllObjectivesFlat(role).find(o => o.id === objectiveId);
      if (objective && !canCompleteObjective(objective, currentStatus)) {
        setError('Devi prima completare l\'obiettivo discovery');
        return false;
      }

      const newStatus = {
        ...currentStatus,
        [objectiveId]: {
          completed,
          tagged_player_id: taggedPlayerId,
          completed_at: completed ? new Date().toISOString() : null,
        },
      };

      const { error: updateError } = await supabase
        .from('players')
        .update({ objectives_status: newStatus })
        .eq('id', player.id);

      if (updateError) throw updateError;

      // Optimistic update
      setPlayer(prev => ({ ...prev, objectives_status: newStatus }));
      return true;
    } catch (err) {
      console.error('Error updating objective:', err);
      setError('Errore nell\'aggiornamento dell\'obiettivo');
      return false;
    }
  }, [player, role]);

  // Tag player for discovery objective
  const tagPlayerForDiscovery = useCallback(async (objectiveId, targetPlayerId) => {
    return updateObjectiveStatus(objectiveId, true, targetPlayerId);
  }, [updateObjectiveStatus]);

  // Cast vote
  const castVote = useCallback(async (targetPlayerId) => {
    if (!player) return false;

    // Check if already voted
    if (player.has_voted) {
      setError('Hai già votato');
      return false;
    }

    try {
      const { error: voteError } = await supabase
        .from('players')
        .update({
          has_voted: true,
          vote_target_id: targetPlayerId,
        })
        .eq('id', player.id);

      if (voteError) throw voteError;

      // Optimistic update
      setPlayer(prev => ({
        ...prev,
        has_voted: true,
        vote_target_id: targetPlayerId,
      }));

      return true;
    } catch (err) {
      console.error('Error casting vote:', err);
      setError('Errore nel voto');
      return false;
    }
  }, [player]);

  return {
    player,
    role,
    loading,
    error,
    updateObjectiveStatus,
    tagPlayerForDiscovery,
    castVote,
    refetch: fetchPlayer,
  };
}

// Helper function to get all objectives as flat array
function getAllObjectivesFlat(role) {
  if (!role) return [];
  return [
    ...(role.objectives?.personal || []),
    ...(role.objectives?.discovery || []),
    ...(role.objectives?.interaction || []),
  ];
}
