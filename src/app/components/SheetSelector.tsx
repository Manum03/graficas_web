interface SheetSelectorProps {
  sheets: string[];
  selectedSheet: string;
  onSelectSheet: (sheetName: string) => void;
  disabled?: boolean;
}

export default function SheetSelector({
  sheets,
  selectedSheet,
  onSelectSheet,
  disabled = false,
}: SheetSelectorProps) {
  return (
    <div className="field">
      <label htmlFor="sheet-select" className="field__label">
        Hoja
      </label>
      <p className="field__hint">
        Cambia la hoja activa para actualizar la preview y la configuracion de la grafica.
      </p>

      <select
        id="sheet-select"
        value={selectedSheet}
        onChange={(e) => onSelectSheet(e.target.value)}
        className="control"
        disabled={disabled}
      >
        <option value="">
          {disabled ? "Carga un archivo primero" : "Selecciona una hoja"}
        </option>
        {sheets.map((sheet) => (
          <option key={sheet} value={sheet}>
            {sheet}
          </option>
        ))}
      </select>
    </div>
  );
}
