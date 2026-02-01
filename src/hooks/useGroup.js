import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  getCurrentGroupId,
  setCurrentGroupId,
  clearCurrentGroup,
  createGroup,
  loadGroup,
  joinGroup,
  loadGroupMembers,
  loadGroupHistory,
  getGroupProgress,
  recordStoryPlayed,
  hasGroupPlayedStory,
  updateGroupName,
  addCurrentDeviceToGroup,
  generateFingerprint
} from '../lib/groups';

/**
 * Hook per gestire il gruppo corrente
 * @returns {{
 *   group: import('../lib/stories/types').GameGroup | null,
 *   members: import('../lib/stories/types').GroupMember[],
 *   history: import('../lib/stories/types').GroupStoryHistory[],
 *   progress: { total: number, played: number },
 *   loading: boolean,
 *   error: Error | null,
 *   hasGroup: boolean,
 *   createNewGroup: (name?: string) => Promise<import('../lib/stories/types').GameGroup>,
 *   joinExistingGroup: (groupId: string) => Promise<import('../lib/stories/types').GameGroup | null>,
 *   leaveGroup: () => void,
 *   renameGroup: (name: string) => Promise<void>,
 *   markStoryPlayed: (storyId: string, roomId?: string) => Promise<void>,
 *   hasPlayed: (storyId: string) => Promise<boolean>,
 *   refresh: () => Promise<void>
 * }}
 */
export function useGroup() {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState({ total: 0, played: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica tutti i dati del gruppo
  const loadData = useCallback(async () => {
    const groupId = getCurrentGroupId();

    if (!groupId) {
      setGroup(null);
      setMembers([]);
      setHistory([]);
      setProgress({ total: 0, played: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const groupData = await loadGroup(groupId);

      if (!groupData) {
        // Gruppo non esiste più
        clearCurrentGroup();
        setGroup(null);
        setMembers([]);
        setHistory([]);
        setProgress({ total: 0, played: 0 });
        return;
      }

      // Carica tutti i dati in parallelo
      const [membersData, historyData, progressData] = await Promise.all([
        loadGroupMembers(groupId),
        loadGroupHistory(groupId),
        getGroupProgress(groupId)
      ]);

      setGroup(groupData);
      setMembers(membersData);
      setHistory(historyData);
      setProgress(progressData);
    } catch (err) {
      console.error('Error loading group data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carica dati iniziali
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sottoscrizione realtime per aggiornamenti gruppo
  useEffect(() => {
    const groupId = getCurrentGroupId();
    if (!groupId) return;

    const subscription = supabase
      .channel(`group_${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_groups',
        filter: `id=eq.${groupId}`
      }, () => {
        loadData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_members',
        filter: `group_id=eq.${groupId}`
      }, () => {
        loadData();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_story_history',
        filter: `group_id=eq.${groupId}`
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadData, group?.id]);

  // Crea nuovo gruppo
  const createNewGroup = useCallback(async (name = null) => {
    setLoading(true);
    try {
      const newGroup = await createGroup(name);
      await loadData();
      return newGroup;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Unisciti a gruppo esistente
  const joinExistingGroup = useCallback(async (groupId) => {
    setLoading(true);
    try {
      const joinedGroup = await joinGroup(groupId);
      if (joinedGroup) {
        await loadData();
      }
      return joinedGroup;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Lascia il gruppo corrente
  const leaveGroup = useCallback(() => {
    clearCurrentGroup();
    setGroup(null);
    setMembers([]);
    setHistory([]);
    setProgress({ total: 0, played: 0 });
  }, []);

  // Rinomina il gruppo
  const renameGroup = useCallback(async (name) => {
    if (!group) return;

    try {
      const updated = await updateGroupName(group.id, name);
      setGroup(updated);
    } catch (err) {
      console.error('Error renaming group:', err);
      throw err;
    }
  }, [group]);

  // Marca una storia come giocata
  const markStoryPlayed = useCallback(async (storyId, roomId = null) => {
    if (!group) return;

    try {
      await recordStoryPlayed(group.id, storyId, roomId);
      await loadData();
    } catch (err) {
      console.error('Error marking story as played:', err);
      throw err;
    }
  }, [group, loadData]);

  // Verifica se una storia è stata giocata
  const hasPlayed = useCallback(async (storyId) => {
    if (!group) return false;
    return hasGroupPlayedStory(group.id, storyId);
  }, [group]);

  return {
    group,
    members,
    history,
    progress,
    loading,
    error,
    hasGroup: !!group,
    createNewGroup,
    joinExistingGroup,
    leaveGroup,
    renameGroup,
    markStoryPlayed,
    hasPlayed,
    refresh: loadData
  };
}

/**
 * Hook per verificare lo stato del gruppo e inizializzarlo se necessario
 * @returns {{
 *   needsGroup: boolean,
 *   groupId: string | null,
 *   loading: boolean
 * }}
 */
export function useGroupStatus() {
  const [groupId, setGroupId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGroup = async () => {
      const id = getCurrentGroupId();

      if (id) {
        // Verifica che il gruppo esista ancora
        const group = await loadGroup(id);
        if (group) {
          setGroupId(id);
        } else {
          clearCurrentGroup();
          setGroupId(null);
        }
      } else {
        setGroupId(null);
      }

      setLoading(false);
    };

    checkGroup();
  }, []);

  return {
    needsGroup: !groupId && !loading,
    groupId,
    loading
  };
}

export default useGroup;
