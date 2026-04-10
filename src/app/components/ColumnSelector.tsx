import { CHART_TYPE_OPTIONS } from "@/lib/chart";
import type { ChartConfig, ColumnAnalysis } from "@/types/excel";

interface ColumnSelectorProps {
  columns: string[];
  analyses?: ColumnAnalysis[];
  chartConfig: ChartConfig;
  onChartConfigChange: (nextConfig: Partial<ChartConfig>) => void;
  disabled?: boolean;
}

export default function ColumnSelector({
  columns,
  chartConfig,
  onChartConfigChange,
  disabled = false,
}: ColumnSelectorProps) {
  const typeHint =
    chartConfig.type === "scatter"
      ? "Dispersión requiere columnas numericas tanto en X como en Y."
      : "Barras, lineas, pastel, radar y area usan X como categoria y Y como valor numerico.";

  return (
    <div className="section-stack">
      <div className="field-grid field-grid--three">
        <div className="field">
          <label className="field__label">Columna X</label>
          <select
            value={chartConfig.xColumn}
            onChange={(e) => onChartConfigChange({ xColumn: e.target.value })}
            className="control"
            disabled={disabled}
          >
            <option value="">Selecciona una columna</option>
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label">Columna Y</label>
          <select
            value={chartConfig.yColumn}
            onChange={(e) => onChartConfigChange({ yColumn: e.target.value })}
            className="control"
            disabled={disabled}
          >
            <option value="">Selecciona una columna</option>
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label">Tipo de grafica</label>
          <select
            value={chartConfig.type}
            onChange={(e) =>
              onChartConfigChange({ type: e.target.value as ChartConfig["type"] })
            }
            className="control"
            disabled={disabled}
          >
            {CHART_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-grid field-grid--two">
        <div className="field">
          <label className="field__label">Titulo</label>
          <input
            type="text"
            value={chartConfig.title || ""}
            onChange={(e) => onChartConfigChange({ title: e.target.value })}
            placeholder="Ej. Ventas por mes"
            className="control"
            disabled={disabled}
          />
        </div>

        <div className="field">
          <label className="field__label">Subtitulo</label>
          <input
            type="text"
            value={chartConfig.subtitle || ""}
            onChange={(e) => onChartConfigChange({ subtitle: e.target.value })}
            placeholder="Ej. Datos cargados desde Excel"
            className="control"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label">Nombre de la serie</label>
        <input
          type="text"
          value={chartConfig.seriesName || ""}
          onChange={(e) => onChartConfigChange({ seriesName: e.target.value })}
          placeholder="Ej. Ingresos"
          className="control"
          disabled={disabled}
        />
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={Boolean(chartConfig.showLegend)}
          onChange={(e) => onChartConfigChange({ showLegend: e.target.checked })}
          disabled={disabled}
        />
        Mostrar leyenda
      </label>

      <div className="helper-card">
        {typeHint}
      </div>
    </div>
  );
}
