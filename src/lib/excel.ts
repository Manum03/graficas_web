import * as XLSX from "xlsx";
import type {
  ExcelRow,
  ParsedSheet,
  ParsedWorkbookData,
  SheetPreviewData,
} from "@/types/excel";

export const ALLOWED_EXCEL_EXTENSIONS = [".xlsx", ".xls"] as const;

function normalizeHeader(header: unknown, index: number): string {
  if (header === null || header === undefined || String(header).trim() === "") {
    return `Columna_${index + 1}`;
  }

  return String(header).trim();
}

function normalizeCellValue(value: unknown): string | number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const text = String(value).trim();

  if (text === "") {
    return null;
  }

  // Intentar convertir a número si realmente parece número
  const normalizedNumber = text.replace(",", ".");
  const asNumber = Number(normalizedNumber);

  if (!Number.isNaN(asNumber) && normalizedNumber !== "") {
    // Evita convertir cosas raras como códigos con letras
    const numericRegex = /^-?\d+([.,]\d+)?$/;
    if (numericRegex.test(text)) {
      return asNumber;
    }
  }

  return text;
}

function removeEmptyColumns(
  headers: string[],
  rows: ExcelRow[]
): { headers: string[]; rows: ExcelRow[] } {
  const nonEmptyHeaders = headers.filter((header) =>
    rows.some((row) => row[header] !== null && row[header] !== "")
  );

  const cleanedRows = rows.map((row) => {
    const newRow: ExcelRow = {};

    nonEmptyHeaders.forEach((header) => {
      newRow[header] = row[header] ?? null;
    });

    return newRow;
  });

  return {
    headers: nonEmptyHeaders,
    rows: cleanedRows,
  };
}

function removeCompletelyEmptyRows(rows: ExcelRow[]): ExcelRow[] {
  return rows.filter((row) =>
    Object.values(row).some((value) => value !== null && value !== "")
  );
}

export function getSheetPreview(
  workbook: XLSX.WorkBook,
  sheetName: string
): SheetPreviewData {
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    return {
      headers: [],
      rows: [],
      totalRows: 0,
      omittedRows: 0,
    };
  }

  // Obtenemos la hoja como matriz para detectar headers manualmente
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
    header: 1,
    defval: null,
    blankrows: false,
  });

  if (!matrix.length) {
    return {
      headers: [],
      rows: [],
      totalRows: 0,
      omittedRows: 0,
    };
  }

  const rawHeaders = matrix[0] || [];
  const headers = rawHeaders.map((header, index) => normalizeHeader(header, index));

  const bodyRows = matrix.slice(1);

  const rows: ExcelRow[] = bodyRows.map((rowArray) => {
    const row: ExcelRow = {};

    headers.forEach((header, index) => {
      row[header] = normalizeCellValue(rowArray[index]);
    });

    return row;
  });

  const withoutEmptyRows = removeCompletelyEmptyRows(rows);
  const cleaned = removeEmptyColumns(headers, withoutEmptyRows);

  return {
    headers: cleaned.headers,
    rows: cleaned.rows,
    totalRows: cleaned.rows.length,
    omittedRows: Math.max(bodyRows.length - cleaned.rows.length, 0),
  };
}

export function isSupportedExcelFileName(fileName: string): boolean {
  const normalizedFileName = fileName.trim().toLowerCase();

  return ALLOWED_EXCEL_EXTENSIONS.some((extension) =>
    normalizedFileName.endsWith(extension)
  );
}

export async function parseExcelFile(file: File): Promise<ParsedWorkbookData> {
  if (!isSupportedExcelFileName(file.name)) {
    throw new Error("Solo se admiten archivos Excel con extension .xlsx o .xls.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  if (!workbook.SheetNames.length) {
    throw new Error("El archivo no contiene hojas legibles.");
  }

  const sheets: ParsedSheet[] = workbook.SheetNames.map((name) => {
    const preview = getSheetPreview(workbook, name);

    return {
      name,
      rows: preview.rows,
      columns: preview.headers,
      totalRows: preview.totalRows,
      omittedRows: preview.omittedRows,
    };
  });

  return {
    fileName: file.name,
    sheets,
  };
}
