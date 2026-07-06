/**
 * Run `prisma generate`, but on Windows allow build to continue when the
 * query engine DLL is locked by a running dev server (EPERM on rename).
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = path.join(root, "node_modules", ".prisma", "client");
const hasClient =
  existsSync(path.join(clientDir, "index.js")) ||
  existsSync(path.join(clientDir, "default.js"));

function isEngineLocked(output) {
  return /EPERM|operation not permitted|EBUSY/i.test(output);
}

try {
  const result = execSync("npx prisma generate", {
    cwd: root,
    stdio: "pipe",
    env: process.env,
    encoding: "utf8",
  });
  if (result) process.stdout.write(result);
} catch (error) {
  const stdout =
    error && typeof error === "object" && "stdout" in error
      ? String(error.stdout)
      : "";
  const stderr =
    error && typeof error === "object" && "stderr" in error
      ? String(error.stderr)
      : "";
  const message = error instanceof Error ? error.message : "";
  const combined = `${message}\n${stdout}\n${stderr}`;

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  if (hasClient && isEngineLocked(combined)) {
    console.warn(
      "\n[prisma-generate-safe] Using existing Prisma client (engine file locked — stop `npm run dev` before regenerating).\n"
    );
    process.exit(0);
  }

  process.exit(
    error && typeof error === "object" && "status" in error && error.status
      ? Number(error.status)
      : 1
  );
}
