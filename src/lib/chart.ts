import type {
  ChartData,
  ChartOptions,
  ScatterDataPoint,
  TooltipItem,
} from "chart.js";
import type { ChartType } from "@/types/excel";

type GenericRow = Record<string, unknown>;

export type ChartTypeOption = ChartType;
export type RenderableChartType = Exclude<ChartType, "area">;

interface BuildChartDataParams {
  rows: GenericRow[];
  chartType: ChartType;
  xColumn: string;
  yColumn: string;
  seriesName?: string;
}

interface BuildChartDataResult {
  data: ChartData<RenderableChartType, Array<number | ScatterDataPoint>, string> | null;
  omittedCount: number;
  error: string | null;
  transformedHeaders: string[];
  transformedRows: GenericRow[];
}

interface BuildChartOptionsParams {
  chartType: ChartType;
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  xLabel?: string;
  yLabel?: string;
  seriesName?: string;
}

const PIE_COLORS = [
  "#2563eb",
  "#0f766e",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#65a30d",
  "#ea580c",
] as const;

const numberFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

export const CHART_TYPE_OPTIONS: ReadonlyArray<{
  value: ChartTypeOption;
  label: string;
}> = [
  { value: "bar", label: "Barras" },
  { value: "line", label: "Líneas" },
  { value: "pie", label: "Pastel" },
  { value: "scatter", label: "Dispersión" },
  { value: "area", label: "Área" },
  { value: "radar", label: "Radar" },
];

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function toLabel(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function getDatasetLabel(yColumn: string, seriesName?: string): string {
  const trimmedSeriesName = seriesName?.trim();
  return trimmedSeriesName ? trimmedSeriesName : yColumn;
}

function buildTransformedRows(
  rows: GenericRow[],
  chartType: ChartType,
  xColumn: string,
  yColumn: string
): GenericRow[] {
  if (chartType === "scatter") {
    return rows.map((row) => ({
      [xColumn]: toNumber(row[xColumn]),
      [yColumn]: toNumber(row[yColumn]),
    }));
  }

  return rows.map((row) => ({
    [xColumn]: toLabel(row[xColumn]),
    [yColumn]: toNumber(row[yColumn]),
  }));
}

function getChartTypeLabel(chartType: ChartType): string {
  switch (chartType) {
    case "bar":
      return "barras";
    case "line":
      return "líneas";
    case "pie":
      return "pastel";
    case "scatter":
      return "dispersión";
    case "radar":
      return "radar";
    case "area":
      return "área";
    default:
      return "gráfica";
  }
}

function extractTooltipNumericValue(
  context: TooltipItem<RenderableChartType>
): number | null {
  if (typeof context.raw === "number") {
    return context.raw;
  }

  if (typeof context.parsed === "number") {
    return context.parsed;
  }

  const parsedObject =
    typeof context.parsed === "object" && context.parsed !== null
      ? (context.parsed as { y?: unknown })
      : null;

  if (typeof parsedObject?.y === "number") {
    return parsedObject.y;
  }

  return null;
}

export function getRenderableChartType(chartType: ChartType): RenderableChartType {
  return chartType === "area" ? "line" : chartType;
}

export function buildChartData(params: BuildChartDataParams): BuildChartDataResult {
  const { rows, chartType, xColumn, yColumn, seriesName } = params;
  const datasetLabel = getDatasetLabel(yColumn, seriesName);

  const validRows = rows.filter((row) => {
    const x = row[xColumn];
    const y = toNumber(row[yColumn]);

    if (chartType === "scatter") {
      const xNum = toNumber(x);
      return xNum !== null && y !== null;
    }

    return toLabel(x).trim() !== "" && y !== null;
  });

  const omittedCount = rows.length - validRows.length;

  if (chartType === "scatter") {
    const points = validRows.map((row) => ({
      x: toNumber(row[xColumn]) as number,
      y: toNumber(row[yColumn]) as number,
    }));

    if (!points.length) {
      return {
        data: null,
        omittedCount,
        error: "La gráfica de dispersión requiere columnas numéricas tanto en X como en Y.",
        transformedHeaders: [xColumn, yColumn],
        transformedRows: [],
      };
    }

    return {
      data: {
        datasets: [
          {
            label: datasetLabel,
            data: points,
            borderColor: "#dc2626",
            backgroundColor: "rgba(220, 38, 38, 0.75)",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      omittedCount,
      error: null,
      transformedHeaders: [xColumn, yColumn],
      transformedRows: buildTransformedRows(validRows, chartType, xColumn, yColumn),
    };
  }

  const labels = validRows.map((row) => toLabel(row[xColumn]));
  const values = validRows.map((row) => toNumber(row[yColumn]) as number);

  if (!values.length) {
    return {
        data: null,
        omittedCount,
        error: `La gráfica de ${getChartTypeLabel(
          chartType
        )} requiere valores en la columna X y una columna Y numérica con al menos una fila válida.`,
        transformedHeaders: [xColumn, yColumn],
        transformedRows: [],
      };
  }

  const isPie = chartType === "pie";
  const isArea = chartType === "area";
  const isRadar = chartType === "radar";

  const dataset = {
    label: datasetLabel,
    data: values,
    backgroundColor: isPie
      ? labels.map((_, index) => PIE_COLORS[index % PIE_COLORS.length])
      : chartType === "bar"
        ? "rgba(37, 99, 235, 0.82)"
        : isRadar
          ? "rgba(15, 118, 110, 0.22)"
          : "rgba(37, 99, 235, 0.2)",
    borderColor: isPie ? "#ffffff" : isRadar ? "#0f766e" : "#2563eb",
    borderWidth: isPie ? 2 : 2,
    borderRadius: chartType === "bar" ? 8 : undefined,
    tension: chartType === "line" || isArea ? 0.28 : undefined,
    fill: isArea || isRadar,
    pointRadius: chartType === "line" || isArea ? 3 : isRadar ? 4 : undefined,
    pointHoverRadius:
      chartType === "line" || isArea ? 5 : isRadar ? 6 : undefined,
    pointBackgroundColor:
      chartType === "line" || isArea ? "#2563eb" : isRadar ? "#0f766e" : undefined,
    hoverOffset: isPie ? 10 : undefined,
  };

  return {
    data: {
      labels,
      datasets: [dataset],
    },
    omittedCount,
    error: null,
    transformedHeaders: [xColumn, yColumn],
    transformedRows: buildTransformedRows(validRows, chartType, xColumn, yColumn),
  };
}

export function buildChartOptions(
  params: BuildChartOptionsParams
): ChartOptions<RenderableChartType> {
  const {
    chartType,
    title,
    subtitle,
    showLegend = true,
    xLabel,
    yLabel,
    seriesName,
  } = params;

  const isCircular = chartType === "pie";
  const isScatter = chartType === "scatter";
  const isRadar = chartType === "radar";
  const datasetLabel = seriesName?.trim() || yLabel || "Valor";

  const options: ChartOptions<RenderableChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: isCircular
      ? undefined
      : {
          mode: isScatter ? "nearest" : "index",
          intersect: false,
        },
    plugins: {
      legend: {
        display: showLegend,
        position: isCircular ? "right" : "top",
        labels: {
          usePointStyle: true,
          padding: 16,
          boxWidth: 10,
        },
      },
      title: {
        display: Boolean(title),
        text: title || "",
        font: {
          size: 18,
          weight: "bold",
        },
      },
      subtitle: {
        display: Boolean(subtitle),
        text: subtitle || "",
        padding: {
          bottom: 12,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        padding: 12,
        callbacks: {
          label: (context) => {
            if (chartType === "scatter") {
              const raw =
                typeof context.raw === "object" && context.raw !== null
                  ? (context.raw as { x?: unknown; y?: unknown })
                  : null;

              if (typeof raw?.x === "number" && typeof raw.y === "number") {
                return `${datasetLabel}: (${formatNumber(raw.x)}, ${formatNumber(
                  raw.y
                )})`;
              }

              return datasetLabel;
            }

            const value = extractTooltipNumericValue(context);
            if (value === null) {
              return datasetLabel;
            }

            return `${datasetLabel}: ${formatNumber(value)}`;
          },
          afterLabel:
            chartType === "pie"
              ? (context) => {
                  const currentValue = extractTooltipNumericValue(context);
                  if (currentValue === null) {
                    return "";
                  }

                  const total = context.dataset.data.reduce<number>((sum, item) => {
                    if (typeof item === "number") {
                      return sum + item;
                    }

                    if (
                      typeof item === "object" &&
                      item !== null &&
                      "y" in item &&
                      typeof item.y === "number"
                    ) {
                      return sum + item.y;
                    }

                    return sum;
                  }, 0);

                  if (!total) {
                    return "";
                  }

                  return `${((currentValue / total) * 100).toFixed(1)}% del total`;
                }
              : undefined,
        },
      },
    },
  };

  if (isRadar) {
    options.scales = {
      r: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.3)",
        },
        angleLines: {
          color: "rgba(148, 163, 184, 0.3)",
        },
        pointLabels: {
          color: "#334155",
        },
        ticks: {
          backdropColor: "transparent",
        },
      },
    };
  } else if (!isCircular) {
    options.scales = {
      x: {
        type: isScatter ? "linear" : "category",
        title: {
          display: true,
          text: xLabel || "Columna X",
        },
        grid: {
          display: isScatter,
          color: isScatter ? "rgba(148, 163, 184, 0.25)" : "transparent",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yLabel || "Columna Y",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.25)",
        },
      },
    };
  }

  return options;
}
