import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, "src");
const contentJsonPath = path.join(projectRoot, "data", "site-content.json");
const suspiciousPattern = /(?:à¦|à§|Ã|Â)/;
const banglaPattern = /[\u0980-\u09FF]/;

const ignoredSuspiciousFiles = new Set([
  path.join(projectRoot, "src", "lib", "contentEncoding.ts"),
  path.join(projectRoot, "src", "lib", "storage.ts")
]);

function collectFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, out);
      continue;
    }
    if (/\.(ts|tsx|json)$/.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function validateFiles() {
  const files = collectFiles(srcDir);
  files.push(contentJsonPath);

  const errors = [];
  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");

    if (raw.includes("\uFFFD")) {
      errors.push(`${filePath}: contains replacement character (�)`);
    }

    if (!ignoredSuspiciousFiles.has(filePath) && suspiciousPattern.test(raw)) {
      errors.push(`${filePath}: contains suspicious mojibake sequence`);
    }
  }

  return errors;
}

function validateBanglaFields() {
  const errors = [];
  const data = JSON.parse(fs.readFileSync(contentJsonPath, "utf8"));

  function walk(node, currentPath = []) {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, [...currentPath, String(index)]));
      return;
    }

    if (!node || typeof node !== "object") {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      const nextPath = [...currentPath, key];
      if (key === "bn" && typeof value === "string") {
        if (value.includes("\uFFFD")) {
          errors.push(`${nextPath.join(".")}: Bangla text contains replacement character`);
        }
        if (suspiciousPattern.test(value)) {
          errors.push(`${nextPath.join(".")}: Bangla text contains mojibake sequence`);
        }
        if (!banglaPattern.test(value)) {
          errors.push(`${nextPath.join(".")}: Bangla field contains no Bangla letters`);
        }
      } else {
        walk(value, nextPath);
      }
    }
  }

  walk(data);
  return errors;
}

const errors = [...validateFiles(), ...validateBanglaFields()];
if (errors.length > 0) {
  console.error("Encoding integrity check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Encoding integrity check passed.");
