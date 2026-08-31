import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthValue {
    user: User | null;
    loading: boolean;
    signUp: (data: { email: string; password: string }) => Promise<unknown>;
    signIn: (data: { email: string; password: string }) => Promise<unknown>;
    signOut: () => Promise<unknown>;
}

export type { Session };

export const AuthContext = createContext<AuthValue | null>(null);

export const useAuth = (): AuthValue | null => useContext(AuthContext);
