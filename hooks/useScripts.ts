import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Script } from '../types';

export function useScripts() {
    const [scripts, setScripts] = useState<Script[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchScripts = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: scriptsData, error: fetchError } = await supabase
                .from('scripts')
                .select(`*, tasks (*)`)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            if (scriptsData) {
                const mappedScripts: Script[] = scriptsData.map((s: any) => ({
                    id: s.id,
                    title: s.title,
                    gameName: s.game_name,
                    description: s.description,
                    imageUrl: s.image_url,
                    author: s.author,
                    views: s.views,
                    rawLink: s.raw_link,
                    shortenerLink: s.shortener_link,
                    verified: s.verified,
                    isOfficial: s.is_official,
                    keySystem: s.key_system || false,
                    createdAt: new Date(s.created_at).getTime(),
                    tasks: s.tasks || []
                }));
                setScripts(mappedScripts);
            }
        } catch (err) {
            console.error('Error loading scripts:', err);
            setError(err instanceof Error ? err : new Error('Unknown error loading scripts'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScripts();
    }, []);

    const filteredScripts = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return scripts.filter(script =>
            script.title.toLowerCase().includes(q) ||
            script.gameName.toLowerCase().includes(q) ||
            script.author.toLowerCase().includes(q)
        ).sort((a, b) => {
            if (a.isOfficial && !b.isOfficial) return -1;
            if (!a.isOfficial && b.isOfficial) return 1;
            return 0;
        });
    }, [scripts, searchQuery]);

    const trendingScripts = useMemo(() => {
        return [...scripts].sort((a, b) => b.views - a.views).slice(0, 4);
    }, [scripts]);

    // Use views and interaction as a proxy for "Featured", mostly prioritizing official
    const featuredScripts = useMemo(() => {
        return [...scripts].sort((a, b) => {
            const scoreA = (a.isOfficial ? 1000 : 0) + a.views;
            const scoreB = (b.isOfficial ? 1000 : 0) + b.views;
            return scoreB - scoreA;
        }).slice(0, 6);
    }, [scripts]);

    return {
        scripts,
        setScripts,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        filteredScripts,
        trendingScripts,
        featuredScripts,
        refreshScripts: fetchScripts
    };
}
