const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_RUNTIME_DIR = "C:\\Users\\mikfo\\Documents\\IRONMIND\\build-ik\\Release";
const DEFAULT_MODEL_PATH = "C:\\Users\\mikfo\\Documents\\IRONMIND\\models\\iurexa-lite-IQ4_XS.gguf";
const REQUIRED_RUNTIME_FILES = [
  "iurexa-runtime.exe",
  "ironmind-ik-daemon.exe",
  "ironmind-ik-native.exe",
  "ggml.dll",
  "llama.dll"
];

function requireExistingFile(filePath, label) {
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} non trovato: ${filePath || "(non configurato)"}`);
  }
}

function copyFileWithDir(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function fileInfo(filePath) {
  const stat = fs.statSync(filePath);
  return {
    bytes: stat.size,
    file: path.basename(filePath)
  };
}

function main() {
  const runtimeDir = path.resolve(process.env.IUREXA_RUNTIME_DIR || DEFAULT_RUNTIME_DIR);
  const modelPath = path.resolve(process.env.IUREXA_MODEL_PATH || DEFAULT_MODEL_PATH);
  const outputDir = path.resolve(__dirname, "iurexa");
  const outputRuntimeDir = path.join(outputDir, "runtime");
  const outputModelsDir = path.join(outputDir, "models");
  const bundledModelName = process.env.IUREXA_BUNDLED_MODEL_NAME || "iurexa-lite.gguf";

  for (const fileName of REQUIRED_RUNTIME_FILES) {
    requireExistingFile(path.join(runtimeDir, fileName), `runtime Iurexa ${fileName}`);
  }
  requireExistingFile(modelPath, "modello locale leggero Iurexa GGUF");

  const modelBytes = fs.statSync(modelPath).size;
  if (modelBytes < 100 * 1024 * 1024) {
    throw new Error(`Il modello Iurexa sembra troppo piccolo per essere il GGUF finale: ${modelPath}`);
  }

  fs.rmSync(outputDir, { force: true, recursive: true });
  fs.mkdirSync(outputRuntimeDir, { recursive: true });
  fs.mkdirSync(outputModelsDir, { recursive: true });

  for (const fileName of REQUIRED_RUNTIME_FILES) {
    copyFileWithDir(path.join(runtimeDir, fileName), path.join(outputRuntimeDir, fileName));
  }

  const bundledModelPath = path.join(outputModelsDir, bundledModelName);
  copyFileWithDir(modelPath, bundledModelPath);

  const manifest = {
    createdAt: new Date().toISOString(),
    model: {
      bundledName: bundledModelName,
      source: modelPath,
      ...fileInfo(bundledModelPath)
    },
    runtime: REQUIRED_RUNTIME_FILES.map((fileName) => ({
      source: path.join(runtimeDir, fileName),
      ...fileInfo(path.join(outputRuntimeDir, fileName))
    }))
  };
  fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Iurexa runtime pronto: ${outputDir}`);
  console.log(`Modello incluso: ${bundledModelName} (${Math.round(modelBytes / 1024 / 1024)} MiB)`);
}

try {
  main();
}
catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error("Configura IUREXA_RUNTIME_DIR o IUREXA_MODEL_PATH se runtime/modello sono in una posizione diversa.");
  process.exit(1);
}
