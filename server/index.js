import { loadEnv } from "./src/utils/env.js";
import { createApp } from "./src/app.js";
import { initializeDatabase } from "./src/db/database.js";

loadEnv();

const PORT = process.env.PORT || 4000;

try {
  await initializeDatabase();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Expense Tracker server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Failed to start server:", error.message);
  process.exit(1);
}
