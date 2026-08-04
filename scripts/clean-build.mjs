import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const targets = [
  path.join(rootDir, ".next"),
  path.join(rootDir, "node_modules", ".cache"),
];

console.log("🧹 Cleaning build artifacts cross-platform...");

for (const target of targets) {
  if (fs.existsSync(target)) {
    try {
      fs.rmSync(target, { recursive: true, force: true });
      console.log(`  ✓ Removed: ${path.relative(rootDir, target)}`);
    } catch (err) {
      console.warn(`  ! Could not remove ${target}:`, err.message);
    }
  }
}

console.log("✨ Clean completed successfully.\n");
