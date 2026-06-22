import { aggiornaReview, accodaReview, leggiDocumentoUtente, leggiFonte, leggiReviewQueue, listaDocumentiUtente, salvaDocumentoUtente, rispondiConFonti } from "@italian-oss-legal-platform/backend";
import { leggiStatoIngestDaEnv } from "@italian-oss-legal-platform/worker/status";
import express from "express";
const app = express();
const port = Number(process.env.PORT ?? 4000);
app.disable("x-powered-by");
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT ?? "12mb" }));
app.use((request, response, next) => {
    const iniziataIl = Date.now();
    response.on("finish", () => {
        console.log(JSON.stringify({
            durataMs: Date.now() - iniziataIl,
            metodo: request.method,
            path: request.path,
            servizio: "api",
            stato: response.statusCode
        }));
    });
    next();
});
app.get("/health", (_request, response) => {
    response.json({
        servizio: "api",
        stato: "ok"
    });
});
app.post("/ask", async (request, response, next) => {
    try {
        const domanda = String(request.body?.domanda ?? "").trim();
        if (!domanda) {
            response.status(400).json({ errore: "La domanda è obbligatoria." });
            return;
        }
        response.json(await rispondiConFonti(domanda));
    }
    catch (error) {
        next(error);
    }
});
app.get("/sources/:id", async (request, response, next) => {
    try {
        const result = await leggiFonte(request.params.id);
        response.status(result.status).json(result.body);
    }
    catch (error) {
        next(error);
    }
});
app.get("/ingest/status", async (_request, response, next) => {
    try {
        response.json(await leggiStatoIngestDaEnv());
    }
    catch (error) {
        next(error);
    }
});
app.get("/review/queue", async (request, response, next) => {
    try {
        const result = await leggiReviewQueue(process.env, tokenOperatore(request));
        response.status(result.status).json(result.body);
    }
    catch (error) {
        next(error);
    }
});
app.post("/review/queue", async (request, response, next) => {
    try {
        const result = await accodaReview(request.body ?? null);
        response.status(result.status).json(result.body);
    }
    catch (error) {
        next(error);
    }
});
app.patch("/review/queue/:id", async (request, response, next) => {
    try {
        const result = await aggiornaReview(request.params.id, request.body ?? null, process.env, tokenOperatore(request));
        response.status(result.status).json(result.body);
    }
    catch (error) {
        next(error);
    }
});
app.get("/documents", async (request, response, next) => {
    try {
        const result = await listaDocumentiUtente(process.env, tokenOperatore(request));
        response.status(result.status).json(result.body);
    }
    catch (error) {
        next(error);
    }
});
app.post("/documents", async (request, response, next) => {
    try {
        const result = await salvaDocumentoUtente(request.body ?? null, process.env, tokenOperatore(request));
        response.status(result.status).json(result.body);
    }
    catch (error) {
        next(error);
    }
});
app.get("/documents/:id", async (request, response, next) => {
    try {
        const result = await leggiDocumentoUtente(request.params.id, process.env, tokenOperatore(request));
        response.status(result.status).json(result.body);
    }
    catch (error) {
        next(error);
    }
});
app.use((error, _request, response, _next) => {
    response.status(500).json({
        errore: error instanceof Error ? error.message : "Errore backend inatteso.",
        stato: "errore"
    });
});
app.listen(port, "0.0.0.0", () => {
    console.log(`API Express pronta sulla porta ${port}.`);
});
function tokenOperatore(request) {
    const value = request.header("x-admin-token") ?? request.header("authorization");
    if (!value) {
        return undefined;
    }
    return value.replace(/^Bearer\s+/i, "").trim();
}
