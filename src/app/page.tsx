'use client';

import { useState } from 'react';
import AppHeader from './components/AppHeader';
import ChartPanel from './components/ChartPanel';
import DataPreview from './components/DataPreview';
import FileUploader from './components/FileUploader';
import SidebarConfig from './components/SidebarConfig';
import type {
  ChartConfig,
  FileLoadState,
  FileUploadFeedback,
  ParsedSheet,
  ParsedWorkbookData,
} from '../types/excel';

const initialChartConfig: ChartConfig = {
  type: 'bar',
  xColumn: '',
  yColumn: '',
  sheetName: '',
  title: '',
  subtitle: '',
  seriesName: '',
  showLegend: true,
};

export default function Home() {
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [chartConfig, setChartConfig] = useState<ChartConfig>(initialChartConfig);
  const [uploadState, setUploadState] = useState<FileLoadState>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedSheetData = sheets.find((sheet) => sheet.name === selectedSheet);
  const sheetNames = sheets.map((sheet) => sheet.name);
  const rows = selectedSheetData?.rows ?? [];
  const columns = selectedSheetData?.columns ?? [];
  const totalRows = sheets.reduce((sum, sheet) => sum + sheet.totalRows, 0);
  const totalOmittedRows = sheets.reduce((sum, sheet) => sum + sheet.omittedRows, 0);
  const hasAnalysisState =
    Boolean(fileName) ||
    Boolean(sheets.length) ||
    Boolean(selectedSheet) ||
    Boolean(uploadError) ||
    uploadState !== 'idle';

  const handleFileLoaded = (data: ParsedWorkbookData) => {
    const firstSheet = data.sheets[0];

    setFileName(data.fileName);
    setSheets(data.sheets);
    setSelectedSheet(firstSheet?.name || '');
    setUploadError(null);
    setChartConfig((current) => ({
      ...current,
      xColumn: '',
      yColumn: '',
      sheetName: firstSheet?.name || '',
    }));
  };

  const handleUploadStateChange = (feedback: FileUploadFeedback) => {
    setUploadState(feedback.state);
    setUploadError(feedback.errorMessage ?? null);
  };

  const handleSelectSheet = (sheetName: string) => {
    setSelectedSheet(sheetName);
    setChartConfig((current) => ({
      ...current,
      xColumn: '',
      yColumn: '',
      sheetName,
    }));
  };

  const handleResetAnalysis = () => {
    setFileName('');
    setSheets([]);
    setSelectedSheet('');
    setChartConfig(initialChartConfig);
    setUploadState('idle');
    setUploadError(null);
  };

  const isLoading = uploadState === 'loading';
  const canResetAnalysis = hasAnalysisState && !isLoading;

  return (
    <main className="app-shell">
      <AppHeader
        fileName={fileName}
        selectedSheet={selectedSheet}
        sheetCount={sheetNames.length}
        totalRows={totalRows}
        omittedRows={totalOmittedRows}
        uploadState={uploadState}
      />

      <section className="workspace-grid">
        <SidebarConfig
          sheets={sheetNames}
          selectedSheet={selectedSheet}
          columns={columns}
          rowCount={rows.length}
          omittedRows={selectedSheetData?.omittedRows ?? 0}
          isLoading={isLoading}
          chartConfig={chartConfig}
          onSelectSheet={handleSelectSheet}
          onChartConfigChange={(nextConfig) =>
            setChartConfig((current) => ({ ...current, ...nextConfig }))
          }
        />

        <div className="workspace-main">
          <FileUploader
            fileName={fileName}
            uploadState={uploadState}
            errorMessage={uploadError}
            onFileLoaded={handleFileLoaded}
            onUploadStateChange={handleUploadStateChange}
          />

          <ChartPanel
            rows={rows}
            chartConfig={chartConfig}
            hasWorkbook={Boolean(sheets.length)}
            selectedSheet={selectedSheet}
            isLoading={isLoading}
            canResetAnalysis={canResetAnalysis}
            onResetAnalysis={handleResetAnalysis}
          />

          <DataPreview
            headers={columns}
            rows={rows}
            hasWorkbook={Boolean(sheets.length)}
            isLoading={isLoading}
            selectedSheet={selectedSheet}
            omittedRows={selectedSheetData?.omittedRows ?? 0}
          />
        </div>
      </section>
    </main>
  );
}
