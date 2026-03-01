import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { AnalyticsPage } from './AnalyticsPage';
import { SettingsPage } from './SettingsPage';
import { TeamPage } from './TeamPage';
import { initialChats } from '../components/initialChats';

const InboxView = () => {
    const [chats, setChats] = useState(initialChats);
    const [activeChatId, setActiveChatId] = useState(initialChats[0].id);
    return (
        <div className="flex w-full h-full">
            <ConversationList chats={chats} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
            <ChatWindow chats={chats} setChats={setChats} activeChatId={activeChatId} />
        </div>
    );
};

export const DashboardPage = () => {
    return (
        <div className="h-screen w-full bg-slate-950 flex overflow-hidden font-jakarta selection:bg-indigo-500/30 selection:text-white relative">
            <Sidebar />
            <Routes>
                <Route index element={<InboxView />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="team" element={<TeamPage />} />
            </Routes>
        </div>
    );
};
