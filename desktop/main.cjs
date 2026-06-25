const { app, BrowserWindow, dialog, shell } = require("electron");
const { createHash } = require("node:crypto");
const { execFileSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const APP_NAME = "Magistra";
const DOCKER_POSTGRES_CONTAINER = "italian-oss-legal-platform-postgres-1";
const DESKTOP_DB_NAME = "magistra";
const DESKTOP_DB_USER = "magistra";
const DESKTOP_SNAPSHOT_NAME = "magistra-corpus.sql";
let serverProcess;
let workerProcess;
let iurexaProcess;
let mainWindow;
let portablePostgres;

function logDir() {
  const dir = path.join(app.getPath("userData"), "logs");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function logFilePath(name) {
  return path.join(logDir(), name);
}

function appendLog(name, message) {
  fs.appendFileSync(logFilePath(name), `${new Date().toISOString()} ${message}\n`, "utf8");
}

function runtimeRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "magistra-runtime");
  }
  return path.resolve(__dirname, "..");
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const output = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) {
      continue;
    }
    output[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return output;
}

function firstExistingPath(candidates) {
  return candidates.find((candidate) => candidate && fs.existsSync(candidate));
}

function executableName(name) {
  return process.platform === "win32" ? `${name}.exe` : name;
}

function resolvePostgresTools(root, env) {
  const configuredBin = env.MAGISTRA_POSTGRES_BIN || process.env.MAGISTRA_POSTGRES_BIN;
  const candidates = [
    configuredBin,
    path.join(root, "postgres", "bin"),
    path.join(root, "postgresql", "bin"),
    path.join(root, "runtime", "postgres", "bin")
  ].filter(Boolean);
  for (const binDir of candidates) {
    const pgCtl = path.join(binDir, executableName("pg_ctl"));
    const initdb = path.join(binDir, executableName("initdb"));
    const createdb = path.join(binDir, executableName("createdb"));
    const psql = path.join(binDir, executableName("psql"));
    if (fs.existsSync(pgCtl) && fs.existsSync(initdb) && fs.existsSync(psql)) {
      return { binDir, createdb, initdb, pgCtl, psql };
    }
  }
  return undefined;
}

function runPostgresTool(logName, file, args, options = {}) {
  appendLog(logName, `exec ${file} ${args.join(" ")}`);
  return execFileSync(file, args, {
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
    timeout: options.timeout ?? 120000,
    windowsHide: true
  });
}

function schemaPath(root) {
  return firstExistingPath([
    path.join(root, "schema.sql"),
    path.join(root, "desktop", "schema.sql")
  ]);
}

function snapshotPath(root, env) {
  const configured = env.MAGISTRA_CORPUS_SNAPSHOT || process.env.MAGISTRA_CORPUS_SNAPSHOT;
  return firstExistingPath([
    configured,
    path.join(root, "snapshots", DESKTOP_SNAPSHOT_NAME),
    path.join(root, "desktop", "snapshots", DESKTOP_SNAPSHOT_NAME)
  ]);
}

