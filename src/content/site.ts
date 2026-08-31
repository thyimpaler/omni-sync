export const LAST_UPDATED = 'March 2026';

export const stats = [
    { value: '8 min', label: 'Median first response after switching' },
    { value: '96%', label: 'Average SLA compliance at 90 days' },
    { value: '3x', label: 'More conversations handled per agent' },
    { value: '< 2 wks', label: 'Typical payback period' },
];

export const blogPosts = [
    {
        slug: 'sla-is-a-culture-problem',
        title: 'An SLA is a culture problem before it is a software problem',
        excerpt:
            'Every team we onboard already knows response time matters. What changes with a timer on the screen is that the whole room can see the same number at the same time.',
        date: '2026-03-04',
        readingTime: '6 min read',
        tag: 'Playbooks',
    },
    {
        slug: 'whatsapp-cloud-api-notes',
        title: 'Field notes: what the WhatsApp Cloud API does not tell you',
        excerpt:
            'Template approvals, the 24-hour service window, and the three webhook edge cases that quietly drop messages in production.',
        date: '2026-02-18',
        readingTime: '9 min read',
        tag: 'Engineering',
    },
    {
        slug: 'triage-instagram-dms',
        title: 'How to triage 200 Instagram DMs a day without hiring',
        excerpt:
            'A practical routing model: intent tags first, VIP rules second, everything else in a single queue sorted by how long someone has been waiting.',
        date: '2026-01-29',
        readingTime: '5 min read',
        tag: 'Playbooks',
    },
    {
        slug: 'response-time-revenue',
        title: 'We measured what a slow reply actually costs',
        excerpt:
            'Across 1.2M conversations, the drop-off between a 10-minute and a 60-minute first response is steeper than almost every team assumes.',
        date: '2026-01-08',
        readingTime: '7 min read',
        tag: 'Research',
    },
];

export const jobs = [
    {
        title: 'Senior Full-Stack Engineer',
        team: 'Product Engineering',
        location: 'Remote (UTC-3 to UTC+3)',
        type: 'Full-time',
        blurb: 'Own the inbox surface end to end — React on the front, Node and Postgres behind it, real-time everywhere.',
    },
    {
        title: 'Platform Engineer, Messaging',
        team: 'Infrastructure',
        location: 'Remote (Europe)',
        type: 'Full-time',
        blurb: 'Keep the Meta webhook pipeline boringly reliable at millions of events a day.',
    },
    {
        title: 'Product Designer',
        team: 'Design',
        location: 'Remote (Europe)',
        type: 'Full-time',
        blurb: 'Design for people who look at one screen for eight hours — density, clarity and calm over decoration.',
    },
    {
        title: 'Customer Success Lead',
        team: 'Go-to-market',
        location: 'Remote (Americas)',
        type: 'Full-time',
        blurb: 'Run onboarding for teams switching from shared inboxes, and turn what you learn into product.',
    },
];

export const values = [
    {
        title: 'The queue is the product',
        body: 'Every feature has to earn its place by making the next reply faster. If it does not move that number, it does not ship.',
    },
    {
        title: 'Boring where it counts',
        body: 'Messaging infrastructure should be unremarkable. We spend our novelty budget on the interface, not on the delivery path.',
    },
    {
        title: 'Customer data is not ours',
        body: 'We store the minimum, encrypt it, keep workspaces isolated, and never train models on customer conversations.',
    },
];

export const aboutSections = [
    {
        heading: 'Why we built it',
        paragraphs: [
            'OmniSync started in a shared Gmail inbox. A small fashion retailer was forwarding screenshots of Instagram DMs to a group address, then answering them from WhatsApp Web in a different tab. Roughly one in five questions never got a reply — not because anyone was careless, but because nothing in the setup made "this person has been waiting 40 minutes" visible to anyone.',
            'We built the first version of the SLA timer for that team in a weekend. Within a month their unanswered rate was under two percent. The whole product is an elaboration of that one idea: put wait time on the screen, sort by it, and make it uncomfortable to ignore.',
        ],
    },
    {
        heading: 'How we work',
        paragraphs: [
            'We are a small, remote, deliberately unhurried team. We ship weekly, run our own support through OmniSync, and answer every trial signup by hand for the first two weeks. Most of the roadmap comes from watching those conversations rather than from a planning offsite.',
        ],
    },
];

