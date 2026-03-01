import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAdmin = async (email: string | undefined) => {
        if (!email) {
            setIsAdmin(false);
            return;
        }
        const { data } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        setIsAdmin(!!data);
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            checkAdmin(session?.user?.email).finally(() => setLoading(false));
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            checkAdmin(session?.user?.email);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, isAdmin, loading };
}
