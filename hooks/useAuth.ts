import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAdmin = async (user: any) => {
        if (!user?.email) {
            setIsAdmin(false);
            return;
        }

        const { data, error } = await supabase.rpc('is_admin');
        if (!error) {
            setIsAdmin(data === true);
            return;
        }

        const { data: adminUser, error: fallbackError } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();

        setIsAdmin(!fallbackError && !!adminUser);
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            checkAdmin(session?.user).finally(() => setLoading(false));
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            checkAdmin(session?.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, isAdmin, loading };
}
