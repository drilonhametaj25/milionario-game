import { useMemo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoom from './useRoom';
import usePlayer from './usePlayer';
import useValidation from './useValidation';
import { calculateScores } from '../lib/roles';
import { supabase } from '../lib/supabase';

export default function useGame(roomCode, playerId) {
  const navigate = useNavigate();

  const {
    room,
    players,
    loading: roomLoading,
    error: roomError,
    isConnected,
    startGame,
    startVoting,
    endVoting,
    startValidation,
    endValidation,
    resetRoom,
    leaveRoom,
    autoVoteTestPlayers,
    autoValidateTestPlayers,
  } = useRoom(roomCode);

  const {
    player,
    role,
    loading: playerLoading,
    error: playerError,
    updateObjectiveStatus,
    tagPlayerForDiscovery,
    castVote,
  } = usePlayer(playerId);

  // Validation data for scoring
  const [validations, setValidations] = useState([]);

  // Fetch validations when entering reveal state
  useEffect(() => {
    const fetchValidations = async () => {
      if (room?.status === 'reveal' && room?.id) {
        const { data, error } = await supabase
          .from('objective_validations')
          .select('*')
          .eq('room_id', room.id);

        if (!error && data) {
          setValidations(data);
        }
      }
    };

    fetchValidations();
  }, [room?.status, room?.id]);

  // Combined loading state
  const loading = roomLoading || playerLoading;

  // Combined error state
  const error = roomError || playerError;

  // Check if current player is host
  const isHost = useMemo(() => {
    return player?.is_host === true;
  }, [player]);

  // Other players (excluding current player)
  const otherPlayers = useMemo(() => {
    return players.filter(p => p.id !== playerId);
  }, [players, playerId]);

  // Voting progress
  const votingProgress = useMemo(() => {
    if (!players.length) return { voted: 0, total: 0, percentage: 0 };
    const voted = players.filter(p => p.has_voted).length;
    const total = players.length;
    return {
      voted,
      total,
      percentage: Math.round((voted / total) * 100),
    };
  }, [players]);

  // Check if all players have voted
  const allVoted = useMemo(() => {
    return players.length > 0 && players.every(p => p.has_voted);
  }, [players]);

  // Auto-transition to reveal when all voted
  useEffect(() => {
    if (room?.status === 'voting' && allVoted && isHost) {
      endVoting();
    }
  }, [room?.status, allVoted, isHost, endVoting]);

  // Calculate scores for reveal
  const scores = useMemo(() => {
    if (room?.status !== 'reveal') return {};

    const votes = players
      .filter(p => p.vote_target_id)
      .map(p => ({
        player_id: p.id,
        vote_target_id: p.vote_target_id,
      }));

    // Pass validations to calculateScores if available
    return calculateScores(players, votes, validations.length > 0 ? validations : null);
  }, [room?.status, players, validations]);

  // Get millionaire
  const millionaire = useMemo(() => {
    return players.find(p => p.role_id === 'millionaire');
  }, [players]);

  // Vote results
  const voteResults = useMemo(() => {
    if (room?.status !== 'reveal') return [];

    const voteCounts = {};
    players.forEach(p => {
      if (p.vote_target_id) {
        voteCounts[p.vote_target_id] = (voteCounts[p.vote_target_id] || 0) + 1;
      }
    });

    return Object.entries(voteCounts)
      .map(([playerId, count]) => ({
        player: players.find(p => p.id === playerId),
        votes: count,
        percentage: Math.round((count / players.length) * 100),
      }))
      .sort((a, b) => b.votes - a.votes);
  }, [room?.status, players]);

  // Navigate based on room status
  useEffect(() => {
    if (!room || !roomCode) return;

    const currentPath = window.location.pathname;
    const basePath = `/${roomCode}`;

    switch (room.status) {
      case 'lobby':
        if (!currentPath.includes('/lobby/')) {
          navigate(`/lobby/${roomCode}`);
        }
        break;
      case 'playing':
        if (!currentPath.includes('/game/')) {
          navigate(`/game/${roomCode}`);
        }
        break;
      case 'voting':
        if (!currentPath.includes('/voting/')) {
          navigate(`/voting/${roomCode}`);
        }
        break;
      case 'validating':
        if (!currentPath.includes('/validation/')) {
          navigate(`/validation/${roomCode}`);
        }
        break;
      case 'reveal':
        if (!currentPath.includes('/reveal/')) {
          navigate(`/reveal/${roomCode}`);
        }
        break;
      default:
        break;
    }
  }, [room?.status, roomCode, navigate]);

  // Handle player leaving
  const handleLeave = useCallback(async () => {
    if (playerId) {
      await leaveRoom(playerId);
    }
    localStorage.removeItem('playerId');
    localStorage.removeItem('roomCode');
    navigate('/');
  }, [playerId, leaveRoom, navigate]);

  // Handle new game
  const handleNewGame = useCallback(async () => {
    await resetRoom();
  }, [resetRoom]);

  // Wrapped castVote that also auto-votes for test players
  const handleCastVote = useCallback(async (targetPlayerId) => {
    const success = await castVote(targetPlayerId);
    if (success && room?.settings?.is_test_room) {
      // Auto-vote for fake players in test mode
      await autoVoteTestPlayers(playerId);
    }
    return success;
  }, [castVote, room, autoVoteTestPlayers, playerId]);

  // Check if this is a test room
  const isTestRoom = room?.settings?.is_test_room === true;

  return {
    // State
    room,
    players,
    player,
    role,
    loading,
    error,
    isConnected,

    // Computed
    isHost,
    isTestRoom,
    otherPlayers,
    votingProgress,
    allVoted,
    scores,
    millionaire,
    voteResults,

    // Actions
    startGame,
    startVoting,
    endVoting,
    startValidation,
    endValidation,
    updateObjectiveStatus,
    tagPlayerForDiscovery,
    castVote: handleCastVote,
    autoValidateTestPlayers,
    handleLeave,
    handleNewGame,
  };
}
