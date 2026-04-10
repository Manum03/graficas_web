export interface SheetPreviewData {
  headers: string[];
  rows: ExcelRow[];
  totalRows: number;
  omittedRows: number;
}

export type ExcelRow = Record<string, unknown>;

export type ChartType = "bar" | "line" | "pie" | "scatter" | "radar" | "area";

export interface ParsedSheet {
  name: string;
  rows: ExcelRow[];
  columns: string[];
  totalRows: number;
  omittedRows: number;
}

export interface ParsedWorkbookData {
  fileName: string;
  sheets: ParsedSheet[];
}

export type ColumnKind = "number" | "text" | "date" | "empty" | "mixed";

export type FileLoadState = "idle" | "loading" | "success" | "error";

export interface FileUploadFeedback {
  state: FileLoadState;
  errorMessage?: string | null;
}

export interface ChartConfig {
  type: ChartType;
  xColumn: string;
  yColumn: string;
  sheetName: string;
  title?: string;
  subtitle?: string;
  seriesName?: string;
  showLegend?: boolean;
  showDataLabels?: boolean;
}

export interface ChartPoint {
  x: string | number;
  y: number;
}

export interface ChartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validData: ChartPoint[];
  skippedRows: number;
}

export interface ColumnAnalysis {
  column: string;
  kind: ColumnKind;
}
