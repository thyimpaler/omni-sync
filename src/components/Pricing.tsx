import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Team',
        price: '£29',
        unit: 'per agent, per month',
        features: ['Both channels', 'Unlimited policies', '90 days of reporting'],
    },
    {
        name: 'Growth',
        price: '£49',
        unit: 'per agent, per month',
        features: ['Messenger when it ships', 'Unlimited history', 'API and webhooks'],
    },
];

export const Pricing = () => (
    <section id="pricing" className="border-b rule" aria-labelledby="pricing-heading">
        <div className="mx-auto max-w-[1240px] px-6 py-16">
            <h2 id="pricing-heading" className="label">
                Pricing
            </h2>

            <div className="mt-8 grid gap-px bg-[color-mix(in_srgb,#1d1f20_16%,transparent)] md:grid-cols-2">
                {plans.map((plan) => (
                    <div key={plan.name} className="flex flex-col bg-white p-8">
                        <h3 className="text-[26px]">{plan.name}</h3>
                        <p className="mt-4 flex items-baseline gap-2">
                            <span className="font-heading text-[44px] font-semibold leading-none text-ink">
                                {plan.price}
                            </span>
                            <span className="text-[14px] text-neutral-600">{plan.unit}</span>
                        </p>
                        <ul className="mt-8 flex-1 space-y-3">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-3 text-[15px] text-neutral-700">
                                    <Check
                                        className="mt-1 h-4 w-4 shrink-0 text-accent-600"
                                        aria-hidden="true"
                                    />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/signup" className="btn btn-primary px-6 py-3">
                    Start free
                </Link>
                <p className="text-[14px] text-neutral-600">Annual billing takes two months off</p>
            </div>
        </div>
    </section>
);
