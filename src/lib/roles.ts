import type { MembershipRole } from '../types';

/**
 * The role ladder, mirroring `app.role_rank` in the database and `atLeast` in
 * the Node service. All three have to agree: the UI hides what a role cannot
 * do, and the other two make sure hiding it was not the only thing stopping it.
 */
const rank: Record<MembershipRole, number> = {
    owner: 40,
    admin: 30,
    agent: 20,
    viewer: 10,
};

export const atLeast = (role: MembershipRole | null | undefined, minimum: MembershipRole): boolean =>
    role ? rank[role] >= rank[minimum] : false;
