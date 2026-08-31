/**
 * Demo data for the workspace screens, taken from the 1c–1f artboards in
 * design/industry-tokens.md. Kept out of the components so the screens stay
 * about layout and the numbers stay easy to change.
 */

import type { MissedAction, Policy } from '../types';

/* — 1c Queue & assignment — */

export const queueContext = { agentsOnline: 5, complianceToday: '96%' };

export const agentLoad = [
    { name: 'Alex A.', open: 7 },
    { name: 'Priya O.', open: 6 },
    { name: 'Marcus W.', open: 5 },
    { name: 'Lena O.', open: 4 },
];

/* — 1d Reports — */

export const reportRanges = {
    '7 days': {
        caption: '25–31 August · both channels · compared with the week before',
        metrics: [
            { label: 'Median first response', value: '3m 12s', note: 'Down from 3m 58s · target 5m' },
            { label: 'SLA compliance', value: '95.8%', note: 'Up 1.1 pts · 11 breaches of 262' },
            { label: 'Resolved', value: '262', note: 'Up 4% · 37 per day average' },
            { label: 'Reopened', value: '1.9%', note: 'Down 0.2 pts · 5 conversations' },
        ],
    },
    '30 days': {
        caption: '1–31 August · both channels · compared with July',
        metrics: [
            { label: 'Median first response', value: '3m 41s', note: 'Down from 6m 02s · target 5m' },
            { label: 'SLA compliance', value: '94.2%', note: 'Up 2.8 pts · 61 breaches of 1,048' },
            { label: 'Resolved', value: '1,048', note: 'Up 11% · 34 per day average' },
            { label: 'Reopened', value: '2.1%', note: 'Up 0.4 pts · 22 conversations' },
        ],
    },
    Quarter: {
        caption: '1 June – 31 August · both channels · compared with the previous quarter',
        metrics: [
            { label: 'Median first response', value: '4m 48s', note: 'Down from 9m 14s · target 5m' },
            { label: 'SLA compliance', value: '91.6%', note: 'Up 6.2 pts · 254 breaches of 3,021' },
            { label: 'Resolved', value: '3,021', note: 'Up 28% · 33 per day average' },
            { label: 'Reopened', value: '2.4%', note: 'Down 0.1 pts · 72 conversations' },
        ],
    },
};

/* height is the bar's share of the tallest hour; state drives the fill */
export const hourly = [
    { hour: '08', height: 24, state: 'comfortable' },
    { hour: '09', height: 34, state: 'comfortable' },
    { hour: '10', height: 41, state: 'comfortable' },
    { hour: '11', height: 48, state: 'comfortable' },
    { hour: '12', height: 85, state: 'past' },
    { hour: '13', height: 100, state: 'past' },
    { hour: '14', height: 63, state: 'near' },
    { hour: '15', height: 38, state: 'comfortable' },
    { hour: '16', height: 32, state: 'comfortable' },
    { hour: '17', height: 36, state: 'comfortable' },
    { hour: '18', height: 45, state: 'comfortable' },
    { hour: '19', height: 29, state: 'comfortable' },
];

export const byChannel = [
    { channel: 'WhatsApp', volume: '691', median: '2m 58s' },
    { channel: 'Instagram', volume: '357', median: '5m 14s' },
];

export const agentPerformance = [
    { name: 'Priya Okonkwo', handled: 312, compliance: 98 },
    { name: 'Alex Adeyemi', handled: 288, compliance: 95 },
    { name: 'Marcus Webb', handled: 254, compliance: 91 },
    { name: 'Lena Ortiz', handled: 194, compliance: 88 },
];

export const topSubjects = [
    { subject: 'Delivery status', count: 284 },
    { subject: 'Returns and refunds', count: 211 },
    { subject: 'Sizing and fit', count: 168 },
    { subject: 'Stock and restock', count: 143 },
    { subject: 'Wholesale enquiries', count: 67 },
];

/* — 1f Settings — */

export const settingsTabs = ['Targets', 'Business hours', 'Saved replies', 'Notifications', 'Team'];

export const policies: Policy[] = [
    {
        n: '01',
        name: 'VIP customers',
        condition: 'Tagged VIP, or lifetime spend over £1,000',
        target: '5 min',
        resolution: '4 hours',
        escalates: 'Support lead',
        applies: 'both channels',
    },
    {
        n: '02',
        name: 'Delivery problems',
        condition: 'Message contains "late", "not arrived", "where is", "tracking"',
        target: '10 min',
        resolution: '8 hours',
        escalates: 'Alex A.',
        applies: 'both channels',
    },
    {
        n: '03',
        name: 'Everything else',
        condition: 'Default policy, cannot be deleted',
        target: '15 min',
        resolution: null,
        escalates: null,
        applies: null,
    },
];

export const missedActions: MissedAction[] = [
    {
        title: 'Move to the top of the queue',
        note: 'Every agent sees it first, regardless of assignment',
        on: true,
    },
    {
        title: 'Notify the escalation contact',
        note: 'Email and in-app, once per conversation',
        on: true,
    },
    {
        title: 'Send a holding message to the customer',
        note: 'Off — customers on this workspace prefer silence to autoreplies',
        on: false,
    },
];

export const policyEffect = {
    headline: "Applied to August's traffic, these targets would have been met on 94.2% of conversations.",
    rows: [
        { name: 'VIP customers', volume: 142, compliance: 91 },
        { name: 'Delivery problems', volume: 284, compliance: 93 },
        { name: 'Everything else', volume: 622, compliance: 96 },
    ],
};

export const recentChanges = [
    { change: 'VIP target 10 min → 5 min', who: 'Alex A. · 14 Aug' },
    { change: 'Added "Delivery problems"', who: 'Alex A. · 2 Aug' },
    { change: 'Holding message turned off', who: 'Priya O. · 28 Jul' },
];

/* — 1e Onboarding — */

export const onboardingSteps = [
    { n: '✓', title: 'Workspace', note: 'Northfield Supply Co.', done: true },
    { n: '2', title: 'Connect channels', note: '1 of 2 connected', current: true },
    { n: '3', title: 'Response targets' },
    { n: '4', title: 'Invite your team' },
];

export const onboardingChannels = [
    {
        name: 'WhatsApp Business',
        note: '+44 7700 900412 · Northfield Supply · connected 2 minutes ago',
        status: 'Connected',
        action: 'Manage',
    },
    {
        name: 'Instagram Direct',
        note: 'Needs a Professional account and a linked Facebook Page',
        status: null,
        action: 'Connect',
        primary: true,
    },
    {
        name: 'Facebook Messenger',
        note: 'Available on Growth and above',
        status: null,
        action: 'Later',
        muted: true,
    },
];
