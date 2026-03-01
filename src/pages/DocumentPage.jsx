import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const DocumentPage = ({ title }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [title]);

    const content = `# OmniSync - Unified Social Media Inbox Product Overview

## What is OmniSync?
OmniSync is a revolutionary customer service platform that consolidates WhatsApp and Instagram direct messages into a single, intelligent inbox. It eliminates the chaos of juggling multiple tabs and ensures no customer is ever left waiting too long.

## The Problem We Solve
Small and medium businesses lose customers daily because:
- Support teams manually switch between WhatsApp Web, Instagram DMs, and other platforms
- Urgent messages get buried in the noise
- There's no visibility into which customers have been waiting longest
- Response times suffer, leading to poor customer satisfaction
- Compliance and audit trails are messy

## The "No Customer Left Behind" Philosophy
OmniSync's core innovation is our intelligent SLA (Service Level Agreement) monitoring engine. Every conversation is automatically prioritized based on wait time:

🟢 GREEN (Healthy): Customer has been waiting less than 15 minutes
🟡 YELLOW (Warning): Customer has been waiting 15-30 minutes  
🔴 RED (Critical): Customer has been waiting over 30 minutes - URGENT!

Critical conversations automatically jump to the top of your inbox, ensuring your team always responds to the most urgent customers first.

## Key Features

### 1. Unified Dashboard
Three-pane glassmorphic interface:
- LEFT: Company navigation and team status
- MIDDLE: Prioritized conversation list with real-time SLA indicators
- RIGHT: Full conversation history with quick-reply tools

### 2. Real-Time SLA Monitoring
- Color-coded dots (green/yellow/red) show wait time at a glance
- Urgent conversations pulse and glow to catch attention
- Automatic re-sorting as conversations age
- Customizable thresholds per company

### 3. Smart Filtering & Search
- Filter by intent: Refund, Order Status, Sizing Questions, VIP Customers
- Search across customer names and message content
- Status tabs: Open, Resolved, Archived
- Assignment filters: See only your conversations or unassigned ones

### 4. Team Collaboration
- Assign conversations to specific agents
- See who's online and handling what
- Internal notes and tags
- Performance analytics per agent

### 5. Compliance & Reporting
- One-click Excel export of resolved conversations
- Color-coded SLA compliance reports
- Complete audit trail with timestamps
- Response time and resolution time metrics
- Perfect for quality assurance and legal compliance

### 6. Analytics Dashboard
Real-time metrics including:
- Total conversations (open vs resolved)
- Average response time
- SLA breakdown (how many healthy/warning/critical)
- Peak hours analysis
- Agent performance leaderboard

## Who It's For

### Small E-commerce Businesses
"We went from losing 20% of Instagram DM inquiries to responding to 98% within 10 minutes. Our conversion rate doubled." - Boutique fashion store owner

### Customer Support Teams (5-50 agents)
"Before OmniSync, we had 3 people doing nothing but switching between tabs. Now they handle 3x more volume." - Tech startup CS manager

### Agencies Managing Multiple Brands
"We manage 15 client Instagram accounts. OmniSync's multi-tenant architecture means we can see everything in one place." - Social media agency

## Pricing Plans

### Normal Plan - \$29/month
Perfect for solopreneurs and small teams
- 1 User seat
- 500 conversations per month
- WhatsApp + Instagram integration
- Basic SLA monitoring (15/30 min thresholds)
- Email support
- 7-day free trial

### Corporate Plan - \$99/month (MOST POPULAR)
Built for growing teams
- 5 User seats
- 5,000 conversations per month
- WhatsApp + Instagram integration
- Advanced SLA monitoring with custom thresholds
- Team assignment and collaboration tools
- Priority support (2-hour response time)
- Advanced analytics and reporting
- Excel exports
- 14-day free trial

### Tailor Plan - Custom Pricing
Enterprise-grade solution
- Unlimited users and conversations
- All platform integrations
- White-label option (your branding)
- Dedicated account manager
- 99.9% uptime SLA guarantee
- API access for custom integrations
- Single Sign-On (SSO)
- Custom training for your team
- Quarterly business reviews

## Technical Architecture

### Frontend
Built with React + Vite for blazing-fast performance. Beautiful glassmorphic UI with Tailwind CSS. Framer Motion animations create a delightful, premium experience.

### Backend
Node.js + Express API with Supabase PostgreSQL database. Row-level security ensures complete data isolation between companies. Socket.IO provides real-time updates without page refreshes.

### Integrations
- WhatsApp Business API (official Meta integration)
- Instagram Graph API for DMs
- Webhook architecture for instant message delivery
- Excel export via ExcelJS library

### Security
- End-to-end encryption for message data
- Row-level security (RLS) for multi-tenant isolation
- SOC 2 Type II compliant infrastructure
- GDPR and CCPA ready
- Regular third-party security audits

## Customer Success Stories

### StyleHub (Fashion E-commerce, 15 employees)
"We used to have a shared Gmail where we'd forward screenshots of Instagram DMs. It was chaos. Now with OmniSync, our average response time went from 4 hours to 8 minutes. Our customer satisfaction score jumped from 3.2 to 4.7 stars."

### TechFlow (SaaS Startup, 8 support agents)
"The SLA monitoring changed our culture. We gamified who could keep the most conversations green. Our first-response SLA went from 58% to 96% in just two weeks. Customers notice the difference."

### GlowBeauty (Beauty Brand, Instagram-focused)
"We get 200+ DMs per day asking about products. Before OmniSync, we'd lose track of people who were ready to buy. Now with the auto-prioritization, we never miss a hot lead. Sales through DMs increased 3x."

### BoutiqueBliss (Solo Founder)
"I run my entire boutique from my phone. OmniSync's mobile experience means I can respond to customers while I'm at the warehouse or doing deliveries. The quick replies save me hours every week."

### TravelEase (Travel Agency, 25 employees)
"During peak booking season, we were drowning. OmniSync's critical alerts meant we never missed someone asking about a time-sensitive deal. The Excel export feature also made our compliance audits effortless."

## What Makes OmniSync Different?

### vs. Shared Inbox Tools (Helpscout, Zendesk)
They're built for email. We're built for modern messaging platforms where customers expect instant responses.

### vs. Social Media Management Tools (Hootsuite, Buffer)
They're built for posting content. We're built for customer service conversations with SLA enforcement.

### vs. WhatsApp Business App
Limited to one platform, no team features, no SLA monitoring, mobile-only interface.

### Our Unique Value
We're the ONLY platform that treats response time as a first-class priority, automatically surfacing the most urgent customers and making it impossible to let someone slip through the cracks.

## The Future Roadmap

Coming in 2026:
- Facebook Messenger integration
- Telegram support
- AI-powered auto-responses (trained on your brand voice)
- Sentiment analysis (detect frustrated customers automatically)
- Video call integration
- Mobile apps (iOS and Android)
- Shopify integration (see order history in conversation)
- Multi-language support with auto-translation

## Getting Started

1. Sign up at omnisync.app (no credit card required)
2. Connect your WhatsApp Business account (2-minute setup)
3. Connect your Instagram account (one-click OAuth)
4. Invite your team members
5. Set your SLA thresholds
6. Start responding to customers!

Our onboarding team will guide you through setup with a personalized demo call.

## Awards & Recognition

- "Best Customer Service Tool 2025" - ProductHunt
- "Rising Star in CX Tech" - G2 Crowd
- "Top 50 B2B SaaS Startups" - TechCrunch
- 4.9/5 stars from 500+ reviews

## Created By
Built with ❤️ by @ThyImpaler`;

    const sections = content.split('## ').filter(Boolean).map(section => {
        const lines = section.split('\n');
        const heading = lines[0].trim();
        const body = lines.slice(1).join('\n').trim();
        return { heading, body };
    });

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-jakarta selection:bg-indigo-500/30 selection:text-white">
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none z-0"></div>
            
            <Navbar />
            
            <div className="pt-32 pb-24 relative z-10 px-6 max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-sora text-white mb-4 capitalize">{title.replace('-', ' ')}</h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>

                <div className="glass-panel p-8 md:p-12 space-y-12">
                    {/* Render Product Overview */}
                    {sections.map((sec, idx) => (
                        <div key={idx} className="space-y-4">
                            {sec.heading && <h2 className="text-2xl font-bold text-white font-sora border-b border-white/10 pb-2">{sec.heading.replace(/^#+ /, '')}</h2>}
                            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {sec.body}
                                {idx === 0 && <div className="mt-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm border-l-4 border-l-indigo-500 italic">Note: The {title.replace('-', ' ')} page is displaying our product overview document until the finalized copy is available.</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <Footer />
        </div>
    );
};
