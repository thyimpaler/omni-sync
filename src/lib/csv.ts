/** Minimal CSV helpers for the workspace exports. */

export interface CsvColumn<Row> {
    header: string;
    value: (row: Row) => string | number | null | undefined;
}

const escape = (value: string | number | null | undefined): string => {
    const text = value == null ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = <Row>(columns: CsvColumn<Row>[], rows: Row[]): string =>
    [columns.map((c) => escape(c.header)).join(',')]
        .concat(rows.map((row) => columns.map((c) => escape(c.value(row))).join(',')))
        .join('\r\n');

/** Hands the file to the browser. No server round-trip — the data is already here. */
export const downloadCsv = (filename: string, csv: string): void => {
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};
