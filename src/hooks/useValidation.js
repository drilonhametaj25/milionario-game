import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { ROLES, getAllObjectives } from '../lib/roles';

export default function useValidation(roomCode, playerId) {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  // Fetch validations for room
  const fetchValidations = useCallback(async (roomId) => {
    if (!roomId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('objective_validations')
        .select('*')
        .eq('room_id', roomId);

      if (fetchError) throw fetchError;
      setValidations(data || []);
    } catch (err) {
      console.error('Error fetching validations:', err);
      setError('Errore nel caricamento delle validazioni');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup realtime subscription for validations
  const setupRealtimeSubscription = useCallback((roomId) => {
    if (!roomId) return;

    const channel = supabase
      .channel(`validations:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'objective_validations',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setValidations(prev => {
              if (prev.some(v => v.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setValidations(prev =>
              prev.map(v => (v.id === payload.new.id ? payload.new : v))
            );
          } else if (payload.eventType === 'DELETE') {
            setValidations(prev => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Vote on an objective
  const voteObjective = useCallback(async (roomId, targetPlayerId, objectiveId, approved) => {
    if (!roomId || !targetPlayerId || !objectiveId || !playerId) return false;

    try {
      const { error: voteError } = await supabase
        .from('objective_validations')
        .upsert({
          room_id: roomId,
          target_player_id: targetPlayerId,
          objective_id: objectiveId,
          voter_player_id: playerId,
          approved,
        }, {
          onConflict: 'room_id,target_player_id,objective_id,voter_player_id',
        });

      if (voteError) throw voteError;
      return true;
    } catch (err) {
      console.error('Error voting on objective:', err);
      setError('Errore nel voto');
      return false;
    }
  }, [playerId]);

  // Advance to next objective (host only)
  const nextObjective = useCallback(async (room, players) => {
    if (!room) return false;

    try {
      const currentPlayerIndex = room.validation_player_index || 0;
      const currentObjectiveIndex = room.validation_objective_index || 0;

      // Get current player and their objectives
      const sortedPlayers = [...players].sort((a, b) =>
        new Date(a.joined_at) - new Date(b.joined_at)
      );
      const currentPlayer = sortedPlayers[currentPlayerIndex];
      if (!currentPlayer) return false;

      const role = ROLES[currentPlayer.role_id];
      if (!role) return false;

      const objectives = getAllObjectives(role);
      const totalObjectives = objectives.length;

      let newObjectiveIndex = currentObjectiveIndex + 1;
      let newPlayerIndex = currentPlayerIndex;

      // If we've finished all objectives for current player, move to next player
      if (newObjectiveIndex >= totalObjectives) {
        newObjectiveIndex = 0;
        newPlayerIndex = currentPlayerIndex + 1;
      }

      // If we've finished all players, end validation
      if (newPlayerIndex >= sortedPlayers.length) {
        // End validation phase
        const { error: endError } = await supabase
          .from('rooms')
          .update({
            status: 'reveal',
            validation_player_index: 0,
            validation_objective_index: 0,
          })
          .eq('id', room.id);

        if (endError) throw endError;
        return true;
      }

      // Update room with new indices
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          validation_player_index: newPlayerIndex,
          validation_objective_index: newObjectiveIndex,
        })
        .eq('id', room.id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error advancing validation:', err);
      setError('Errore nell\'avanzamento');
      return false;
    }
  }, []);

  // Skip to next player (host only)
  const nextPlayer = useCallback(async (room, players) => {
    if (!room) return false;

    try {
      const currentPlayerIndex = room.validation_player_index || 0;
      const sortedPlayers = [...players].sort((a, b) =>
        new Date(a.joined_at) - new Date(b.joined_at)
      );

      const newPlayerIndex = currentPlayerIndex + 1;

      // If we've finished all players, end validation
      if (newPlayerIndex >= sortedPlayers.length) {
        const { error: endError } = await supabase
          .from('rooms')
          .update({
            status: 'reveal',
            validation_player_index: 0,
            validation_objective_index: 0,
          })
          .eq('id', room.id);

        if (endError) throw endError;
        return true;
      }

      // Update room with new player index and reset objective index
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          validation_player_index: newPlayerIndex,
          validation_objective_index: 0,
        })
        .eq('id', room.id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error skipping to next player:', err);
      setError('Errore nel passaggio al prossimo giocatore');
      return false;
    }
  }, []);

  // Get votes for current objective
  const getVotesForObjective = useCallback((targetPlayerId, objectiveId) => {
    return validations.filter(
      v => v.target_player_id === targetPlayerId && v.objective_id === objectiveId
    );
  }, [validations]);

  // Check if current player has voted for objective
  const hasVotedForObjective = useCallback((targetPlayerId, objectiveId) => {
    return validations.some(
      v => v.target_player_id === targetPlayerId &&
           v.objective_id === objectiveId &&
           v.voter_player_id === playerId
    );
  }, [validations, playerId]);

  // Get player's vote for objective
  const getPlayerVote = useCallback((targetPlayerId, objectiveId) => {
    const vote = validations.find(
      v => v.target_player_id === targetPlayerId &&
           v.objective_id === objectiveId &&
           v.voter_player_id === playerId
    );
    return vote?.approved;
  }, [validations, playerId]);

  // Calculate approval percentage for an objective
  const getApprovalForObjective = useCallback((targetPlayerId, objectiveId, totalPlayers) => {
    const votes = getVotesForObjective(targetPlayerId, objectiveId);
    const approvals = votes.filter(v => v.approved).length;
    return {
      votesReceived: votes.length,
      totalVoters: totalPlayers,
      approvals,
      rejections: votes.length - approvals,
      percentage: votes.length > 0 ? Math.round((approvals / votes.length) * 100) : 0,
      allVoted: votes.length >= totalPlayers,
    };
  }, [getVotesForObjective]);

  // Get all validated objectives for scoring
  const getValidatedObjectives = useCallback((targetPlayerId, totalPlayers) => {
    const playerValidations = validations.filter(v => v.target_player_id === targetPlayerId);
    const objectiveIds = [...new Set(playerValidations.map(v => v.objective_id))];

    const result = {};
    for (const objId of objectiveIds) {
      const objVotes = playerValidations.filter(v => v.objective_id === objId);
      const approvals = objVotes.filter(v => v.approved).length;
      // Objective is considered completed if majority approved
      result[objId] = {
        completed: approvals > objVotes.length / 2,
        approvals,
        total: objVotes.length,
      };
    }
    return result;
  }, [validations]);

  return {
    validations,
    loading,
    error,
    fetchValidations,
    setupRealtimeSubscription,
    voteObjective,
    nextObjective,
    nextPlayer,
    getVotesForObjective,
    hasVotedForObjective,
    getPlayerVote,
    getApprovalForObjective,
    getValidatedObjectives,
  };
}
