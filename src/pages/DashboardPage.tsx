import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { AnalyticsPage } from './AnalyticsPage';
import { QueuePage } from './QueuePage';
import { SettingsPage } from './SettingsPage';
import { TeamPage } from './TeamPage';
import { WorkspaceProvider } from '../state/WorkspaceProvider';

/* flex-1, not w-full: as a flex sibling of the fixed-width sidebar, w-full
   resolved to the whole container width and pushed the customer record off the
   edge, where it covered the thread's action buttons. */
const InboxView = () => (
    <div className="flex h-full min-w-[880px] flex-1">
        <ConversationList />
        <ChatWindow />
    </div>
);

/* Data fetching only exists inside the app, so the query client lives here
   rather than at the root — marketing pages never load react-query. */
const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export const DashboardPage = () => (
    <QueryClientProvider client={queryClient}>
        <WorkspaceProvider>
            <div className="flex h-screen w-full overflow-x-auto bg-ground text-ink">
                <Sidebar />
                <Routes>
                    <Route index element={<InboxView />} />
                    <Route path="queue" element={<QueuePage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="team" element={<TeamPage />} />
                </Routes>
            </div>
        </WorkspaceProvider>
    </QueryClientProvider>
);
