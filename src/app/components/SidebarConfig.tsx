import type { ChartConfig } from "@/types/excel";
import ColumnSelector from "./ColumnSelector";
import Panel from "./Panel";
import SheetSelector from "./SheetSelector";

interface SidebarConfigProps {
  sheets: string[];
  selectedSheet: string;
  columns: string[];
  rowCount: number;
  omittedRows: number;
  isLoading: boolean;
  chartConfig: ChartConfig;
  onSelectSheet: (sheetName: string) => void;
  onChartConfigChange: (nextConfig: Partial<ChartConfig>) => void;
}

export default function SidebarConfig({
  sheets,
  selectedSheet,
  columns,
  rowCount,
  omittedRows,
  isLoading,
  chartConfig,
  onSelectSheet,
  onChartConfigChange,
}: SidebarConfigProps) {
  const hasSheets = sheets.length > 0;
  const hasColumns = columns.length > 0;
  const panelStatus = isLoading ? (
    <span className="status-pill status-pill--info">Cargando</span>
  ) : hasColumns ? (
    <span className="status-pill status-pill--success">Configurable</span>
  ) : (
    <span className="status-pill status-pill--neutral">Bloqueado</span>
  );

  return (
    <aside className="workspace-sidebar">
      <Panel
        eyebrow="Panel lateral"
        title="Configuracion"
        description="Selecciona la hoja, define las columnas y ajusta el contexto visual de la grafica."
        aside={panelStatus}
      >
        <div className="metric-grid">
          <article className="metric-card">
            <span className="metric-card__label">Hojas</span>
            <strong className="metric-card__value">{sheets.length}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Columnas</span>
            <strong className="metric-card__value">{columns.length}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Filas</span>
            <strong className="metric-card__value">{rowCount}</strong>
          </article>
          <article className="metric-card">
            <span className="metric-card__label">Omitidas</span>
            <strong className="metric-card__value">{omittedRows}</strong>
          </article>
        </div>

        {isLoading ? (
          <div className="inline-message inline-message--info">
            Leyendo el workbook y preparando las hojas disponibles.
          </div>
        ) : !hasSheets ? (
          <div className="inline-message inline-message--neutral">
            Carga un archivo Excel para habilitar la configuracion.
          </div>
        ) : !selectedSheet ? (
          <div className="inline-message inline-message--warning">
            Selecciona una hoja antes de configurar columnas y grafica.
          </div>
        ) : !hasColumns ? (
          <div className="inline-message inline-message--warning">
            La hoja seleccionada no tiene columnas utilizables para la vista previa.
          </div>
        ) : null}

        <div className="section-stack">
          <SheetSelector
            sheets={sheets}
            selectedSheet={selectedSheet}
            onSelectSheet={onSelectSheet}
            disabled={!hasSheets || isLoading}
          />

          <ColumnSelector
            columns={columns}
            chartConfig={chartConfig}
            onChartConfigChange={onChartConfigChange}
            disabled={!hasColumns || isLoading}
          />
        </div>
      </Panel>
    </aside>
  );
}
