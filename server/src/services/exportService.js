import * as XLSX from "xlsx";
import { listExpenses } from "../repositories/expenseRepository.js";

async function mapExportRows(ownerId, filters) {
  const expenses = await listExpenses(ownerId, filters);

  return expenses.map((expense) => ({
    ID: expense.id,
    Amount: expense.amount,
    Category: expense.category,
    Date: expense.date,
    Description: expense.description,
    "Payment Method": expense.paymentMethod,
    Notes: expense.notes
  }));
}

export async function exportToCsv(ownerId, filters) {
  const rows = await mapExportRows(ownerId, filters);
  const header = ["ID", "Amount", "Category", "Date", "Description", "Payment Method", "Notes"];
  const dataRows = rows.map((row) =>
    [
      row.ID,
      row.Amount,
      row.Category,
      row.Date,
      `"${String(row.Description).replaceAll("\"", "\"\"")}"`,
      row["Payment Method"],
      `"${String(row.Notes || "").replaceAll("\"", "\"\"")}"`
    ].join(",")
  );

  return [header.join(","), ...dataRows].join("\n");
}

export async function exportToExcel(ownerId, filters) {
  const rows = await mapExportRows(ownerId, filters);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });
}
