import React, { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { cannedReplies } from '../content/conversations';
import { useWorkspace, CURRENT_AGENT } from '../state/workspace-context';
import type { FormEvent, ReactNode } from 'react';
import type { Message as ThreadMessage } from '../types';

const initials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

const Message = ({ message }: { message: ThreadMessage }) => {
    if (message.sender === 'rule') {
        return (
            <li className="flex gap-4">
                <span className="w-10 shrink-0 pt-0.5 text-right font-mono text-[12px] text-neutral-500">
                    {message.time}
                </span>
                {/* A rule firing is a product event, not an assistant: it says what
                    changed and why, and stays in the thread as a record. */}
                <div className="border-l-2 pl-3 rule">
                    <p className="label-ink">Rule fired · {message.rule}</p>
                    <p className="mt-1 text-[14px] text-neutral-700">{message.text}</p>
                </div>
            </li>
        );
    }

    const fromAgent = message.sender === 'agent';
    return (
        <li className="flex gap-4">
            <span className="w-10 shrink-0 pt-2 text-right font-mono text-[12px] text-neutral-500">{message.time}</span>
            <p
                className={`max-w-[560px] px-4 py-2.5 text-[15px] leading-relaxed ${
                    fromAgent ? 'ml-auto bg-accent-600 text-white' : 'border bg-white text-ink rule-soft'
                }`}
            >
                {message.text}
            </p>
        </li>
    );
};

const RecordBlock = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="border-b px-4 py-4 rule-soft">
        <h3 className="label mb-3">{title}</h3>
        {children}
    </section>
);

export const ChatWindow = () => {
    const { conversations, activeId, assign, snooze, resolve, reopen, sendReply } = useWorkspace();
    const [draft, setDraft] = useState('');
    const chat = conversations.find((c) => c.id === activeId);

    if (!chat) {
        return (
            <div className="flex flex-1 items-center justify-center text-neutral-600">
                Select a conversation to open it.
            </div>
        );
    }

    const send = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text) return;
        sendReply(chat.id, text);
        setDraft('');
    };

    return (
        <div className="flex h-full min-w-0 flex-1">
            {/* Thread */}
            <div className="flex min-w-0 flex-1 flex-col bg-ground">
                <header className="flex items-start justify-between gap-4 border-b px-6 py-4 rule">
                    <div className="flex items-center gap-3">
                        <span
                            className="flex h-9 w-9 items-center justify-center border font-mono text-[13px] text-neutral-700 rule"
                            aria-hidden="true"
                        >
                            {initials(chat.name)}
                        </span>
                        <div>
                            <h2 className="text-[20px] leading-tight">{chat.name}</h2>
                            <p className="text-[12px] text-neutral-600">
                                {chat.channel} Business · {chat.phone} · {chat.previousConversations} previous conversations
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`sla sla-${chat.state}`}>
                            <span>{chat.waiting}</span>
                            {chat.state === 'breached' && <span className="sla-state">SLA breached</span>}
                        </span>
                        {chat.status === 'resolved' ? (
                            <button
                                type="button"
                                onClick={() => { reopen(chat.id); toast('Conversation reopened'); }}
                                className="btn btn-secondary py-1.5"
                            >
                                Reopen
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        assign(chat.id, chat.assignee === CURRENT_AGENT ? null : CURRENT_AGENT);
                                        toast(chat.assignee === CURRENT_AGENT ? 'Unassigned' : 'Assigned to you');
                                    }}
                                    className="btn btn-secondary py-1.5"
                                >
                                    {chat.assignee === CURRENT_AGENT ? 'Unassign' : 'Assign to me'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { snooze(chat.id); toast(`${chat.name} snoozed`); }}
                                    className="btn btn-secondary py-1.5"
                                >
                                    Snooze
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { resolve(chat.id); toast(`${chat.name} resolved`); }}
                                    className="btn btn-secondary py-1.5"
                                >
                                    Resolve
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <p className="mb-5 flex items-center gap-3 text-center">
                        <span className="h-px flex-1 bg-[color-mix(in_srgb,#1d1f20_9%,transparent)]" aria-hidden="true" />
                        <span className="label">Today</span>
                        <span className="h-px flex-1 bg-[color-mix(in_srgb,#1d1f20_9%,transparent)]" aria-hidden="true" />
                    </p>

                    <ul className="space-y-4">
                        {chat.messages.map((message) => (
                            <Message key={message.id} message={message} />
                        ))}
                    </ul>
                </div>

                <form onSubmit={send} className="border-t px-6 py-4 rule">
                    <div className="mb-3 flex flex-wrap gap-2">
                        {cannedReplies.map((reply) => (
                            <button
                                key={reply.command}
                                type="button"
                                onClick={() => setDraft(`${reply.command} `)}
                                className="border px-2.5 py-1 font-mono text-[12px] text-neutral-700 transition-colors hover:bg-neutral-200 rule-soft"
                            >
                                {reply.command} — {reply.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <label htmlFor="composer" className="sr-only">
                            Reply to {chat.name}
                        </label>
                        <input
                            id="composer"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Write a reply — nothing sends until you press send"
                            className="input"
                        />
                        <button type="submit" className="btn btn-primary shrink-0">
                            Send
                            <Send className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Customer record */}
            <aside className="hidden w-[288px] shrink-0 overflow-y-auto border-l bg-ground xl:block rule" aria-label="Customer record">
                <RecordBlock title="Customer">
                    <p className="font-heading text-[18px] font-semibold text-ink">{chat.name}</p>
                    <p className="mt-1 text-[13px] text-neutral-600">
                        Customer since {chat.customer.since} · {chat.customer.orders} orders · {chat.customer.lifetime} lifetime
                    </p>
                    {chat.customer.tags.length > 0 && (
                        <p className="mt-3 flex flex-wrap gap-1.5">
                            {chat.customer.tags.map((tag) => (
                                <span key={tag} className="tag tag-accent">
                                    {tag}
                                </span>
                            ))}
                        </p>
                    )}
                </RecordBlock>

                {chat.order && (
                    <RecordBlock title="Order in question">
                        <div className="border p-3 rule-soft">
                            <p className="flex items-baseline justify-between">
                                <span className="font-mono text-[14px] text-ink">{chat.order.ref}</span>
                                <span className="text-[12px] text-neutral-600">{chat.order.placed}</span>
                            </p>
                            <p className="mt-2 text-[13px] text-neutral-700">{chat.order.items}</p>
                            <p className="mt-1 text-[13px] text-neutral-600">{chat.order.courier}</p>
                            <p className="label-ink mt-3">{chat.order.status}</p>
                        </div>
                    </RecordBlock>
                )}

                <RecordBlock title="SLA policy">
                    <dl className="space-y-2 text-[13px]">
                        {[
                            ['Policy', chat.sla.policy],
                            ['First response', chat.sla.firstResponse],
                            ['Resolution target', chat.sla.resolution],
                            ['Business hours', chat.sla.hours],
                        ].map(([term, value]) => (
                            <div key={term} className="flex justify-between gap-3">
                                <dt className="text-neutral-600">{term}</dt>
                                <dd className="text-right text-ink">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </RecordBlock>

                {chat.recent.length > 0 && (
                    <RecordBlock title="Recent conversations">
                        <ul className="space-y-3">
                            {chat.recent.map((item) => (
                                <li key={item.subject}>
                                    <p className="text-[14px] text-ink">{item.subject}</p>
                                    <p className="text-[12px] text-neutral-600">{item.meta}</p>
                                </li>
                            ))}
                        </ul>
                    </RecordBlock>
                )}
            </aside>
        </div>
    );
};
