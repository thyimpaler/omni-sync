import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { env } from '../lib/env';

const FALLBACK = [
    { id: 1, customer: 'John Doe', status: 'open', sla_status: 'green', last_message: 'Hi there' },
    { id: 2, customer: 'Jane Smith', status: 'open', sla_status: 'yellow', last_message: 'Need help with order' },
    { id: 3, customer: 'Bob Ross', status: 'open', sla_status: 'red', last_message: 'Where is my painting?' },
];

const fetchConversations = async () => {
    try {
        const res = await fetch(`${env.apiBase}/conversations`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return await res.json();
    } catch {
        // No API running yet — fall back to sample data so the UI still works.
        return FALLBACK;
    }
};

export const useConversations = () => {
    const queryClient = useQueryClient();

    // Refetch whenever the conversations table changes underneath us.
    useEffect(() => {
        let cleanup = () => {};
        getSupabase().then((supabase) => {
            const channel = supabase
                .channel('table-db-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                })
                .subscribe();
            cleanup = () => supabase.removeChannel(channel);
        });
        return () => cleanup();
    }, [queryClient]);

    return useQuery({
        queryKey: ['conversations'],
        queryFn: fetchConversations,
        staleTime: 1000 * 60 * 5,
    });
};