function hashFile(filePath) {
  const hash = createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function psqlArgs(connection, extraArgs) {
  return [
    "-h",
    "127.0.0.1",
    "-p",
    String(connection.port),
    "-U",
    connection.user,
    "-d",
    connection.database,
    ...extraArgs
  ];
}

function applyDesktopSchema(root, tools, connection) {
  const filePath = schemaPath(root);
  if (!filePath) {
    appendLog("postgres.log", "schema.sql non trovato: salto bootstrap schema");
    return;
  }
  runPostgresTool("postgres.log", tools.psql, psqlArgs(connection, [
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    filePath
  ]), { timeout: 180000 });
}

function restoreBundledSnapshot(root, tools, connection, env) {
  const filePath = snapshotPath(root, env);
  if (!filePath) {
    appendLog("postgres.log", "snapshot corpus non trovato: avvio senza restore snapshot");
    return false;
  }
  const digest = hashFile(filePath);
  const marker = path.join(app.getPath("userData"), `snapshot-${digest}.restored`);
  if (fs.existsSync(marker)) {
    appendLog("postgres.log", `snapshot gia' ripristinato: ${path.basename(filePath)}`);
    return false;
  }
  runPostgresTool("postgres.log", tools.psql, psqlArgs(connection, [
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    filePath
  ]), { timeout: 900000 });
  fs.writeFileSync(marker, new Date().toISOString(), "utf8");
  appendLog("postgres.log", `snapshot ripristinato: ${filePath}`);
  return true;
}

function countLocalChunks(tools, connection) {
  try {
    const output = runPostgresTool("postgres.log", tools.psql, psqlArgs(connection, [
      "-At",
      "-c",
      "select count(*) from chunk_normativi"
    ]), { timeout: 30000 });
    return Number(output.trim());
  }
  catch (error) {
    appendLog("postgres.log", `conteggio chunk non disponibile: ${error.message}`);
    return 0;
  }
}

function normalizeSqlForPglite(sql) {
  return sql
    .replace(/create\s+extension\s+if\s+not\s+exists\s+vector\s*;?/gi, "")
    .replace(/\bembedding\s+vector\s*\(\s*\d+\s*\)/gi, "embedding text")
    .replace(/::\s*vector\b/gi, "")
    .replace(/\bpublic\./g, "");
}

function pgliteDataDir(env) {
  return env.PGLITE_DATA_DIR ||
    env.MAGISTRA_PGLITE_DATA_DIR ||
    process.env.PGLITE_DATA_DIR ||
    process.env.MAGISTRA_PGLITE_DATA_DIR ||
    path.join(app.getPath("userData"), "pglite-data");
}

async function createPgliteDatabase(dataDir) {
  const { PGlite } = await import("@electric-sql/pglite");
  return new PGlite(dataDir);
}

async function applyPgliteSchema(root, database) {
  const filePath = schemaPath(root);
  if (!filePath) {
    appendLog("pglite.log", "schema.sql non trovato: salto bootstrap schema");
    return;
  }
  await database.exec(normalizeSqlForPglite(fs.readFileSync(filePath, "utf8")));
}

function parseCopyHeader(line) {
  const match = line.match(/^COPY\s+(?:public\.)?([A-Za-z_][A-Za-z0-9_]*)\s+\(([^)]+)\)\s+FROM\s+stdin;$/i);
  if (!match) {
    return undefined;
  }
  const columns = match[2].split(",").map((column) => column.trim().replace(/^"|"$/g, ""));
  if (!columns.every((column) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(column))) {
    throw new Error(`Colonne COPY non valide per ${match[1]}`);
  }
  return {
    columns,
    table: match[1]
  };
}

