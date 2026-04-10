"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  type ScatterDataPoint,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import {
  CHART_TYPE_OPTIONS,
  buildChartData,
  buildChartOptions,
  getRenderableChartType,
  type RenderableChartType,
} from "@/lib/chart";
import {
  buildDownloadFileName,
  exportChartToPng,
  exportRowsToCsv,
} from "@/lib/export";
import type { ChartConfig } from "@/types/excel";
import EmptyState from "./EmptyState";
import Panel from "./Panel";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler
);

type GenericRow = Record<string, unknown>;

interface ChartPanelProps {
  rows: GenericRow[];
  chartConfig: ChartConfig;
  hasWorkbook: boolean;
  selectedSheet: string;
  isLoading?: boolean;
  canResetAnalysis: boolean;
  onResetAnalysis: () => void;
}

type ActionFeedbackTone = "success" | "warning" | "danger";

interface ActionFeedback {
  tone: ActionFeedbackTone;
  message: string;
}

export default function ChartPanel({
  rows,
  chartConfig,
  hasWorkbook,
  selectedSheet,
  isLoading = false,
  canResetAnalysis,
  onResetAnalysis,
}: ChartPanelProps) {
  const chartRef = useRef<
    ChartJS<RenderableChartType, Array<number | ScatterDataPoint>, string> | undefined
  >(undefined);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);

  const {
    type,
    xColumn,
    yColumn,
    title,
    subtitle,
    seriesName,
    showLegend = true,
  } = chartConfig;

  const chartTypeLabel =
    CHART_TYPE_OPTIONS.find((option) => option.value === type)?.label || "Grafica";

  const chartBuildResult =
    rows.length && xColumn && yColumn
      ? buildChartData({
          rows,
          chartType: type,
          xColumn,
          yColumn,
          seriesName,
        })
      : null;

  const data = chartBuildResult?.data ?? null;
  const omittedCount = chartBuildResult?.omittedCount ?? 0;
  const error = chartBuildResult?.error ?? null;
  const transformedHeaders = chartBuildResult?.transformedHeaders ?? [];
  const transformedRows = chartBuildResult?.transformedRows ?? [];
  const normalizedType = getRenderableChartType(type);
  const panelDescription = `Hoja activa: ${selectedSheet}. Tipo seleccionado: ${chartTypeLabel}.`;
  const canExportPng = Boolean(data && !error);
  const canExportCsv = Boolean(transformedHeaders.length && transformedRows.length);

  const pngAvailabilityMessage = canExportPng
    ? "La grafica actual puede descargarse como PNG."
    : "No hay grafica para exportar.";

  const csvAvailabilityMessage = canExportCsv
    ? `El CSV incluira ${transformedRows.length} filas transformadas con encabezados.`
    : "No hay datos transformados para descargar.";

  const handleExportPng = async () => {
    const result = await exportChartToPng(
      chartRef.current?.canvas,
      buildDownloadFileName("grafica", "png")
    );

    setActionFeedback({
      tone: result.success ? "success" : "warning",
      message: result.message,
    });
  };

  const handleExportCsv = () => {
    const result = exportRowsToCsv(
      transformedRows,
      transformedHeaders,
      buildDownloadFileName("datos-transformados", "csv")
    );

    setActionFeedback({
      tone: result.success ? "success" : "warning",
      message: result.message,
    });
  };

  const handleReset = () => {
    setActionFeedback(null);
    onResetAnalysis();
  };

  const actionFooter = (
    <div className="action-bar">
      <div className="action-bar__buttons">
        <button
          type="button"
          className="button button--secondary"
          onClick={handleExportPng}
          disabled={!canExportPng}
        >
          Descargar grafica PNG
        </button>

        <button
          type="button"
          className="button button--secondary"
          onClick={handleExportCsv}
          disabled={!canExportCsv}
        >
          Descargar CSV
        </button>

        <button
          type="button"
          className="button button--danger"
          onClick={handleReset}
          disabled={!canResetAnalysis}
        >
          Reiniciar analisis
        </button>
      </div>

      <div className="action-bar__messages">
        <p className="action-bar__message">{pngAvailabilityMessage}</p>
        <p className="action-bar__message">{csvAvailabilityMessage}</p>
      </div>

      {actionFeedback ? (
        <div className={`inline-message inline-message--${actionFeedback.tone}`}>
          {actionFeedback.message}
        </div>
      ) : null}
    </div>
  );

  const renderPanel = (aside: ReactNode, description: string, content: ReactNode) => (
    <Panel
      eyebrow="Paso 4"
      title="Vista de grafica"
      description={description}
      aside={aside}
      footer={actionFooter}
    >
      {content}
    </Panel>
  );

  if (isLoading) {
    return renderPanel(
      <span className="status-pill status-pill--info">Cargando</span>,
      "La grafica se actualiza con la configuracion seleccionada y reutiliza la logica actual de Chart.js.",
      <EmptyState
        title="Preparando datos para la grafica"
        description="Estamos leyendo el workbook y organizando las filas disponibles antes de construir el dataset."
        tone="info"
      />
    );
  }

  if (!hasWorkbook) {
    return renderPanel(
      <span className="status-pill status-pill--neutral">Sin grafica</span>,
      "La grafica se actualiza con la configuracion seleccionada y reutiliza la logica actual de Chart.js.",
      <EmptyState
        title="Carga un workbook para habilitar la grafica"
        description="Cuando exista un archivo valido, aqui veras la visualizacion final con la configuracion actual."
        tone="neutral"
      />
    );
  }

  if (!selectedSheet) {
    return renderPanel(
      <span className="status-pill status-pill--warning">Falta seleccion</span>,
      "La grafica se actualiza con la configuracion seleccionada y reutiliza la logica actual de Chart.js.",
      <EmptyState
        title="Selecciona una hoja"
        description="Necesitamos una hoja activa antes de construir el dataset y renderizar la grafica."
        tone="warning"
      />
    );
  }

  if (!rows.length) {
    return renderPanel(
      <span className="status-pill status-pill--warning">Sin datos</span>,
      "La grafica se actualiza con la configuracion seleccionada y reutiliza la logica actual de Chart.js.",
      <EmptyState
        title="La hoja activa no tiene datos suficientes"
        description="No hay filas disponibles para convertir en un dataset de grafica."
        tone="warning"
      />
    );
  }

  if (!xColumn || !yColumn) {
    return renderPanel(
      <span className="status-pill status-pill--info">Configuracion incompleta</span>,
      "La grafica se actualiza con la configuracion seleccionada y reutiliza la logica actual de Chart.js.",
      <EmptyState
        title="Faltan columnas por seleccionar"
        description="Define la columna X, la columna Y y el tipo de grafica en el panel lateral para generar la visualizacion."
        tone="info"
      />
    );
  }

  const options = buildChartOptions({
    chartType: type,
    title,
    subtitle,
    showLegend,
    xLabel: xColumn,
    yLabel: yColumn,
    seriesName,
  });

  if (!data || error) {
    return renderPanel(
      <span className="status-pill status-pill--danger">Grafica no valida</span>,
      panelDescription,
      <div className="section-stack">
        {omittedCount > 0 ? (
          <div className="inline-message inline-message--warning">
            Se omitieron {omittedCount} filas invalidas para esta grafica.
          </div>
        ) : null}

        <EmptyState
          title="Los datos seleccionados no pueden graficarse"
          description={
            error || "No encontramos filas validas para el tipo de grafica seleccionado."
          }
          tone="danger"
        />
      </div>
    );
  }

  return renderPanel(
    <span className="status-pill status-pill--success">Grafica lista</span>,
    panelDescription,
    <div className="section-stack">
      <div className="chart-summary">
        <span className="info-chip">Tipo: {chartTypeLabel}</span>
        <span className="info-chip">X: {xColumn}</span>
        <span className="info-chip">Y: {yColumn}</span>
        <span className="info-chip">Serie: {seriesName?.trim() || yColumn}</span>
      </div>

      <div className="inline-message inline-message--info">
        Cambia hoja, columnas o tipo de grafica para generar otra visualizacion sin volver a cargar el archivo.
      </div>

      {omittedCount > 0 ? (
        <div className="inline-message inline-message--warning">
          Se omitieron {omittedCount} filas invalidas al construir esta grafica.
        </div>
      ) : null}

      <div className="chart-canvas">
        <Chart
          key={`${selectedSheet}-${normalizedType}-${xColumn}-${yColumn}`}
          ref={chartRef}
          type={normalizedType}
          data={data}
          options={options}
        />
      </div>
    </div>
  );
}
