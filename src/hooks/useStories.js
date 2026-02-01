import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { loadStories } from '../lib/stories';
import { loadPlayedStoryIds, getCurrentGroupId } from '../lib/groups';

/**
 * Hook per caricare la lista delle storie con stato di progresso
 * @param {string} [groupId] - ID del gruppo (opzionale, usa localStorage se non fornito)
 * @returns {{
 *   stories: import('../lib/stories/types').StoryWithProgress[],
 *   loading: boolean,
 *   error: Error | null,
 *   refresh: () => Promise<void>,
 *   progress: { total: number, played: number }
 * }}
 */
export function useStories(groupId = null) {
  const [stories, setStories] = useState([]);
  const [playedIds, setPlayedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usa groupId fornito o quello dal localStorage
  const effectiveGroupId = groupId || getCurrentGroupId();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Carica storie e storie giocate in parallelo
      const [allStories, played] = await Promise.all([
        loadStories(),
        effectiveGroupId ? loadPlayedStoryIds(effectiveGroupId) : Promise.resolve([])
      ]);

      setStories(allStories);
      setPlayedIds(played);
    } catch (err) {
      console.error('Error loading stories:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [effectiveGroupId]);

  // Carica dati iniziali
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sottoscrizione realtime per aggiornamenti storie
  useEffect(() => {
    const subscription = supabase
      .channel('stories_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stories'
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadData]);

  // Combina storie con stato di progresso
  const storiesWithProgress = stories.map(story => ({
    story,
    played: playedIds.includes(story.id),
    played_at: null // TODO: caricare data se necessario
  }));

  const progress = {
    total: stories.length,
    played: playedIds.length
  };

  return {
    stories: storiesWithProgress,
    loading,
    error,
    refresh: loadData,
    progress
  };
}

/**
 * Hook per ottenere una storia specifica dalla lista
 * @param {string} storyIdOrSlug - ID o slug della storia
 * @returns {{
 *   story: import('../lib/stories/types').Story | null,
 *   played: boolean,
 *   loading: boolean
 * }}
 */
export function useStoryFromList(storyIdOrSlug) {
  const { stories, loading } = useStories();

  const found = stories.find(
    s => s.story.id === storyIdOrSlug || s.story.slug === storyIdOrSlug
  );

  return {
    story: found?.story || null,
    played: found?.played || false,
    loading
  };
}

export default useStories;
