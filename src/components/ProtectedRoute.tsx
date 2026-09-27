import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from '../contexts/auth-context';
import { useMembership } from '../hooks/useMembership';
import { atLeast } from '../lib/roles';
import type { MembershipRole } from '../types';

const Waiting = () => (
    <div className="flex min-h-screen items-center justify-center bg-ground">
        <span
            className="h-7 w-7 animate-spin rounded-full border-2 border-accent-600 border-t-transparent"
            role="status"
            aria-label="Checking your session"
        />
    </div>
);

const Refused = ({ minimumRole }: { minimumRole: MembershipRole }) => (
    <div className="flex min-h-screen items-center justify-center bg-ground px-6">
        <div className="panel max-w-md p-8">
            <h1 className="label">Not your call to make</h1>
            <p className="mt-3 text-neutral-700">
                This screen is for {minimumRole}s and above. Ask an admin in your workspace if you need access
                to it.
            </p>
        </div>
    </div>
);

/**
 * The gate on everything behind a session.
 *
 * It is not the security boundary — row-level security and the Node service
 * are, and both assume this component does not exist. What it does is keep a
 * signed-out visitor out of screens that would only show them empty state, and
 * keep a viewer out of screens whose every action the database would refuse.
 */
export const ProtectedRoute = ({
    children,
    minimumRole = 'viewer',
}: {
    children: ReactNode;
    minimumRole?: MembershipRole;
}) => {
    const auth = useAuth();
    const membership = useMembership();
    const location = useLocation();

    if (!auth || auth.loading) return <Waiting />;

    if (!auth.user) {
        // `from` is what sends someone back where they were headed once they
        // have signed in.
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (membership.loading) return <Waiting />;

    // Signed in, but in no workspace yet: that is what onboarding is for.
    if (!membership.current) return <Navigate to="/setup" replace />;

    if (!atLeast(membership.current.role, minimumRole)) {
        return <Refused minimumRole={minimumRole} />;
    }

    return children;
};
