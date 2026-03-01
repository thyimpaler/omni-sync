import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

// Fetch all conversations API
const fetchConversations = async () => {
    try {
        const res = await fetch(`${API_BASE}/conversations`);
        return await res.json();
    } catch (e) {
        return [
            { id: 1, customer: 'John Doe', status: 'open', sla_status: 'green', last_message: 'Hi there' },
            { id: 2, customer: 'Jane Smith', status: 'open', sla_status: 'yellow', last_message: 'Need help with order' },
            { id: 3, customer: 'Bob Ross', status: 'open', sla_status: 'red', last_message: 'Where is my painting?' },
        ];
    }
}

export const useConversations = () => {
    const queryClient = useQueryClient();

    // Setup Real-time subscription via Supabase
    useEffect(() => {
        const channel = supabase.channel('table-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return useQuery({
        queryKey: ['conversations'],
        queryFn: fetchConversations,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};
