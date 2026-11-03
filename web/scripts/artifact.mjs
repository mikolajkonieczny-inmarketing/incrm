// Zamienia jednoplikowy build (dist-artifact/index.html) na stronę do publikacji jako Artifact:
// bez <!doctype>, <html>, <head>, <body>, bo te dokłada hosting.
import { readFileSync, writeFileSync } from "node:fs"

const src = readFileSync("dist-artifact/index.html", "utf8")
const out = src
  .replace(/<!doctype html>\s*/i, "")
  .replace(/<\/?(html|head|body)[^>]*>/g, "")
  .replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, "")
  .trim()
writeFileSync("dist-artifact/incrm-pm.html", out)
console.log(`dist-artifact/incrm-pm.html · ${(out.length / 1024).toFixed(0)} KB`)
