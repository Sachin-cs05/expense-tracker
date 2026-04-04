import fs from "fs";
import path from "path";

const sourceDirectory = path.resolve("server");
const outputDirectory = path.resolve("dist/server");

fs.cpSync(sourceDirectory, outputDirectory, {
  recursive: true
});

console.log("Server files copied to dist/server");
