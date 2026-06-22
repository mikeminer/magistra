import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vaultHandler from "../api/vault.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "public");
const port = Number(process.env.PORT || process.argv[2] || 4173);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function safeResolve(urlPath) {
  const normalized = decodeURIComponent(urlPath.split("?")[0]).replace(/\\/g, "/");
  const requested = normalized === "/" ? "/index.html" : normalized;
  const resolved = path.resolve(root, `.${requested}`);

  if (!resolved.startsWith(root)) {
    return path.join(root, "index.html");
  }

  return resolved;
}

createServer(async (request, response) => {
  try {
    if ((request.url || "").startsWith("/api/vault")) {
      await vaultHandler(request, response);
      return;
    }

    let filePath = safeResolve(request.url || "/");
    const fileStat = await stat(filePath).catch(() => null);

    if (!fileStat || fileStat.isDirectory()) {
      filePath = path.join(root, "index.html");
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes.get(path.extname(filePath)) || "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Server error");
  }
}).listen(port, () => {
  console.log(`Vault graph: http://localhost:${port}`);
});
