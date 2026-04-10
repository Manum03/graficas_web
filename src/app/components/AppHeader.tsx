import type { FileLoadState } from "@/types/excel";

interface AppHeaderProps {
  fileName: string;
  selectedSheet: string;
  sheetCount: number;
  totalRows: number;
  omittedRows: number;
  uploadState: FileLoadState;
}

function getStatusLabel(uploadState: FileLoadState, hasWorkbook: boolean): string {
  if (uploadState === "loading") {
    return "Procesando workbook";
  }

  if (uploadState === "error") {
    return hasWorkbook ? "Archivo actual conservado" : "Revisa el archivo";
  }

  if (hasWorkbook) {
    return "Workspace listo";
  }

  return "Esperando archivo";
}

function getStatusTone(
  uploadState: FileLoadState,
  hasWorkbook: boolean
): "neutral" | "info" | "warning" | "danger" | "success" {
  if (uploadState === "loading") {
    return "info";
  }

  if (uploadState === "error") {
    return hasWorkbook ? "warning" : "danger";
  }

  if (hasWorkbook) {
    return "success";
  }

  return "neutral";
}

export default function AppHeader({
  fileName,
  selectedSheet,
  sheetCount,
  totalRows,
  omittedRows,
  uploadState,
}: AppHeaderProps) {
  const hasWorkbook = sheetCount > 0;
  const statusLabel = getStatusLabel(uploadState, hasWorkbook);
  const statusTone = getStatusTone(uploadState, hasWorkbook);

  return (
    <header className="app-header">
      <div className="app-header__content">
        <div className="app-header__intro">
          <p className="app-header__eyebrow">Dashboard de Excel y graficas</p>
          <div className="app-header__title-row">
            <h1 className="app-header__title">Analiza hojas, valida datos y genera visualizaciones limpias.</h1>
            <span className={`status-pill status-pill--${statusTone}`}>{statusLabel}</span>
          </div>
          <p className="app-header__description">
            El flujo queda organizado para cargar un workbook, seleccionar la hoja,
            revisar la tabla y construir la grafica sin perder la logica existente.
          </p>
          <div className="app-header__steps">
            <span className="info-chip">1. Carga</span>
            <span className="info-chip">2. Configura</span>
            <span className="info-chip">3. Revisa</span>
            <span className="info-chip">4. Grafica</span>
          </div>
        </div>

        <div className="app-header__stats">
          <article className="summary-card">
            <span className="summary-card__label">Archivo activo</span>
            <strong className="summary-card__value">
              {fileName || "Sin archivo cargado"}
            </strong>
          </article>

          <article className="summary-card">
            <span className="summary-card__label">Hojas detectadas</span>
            <strong className="summary-card__value">{sheetCount}</strong>
          </article>

          <article className="summary-card">
            <span className="summary-card__label">Filas disponibles</span>
            <strong className="summary-card__value">{totalRows}</strong>
          </article>

          <article className="summary-card">
            <span className="summary-card__label">Hoja seleccionada</span>
            <strong className="summary-card__value">
              {selectedSheet || "Sin seleccionar"}
            </strong>
            {omittedRows > 0 ? (
              <span className="summary-card__meta">{omittedRows} filas omitidas en lectura</span>
            ) : null}
          </article>
        </div>
      </div>
    </header>
  );
}
