import React, { useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LogoMark } from './Logo';
import { useWorkspace, CURRENT_AGENT } from '../state/workspace-context';

export const Sidebar = () => {
    const { conversations } = useWorkspace();

    /* Counts come from the live workspace, so assigning in one screen moves the
       numbers everywhere. */
    const { workspace, views } = useMemo(() => {
        const open = conversations.filter((c) => c.status === 'open');
        return {
            workspace: [
                { label: 'Inbox', path: '/example', count: open.length },
                { label: 'Queue', path: '/example/queue', count: open.filter((c) => !c.assignee).length },
                { label: 'Reports', path: '/example/analytics' },
                { label: 'Team', path: '/example/team' },
                { label: 'Settings', path: '/example/settings' },
            ],
            views: [
                { label: 'Assigned to me', count: open.filter((c) => c.assignee === CURRENT_AGENT).length },
                { label: 'Unassigned', count: open.filter((c) => !c.assignee).length },
                { label: 'Breached', count: open.filter((c) => c.state === 'breached').length },
                { label: 'Snoozed', count: conversations.filter((c) => c.status === 'snoozed').length },
            ],
        };
    }, [conversations]);

    return (
        <nav
            aria-label="Workspace"
            className="flex h-full w-[212px] shrink-0 flex-col border-r bg-ground px-4 py-5 rule"
        >
            <Link to="/" className="mb-8 flex items-center gap-2.5 px-1" aria-label="OmniSync home">
                <LogoMark size={22} className="text-accent-600" />
                <span className="font-heading text-[16px] font-semibold uppercase tracking-[0.18em] text-ink">
                    Omnisync
                </span>
            </Link>

            <p className="label mb-2 px-1">Workspace</p>
            <ul className="mb-8 space-y-0.5">
                {workspace.map((item) => (
                    <li key={item.label}>
                        <NavLink
                            to={item.path}
                            end={item.path === '/example'}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-2 py-1.5 text-[15px] transition-colors ${
                                    isActive
                                        ? 'bg-neutral-200 font-semibold text-ink'
                                        : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-ink'
                                }`
                            }
                        >
                            {item.label}
                            {item.count != null && (
                                <span className="font-mono text-[12px] tabular-nums text-neutral-600">
                                    {item.count}
                                </span>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>

            <p className="label mb-2 px-1">Views</p>
            <ul className="space-y-1">
                {views.map((view) => (
                    <li
                        key={view.label}
                        className="flex items-center justify-between px-2 text-[13px] text-neutral-600"
                    >
                        <span>{view.label}</span>
                        <span className="font-mono tabular-nums">{view.count}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto border-t pt-4 rule-soft">
                <p className="text-[13px] font-semibold text-ink">Alex Admin</p>
                <p className="text-[12px] text-neutral-600">Support lead · {CURRENT_AGENT}</p>
                <Link
                    to="/"
                    className="mt-3 inline-block text-[13px] text-accent-700 underline-offset-2 hover:underline"
                >
                    Exit demo
                </Link>
            </div>
        </nav>
    );
};