function decodeCopyValue(value, column) {
  if (value === "\\N") {
    return null;
  }
  if (column === "target_risolto") {
    return value === "t" || value === "true";
  }
  return value.replace(/\\([\\bfnrtv])/g, (_match, char) => {
    if (char === "\\") {
      return "\\";
    }
    if (char === "b") {
      return "\b";
    }
    if (char === "f") {
      return "\f";
    }
    if (char === "n") {
      return "\n";
    }
    if (char === "r") {
      return "\r";
    }
    if (char === "t") {
      return "\t";
    }
    if (char === "v") {
      return "\v";
    }
    return char;
  }).replace(/\\([0-7]{3})/g, (_match, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
}

async function restorePgliteCopyDump(database, dumpSql) {
  const lines = dumpSql.split(/\r?\n/);
  let restoredRows = 0;
  await database.query("begin");
  try {
    for (let index = 0; index < lines.length; index += 1) {
      const header = parseCopyHeader(lines[index]);
      if (!header) {
        continue;
      }
      const placeholders = header.columns.map((_column, columnIndex) => `$${columnIndex + 1}`).join(", ");
      const columnList = header.columns.join(", ");
      const insertSql = `insert into ${header.table} (${columnList}) values (${placeholders}) on conflict do nothing`;
      for (index += 1; index < lines.length && lines[index] !== "\\."; index += 1) {
        if (lines[index].length === 0) {
          continue;
        }
        const values = lines[index].split("\t").map((value, valueIndex) => decodeCopyValue(value, header.columns[valueIndex]));
        await database.query(insertSql, values);
        restoredRows += 1;
      }
    }
    await database.query("commit");
  }
  catch (error) {
    await database.query("rollback");
    throw error;
  }
  return restoredRows;
}

async function restorePgliteBundledSnapshot(root, database, env) {
  const filePath = snapshotPath(root, env);
  if (!filePath) {
    appendLog("pglite.log", "snapshot corpus non trovato: avvio senza restore snapshot");
    return false;
  }
  const digest = hashFile(filePath);
  const marker = path.join(app.getPath("userData"), `snapshot-${digest}.pglite.restored`);
  if (fs.existsSync(marker)) {
    const chunkCount = await countPgliteChunks(database);
    if (chunkCount > 0) {
      appendLog("pglite.log", `snapshot gia' ripristinato in PGlite: ${path.basename(filePath)}; chunks=${chunkCount}`);
      return false;
    }
    appendLog("pglite.log", "marker snapshot presente ma DB PGlite vuoto: ripristino forzato");
  }
  const restoredRows = await restorePgliteCopyDump(database, fs.readFileSync(filePath, "utf8"));
  fs.writeFileSync(marker, new Date().toISOString(), "utf8");
  appendLog("pglite.log", `snapshot ripristinato in PGlite: ${filePath}; righe=${restoredRows}`);
  return true;
}

async function countPgliteChunks(database) {
  try {
    const result = await database.query("select count(*)::int as count from chunk_normativi");
    return Number(result.rows?.[0]?.count ?? 0);
  }
  catch (error) {
    appendLog("pglite.log", `conteggio chunk non disponibile: ${error.message}`);
    return 0;
  }
}

async function startPgliteDatabase(root, env) {
  const mode = String(env.MAGISTRA_DESKTOP_DB_MODE || process.env.MAGISTRA_DESKTOP_DB_MODE || "pglite").toLowerCase();
  if (mode === "external" || mode === "portable-postgres" || mode === "postgres") {
    return undefined;
  }
  const dataDir = pgliteDataDir(env);
  fs.mkdirSync(dataDir, { recursive: true });
  let database;
  try {
    database = await createPgliteDatabase(dataDir);
    await applyPgliteSchema(root, database);
    const restoredSnapshot = await restorePgliteBundledSnapshot(root, database, env);
    const chunkCount = await countPgliteChunks(database);
    return {
      chunkCount,
      dataDir,
      restoredSnapshot
    };
  }
  catch (error) {
    appendLog("pglite.log", `bootstrap PGlite non riuscito: ${error.message}`);
    return undefined;
  }
  finally {
    await database?.close?.();
  }
}

async function startPortablePostgres(root, env) {
  if ((env.MAGISTRA_DESKTOP_DB_MODE || process.env.MAGISTRA_DESKTOP_DB_MODE) === "external") {
    return undefined;
  }
  const tools = resolvePostgresTools(root, env);
  if (!tools) {
    appendLog("postgres.log", "runtime PostgreSQL portabile non trovato");
    return undefined;
  }
  const dataDir = env.MAGISTRA_POSTGRES_DATA_DIR ||
    process.env.MAGISTRA_POSTGRES_DATA_DIR ||
    path.join(app.getPath("userData"), "postgres-data");
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const initialized = fs.existsSync(path.join(dataDir, "PG_VERSION"));
  if (!initialized) {
    fs.mkdirSync(dataDir, { recursive: true });
    runPostgresTool("postgres.log", tools.initdb, [
      "-D",
      dataDir,
      "-U",
      DESKTOP_DB_USER,
      "-A",
      "trust",
      "-E",
      "UTF8"
    ], { timeout: 180000 });
  }
  const port = Number(env.MAGISTRA_POSTGRES_PORT || process.env.MAGISTRA_POSTGRES_PORT) ||
    await findFreePort();
  runPostgresTool("postgres.log", tools.pgCtl, [
    "-D",
    dataDir,
    "-o",
    `-p ${port} -h 127.0.0.1`,
    "-w",
    "start"
  ], { timeout: 180000 });
  portablePostgres = { dataDir, pgCtl: tools.pgCtl };
  try {
    runPostgresTool("postgres.log", tools.createdb, [
      "-h",
      "127.0.0.1",
      "-p",
      String(port),
      "-U",
      DESKTOP_DB_USER,
      DESKTOP_DB_NAME
    ], { timeout: 60000 });
  }
  catch (error) {
    appendLog("postgres.log", `createdb saltato: ${error.message}`);
  }
  const connection = {
    database: DESKTOP_DB_NAME,
    port,
    user: DESKTOP_DB_USER
  };
  applyDesktopSchema(root, tools, connection);
  const restoredSnapshot = restoreBundledSnapshot(root, tools, connection, env);
  const chunkCount = countLocalChunks(tools, connection);
  return {
    chunkCount,
    connection,
    databaseUrl: `postgresql://${DESKTOP_DB_USER}@127.0.0.1:${port}/${DESKTOP_DB_NAME}`,
    restoredSnapshot,
    tools
  };
}

function stopPortablePostgres() {
  if (!portablePostgres) {
    return;
  }
  try {
    runPostgresTool("postgres.log", portablePostgres.pgCtl, [
      "-D",
      portablePostgres.dataDir,
      "-m",
      "fast",
      "-w",
      "stop"
    ], { timeout: 60000 });
  }
  catch (error) {
    appendLog("postgres.log", `stop PostgreSQL fallito: ${error.message}`);
  }
}

function detectDockerDatabaseUrl() {
  try {
    const output = execFileSync("docker", [
      "inspect",
      DOCKER_POSTGRES_CONTAINER,
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
    if (!env.POSTGRES_USER || !env.POSTGRES_PASSWORD || !env.POSTGRES_DB) {
      return undefined;
    }
    return `postgresql://${encodeURIComponent(env.POSTGRES_USER)}:${encodeURIComponent(env.POSTGRES_PASSWORD)}@localhost:5432/${encodeURIComponent(env.POSTGRES_DB)}`;
  }
  catch {
    return undefined;
  }
}

function resolveDesktopLlmBaseUrl(fileEnv, iurexaRuntime) {
  const configured = process.env.LLM_BASE_URL || fileEnv.LLM_BASE_URL;
  if (!configured || /host\.docker\.internal/i.test(configured)) {
    if (iurexaRuntime?.baseUrl) {
      return iurexaRuntime.baseUrl;
    }
    return "http://127.0.0.1:11434/v1";
  }
  return configured;
}

function resolvePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveIurexaRuntime(root, fileEnv) {
  const enabled = String(fileEnv.MAGISTRA_IUREXA_ENABLED || process.env.MAGISTRA_IUREXA_ENABLED || "true").toLowerCase();
  if (enabled === "false" || enabled === "0" || enabled === "no") {
    appendLog("iurexa.log", "runtime Iurexa disabilitato da configurazione");
    return undefined;
  }

  const configuredDir = fileEnv.MAGISTRA_IUREXA_DIR || process.env.MAGISTRA_IUREXA_DIR;
  const iurexaDir = firstExistingPath([
    configuredDir ? path.resolve(configuredDir) : undefined,
    path.join(root, "iurexa"),
    path.join(root, "desktop", "iurexa")
  ]);
  if (!iurexaDir) {
    const message = "Runtime Iurexa non trovato. Ricrea il bundle con: npm --prefix desktop run prepare:iurexa";
    if (app.isPackaged) {
      throw new Error(message);
    }
    appendLog("iurexa.log", `${message}; fallback LLM legacy`);
    return undefined;
  }

  const runtimeExe = fileEnv.MAGISTRA_IUREXA_RUNTIME_EXE
    || process.env.MAGISTRA_IUREXA_RUNTIME_EXE
    || path.join(iurexaDir, "runtime", executableName("iurexa-runtime"));
  const modelPath = fileEnv.MAGISTRA_IUREXA_MODEL_PATH
    || process.env.MAGISTRA_IUREXA_MODEL_PATH
    || path.join(iurexaDir, "models", "iurexa-lite.gguf");

  if (!fs.existsSync(runtimeExe) || !fs.existsSync(modelPath)) {
    const message = `Runtime Iurexa incompleto: exe=${runtimeExe}; model=${modelPath}`;
    if (app.isPackaged) {
      throw new Error(message);
    }
    appendLog("iurexa.log", `${message}; fallback LLM legacy`);
    return undefined;
  }

  return {
    baseUrl: `http://127.0.0.1:${resolvePositiveInteger(fileEnv.MAGISTRA_IUREXA_PORT || process.env.MAGISTRA_IUREXA_PORT, 4141)}/v1`,
    batch: String(fileEnv.MAGISTRA_IUREXA_BATCH || process.env.MAGISTRA_IUREXA_BATCH || "128"),
    context: String(fileEnv.MAGISTRA_IUREXA_CTX || process.env.MAGISTRA_IUREXA_CTX || "4096"),
    logDirectory: fileEnv.MAGISTRA_IUREXA_LOG_DIR || process.env.MAGISTRA_IUREXA_LOG_DIR || logDir(),
    modelId: fileEnv.MAGISTRA_IUREXA_MODEL_ID || process.env.MAGISTRA_IUREXA_MODEL_ID || "iurexa",
    modelPath,
    port: resolvePositiveInteger(fileEnv.MAGISTRA_IUREXA_PORT || process.env.MAGISTRA_IUREXA_PORT, 4141),
    runtimeExe,
    threads: String(fileEnv.MAGISTRA_IUREXA_THREADS || process.env.MAGISTRA_IUREXA_THREADS || "auto")
  };
}

async function startIurexaRuntime(root, fileEnv) {
  const runtime = resolveIurexaRuntime(root, fileEnv);
  if (!runtime) {
    return undefined;
  }

  const healthUrl = `http://127.0.0.1:${runtime.port}/health`;
  try {
    await waitForHttp(healthUrl, 1200);
    appendLog("iurexa.log", `runtime Iurexa gia' disponibile: ${runtime.baseUrl}`);
    return { baseUrl: runtime.baseUrl, model: runtime.modelId };
  }
  catch {
    // Not running yet: start the bundled runtime below.
  }

  appendLog("iurexa.log", `starting runtime=${runtime.runtimeExe} model=${runtime.modelPath}`);
  iurexaProcess = spawn(runtime.runtimeExe, [
    "--model",
    runtime.modelPath,
    "--host",
    "127.0.0.1",
    "--port",
    String(runtime.port),
    "--ctx",
    runtime.context,
    "--threads",
    runtime.threads,
    "--batch",
    runtime.batch,
    "--cpu-only",
    "--model-id",
    runtime.modelId,
    "--log-dir",
    runtime.logDirectory
  ], {
    cwd: path.dirname(runtime.runtimeExe),
    env: { ...process.env, ...fileEnv },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  iurexaProcess.stdout.on("data", (chunk) => appendLog("iurexa.out.log", chunk.toString()));
  iurexaProcess.stderr.on("data", (chunk) => appendLog("iurexa.err.log", chunk.toString()));
  iurexaProcess.once("exit", (code) => {
    appendLog("iurexa.log", `runtime Iurexa exited code=${code ?? "unknown"}`);
    iurexaProcess = undefined;
  });

  await waitForHttp(healthUrl, resolvePositiveInteger(fileEnv.MAGISTRA_IUREXA_STARTUP_TIMEOUT_MS || process.env.MAGISTRA_IUREXA_STARTUP_TIMEOUT_MS, 180000));
  appendLog("iurexa.log", `runtime Iurexa pronto: ${runtime.baseUrl}`);
  return { baseUrl: runtime.baseUrl, model: runtime.modelId };
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

function waitForHttp(url, timeoutMs = 90000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on("error", retry);
      request.setTimeout(2500, () => {
        request.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timeout avvio server locale: ${url}`));
        return;
      }
      setTimeout(attempt, 700);
    };
    attempt();
  });
}

async function buildServerEnv(root, port) {
  const fileEnv = readEnvFile(app.isPackaged
    ? path.join(app.getPath("userData"), "magistra.env")
    : path.join(root, ".env"));
  const storageDir = path.join(app.getPath("userData"), "storage");
  fs.mkdirSync(storageDir, { recursive: true });
  const certPath = path.join(root, "certs", "local-ca.pem");
  const desktopDbMode = String(fileEnv.MAGISTRA_DESKTOP_DB_MODE || process.env.MAGISTRA_DESKTOP_DB_MODE || "pglite").toLowerCase();
  const allowExternalDatabase = desktopDbMode === "external";
  const hasConfiguredDatabaseUrl = allowExternalDatabase && Boolean(process.env.DATABASE_URL || fileEnv.DATABASE_URL);
  const pgliteDatabase = !hasConfiguredDatabaseUrl
    ? await startPgliteDatabase(root, fileEnv)
    : undefined;
  const portableDatabase = !hasConfiguredDatabaseUrl && !pgliteDatabase
    ? await startPortablePostgres(root, fileEnv)
    : undefined;
  const iurexaRuntime = await startIurexaRuntime(root, fileEnv);
  const defaultLlmProvider = iurexaRuntime ? "openai-compatible" : "ollama";
  const defaultLlmModel = iurexaRuntime?.model || "llama3.2:1b";
  const env = {
    ...process.env,
    ...fileEnv,
    ELECTRON_RUN_AS_NODE: "1",
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    PORT: String(port),
    ONLINE_SOURCE_RECOVERY_ENABLED: "true",
    ONLINE_SOURCE_RECOVERY_API_FALLBACK: "true",
    OBJECT_STORAGE_DIR: storageDir,
    MAGISTRA_RUNTIME_ROOT: root,
    MAGISTRA_IUREXA_BASE_URL: iurexaRuntime?.baseUrl || "",
    MAGISTRA_IUREXA_MODEL: iurexaRuntime?.model || "",
    LLM_PROVIDER: fileEnv.LLM_PROVIDER || process.env.LLM_PROVIDER || defaultLlmProvider,
    LLM_BASE_URL: resolveDesktopLlmBaseUrl(fileEnv, iurexaRuntime),
    LLM_MODEL: fileEnv.LLM_MODEL || process.env.LLM_MODEL || defaultLlmModel,
    LLM_API_FORMAT: fileEnv.LLM_API_FORMAT || process.env.LLM_API_FORMAT || "chat",
    LLM_TEMPERATURE: fileEnv.LLM_TEMPERATURE || process.env.LLM_TEMPERATURE || "0.1",
    LLM_MAX_OUTPUT_TOKENS: fileEnv.LLM_MAX_OUTPUT_TOKENS || process.env.LLM_MAX_OUTPUT_TOKENS || "700",
    NODE_PATH: path.join(root, "node_modules")
  };
  if (portableDatabase?.databaseUrl) {
    env.DATABASE_URL = portableDatabase.databaseUrl;
    env.MAGISTRA_DESKTOP_DB_KIND = "portable-postgres";
    env.MAGISTRA_DESKTOP_DB_CHUNKS = String(portableDatabase.chunkCount);
  }
  if (pgliteDatabase?.dataDir) {
    env.MAGISTRA_DB_DRIVER = "pglite";
    env.PGLITE_DATA_DIR = pgliteDatabase.dataDir;
    env.MAGISTRA_DESKTOP_DB_KIND = "pglite";
    env.MAGISTRA_DESKTOP_DB_CHUNKS = String(pgliteDatabase.chunkCount);
    env.ONLINE_SOURCE_RECOVERY_API_FALLBACK = env.ONLINE_SOURCE_RECOVERY_API_FALLBACK || "true";
  }
  if (!env.DATABASE_URL && env.MAGISTRA_DB_DRIVER !== "pglite") {
    const detected = detectDockerDatabaseUrl();
    if (detected) {
      env.DATABASE_URL = detected;
      env.MAGISTRA_DESKTOP_DB_KIND = "docker-postgres";
    }
  }
  if (fs.existsSync(certPath)) {
    env.NODE_EXTRA_CA_CERTS = certPath;
  }
  else {
    delete env.NODE_EXTRA_CA_CERTS;
  }
  env.MAGISTRA_DESKTOP_NEEDS_BOOTSTRAP_INGEST =
    portableDatabase && portableDatabase.chunkCount === 0 && !portableDatabase.restoredSnapshot
      ? "true"
      : "false";
  return env;
}

function startDesktopWorker(root, env) {
  const hasDatabaseRuntime = Boolean(env.DATABASE_URL || env.MAGISTRA_DB_DRIVER === "pglite");
  if (env.DESKTOP_WORKER_ENABLED === "false" || !hasDatabaseRuntime) {
    return;
  }
  const workerCli = path.join(root, "packages", "worker", "dist", "cli.js");
  if (!fs.existsSync(workerCli)) {
    appendLog("worker.log", `worker CLI non trovato: ${workerCli}`);
    return;
  }
  const shouldBootstrap = env.MAGISTRA_DESKTOP_NEEDS_BOOTSTRAP_INGEST === "true" &&
    env.DESKTOP_WORKER_BOOTSTRAP_ON_EMPTY !== "false";
  const scheduleEnabled = env.DESKTOP_WORKER_SCHEDULE_ENABLED === "true";
  if (!shouldBootstrap && !scheduleEnabled) {
    appendLog("worker.log", "worker non avviato: nessun bootstrap o schedule richiesto");
    return;
  }
  const command = shouldBootstrap ? "ingest-once" : "schedule";
  const workerEnv = {
    ...env,
    WORKER_IMPORT_DATABASE: env.WORKER_IMPORT_DATABASE || "true",
    WORKER_MIGRATE_BEFORE_INGEST: env.WORKER_MIGRATE_BEFORE_INGEST || "false",
    WORKER_RUN_ONCE: shouldBootstrap ? "true" : env.WORKER_RUN_ONCE
  };
  appendLog("worker.log", `starting worker command=${command}`);
  workerProcess = spawn(process.execPath, [
    workerCli,
    command
  ], {
    cwd: root,
    env: workerEnv,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  workerProcess.stdout.on("data", (chunk) => appendLog("worker.out.log", chunk.toString()));
  workerProcess.stderr.on("data", (chunk) => appendLog("worker.err.log", chunk.toString()));
  workerProcess.once("exit", (code) => {
    appendLog("worker.log", `worker exited code=${code ?? "unknown"}`);
    workerProcess = undefined;
  });
}

async function startNextServer() {
  const root = runtimeRoot();
  const webRoot = path.join(root, "apps", "web");
  const nextBin = path.join(webRoot, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    throw new Error(`Build web non trovata: ${nextBin}`);
  }
  const port = await findFreePort();
  const env = await buildServerEnv(root, port);
  const url = `http://127.0.0.1:${port}`;
  fs.writeFileSync(logFilePath("server-url.txt"), url, "utf8");
  appendLog("main.log", `starting Next at ${url}`);
  serverProcess = spawn(process.execPath, [
    nextBin,
    "start",
    "-p",
    String(port),
    "-H",
    "127.0.0.1"
  ], {
    cwd: webRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  serverProcess.stdout.on("data", (chunk) => appendLog("server.out.log", chunk.toString()));
  serverProcess.stderr.on("data", (chunk) => appendLog("server.err.log", chunk.toString()));
  serverProcess.once("exit", (code) => {
    appendLog("main.log", `server exited code=${code ?? "unknown"}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog.showErrorBox(APP_NAME, `Il server locale si e' chiuso con codice ${code ?? "sconosciuto"}.`);
    }
  });
  startDesktopWorker(root, env);
  await waitForHttp(`${url}/api/health`);
  return url;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 700,
    title: APP_NAME,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.removeMenu();
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  return mainWindow;
}

function loadingHtml() {
  return `<!doctype html>
<html lang="it">
<meta charset="utf-8">
<title>${APP_NAME}</title>
<style>
body{margin:0;height:100vh;display:grid;place-items:center;font-family:Segoe UI,Arial,sans-serif;background:#10151f;color:#f7f7f3}
main{width:min(520px,calc(100vw - 48px));line-height:1.45}
h1{font-size:28px;margin:0 0 12px}
p{margin:0;color:#c8cfda}
</style>
<main><h1>${APP_NAME}</h1><p>Avvio del servizio locale in corso...</p></main>
</html>`;
}

app.whenReady().then(async () => {
  const window = createWindow();
  await window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml())}`);
  try {
    const url = await startNextServer();
    await window.loadURL(url);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    dialog.showErrorBox(APP_NAME, message);
    app.quit();
  }
});

app.on("before-quit", () => {
  if (workerProcess && !workerProcess.killed) {
    workerProcess.kill();
  }
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
  if (iurexaProcess && !iurexaProcess.killed) {
    iurexaProcess.kill();
  }
  stopPortablePostgres();
});

app.on("window-all-closed", () => {
  app.quit();
});
