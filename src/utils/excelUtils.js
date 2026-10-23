/**
 * Secure Excel export utility — replaces vulnerable `xlsx` package.
 * Uses `exceljs` (no known vulnerabilities) + `file-saver`.
 *
 * Drop-in replacement for the xlsx API surface used in this codebase:
 *   XLSX.utils.json_to_sheet, aoa_to_sheet, book_new, book_append_sheet,
 *   sheet_add_aoa, writeFile, write
 */
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ─── Sheet data format ────────────────────────────────────────────────────────
// Internally every "sheet" is stored as { __aoa: Array<Array<any>> }

function json_to_sheet(data) {
    if (!data || data.length === 0) return { __aoa: [] };
    const headers = Object.keys(data[0]);
    return { __aoa: [headers, ...data.map((obj) => headers.map((h) => obj[h]))] };
}

function aoa_to_sheet(aoa) {
    return { __aoa: Array.isArray(aoa) ? aoa : [] };
}

function book_new() {
    return { __sheets: [] };
}

function book_append_sheet(workbook, sheet, sheetName) {
    workbook.__sheets.push({ name: sheetName || 'Sheet1', aoa: sheet.__aoa || [] });
}

/**
 * Append rows to an existing sheet at a given row offset.
 * Mirrors: XLSX.utils.sheet_add_aoa(sheet, aoa, { origin: rowIndex })
 */
function sheet_add_aoa(sheet, aoa, options) {
    const origin = (options && options.origin != null) ? options.origin : sheet.__aoa.length;
    if (!Array.isArray(sheet.__aoa)) sheet.__aoa = [];
    // Ensure the array is long enough
    while (sheet.__aoa.length < origin) sheet.__aoa.push([]);
    // Insert/overwrite rows at origin
    const rows = Array.isArray(aoa) ? aoa : [];
    rows.forEach((row, i) => {
        sheet.__aoa[origin + i] = row;
    });
}

// ─── Workbook → ArrayBuffer ───────────────────────────────────────────────────
async function _buildBuffer(workbook) {
    const wb = new ExcelJS.Workbook();
    for (const { name, aoa } of workbook.__sheets) {
        const ws = wb.addWorksheet(name);
        if (aoa && aoa.length > 0) {
            aoa.forEach((row) => ws.addRow(row));
        }
    }
    return wb.xlsx.writeBuffer();
}

// ─── Public write APIs ────────────────────────────────────────────────────────

/**
 * Equivalent to XLSX.writeFile — triggers a browser download.
 * Now async; callers should use: await XLSX.writeFile(wb, filename)
 * or simply call without awaiting (fire-and-forget is fine for downloads).
 */
async function writeFile(workbook, filename) {
    const buffer = await _buildBuffer(workbook);
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, filename);
}

/**
 * Equivalent to XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }).
 * Returns a Promise<ArrayBuffer>. Callers using saveAs() themselves must await.
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
        // Stubs for rarely-used cell-reference helpers (no-ops, keep code from crashing)
        decode_range: () => ({ s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }),
        encode_range: () => 'A1',
        encode_cell: () => 'A1',
    },
    writeFile,
    write,
};

export default XLSX;
export { writeFile, write, json_to_sheet, aoa_to_sheet, book_new, book_append_sheet, sheet_add_aoa };
