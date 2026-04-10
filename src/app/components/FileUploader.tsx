"use client";

import { useRef, useState } from "react";
import {
  isSupportedExcelFileName,
  parseExcelFile,
} from "@/lib/excel";
import type {
  FileLoadState,
  FileUploadFeedback,
  ParsedWorkbookData,
} from "@/types/excel";
import Panel from "./Panel";

interface FileUploaderProps {
  fileName: string;
  uploadState: FileLoadState;
  errorMessage?: string | null;
  onFileLoaded: (data: ParsedWorkbookData) => void;
  onUploadStateChange: (feedback: FileUploadFeedback) => void;
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "No fue posible leer el archivo. Verifica que sea un Excel valido.";
}

export default function FileUploader({
  fileName,
  uploadState,
  errorMessage,
  onFileLoaded,
  onUploadStateChange,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const openFileDialog = () => {
    if (uploadState === "loading") {
      return;
    }

    inputRef.current?.click();
  };

  const processFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!isSupportedExcelFileName(file.name)) {
      onUploadStateChange({
        state: "error",
        errorMessage: "Solo se admiten archivos Excel con extension .xlsx o .xls.",
      });
      return;
    }

    onUploadStateChange({ state: "loading", errorMessage: null });

    try {
      const parsedWorkbook = await parseExcelFile(file);
      onFileLoaded(parsedWorkbook);
      onUploadStateChange({ state: "success", errorMessage: null });
    } catch (error) {
      onUploadStateChange({
        state: "error",
        errorMessage: getReadableErrorMessage(error),
      });
    }
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    await processFile(file);
    event.target.value = "";
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current -= 1;

    if (dragDepthRef.current <= 0) {
      setIsDragging(false);
      dragDepthRef.current = 0;
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsDragging(false);
    await processFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFileDialog();
    }
  };

  const statusClassName =
    uploadState === "loading"
      ? "is-loading"
      : uploadState === "error"
        ? "is-error"
        : fileName
          ? "is-success"
          : "";

  const panelStatus =
    uploadState === "loading" ? (
      <span className="status-pill status-pill--info">Leyendo archivo</span>
    ) : uploadState === "error" ? (
      <span className="status-pill status-pill--danger">Error de carga</span>
    ) : fileName ? (
      <span className="status-pill status-pill--success">Archivo listo</span>
    ) : (
      <span className="status-pill status-pill--neutral">Sin archivo</span>
    );

  const uploadTitle =
    uploadState === "loading"
      ? "Procesando el workbook"
      : isDragging
        ? "Suelta el archivo para cargarlo"
        : uploadState === "error"
          ? fileName
            ? "No se pudo reemplazar el archivo"
            : "El archivo no pudo cargarse"
          : fileName
            ? "Archivo listo para explorar"
            : "Carga tu Excel para comenzar";

  const uploadDescription =
    uploadState === "loading"
      ? "Estamos leyendo hojas, normalizando columnas y preparando la vista previa."
      : uploadState === "error"
        ? fileName
          ? "La nueva carga fallo, pero el workbook anterior sigue disponible para trabajar."
          : "Verifica la extension y el contenido del archivo antes de intentar nuevamente."
        : fileName
          ? "Puedes mantener el archivo actual o arrastrar otro para reemplazarlo sin salir del flujo."
          : "Se admiten unicamente archivos .xlsx y .xls. El analisis se realiza en el navegador usando la logica existente.";

  return (
    <Panel
      eyebrow="Paso 1"
      title="Carga el archivo de trabajo"
      description="Arrastra el Excel al area principal o selecciona el archivo manualmente. La interfaz valida la extension y conserva el workbook actual si una nueva carga falla."
      aside={panelStatus}
    >
      <div
        className={`upload-zone ${statusClassName} ${isDragging ? "is-dragging" : ""}`.trim()}
        role="button"
        tabIndex={0}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleInputChange}
          className="visually-hidden"
        />

        <div className="upload-zone__mark">XLS</div>

        <div className="section-stack">
          <div className="section-stack">
            <h3 className="upload-zone__title">{uploadTitle}</h3>

            <p className="upload-zone__description">{uploadDescription}</p>
          </div>

          <div className="upload-zone__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={(event) => {
                event.stopPropagation();
                openFileDialog();
              }}
              disabled={uploadState === "loading"}
            >
              {fileName ? "Cambiar archivo" : "Seleccionar archivo"}
            </button>

            <p className="upload-zone__hint">
              Tambien puedes arrastrar y soltar el archivo directamente.
            </p>
          </div>

          <div className="upload-zone__tags">
            <span className="info-chip">Extensiones validas</span>
            <span className="info-chip">.xlsx</span>
            <span className="info-chip">.xls</span>
          </div>

          {fileName ? (
            <p className="upload-zone__file">
              Archivo actual: <strong>{fileName}</strong>
            </p>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <div className="inline-message inline-message--danger">
          {errorMessage}
          {fileName ? " El archivo cargado anteriormente sigue disponible." : ""}
        </div>
      ) : null}
    </Panel>
  );
}
