import { describe, expect, it } from 'vitest';
import { freshDatabase, service } from './harness';
import { seed } from './fixtures';

describe('migrations', () => {
    it('apply to an empty database', async () => {
        const db = await freshDatabase();
        const s = await seed(db);
        const rows = await db.query<{ n: number }>(service, 'select count(*)::int n from conversations');
        expect(rows[0]?.n).toBe(2);
        expect(s.a.id).not.toBe(s.b.id);
        await db.close();
    });
});
