import type { ExcelRow } from "@/types/excel";
import EmptyState from "./EmptyState";
import Panel from "./Panel";

interface DataPreviewProps {
  headers: string[];
  rows: ExcelRow[];
  hasWorkbook: boolean;
  isLoading?: boolean;
  selectedSheet: string;
  omittedRows?: number;
  maxRows?: number;
}

export default function DataPreview({
  headers,
  rows,
  hasWorkbook,
  isLoading = false,
  selectedSheet,
  omittedRows = 0,
  maxRows = 12,
}: DataPreviewProps) {
  return (
    <Panel
      eyebrow="Paso 3"
      title="Preview de tabla"
      description="Revisa una muestra de la hoja activa antes de construir la grafica."
      aside={
        isLoading ? (
          <span className="status-pill status-pill--info">Cargando</span>
        ) : headers.length && rows.length ? (
          <span className="status-pill status-pill--success">Datos listos</span>
        ) : (
          <span className="status-pill status-pill--neutral">Sin preview</span>
        )
      }
    >
      {isLoading ? (
        <EmptyState
          title="Preparando la preview"
          description="Estamos leyendo el workbook y organizando la informacion disponible para la tabla."
          tone="info"
        />
      ) : !hasWorkbook ? (
        <EmptyState
          title="Aun no hay datos cargados"
          description="Sube un archivo Excel para habilitar la tabla de preview y verificar el contenido de las hojas."
          tone="neutral"
        />
      ) : !selectedSheet ? (
        <EmptyState
          title="Selecciona una hoja"
          description="La tabla se llenara cuando elijas una hoja activa en el panel lateral."
          tone="info"
        />
      ) : !headers.length || !rows.length ? (
        <EmptyState
          title="La hoja no tiene datos utilizables"
          description="No encontramos filas o columnas validas para previsualizar en esta hoja."
          tone="warning"
        />
      ) : (
        (() => {
          const previewRows = rows.slice(0, maxRows);
          const hiddenRows = Math.max(rows.length - previewRows.length, 0);

          return (
            <div className="section-stack">
              <div className="table-toolbar">
                <div className="table-meta">
                  <span className="info-chip">Hoja: {selectedSheet}</span>
                  <span className="info-chip">Columnas: {headers.length}</span>
                  <span className="info-chip">Filas: {rows.length}</span>
                  <span className="info-chip">
                    Mostrando: {previewRows.length}
                  </span>
                </div>
              </div>

              {omittedRows > 0 ? (
                <div className="inline-message inline-message--warning">
                  Se omitieron {omittedRows} filas vacias o incompletas durante la lectura del workbook.
                </div>
              ) : null}

              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {headers.map((header) => (
                          <td key={`${rowIndex}-${header}`}>
                            {row[header] !== null && row[header] !== undefined
                              ? String(row[header])
                              : "--"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="inline-message inline-message--neutral">
                {hiddenRows > 0
                  ? `La preview esta limitada a ${maxRows} filas para mantener la interfaz agil.`
                  : "La preview muestra todas las filas disponibles de la hoja actual."}
              </div>
            </div>
          );
        })()
      )}
    </Panel>
  );
}
