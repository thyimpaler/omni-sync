import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '../contexts/auth-context';
import type { AuthValue } from '../contexts/auth-context';
import type { Membership, MembershipRole } from '../types';
import { ProtectedRoute } from './ProtectedRoute';
import type { MembershipState } from '../hooks/useMembership';

const membershipState = vi.hoisted(() => ({
    current: {
        memberships: [],
        current: null,
        loading: false,
        error: null,
    } as MembershipState,
}));

vi.mock('../hooks/useMembership', () => ({
    useMembership: () => membershipState.current,
}));

const membership = (role: MembershipRole): Membership => ({
    id: 'membership-1',
    workspaceId: 'workspace-1',
    workspaceName: 'Northfield Supply Co.',
    workspaceSlug: 'northfield',
    role,
});

const auth = (overrides: Partial<AuthValue>): AuthValue => ({
    user: null,
    loading: false,
    signUp: async () => undefined,
    signIn: async () => undefined,
    signOut: async () => undefined,
    ...overrides,
});

function renderAt(path: string, value: AuthValue, minimumRole?: MembershipRole) {
    return render(
        <AuthContext.Provider value={value}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/login" element={<p>Sign in</p>} />
                    <Route path="/setup" element={<p>Connect a channel</p>} />
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute {...(minimumRole ? { minimumRole } : {})}>
                                <p>The inbox</p>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

const signedIn = { id: 'user-1' } as AuthValue['user'];

beforeEach(() => {
    membershipState.current = {
        memberships: [membership('agent')],
        current: membership('agent'),
        loading: false,
        error: null,
    };
});

describe('while the session is still being restored', () => {
    it('shows a waiting state rather than deciding early', () => {
        // Rendering the login redirect first would sign people out on every
        // refresh, which is what a naive `!user` check does.
        renderAt('/app', auth({ loading: true }));
        expect(screen.getByRole('status', { name: 'Checking your session' })).toBeInTheDocument();
        expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    });

    it('waits for the membership too', () => {
        membershipState.current = {
            memberships: [],
            current: null,
            loading: true,
            error: null,
        };
        renderAt('/app', auth({ user: signedIn }));
        expect(screen.getByRole('status', { name: 'Checking your session' })).toBeInTheDocument();
    });
});

describe('a signed-out visitor', () => {
    it('is sent to the login page', () => {
        renderAt('/app', auth({ user: null }));
        expect(screen.getByText('Sign in')).toBeInTheDocument();
    });
});

describe('a signed-in user with no workspace', () => {
    it('is sent to onboarding', () => {
        membershipState.current = {
            memberships: [],
            current: null,
            loading: false,
            error: null,
        };
        renderAt('/app', auth({ user: signedIn }));
        expect(screen.getByText('Connect a channel')).toBeInTheDocument();
    });
});

describe('the role gate', () => {
    it('lets an agent into an agent screen', () => {
        renderAt('/app', auth({ user: signedIn }), 'agent');
        expect(screen.getByText('The inbox')).toBeInTheDocument();
    });

    it('keeps an agent out of an admin screen', () => {
        renderAt('/app', auth({ user: signedIn }), 'admin');
        expect(screen.queryByText('The inbox')).not.toBeInTheDocument();
        expect(screen.getByText(/for admins and above/i)).toBeInTheDocument();
    });

    it('lets an owner into an admin screen', () => {
        membershipState.current = {
            memberships: [membership('owner')],
            current: membership('owner'),
            loading: false,
            error: null,
        };
        renderAt('/app', auth({ user: signedIn }), 'admin');
        expect(screen.getByText('The inbox')).toBeInTheDocument();
    });

    it('lets a viewer read a screen with no stated minimum', () => {
        membershipState.current = {
            memberships: [membership('viewer')],
            current: membership('viewer'),
            loading: false,
            error: null,
        };
        renderAt('/app', auth({ user: signedIn }));
        expect(screen.getByText('The inbox')).toBeInTheDocument();
    });
});
