import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const forbiddenPatterns = [
  "innermirror-runtime-private",
  "autonomous/",
  "orchestration/",
  "diagnostics/",
  "continuity/",
  "gravity/",
  "identity/",
  "life/",
  "meaning/",
];

const sourceDirs = [
  "src",
];

const violations = [];

for (const sourceDir of sourceDirs) {
  walk(path.join(rootDir, sourceDir));
}

if (violations.length > 0) {
  console.error(
    "\nPublic/private boundary violations detected:\n"
  );

  for (const violation of violations) {
    console.error(
      `- ${violation.file}: ${violation.pattern}`
    );
  }

  process.exit(1);
}

console.log(
  "Public/private boundary check passed."
);

function walk(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      walk(path.join(targetPath, entry));
    }

    return;
  }

  if (!/\.(ts|tsx|js|jsx)$/.test(targetPath)) {
    return;
  }

  const content =
    fs.readFileSync(targetPath, "utf8");

  for (const pattern of forbiddenPatterns) {
    if (content.includes(pattern)) {
      violations.push({
        file: path.relative(rootDir, targetPath),
        pattern,
      });
    }
  }
}