/**
 * Secure Excel export utility — replaces vulnerable `xlsx` package.
 * Uses `exceljs` (no known vulnerabilities) + `file-saver`.
 *
 * Drop-in replacement for the xlsx API surface used in this codebase:
 *   XLSX.utils.json_to_sheet, aoa_to_sheet, book_new, book_append_sheet,
 *   sheet_add_aoa, writeFile, write
 */
import fileSaver from 'file-saver';

// ─── Sheet data format ────────────────────────────────────────────────────────
// Internally every "sheet" is stored as { __aoa: Array<Array<any>> }

function aoa_to_sheet(aoa) {
    return createSheet(Array.isArray(aoa) ? aoa : []);
}

function createSheet(aoa) {
    const sheet = { __aoa: aoa, __cellStyles: new Map() };
    return new Proxy(sheet, {
        get(target, property, receiver) {
            if (typeof property === 'string' && /^[A-Z]+\d+$/.test(property)) {
                const position = decode_cell(property);
                const value = target.__aoa[position.r]?.[position.c];
                if (value === undefined) return undefined;
                return {
                    get s() {
                        return target.__cellStyles.get(property);
                    },
                    set s(style) {
                        target.__cellStyles.set(property, style);
                    },
                };
            }
            if (property === '!ref') return encode_range(getRange(target.__aoa));
            return Reflect.get(target, property, receiver);
        },
    });
}

function book_new() {
    return { __sheets: [] };
}

function book_append_sheet(workbook, sheet, sheetName) {
    workbook.__sheets.push({ name: sheetName || 'Sheet1', sheet });
}

/**
 * Append rows to an existing sheet at a given row offset.
 * Mirrors: XLSX.utils.sheet_add_aoa(sheet, aoa, { origin: rowIndex })
 */
function sheet_add_aoa(sheet, aoa, options) {
    const origin = (options && options.origin != null) ? options.origin : sheet.__aoa.length;
    if (!Array.isArray(sheet.__aoa)) sheet.__aoa = [];
    while (sheet.__aoa.length < origin) sheet.__aoa.push([]);
    const rows = Array.isArray(aoa) ? aoa : [];
    rows.forEach((row, i) => {
        sheet.__aoa[origin + i] = row;
    });
}

// ─── Workbook → ArrayBuffer ───────────────────────────────────────────────────
async function _buildBuffer(workbook) {
    const { default: ExcelJS } = await import('exceljs');
    const wb = new ExcelJS.Workbook();
    for (const { name, sheet } of workbook.__sheets) {
        const ws = wb.addWorksheet(name);
        if (sheet.__aoa && sheet.__aoa.length > 0) {
            sheet.__aoa.forEach((row) => ws.addRow(row));
        }
        if (Array.isArray(sheet['!cols'])) {
            ws.columns = sheet['!cols'].map(({ wch, ...column }) => ({
                ...column,
                width: wch,
            }));
        }
        for (const [address, style] of sheet.__cellStyles) {
            const cell = ws.getCell(address);
            if (style.font) cell.font = style.font;
        }
        const autoFilter = sheet['!autofilter']?.ref;
        if (autoFilter) {
            const range = decode_range(autoFilter);
            ws.autoFilter = {
                from: { row: range.s.r + 1, column: range.s.c + 1 },
                to: { row: range.e.r + 1, column: range.e.c + 1 },
            };
        }
    }
    return wb.xlsx.writeBuffer();
}

function decode_cell(address) {
    const match = /^([A-Z]+)(\d+)$/.exec(address);
    if (!match) return { r: 0, c: 0 };
    const column = [...match[1]].reduce((value, char) => value * 26 + char.charCodeAt(0) - 64, 0);
    return { r: Number(match[2]) - 1, c: column - 1 };
}

function encode_cell({ r, c }) {
    let column = c + 1;
    let letters = '';
    while (column > 0) {
        const remainder = (column - 1) % 26;
        letters = String.fromCharCode(65 + remainder) + letters;
        column = Math.floor((column - 1) / 26);
    }
    return `${letters}${r + 1}`;
}

function getRange(aoa) {
    const lastRow = aoa.length - 1;
    const lastColumn = Math.max(0, ...aoa.map((row) => row.length - 1));
    return { s: { r: 0, c: 0 }, e: { r: Math.max(0, lastRow), c: lastColumn } };
}

function encode_range(range) {
    return `${encode_cell(range.s)}:${encode_cell(range.e)}`;
}

function decode_range(reference) {
    const [start, end = start] = reference.split(':');
    return { s: decode_cell(start), e: decode_cell(end) };
}

function json_to_sheet(data, options = {}) {
    if (!data || data.length === 0) return createSheet([]);
    const headers = Object.keys(data[0]);
    const rows = [headers, ...data.map((obj) => headers.map((header) => obj[header]))];
    const origin = options.origin || 0;
    return createSheet([...Array(origin).fill([]), ...rows]);
}

// ─── Public write APIs ────────────────────────────────────────────────────────

/**
 * Equivalent to XLSX.writeFile — triggers a browser download.
 */
async function writeFile(workbook, filename) {
    const buffer = await _buildBuffer(workbook);
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    fileSaver.saveAs(blob, filename);
}

/**
 * Equivalent to XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }).
 * Returns a Promise<ArrayBuffer>.
 */
async function write(workbook) {
    return _buildBuffer(workbook);
}

// ─── Namespace export — drop-in for `import * as XLSX from 'xlsx'` ────────────
const XLSX = {
    utils: {
        json_to_sheet,
        aoa_to_sheet,
        book_new,
        book_append_sheet,
        sheet_add_aoa,
        decode_range,
        encode_range,
        encode_cell,
    },
    writeFile,
    write,
};

export default XLSX;
export { writeFile, write, json_to_sheet, aoa_to_sheet, book_new, book_append_sheet, sheet_add_aoa };
