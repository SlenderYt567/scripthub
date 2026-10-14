import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Script } from '../types';
import { mapScript } from '../utils/mapScript';

const PAGE_SIZE = 24;
const SCRIPT_COLUMNS = 'id,title,game_name,description,image_url,author,author_id,views,raw_link,shortener_link,verified,is_official,key_system,created_at,last_verified_at,tasks(*)';

export type ScriptSort = 'recent' | 'popular' | 'official';
export type AccessFilter = 'all' | 'free' | 'keyed';

export function useScripts(adminMode = false) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [adminScripts, setAdminScripts] = useState<Script[]>([]);
  const [featuredScripts, setFeaturedScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<ScriptSort>('recent');
  const requestId = useRef(0);

  const fetchPage = useCallback(async (offset = 0) => {
    const id = ++requestId.current;
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      let query = supabase.from('scripts')
        .select(SCRIPT_COLUMNS, { count: 'exact' });

      const search = searchQuery.trim();
      if (search) query = query.textSearch('search_vector', search, { type: 'plain', config: 'simple' });
      if (gameFilter.trim()) query = query.ilike('game_name', `%${gameFilter.trim()}%`);
      if (accessFilter !== 'all') query = query.eq('key_system', accessFilter === 'keyed');
      if (verifiedOnly) query = query.eq('verified', true);

      if (sortBy === 'popular') query = query.order('views', { ascending: false });
      else if (sortBy === 'official') query = query.order('is_official', { ascending: false }).order('created_at', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, count, error: fetchError } = await query
        .order('id', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      if (fetchError) throw fetchError;
      if (id !== requestId.current) return;
      const mapped = (data || []).map(mapScript);
      setScripts(previous => offset === 0 ? mapped : [...previous, ...mapped]);
      setTotalCount(count ?? 0);
    } catch (cause) {
      if (id !== requestId.current) return;
      setError(cause instanceof Error ? cause : new Error('Unable to load scripts'));
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [searchQuery, gameFilter, accessFilter, verifiedOnly, sortBy]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchPage(0); }, 250);
    return () => {
      window.clearTimeout(timer);
      requestId.current += 1;
    };
  }, [fetchPage]);

  const refreshFeatured = useCallback(async () => {
    const { data, error: fetchError } = await supabase.from('scripts')
      .select(SCRIPT_COLUMNS)
      .order('is_official', { ascending: false })
      .order('views', { ascending: false })
      .limit(3);
    if (!fetchError) setFeaturedScripts((data || []).map(mapScript));
  }, []);

  const refreshAdminScripts = useCallback(async () => {
    const { data, error: fetchError } = await supabase.from('scripts')
      .select(SCRIPT_COLUMNS)
      .order('created_at', { ascending: false });
    if (!fetchError) setAdminScripts((data || []).map(mapScript));
  }, []);

  useEffect(() => { void refreshFeatured(); }, [refreshFeatured]);
  useEffect(() => { if (adminMode) void refreshAdminScripts(); }, [adminMode, refreshAdminScripts]);

  const refreshScripts = async () => {
    await Promise.all([fetchPage(0), refreshFeatured(), ...(adminMode ? [refreshAdminScripts()] : [])]);
  };

  return {
    scripts, setScripts,
    adminScripts, setAdminScripts,
    loading, loadingMore, error,
    searchQuery, setSearchQuery,
    gameFilter, setGameFilter,
    accessFilter, setAccessFilter,
    verifiedOnly, setVerifiedOnly,
    sortBy, setSortBy,
    totalCount, hasMore: scripts.length < totalCount,
    featuredScripts,
    loadMore: () => fetchPage(scripts.length),
    refreshScripts,
    refreshAdminScripts,
  };
}

export async function fetchScriptById(id: string): Promise<Script | null> {
  const { data, error } = await supabase.from('scripts')
    .select(SCRIPT_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapScript(data) : null;
}
