import { loadEnv } from "../server/src/utils/env.js";
import { createApp } from "../server/src/app.js";
import { initializeDatabase } from "../server/src/db/database.js";

loadEnv();

const app = createApp();
let databaseInitializationPromise;

async function ensureDatabase() {
  if (!databaseInitializationPromise) {
    databaseInitializationPromise = initializeDatabase();
  }

  return databaseInitializationPromise;
}

export default async function handler(request, response) {
  await ensureDatabase();
  return app(request, response);
}
