import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const vaultRoot = path.join(repoRoot, "knowledge");
const outputPath = path.join(repoRoot, "public", "vault-data.json");

const source = {
  repo: "Italian-Builders-Org/magistra",
  aliases: ["mikeminer/magistra"],
  branch: "dev",
  path: "knowledge",
};

const files = [];

await collectMarkdown(vaultRoot);

files.sort((a, b) => a.path.localeCompare(b.path, "it"));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    source,
    truncated: false,
    files,
  }),
  "utf8",
);

console.log(`Vault snapshot generated: ${files.length} markdown files`);

async function collectMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".obsidian") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectMarkdown(fullPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const text = await readFile(fullPath, "utf8");
    const relativePath = path.relative(repoRoot, fullPath).split(path.sep).join("/");
    files.push({
      path: relativePath,
      sha: createHash("sha1").update(text).digest("hex"),
      text,
    });
  }
}
