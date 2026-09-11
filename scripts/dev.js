import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const nodeBin = process.execPath;
const viteBin = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");

const processes = [
  {
    name: "server",
    command: nodeBin,
    args: [
      "--watch",
      `--watch-path=${path.join(projectRoot, ".env")}`,
      path.join(projectRoot, "server", "index.js")
    ]
  },
  {
    name: "client",
    command: nodeBin,
    args: [viteBin]
  }
];

let shuttingDown = false;
const children = [];

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 100);
}

for (const proc of processes) {
  const child = spawn(proc.command, proc.args, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false,
    env: process.env
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (signal) {
      console.log(`[${proc.name}] exited with signal ${signal}`);
      stopAll(1);
      return;
    }

    if (code !== 0) {
      console.log(`[${proc.name}] exited with code ${code}`);
      stopAll(code ?? 1);
    }
  });

  child.on("error", (error) => {
    console.error(`[${proc.name}] failed to start:`, error.message);
    stopAll(1);
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
