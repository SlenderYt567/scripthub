import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Executor } from '../types';

export function useExecutors() {
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExecutors = async () => {
        setLoading(true);
        try {
            const { data: execData } = await supabase
                .from('executors')
                .select('*')
                .order('created_at', { ascending: false });

            if (execData) {
                const mappedExecutors: Executor[] = execData.map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    description: e.description,
                    imageUrl: e.image_url,
                    downloadUrl: e.download_url,
                    status: e.status,
                    platform: e.platform
                }));
                setExecutors(mappedExecutors);
            }
        } catch (err) {
            console.error('Error loading executors:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExecutors();
    }, []);

    return { executors, setExecutors, loading, refreshExecutors: fetchExecutors };
}
