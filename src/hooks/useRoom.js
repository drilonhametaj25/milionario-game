import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { assignRoles } from '../lib/roles';

export default function useRoom(roomCode) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const channelRef = useRef(null);

  // Handle case when no roomCode is provided (e.g., CreateRoom page)
  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
    }
  }, [roomCode]);

  // Fetch room and players
  const fetchRoomData = useCallback(async () => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    try {
      // Fetch room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();

      if (roomError) {
        if (roomError.code === 'PGRST116') {
          setError('Stanza non trovata');
        } else {
          throw roomError;
        }
        setLoading(false);
        return;
      }

      setRoom(roomData);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id)
        .order('joined_at', { ascending: true });

      if (playersError) throw playersError;

      setPlayers(playersData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching room:', err);
      setError('Errore nel caricamento della stanza');
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  // Setup realtime subscription
  useEffect(() => {
    if (!roomCode) return;

    fetchRoomData();

    // Create channel for realtime updates
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode.toUpperCase()}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRoom(payload.new);
          } else if (payload.eventType === 'DELETE') {
            setRoom(null);
            setError('La stanza è stata eliminata');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers(prev => {
              // Check if player belongs to this room
              if (payload.new.room_id === room?.id) {
                // Avoid duplicates
                if (prev.some(p => p.id === payload.new.id)) return prev;
                return [...prev, payload.new];
              }
              return prev;
            });
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev =>
              prev.map(p => (p.id === payload.new.id ? payload.new : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomCode, fetchRoomData, room?.id]);

  // Create a new room
  const createRoom = useCallback(async (hostNickname, avatarEmoji, settings = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Generate room code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_room_code');

      if (codeError) throw codeError;

      const code = codeData;

      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: '00000000-0000-0000-0000-000000000000', // Will be updated after player creation
          status: 'lobby',
          settings: {
            timer_minutes: settings.timerMinutes || null,
            use_accomplice: settings.useAccomplice !== false,
          },
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Create host player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          nickname: hostNickname,
          avatar_emoji: avatarEmoji,
          is_host: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // Update room with host_id
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ host_id: playerData.id })
        .eq('id', roomData.id);

      if (updateError) throw updateError;

      return { room: roomData, player: playerData, code };
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Errore nella creazione della stanza');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join an existing room
  const joinRoom = useCallback(async (code, nickname, avatarEmoji) => {
    try {
      setLoading(true);
      setError(null);

      // Find room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (roomError) {
        if (roomError.code === 'PGRST116') {
          throw new Error('Stanza non trovata');
        }
        throw roomError;
      }

      // Check room status
      if (roomData.status !== 'lobby') {
        throw new Error('La partita è già iniziata');
      }

      // Check if nickname is unique in room
      const { data: existingPlayer, error: checkError } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', roomData.id)
        .eq('nickname', nickname)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingPlayer) {
        throw new Error('Questo nickname è già in uso');
      }

      // Create player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          nickname,
          avatar_emoji: avatarEmoji,
          is_host: false,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      return { room: roomData, player: playerData };
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'Errore nell\'unirsi alla stanza');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leave room
  const leaveRoom = useCallback(async (playerId) => {
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;

      // Delete player
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (deleteError) throw deleteError;

      // If host left, assign new host
      if (player.is_host && players.length > 1) {
        const newHost = players.find(p => p.id !== playerId);
        if (newHost) {
          await supabase
            .from('players')
            .update({ is_host: true })
            .eq('id', newHost.id);

          await supabase
            .from('rooms')
            .update({ host_id: newHost.id })
            .eq('id', room.id);
        }
      }

      // If last player, delete room
      if (players.length <= 1) {
        await supabase.from('rooms').delete().eq('id', room.id);
      }
    } catch (err) {
      console.error('Error leaving room:', err);
      setError('Errore nell\'uscire dalla stanza');
    }
  }, [players, room]);

  // Start the game
  const startGame = useCallback(async () => {
    if (!room || players.length < 6) {
      setError('Servono almeno 6 giocatori per iniziare');
      return;
    }

    try {
      // Assign roles
      const playerIds = players.map(p => p.id);
      const useAccomplice = room.settings?.use_accomplice !== false;
      const roleAssignments = assignRoles(playerIds, useAccomplice);

      // Update each player with their role
      for (const [playerId, roleId] of Object.entries(roleAssignments)) {
        const { error } = await supabase
          .from('players')
          .update({ role_id: roleId })
          .eq('id', playerId);

        if (error) throw error;
      }

      // Update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({
          status: 'playing',
          started_at: new Date().toISOString(),
        })
        .eq('id', room.id);

      if (roomError) throw roomError;
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Errore nell\'avvio della partita');
    }
  }, [room, players]);

  // Start voting phase
  const startVoting = useCallback(async () => {
    if (!room) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          status: 'voting',
          voting_started_at: new Date().toISOString(),
        })
        .eq('id', room.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error starting voting:', err);
      setError('Errore nell\'avvio della votazione');
    }
  }, [room]);

  // End voting and go to validation phase
  const endVoting = useCallback(async () => {
    if (!room) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          status: 'validating',
          validation_player_index: 0,
          validation_objective_index: 0,
        })
        .eq('id', room.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error ending voting:', err);
      setError('Errore nella chiusura della votazione');
    }
  }, [room]);

  // Start validation phase (skip voting auto-transition)
  const startValidation = useCallback(async () => {
    if (!room) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          status: 'validating',
          validation_player_index: 0,
          validation_objective_index: 0,
        })
        .eq('id', room.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error starting validation:', err);
      setError('Errore nell\'avvio della validazione');
    }
  }, [room]);

  // End validation and go to reveal
  const endValidation = useCallback(async () => {
    if (!room) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'reveal' })
        .eq('id', room.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error ending validation:', err);
      setError('Errore nella chiusura della validazione');
    }
  }, [room]);

  // Create a test room with 6 fake players for testing
  const createTestRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate room code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_room_code');

      if (codeError) throw codeError;

      const code = codeData;

      // Create room (marked as test room)
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: '00000000-0000-0000-0000-000000000000',
          status: 'lobby',
          settings: {
            timer_minutes: null,
            use_accomplice: true,
            is_test_room: true,
          },
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Create host player (Test Host)
      const { data: hostPlayer, error: hostError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          nickname: 'Test Host 🎮',
          avatar_emoji: '🎮',
          is_host: true,
        })
        .select()
        .single();

      if (hostError) throw hostError;

      // Update room with host_id
      await supabase
        .from('rooms')
        .update({ host_id: hostPlayer.id })
        .eq('id', roomData.id);

      // Create 5 fake players
      const fakePlayerEmojis = ['🤖', '👾', '🎯', '🎲', '🎪'];
      const fakePlayerPromises = [];

      for (let i = 1; i <= 5; i++) {
        fakePlayerPromises.push(
          supabase
            .from('players')
            .insert({
              room_id: roomData.id,
              nickname: `Test${i} ${fakePlayerEmojis[i - 1]}`,
              avatar_emoji: fakePlayerEmojis[i - 1],
              is_host: false,
            })
            .select()
            .single()
        );
      }

      await Promise.all(fakePlayerPromises);

      return { room: roomData, player: hostPlayer, code };
    } catch (err) {
      console.error('Error creating test room:', err);
      setError('Errore nella creazione della stanza di test');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-vote for fake players in test mode
  const autoVoteTestPlayers = useCallback(async (hostPlayerId) => {
    if (!room || !room.settings?.is_test_room) return;

    try {
      // Get all players except host who haven't voted
      const fakePlayers = players.filter(p => p.id !== hostPlayerId && !p.has_voted);

      // Get all possible vote targets (excluding self for each player)
      const allPlayerIds = players.map(p => p.id);

      // Make each fake player vote for a random other player
      for (const fakePlayer of fakePlayers) {
        const possibleTargets = allPlayerIds.filter(id => id !== fakePlayer.id);
        const randomTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

        await supabase
          .from('players')
          .update({
            has_voted: true,
            vote_target_id: randomTarget,
          })
          .eq('id', fakePlayer.id);
      }
    } catch (err) {
      console.error('Error auto-voting for test players:', err);
    }
  }, [room, players]);

  // Auto-validate for fake players in test mode
  const autoValidateTestPlayers = useCallback(async (hostPlayerId, targetPlayerId, objectiveId) => {
    if (!room || !room.settings?.is_test_room) return;

    try {
      // Get all players except host and target who haven't voted on this objective
      const fakePlayers = players.filter(p =>
        p.id !== hostPlayerId &&
        p.id !== targetPlayerId
      );

      // Make each fake player vote randomly (70% approve, 30% reject for more interesting results)
      for (const fakePlayer of fakePlayers) {
        const approved = Math.random() > 0.3;

        await supabase
          .from('objective_validations')
          .upsert({
            room_id: room.id,
            target_player_id: targetPlayerId,
            objective_id: objectiveId,
            voter_player_id: fakePlayer.id,
            approved,
          }, {
            onConflict: 'room_id,target_player_id,objective_id,voter_player_id',
          });
      }
    } catch (err) {
      console.error('Error auto-validating for test players:', err);
    }
  }, [room, players]);

  // Reset room for new game
  const resetRoom = useCallback(async () => {
    if (!room) return;

    try {
      // Delete all validation votes
      await supabase
        .from('objective_validations')
        .delete()
        .eq('room_id', room.id);

      // Reset all players
      const { error: playersError } = await supabase
        .from('players')
        .update({
          role_id: null,
          objectives_status: {},
          has_voted: false,
          vote_target_id: null,
        })
        .eq('room_id', room.id);

      if (playersError) throw playersError;

      // Reset room
      const { error: roomError } = await supabase
        .from('rooms')
        .update({
          status: 'lobby',
          started_at: null,
          voting_started_at: null,
          validation_player_index: 0,
          validation_objective_index: 0,
        })
        .eq('id', room.id);

      if (roomError) throw roomError;
    } catch (err) {
      console.error('Error resetting room:', err);
      setError('Errore nel reset della partita');
    }
  }, [room]);

  return {
    room,
    players,
    loading,
    error,
    isConnected,
    createRoom,
    createTestRoom,
    joinRoom,
    leaveRoom,
    startGame,
    startVoting,
    endVoting,
    startValidation,
    endValidation,
    resetRoom,
    autoVoteTestPlayers,
    autoValidateTestPlayers,
    refetch: fetchRoomData,
  };
}
