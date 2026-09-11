import fs from "fs";
import path from "path";

let loaded = false;

function applyEnvFile(filePath, force = false) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!key || (!force && process.env[key] !== undefined && process.env[key] !== "")) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }

  return true;
}

export function loadEnv(force = false) {
  if (loaded && !force) {
    return;
  }

  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, ".env"),
    path.resolve(cwd, ".env.local"),
    path.resolve(cwd, ".env.example")
  ];

  for (const candidate of candidates) {
    if (applyEnvFile(candidate, force)) {
      loaded = true;
      return;
    }
  }

  loaded = true;
}
