import express from "express";
import { exportToCsv, exportToExcel } from "../services/exportService.js";

export const reportRouter = express.Router();

reportRouter.get("/csv", async (request, response) => {
  try {
    const csvContent = await exportToCsv(request.user.id, request.query);

    response.setHeader("Content-Type", "text/csv");
    response.setHeader("Content-Disposition", 'attachment; filename="expenses.csv"');
    response.send(csvContent);
  } catch (error) {
    response.status(500).json({ message: error.message || "Unable to export CSV report." });
  }
});

reportRouter.get("/excel", async (request, response) => {
  try {
    const workbookBuffer = await exportToExcel(request.user.id, request.query);

    response.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.setHeader("Content-Disposition", 'attachment; filename="expenses.xlsx"');
    response.send(workbookBuffer);
  } catch (error) {
    response.status(500).json({ message: error.message || "Unable to export Excel report." });
  }
});
