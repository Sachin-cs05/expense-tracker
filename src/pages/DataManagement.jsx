import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { Card, EmptyState } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";

function normalizeRow(row) {
  const amount = Number(row.amount ?? row.Amount ?? row.AMOUNT);
  const category = String(row.category ?? row.Category ?? "").trim();
  const description = String(row.description ?? row.Description ?? row.notes ?? "").trim();
  const date = String(row.date ?? row.Date ?? "").trim();
  const paymentMethod = String(row.paymentMethod ?? row.PaymentMethod ?? row["Payment Method"] ?? "Other").trim();

  return { amount, category, description, date, paymentMethod };
}

export default function DataManagement() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [previewRows, setPreviewRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const workbook = XLSX.read(loadEvent.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map(normalizeRow);
      setPreviewRows(rows);
    };
    reader.readAsBinaryString(file);
  }

  async function handleConfirmImport() {
    setIsImporting(true);
    try {
      const result = await api.importExpenses(previewRows);
      setImportResult(result);
      showToast(`Imported ${result.inserted} expense${result.inserted === 1 ? "" : "s"}.`);
      setPreviewRows([]);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleExport(type) {
    setIsExporting(true);
    try {
      await api.downloadReport(type);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Import / Export</h2>
          <p className="muted-copy">Bring your data in, or take it with you.</p>
        </div>
      </div>

      <Card>
        <div className="card-header">
          <h3>Import expenses</h3>
        </div>
        <p className="muted-copy">
          Upload a CSV or Excel file with columns for <code>amount</code>, <code>category</code>, <code>description</code>, and <code>date</code>.
        </p>
        <div className="import-dropzone">
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} id="import-file" />
          <label htmlFor="import-file" className="btn btn-secondary">
            <Icon name="upload" size={16} />
            Choose file
          </label>
          {fileName ? <span className="muted-copy">{fileName}</span> : null}
        </div>

        {previewRows.length ? (
          <>
            <p className="muted-copy">{previewRows.length} rows detected — review before importing.</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 8).map((row, index) => (
                    <tr key={index}>
                      <td>{row.amount}</td>
                      <td>{row.category}</td>
                      <td>{row.description}</td>
                      <td>{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewRows.length > 8 ? <p className="muted-copy">+ {previewRows.length - 8} more rows</p> : null}
            <button type="button" className="btn btn-primary" onClick={handleConfirmImport} disabled={isImporting}>
              {isImporting ? "Importing..." : `Confirm import (${previewRows.length} rows)`}
            </button>
          </>
        ) : null}

        {importResult ? (
          <div className="import-result">
            <p>✅ {importResult.inserted} imported</p>
            {importResult.failed ? <p>⚠️ {importResult.failed} failed</p> : null}
            {importResult.errors?.length ? (
              <ul className="muted-copy">
                {importResult.errors.slice(0, 5).map((error) => (
                  <li key={error.row}>
                    Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {!previewRows.length && !importResult ? (
          <EmptyState icon="upload" title="No file selected" description="Choose a CSV or Excel file to preview it before importing." />
        ) : null}
      </Card>

      <Card>
        <div className="card-header">
          <h3>Export expenses</h3>
        </div>
        <p className="muted-copy">Download your current expenses as a spreadsheet.</p>
        <div className="row-actions">
          <button type="button" className="btn btn-secondary" onClick={() => handleExport("csv")} disabled={isExporting}>
            <Icon name="download" size={16} />
            Export CSV
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => handleExport("excel")} disabled={isExporting}>
            <Icon name="download" size={16} />
            Export Excel
          </button>
        </div>
      </Card>
    </div>
  );
}
