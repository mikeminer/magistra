import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
export class FileSystemObjectStorage {
    options;
    constructor(options) {
        this.options = options;
    }
    async salvaArtefatto(input) {
        const percorso = join(this.options.baseDir, input.chiave);
        const body = Buffer.isBuffer(input.body) ? input.body : Buffer.from(input.body, "utf8");
        await mkdir(dirname(percorso), { recursive: true });
        await writeFile(percorso, body);
        return {
            chiave: input.chiave,
            dimensioneByte: body.byteLength,
            sha256: sha256(body),
            uri: `file://${percorso.replaceAll("\\", "/")}`
        };
    }
}
export class S3ObjectStorage {
    options;
    client;
    constructor(options) {
        this.options = options;
        this.client = new S3Client({
            credentials: {
                accessKeyId: options.accessKeyId,
                secretAccessKey: options.secretAccessKey
            },
            endpoint: options.endpoint,
            forcePathStyle: options.forcePathStyle ?? true,
            region: options.region
        });
    }
    async salvaArtefatto(input) {
        const body = Buffer.isBuffer(input.body) ? input.body : Buffer.from(input.body, "utf8");
        const bucket = input.bucket ?? this.options.bucket;
        await this.client.send(new PutObjectCommand({
            Body: body,
            Bucket: bucket,
            ContentType: input.contentType,
            Key: input.chiave,
            Metadata: {
                sha256: sha256(body),
                ...(input.metadati ?? {})
            }
        }));
        return {
            bucket,
            chiave: input.chiave,
            dimensioneByte: body.byteLength,
            sha256: sha256(body),
            uri: `s3://${bucket}/${input.chiave}`
        };
    }
}
export function creaArchiviazioneOggettiDaEnv(env = process.env) {
    const driver = env.OBJECT_STORAGE_DRIVER ?? "file";
    if (driver === "s3") {
        return new S3ObjectStorage({
            accessKeyId: requireEnv(env, "S3_ACCESS_KEY_ID"),
            bucket: requireEnv(env, "S3_BUCKET"),
            endpoint: env.S3_ENDPOINT,
            forcePathStyle: true,
            region: env.S3_REGION ?? "local",
            secretAccessKey: requireEnv(env, "S3_SECRET_ACCESS_KEY")
        });
    }
    return new FileSystemObjectStorage({
        baseDir: env.OBJECT_STORAGE_DIR ?? "artifacts/storage"
    });
}
export async function archiviaFontiCorpus(corpus, storage) {
    const risultati = [];
    for (const documento of corpus.documentiFonte) {
        risultati.push(await archiviaDocumentoFonte(documento, storage));
    }
    return risultati;
}
async function archiviaDocumentoFonte(documento, storage) {
    return storage.salvaArtefatto({
        body: documento.contenuto,
        chiave: `fonti/${documento.nomeFile}`,
        contentType: documento.contentType,
        metadati: {
            artefatto: documento.artefatto.id,
            fonte: documento.artefatto.fonte
        }
    });
}
function requireEnv(env, key) {
    const value = env[key];
    if (!value) {
        throw new Error(`Variabile d'ambiente obbligatoria mancante: ${key}`);
    }
    return value;
}
function sha256(body) {
    return createHash("sha256").update(body).digest("hex");
}
