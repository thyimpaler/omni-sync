import React from 'react';
import { Mail, LifeBuoy, Building2, Clock } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { ContactForm } from '../components/ContactForm';

const channels = [
    {
        icon: LifeBuoy,
        title: 'Support',
        body: 'Trial or paying customer with a question about the product.',
        action: { label: 'support@omnisync.app', href: 'mailto:support@omnisync.app' },
        note: 'Replies within 2 hours on Corporate and above.',
    },
    {
        icon: Building2,
        title: 'Sales',
        body: 'Volume pricing, security review, or a walkthrough for your team.',
        action: { label: 'sales@omnisync.app', href: 'mailto:sales@omnisync.app' },
        note: 'One business day, usually much less.',
    },
    {
        icon: Mail,
        title: 'Everything else',
        body: 'Press, partnerships, or a bug you found in the marketing site.',
        action: { label: 'hello@omnisync.app', href: 'mailto:hello@omnisync.app' },
        note: 'Read by a human, not a bot.',
    },
];

export const ContactPage = () => (
    <PageShell
        eyebrow="Contact"
        title="Talk to a person."
        intro="No ticket portal and no chatbot maze. Pick the route that fits, or send the form and it lands in the same inbox the product is built for."
        seoTitle="Contact"
        seoDescription="Reach OmniSync support, sales or the team. Real people, real response times — we run our own support through the product."
        width="max-w-[1040px]"
    >
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-4">
                {channels.map((channel) => (
                    <div key={channel.title} className="border-b pb-6 rule-soft">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center bg-neutral-200">
                            <channel.icon className="h-4 w-4 text-accent-700" aria-hidden="true" />
                        </div>
                        <h2 className="text-[20px]">{channel.title}</h2>
                        <p className="mt-1 text-[14px] leading-relaxed text-neutral-700">{channel.body}</p>
                        <a
                            href={channel.action.href}
                            className="mt-3 inline-block font-medium text-accent-700 underline-offset-2 hover:underline"
                        >
                            {channel.action.label}
                        </a>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-neutral-600">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {channel.note}
                        </p>
                    </div>
                ))}
            </div>

            <div className="panel h-fit p-8">
                <h2 className="mb-2 text-[24px]">Send us a note</h2>
                <p className="mb-6 text-neutral-700">Tell us what you are trying to solve and we will reply with something useful, not a brochure.</p>
                <ContactForm
                    requireMessage
                    messageLabel="What can we help with?"
                    messagePlaceholder="Channels you support, team size, what is breaking today…"
                    submitLabel="Send message"
                    successTitle="Thanks — it landed"
                    successMessage="We reply to everything within one business day."
                />
            </div>
        </div>
    </PageShell>
);
