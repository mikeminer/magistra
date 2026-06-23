import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

export interface OnlineRecoveryWorkerResult {
  chunkNormativi: number;
  jobId: string;
}

export async function importaUrnNormattivaTramiteWorker(
  urns: string[],
  env: NodeJS.ProcessEnv = process.env
): Promise<OnlineRecoveryWorkerResult> {
  const workerCli =
    env.ONLINE_SOURCE_RECOVERY_WORKER_CLI ??
    fileURLToPath(new URL("../../worker/dist/cli.js", import.meta.url));
  const timeoutMs = Number(env.ONLINE_SOURCE_RECOVERY_WORKER_TIMEOUT_MS ?? 180000);
  const output = await execFileJson(process.execPath, [workerCli, "recover-online", ...urns], {
    cwd: env.MAGISTRA_RUNTIME_ROOT || process.cwd(),
    env: {
      ...process.env,
      ...env,
      ONLINE_RECOVERY_URNS: JSON.stringify(urns),
      WORKER_IMPORT_DATABASE: "true",
      WORKER_MIGRATE_BEFORE_ONLINE_RECOVERY:
        env.WORKER_MIGRATE_BEFORE_ONLINE_RECOVERY ?? "false"
    },
    timeoutMs
  });

  return {
    chunkNormativi: Number(output.chunkNormativi ?? output.conteggi?.chunk_normativi ?? 0),
    jobId: String(output.jobId ?? "")
  };
}

async function execFileJson(
  file: string,
  args: string[],
  options: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    timeoutMs: number;
  }
): Promise<Record<string, any>> {
  const stdout = await new Promise<string>((resolve, reject) => {
    execFile(
      file,
      args,
      {
        cwd: options.cwd,
        env: options.env,
        maxBuffer: 20 * 1024 * 1024,
        timeout: options.timeoutMs,
        windowsHide: true
      },
      (error, stdoutValue, stderrValue) => {
        if (error) {
          const detail = stderrValue?.toString().trim();
          reject(new Error(detail ? `${error.message}: ${detail}` : error.message));
          return;
        }
        resolve(stdoutValue.toString());
      }
    );
  });
  const jsonStart = stdout.indexOf("{");
  if (jsonStart === -1) {
    throw new Error("Worker recupero online non ha restituito JSON.");
  }
  return JSON.parse(stdout.slice(jsonStart));
}
