const { app, BrowserWindow, dialog, shell } = require("electron");
const { execFileSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

const APP_NAME = "Magistra";
const DOCKER_POSTGRES_CONTAINER = "italian-oss-legal-platform-postgres-1";
let serverProcess;
let mainWindow;

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

function resolveDesktopLlmBaseUrl(fileEnv) {
  const configured = process.env.LLM_BASE_URL || fileEnv.LLM_BASE_URL;
  if (!configured || /host\.docker\.internal/i.test(configured)) {
    return "http://127.0.0.1:11434/v1";
  }
  return configured;
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

function buildServerEnv(root, port) {
  const fileEnv = readEnvFile(path.join(root, ".env"));
  const storageDir = path.join(app.getPath("userData"), "storage");
  fs.mkdirSync(storageDir, { recursive: true });
  const certPath = path.join(root, "certs", "local-ca.pem");
  const env = {
    ...process.env,
    ...fileEnv,
    ELECTRON_RUN_AS_NODE: "1",
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    PORT: String(port),
    ONLINE_SOURCE_RECOVERY_ENABLED: "true",
    OBJECT_STORAGE_DIR: storageDir,
    LLM_PROVIDER: fileEnv.LLM_PROVIDER || process.env.LLM_PROVIDER || "ollama",
    LLM_BASE_URL: resolveDesktopLlmBaseUrl(fileEnv),
    LLM_MODEL: fileEnv.LLM_MODEL || process.env.LLM_MODEL || "llama3.2:latest",
    LLM_API_FORMAT: fileEnv.LLM_API_FORMAT || process.env.LLM_API_FORMAT || "chat",
    LLM_TEMPERATURE: fileEnv.LLM_TEMPERATURE || process.env.LLM_TEMPERATURE || "0.1",
    LLM_MAX_OUTPUT_TOKENS: fileEnv.LLM_MAX_OUTPUT_TOKENS || process.env.LLM_MAX_OUTPUT_TOKENS || "700",
    NODE_PATH: path.join(root, "node_modules")
  };
  if (!env.DATABASE_URL) {
    const detected = detectDockerDatabaseUrl();
    if (detected) {
      env.DATABASE_URL = detected;
    }
  }
  if (fs.existsSync(certPath)) {
    env.NODE_EXTRA_CA_CERTS = certPath;
  }
  return env;
}

async function startNextServer() {
  const root = runtimeRoot();
  const webRoot = path.join(root, "apps", "web");
  const nextBin = path.join(webRoot, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    throw new Error(`Build web non trovata: ${nextBin}`);
  }
  const port = await findFreePort();
  const env = buildServerEnv(root, port);
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
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
