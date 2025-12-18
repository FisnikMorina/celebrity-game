import fs from "fs";
import path from "path";

const repo = "celebrity-game"; // your repo name
const dist = path.join(process.cwd(), "dist");
const indexPath = path.join(dist, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("dist/index.html not found. Run export first.");
  process.exit(1);
}

let html = fs.readFileSync(indexPath, "utf8");

// Fix Expo absolute paths so they work under /celebrity-game/
html = html.replaceAll('"/_expo/', `"/${repo}/_expo/`);
html = html.replaceAll("'/_expo/", `"/${repo}/_expo/`);

html = html.replaceAll('"/assets/', `"/${repo}/assets/`);
html = html.replaceAll("'\/assets/", `"/${repo}/assets/`);

fs.writeFileSync(indexPath, html, "utf8");

// Prevent GitHub Pages Jekyll from ignoring folders starting with "_"
fs.writeFileSync(path.join(dist, ".nojekyll"), "");

// SPA refresh fallback
fs.copyFileSync(indexPath, path.join(dist, "404.html"));

console.log("Patched dist for GitHub Pages.");
