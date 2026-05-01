import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SupportedGame } from '../types';

export const useSupportedGames = () => {
  const [games, setGames] = useState<SupportedGame[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('supported_games')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching supported games:', error);
      // Fallback if table doesn't exist yet
      if (error.code === '42P01') {
        setGames([
          { id: '1', name: 'Blox Fruits' },
          { id: '2', name: 'Pet Simulator 99' },
          { id: '3', name: 'Blade Ball' },
          { id: '4', name: 'Da Hood' },
          { id: '5', name: 'Arsenal' },
        ]);
      }
    } else {
      setGames(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return {
    games,
    setGames,
    loading,
    refreshGames: fetchGames
  };
};
