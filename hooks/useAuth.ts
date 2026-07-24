import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAdmin = async (userId: string | undefined) => {
        if (!userId) {
            setIsAdmin(false);
            return;
        }
        const { data, error } = await supabase.rpc('is_admin');
        setIsAdmin(!error && data === true);
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            checkAdmin(session?.user?.id).finally(() => setLoading(false));
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            checkAdmin(session?.user?.id);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, isAdmin, loading };
}