export const privacySections = [
    {
        heading: 'What we collect',
        paragraphs: [
            'Account data you give us — name, work email, company, and billing details handled by our payment processor. We never store full card numbers.',
            'Conversation data your connected channels send us: message contents, sender identifiers, timestamps and delivery status. This is your data; we process it to run the service for you.',
            'Product telemetry: pages viewed, features used, and error traces. This is tied to a workspace, not to your customers.',
        ],
    },
    {
        heading: 'How we use it',
        bullets: [
            'To deliver the inbox, route conversations and calculate SLA timers.',
            'To provide support when you ask us for it.',
            'To detect abuse, fraud and outages.',
            'To send service notices, and — only if you opt in — product news.',
        ],
        paragraphs: [
            'We do not sell personal data, and we do not use customer conversation content to train machine learning models.',
        ],
    },
    {
        heading: 'Retention and deletion',
        paragraphs: [
            'Conversation data is retained for as long as your plan specifies, and deleted within 30 days of a workspace being closed. You can export everything you have stored with us at any time from Settings, and you can request earlier deletion by writing to privacy@omnisync.app.',
        ],
    },
    {
        heading: 'Sub-processors',
        bullets: [
            'Meta Platforms — message delivery for WhatsApp and Instagram.',
            'Supabase — application database and authentication.',
            'A payment processor for subscriptions and invoices.',
            'An email provider for transactional messages.',
        ],
    },
    {
        heading: 'Your rights',
        paragraphs: [
            'Depending on where you live you may have the right to access, correct, export or delete your personal data, and to object to certain processing. Write to privacy@omnisync.app and we will respond within 30 days.',
        ],
    },
];

export const termsSections = [
    {
        heading: 'The agreement',
        paragraphs: [
            'These terms cover your use of OmniSync. By creating a workspace you accept them on behalf of yourself and the organisation you represent.',
        ],
    },
    {
        heading: 'Your account',
        bullets: [
            'You are responsible for what happens under your credentials — use a strong password and turn on two-factor authentication.',
            'You must have the right to connect the channels you connect, and to process the customer messages that flow through them.',
            'One person per seat. Sharing a login between agents is not permitted.',
        ],
    },
    {
        heading: 'Acceptable use',
        paragraphs: [
            'Do not use OmniSync to send unsolicited bulk messages, to harass anyone, to break Meta platform policy, or to store data you are not allowed to store. We may suspend a workspace that puts our messaging access at risk, and we will tell you why.',
        ],
    },
    {
        heading: 'Billing',
        bullets: [
            'Trials run 14 days and require no card. Nothing is charged unless you choose a plan.',
            'Paid plans renew monthly or annually until cancelled; cancelling stops the next renewal and keeps access until the period ends.',
            'Fees are exclusive of tax. Annual plans are refundable pro rata within the first 30 days.',
        ],
    },
    {
        heading: 'Availability and liability',
        paragraphs: [
            'We target 99.9% monthly uptime and publish incidents openly. The service is otherwise provided as-is: to the extent the law allows, our aggregate liability is capped at the fees you paid in the twelve months before a claim, and neither side is liable for indirect or consequential loss.',
            'Either side may end the agreement at any time. On termination you keep 30 days to export your data.',
        ],
    },
];

export const cookieSections = [
    {
        heading: 'What we set',
        bullets: [
            'Strictly necessary — a session cookie that keeps you signed in, and a CSRF token. These cannot be turned off without breaking sign-in.',
            'Preferences — the workspace you last opened and your inbox layout, so the app looks the same when you return.',
            'Analytics — aggregate, first-party product usage. Off until you accept it.',
        ],
    },
    {
        heading: 'What we do not set',
        paragraphs: [
            'No advertising cookies, no cross-site tracking pixels, and no third-party marketing tags on the application. The marketing site runs the same way.',
        ],
    },
    {
        heading: 'Managing cookies',
        paragraphs: [
            'You can clear or block cookies in your browser settings at any time; blocking the strictly necessary ones will sign you out. Questions go to privacy@omnisync.app.',
        ],
    },
];
