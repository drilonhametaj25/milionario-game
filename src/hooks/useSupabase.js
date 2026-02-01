import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useSupabase() {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Monitor connection status via realtime
    const channel = supabase.channel('system')
      .on('system', { event: '*' }, (payload) => {
        if (payload.event === 'disconnect') {
          setIsConnected(false);
          setConnectionError('Disconnesso dal server');
        } else if (payload.event === 'connect') {
          setIsConnected(true);
          setConnectionError(null);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionError(null);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
          setConnectionError('Errore di connessione');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const { error } = await supabase.from('rooms').select('id').limit(1);
      if (error) throw error;
      setIsConnected(true);
      setConnectionError(null);
      return true;
    } catch (err) {
      setIsConnected(false);
      setConnectionError('Impossibile connettersi al server');
      return false;
    }
  }, []);

  return {
    supabase,
    isConnected,
    connectionError,
    checkConnection,
  };
}
