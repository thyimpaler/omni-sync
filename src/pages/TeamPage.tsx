import React from 'react';

const team = [
    { id: 1, name: 'Alex Admin', role: 'Owner', email: 'alex@acmecorp.com', open: 3 },
    { id: 2, name: 'Priya O.', role: 'Agent', email: 'priya@acmecorp.com', open: 5 },
    { id: 3, name: 'Marcus W.', role: 'Agent', email: 'marcus@acmecorp.com', open: 4 },
];

export const TeamPage = () => (
    <div className="w-full flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[900px] px-8 py-8">
            <header className="border-b pb-6 rule">
                <h1 className="text-[32px]">Team</h1>
                <p className="mt-1 text-neutral-700">Who can open the inbox, and what they are carrying.</p>
            </header>

            <table className="mt-8 w-full text-left">
                <thead>
                    <tr className="border-b rule">
                        <th scope="col" className="label pb-2">Name</th>
                        <th scope="col" className="label pb-2">Role</th>
                        <th scope="col" className="label pb-2">Email</th>
                        <th scope="col" className="label pb-2 text-right">Open</th>
                    </tr>
                </thead>
                <tbody>
                    {team.map((member) => (
                        <tr key={member.id} className="border-b rule-soft">
                            <td className="py-3 font-heading text-[16px] font-semibold text-ink">{member.name}</td>
                            <td className="py-3 text-[14px] text-neutral-700">{member.role}</td>
                            <td className="py-3 text-[14px] text-neutral-600">{member.email}</td>
                            <td className="py-3 text-right font-mono text-[14px] tabular-nums text-ink">{member.open}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button type="button" className="btn btn-secondary mt-6">Invite an agent</button>
        </div>
    </div>
);
