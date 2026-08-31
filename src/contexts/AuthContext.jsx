import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe = () => {};
        let cancelled = false;

        // Restore an existing session, then follow any auth change from there.
        getSupabase().then(async (supabase) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (cancelled) return;
            setUser(session?.user ?? null);
            setLoading(false);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
                setUser(next?.user ?? null);
            });
            unsubscribe = () => subscription.unsubscribe();
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        signUp: async (data) => (await getSupabase()).auth.signUp(data),
        signIn: async (data) => (await getSupabase()).auth.signInWithPassword(data),
        signOut: async () => (await getSupabase()).auth.signOut(),
    };

    // The site must never wait on an auth round-trip to paint — consumers that
    // care read `loading` from context instead.
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
