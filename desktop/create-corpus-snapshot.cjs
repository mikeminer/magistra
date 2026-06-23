const { createHash } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const outputDir = process.env.MAGISTRA_SNAPSHOT_DIR
  ? path.resolve(process.env.MAGISTRA_SNAPSHOT_DIR)
  : path.join(__dirname, "snapshots");
const outputSql = process.env.MAGISTRA_SNAPSHOT_FILE
  ? path.resolve(process.env.MAGISTRA_SNAPSHOT_FILE)
  : path.join(outputDir, "magistra-corpus.sql");
const outputManifest = outputSql.replace(/\.sql$/i, ".manifest.json");
const dockerContainer = process.env.MAGISTRA_POSTGRES_CONTAINER ||
  "italian-oss-legal-platform-postgres-1";

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const output = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) {
      output[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
  return output;
}

function requireDatabaseUrl() {
  const fileEnv = readEnvFile(path.join(repoRoot, ".env"));
  const value = process.env.DATABASE_URL || fileEnv.DATABASE_URL;
  if (!value) {
    return undefined;
  }
  return value;
}

function detectDockerPostgresEnv() {
  try {
    const output = execFileSync("docker", [
      "inspect",
      dockerContainer,
      "--format",
      "{{range .Config.Env}}{{println .}}{{end}}"
    ], {
      encoding: "utf8",
      timeout: 5000,
      windowsHide: true
    });
    const env = {};
    for (const line of output.split(/\r?\n/)) {
      const index = line.indexOf("=");
      if (index > 0) {
        env[line.slice(0, index)] = line.slice(index + 1);
      }
    }
    if (!env.POSTGRES_USER || !env.POSTGRES_DB) {
      return undefined;
    }
    return env;
  }
  catch {
    return undefined;
  }
}

function redactDatabaseUrl(value) {
  try {
    const url = new URL(value);
    if (url.password) {
      url.password = "***";
    }
    return url.toString();
  }
  catch {
    return value.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  }
}

function hashFile(filePath) {
  const hash = createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function main() {
  const databaseUrl = requireDatabaseUrl();
  fs.mkdirSync(outputDir, { recursive: true });

  const pgDump = process.env.PG_DUMP || "pg_dump";
  let source;
  try {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL assente, provo Docker.");
    }
    execFileSync(pgDump, [
      "--format=plain",
      "--data-only",
      "--no-owner",
      "--no-privileges",
      "--schema=public",
      `--file=${outputSql}`,
      databaseUrl
    ], {
      cwd: repoRoot,
      stdio: "inherit",
      windowsHide: true
    });
    source = redactDatabaseUrl(databaseUrl);
  }
  catch (error) {
    const dockerEnv = detectDockerPostgresEnv();
    if (!dockerEnv) {
      throw error;
    }
    const dump = execFileSync("docker", [
      "exec",
      "-e",
      `PGPASSWORD=${dockerEnv.POSTGRES_PASSWORD ?? ""}`,
      dockerContainer,
      "pg_dump",
      "--format=plain",
      "--data-only",
      "--no-owner",
      "--no-privileges",
      "--schema=public",
      "--username",
      dockerEnv.POSTGRES_USER,
      "--dbname",
      dockerEnv.POSTGRES_DB
    ], {
      cwd: repoRoot,
      maxBuffer: 1024 * 1024 * 1024,
      windowsHide: true
    });
    fs.writeFileSync(outputSql, dump);
    source = `docker:${dockerContainer}/${dockerEnv.POSTGRES_DB}`;
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    source,
    file: path.basename(outputSql),
    format: "postgresql-data-only-sql",
    sha256: hashFile(outputSql)
  };
  fs.writeFileSync(outputManifest, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Snapshot creato: ${outputSql}`);
  console.log(`Manifest: ${outputManifest}`);
}

main();
