// Prepares dist/ for the static site: wipes it and copies public/ into it.
// Replaces the old `vite build` step — the Vite/React SPA in src/ is retired and must
// not be shipped, because its createRoot() overwrote the static astrology pages with
// the old "The Signal" software-comparison app. (`npm run build:spa` still builds it.)
import fs from "node:fs";
import path from "node:path";
const dist = path.resolve("dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.resolve("public"), dist, { recursive: true });
console.log("[copy-public] public/ → dist/");
