"use client";

import type { ExcelRow } from "@/types/excel";

interface ExportResult {
  success: boolean;
  message: string;
}

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function triggerDownload(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, fileName);
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const normalizedValue = String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const escapedValue = normalizedValue.replace(/"/g, "\"\"");

  return `"${escapedValue}"`;
}

export function buildDownloadFileName(
  baseName: string,
  extension: "png" | "csv",
  date = new Date()
): string {
  const timestamp = [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
    padNumber(date.getHours()),
    padNumber(date.getMinutes()),
  ].join("-");

  return `${baseName}-${timestamp}.${extension}`;
}

export async function exportChartToPng(
  canvas: HTMLCanvasElement | null | undefined,
  fileName = buildDownloadFileName("grafica", "png")
): Promise<ExportResult> {
  if (!canvas) {
    return {
      success: false,
      message: "No hay grafica para exportar.",
    };
  }

  if (typeof canvas.toBlob === "function") {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      return {
        success: false,
        message: "No fue posible generar el archivo PNG de la grafica actual.",
      };
    }

    downloadBlob(blob, fileName);

    return {
      success: true,
      message: "Se inicio la descarga de la grafica en PNG.",
    };
  }

  triggerDownload(canvas.toDataURL("image/png"), fileName);

  return {
    success: true,
    message: "Se inicio la descarga de la grafica en PNG.",
  };
}

export function exportRowsToCsv(
  rows: ExcelRow[],
  headers: string[],
  fileName = buildDownloadFileName("datos-transformados", "csv")
): ExportResult {
  if (!rows.length || !headers.length) {
    return {
      success: false,
      message: "No hay datos transformados para descargar.",
    };
  }

  const csvLines = [
    headers.map((header) => escapeCsvValue(header)).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ];

  const csvContent = `\uFEFF${csvLines.join("\r\n")}`;
  const csvBlob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(csvBlob, fileName);

  return {
    success: true,
    message: `Se inicio la descarga del CSV con ${rows.length} filas transformadas.`,
  };
}
