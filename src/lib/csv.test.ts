import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';
import type { CsvColumn } from './csv';

interface Row {
    name: string;
    note: string | null;
    count: number;
}

const columns: CsvColumn<Row>[] = [
    { header: 'Name', value: (r) => r.name },
    { header: 'Note', value: (r) => r.note },
    { header: 'Count', value: (r) => r.count },
];

describe('toCsv', () => {
    it('writes a header row even when there are no rows', () => {
        expect(toCsv(columns, [])).toBe('Name,Note,Count');
    });

    it('uses CRLF between records, as RFC 4180 expects', () => {
        const csv = toCsv(columns, [
            { name: 'Amanda', note: 'VIP', count: 11 },
            { name: 'Tomas', note: 'Wholesale', count: 9 },
        ]);
        expect(csv.split('\r\n')).toHaveLength(3);
    });

    it('renders null and undefined as empty rather than the literal text', () => {
        const csv = toCsv(columns, [{ name: 'Michael', note: null, count: 0 }]);
        expect(csv).toContain('Michael,,0');
        expect(csv).not.toContain('null');
    });

    it('quotes values containing a comma', () => {
        const csv = toCsv(columns, [{ name: 'Smith, Amanda', note: 'x', count: 1 }]);
        expect(csv).toContain('"Smith, Amanda"');
    });

    it('doubles embedded quotes so the field survives a round trip', () => {
        const csv = toCsv(columns, [{ name: 'He said "hello"', note: 'x', count: 1 }]);
        expect(csv).toContain('"He said ""hello"""');
    });

    it('quotes values containing a newline', () => {
        const csv = toCsv(columns, [{ name: 'line one\nline two', note: 'x', count: 1 }]);
        expect(csv).toContain('"line one\nline two"');
    });

    it('quotes headers that need it', () => {
        const csv = toCsv([{ header: 'Name, full', value: (r: Row) => r.name }], []);
        expect(csv).toBe('"Name, full"');
    });
});
