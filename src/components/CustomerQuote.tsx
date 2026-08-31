import React from 'react';

export const CustomerQuote = () => (
    <section id="customers" className="border-b rule" aria-labelledby="customers-heading">
        <figure className="mx-auto max-w-[1240px] px-6 py-16">
            <figcaption className="label" id="customers-heading">From a customer</figcaption>
            <blockquote className="mt-6 max-w-[900px] font-heading text-[30px] font-medium leading-[1.25] text-ink md:text-[36px]">
                Two people were watching two phones and a laptop. Now there is one list, and we can see who has been
                waiting longest. Average first reply went from about eleven minutes to under four.
            </blockquote>
            <p className="mt-6 text-[14px] text-neutral-600">
                Dami Aluko · Operations, Northfield Supply Co. · 6 agents
            </p>
        </figure>
    </section>
);
