import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { blogPosts } from '../content/site';

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const BlogPage = () => (
    <PageShell
        eyebrow="Blog"
        title="Notes from the queue"
        intro="What we learn running support for ourselves and for the teams we onboard — playbooks, research and the occasional engineering post-mortem."
        seoTitle="Blog"
        seoDescription="Playbooks, research and engineering notes on response time, SLA design and running support on WhatsApp and Instagram."
    >
        <ul className="space-y-8">
            {blogPosts.map((post) => (
                <li key={post.slug}>
                    <article className="group border-b pb-6 rule-soft">
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-[12px] text-neutral-600">
                            <span className="tag tag-accent">
                                {post.tag}
                            </span>
                            <time dateTime={post.date}>{formatDate(post.date)}</time>
                            <span aria-hidden="true">·</span>
                            <span>{post.readingTime}</span>
                        </div>
                        <h2 className="text-[24px]">{post.title}</h2>
                        <p className="mt-3 max-w-[640px] leading-relaxed text-neutral-700">{post.excerpt}</p>
                        <p className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-accent-700">
                            Full post coming soon
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </p>
                    </article>
                </li>
            ))}
        </ul>

        <p className="mt-10 text-[14px] text-neutral-600">
            Want these in your inbox? Write to{' '}
            <a href="mailto:hello@omnisync.app" className="text-accent-700 underline-offset-2 hover:underline">
                hello@omnisync.app
            </a>{' '}
            and we will add you to the monthly note.
        </p>
    </PageShell>
);
