module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/apps/web/src/lib/github-knowledge-graph.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadKnowledgeGraphFromGitHub",
    ()=>loadKnowledgeGraphFromGitHub
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
const DEFAULT_OWNER = "mikeminer";
const DEFAULT_REPO = "Italian-OSS-Legal-Platform";
const DEFAULT_BRANCH = "dev";
const DEFAULT_ROOT = "docs/okf";
const FALLBACK_BRANCHES = [
    "codex/knowledge-base-docs",
    "main",
    "master"
];
const FALLBACK_ROOTS = [
    "knowledge"
];
const API_BASE = "https://api.github.com";
async function loadKnowledgeGraphFromGitHub(env = process.env) {
    const owner = env.KNOWLEDGE_REPO_OWNER ?? DEFAULT_OWNER;
    const repo = env.KNOWLEDGE_REPO_NAME ?? DEFAULT_REPO;
    const requestedBranch = env.KNOWLEDGE_BRANCH ?? DEFAULT_BRANCH;
    const requestedRoot = normalizePath(env.KNOWLEDGE_ROOT ?? DEFAULT_ROOT);
    const branchCandidates = unique([
        requestedBranch,
        ...FALLBACK_BRANCHES
    ]);
    const rootCandidates = unique([
        requestedRoot,
        ...FALLBACK_ROOTS
    ]);
    let lastError = "";
    for (const branch of branchCandidates){
        const headers = createGitHubHeaders(env.GITHUB_TOKEN);
        try {
            const treeSha = await fetchBranchTreeSha({
                owner,
                repo,
                branch,
                headers
            });
            const tree = await fetchRepositoryTree({
                owner,
                repo,
                sha: treeSha,
                headers
            });
            for (const root of rootCandidates){
                const markdownItems = tree.filter((item)=>item.type === "blob" && item.path.startsWith(`${root}/`) && /\.(md|mdx)$/i.test(item.path));
                if (!markdownItems.length) {
                    lastError = `Nessun documento Markdown in ${branch}/${root}`;
                    continue;
                }
                const sources = await Promise.all(markdownItems.map(async (item)=>({
                        item,
                        content: await fetchBlobContent({
                            owner,
                            repo,
                            sha: item.sha,
                            headers
                        })
                    })));
                return buildKnowledgeGraph({
                    owner,
                    repo,
                    branch,
                    root,
                    sourceUrl: githubTreeUrl(owner, repo, branch, root),
                    documents: sources.map(({ item, content })=>createDocumentSource(item, content))
                });
            }
        } catch (error) {
            lastError = error instanceof Error ? error.message : "Errore sconosciuto";
        }
    }
    for (const root of rootCandidates){
        try {
            const documents = await loadDocumentsFromFilesystem(root);
            if (documents.length) {
                return buildKnowledgeGraph({
                    owner,
                    repo,
                    branch: requestedBranch,
                    root,
                    sourceUrl: githubTreeUrl(owner, repo, requestedBranch, root),
                    documents
                });
            }
        } catch (error) {
            lastError = error instanceof Error ? error.message : lastError;
        }
    }
    return createErrorGraph({
        owner,
        repo,
        branch: requestedBranch,
        root: requestedRoot,
        sourceUrl: githubTreeUrl(owner, repo, requestedBranch, requestedRoot),
        error: lastError || "Knowledge base non trovata"
    });
}
async function fetchBranchTreeSha(input) {
    const response = await fetch(`${API_BASE}/repos/${input.owner}/${input.repo}/branches/${encodeURIComponent(input.branch)}`, {
        headers: input.headers,
        next: {
            revalidate: 900
        }
    });
    if (!response.ok) {
        throw new Error(`Branch GitHub non leggibile (${response.status})`);
    }
    const payload = await response.json();
    if (!payload.commit?.commit?.tree?.sha) {
        throw new Error("La risposta GitHub non contiene lo SHA dell'albero");
    }
    return payload.commit.commit.tree.sha;
}
async function fetchRepositoryTree(input) {
    const response = await fetch(`${API_BASE}/repos/${input.owner}/${input.repo}/git/trees/${input.sha}?recursive=1`, {
        headers: input.headers,
        next: {
            revalidate: 900
        }
    });
    if (!response.ok) {
        throw new Error(`Albero GitHub non leggibile (${response.status})`);
    }
    const payload = await response.json();
    return payload.tree ?? [];
}
async function fetchBlobContent(input) {
    const response = await fetch(`${API_BASE}/repos/${input.owner}/${input.repo}/git/blobs/${input.sha}`, {
        headers: input.headers,
        next: {
            revalidate: 900
        }
    });
    if (!response.ok) {
        throw new Error(`Documento knowledge non leggibile (${response.status})`);
    }
    const payload = await response.json();
    if (payload.encoding !== "base64" || !payload.content) {
        throw new Error("Blob GitHub in formato non supportato");
    }
    return Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf8");
}
async function loadDocumentsFromFilesystem(root) {
    const repositoryRoot = process.cwd();
    const rootDir = localRootDirectory(repositoryRoot, root);
    if (!rootDir) {
        return [];
    }
    const filePaths = await walkMarkdownFiles(rootDir);
    return Promise.all(filePaths.map(async (filePath)=>{
        const content = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(filePath, "utf8");
        const relativePath = normalizePath((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["relative"])(repositoryRoot, filePath));
        const item = {
            path: relativePath,
            type: "blob",
            sha: `local:${relativePath}`,
            size: Buffer.byteLength(content)
        };
        return createDocumentSource(item, content);
    }));
}
function localRootDirectory(repositoryRoot, root) {
    if (root === "docs/okf") {
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(repositoryRoot, "docs", "okf");
    }
    if (root === "knowledge") {
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(repositoryRoot, "knowledge");
    }
    return undefined;
}
async function walkMarkdownFiles(directory) {
    const entries = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readdir"])(directory, {
        withFileTypes: true
    });
    const files = await Promise.all(entries.map(async (entry)=>{
        const entryPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(directory, entry.name);
        if (entry.isDirectory()) {
            return walkMarkdownFiles(entryPath);
        }
        return /\.(md|mdx)$/i.test(entry.name) ? [
            entryPath
        ] : [];
    }));
    return files.flat();
}
function createDocumentSource(item, content) {
    const frontmatter = extractFrontmatter(content);
    return {
        item,
        content,
        title: frontmatter.title ?? extractHeading(content) ?? titleFromPath(item.path),
        summary: frontmatter.description ?? extractSummary(content),
        tags: frontmatter.tags
    };
}
function buildKnowledgeGraph(input) {
    const nodes = new Map();
    const edges = new Map();
    const documentIdsByPath = new Map();
    const rootId = `root:${input.root}`;
    nodes.set(rootId, {
        id: rootId,
        label: input.root,
        type: "root",
        path: input.root,
        url: input.sourceUrl,
        summary: "Radice della knowledge base pubblicata sul branch GitHub."
    });
    for (const document of input.documents){
        ensureFolderChain({
            nodes,
            edges,
            root: input.root,
            filePath: document.item.path
        });
        const docId = `doc:${document.item.path}`;
        documentIdsByPath.set(document.item.path, docId);
        nodes.set(docId, {
            id: docId,
            label: document.title,
            type: "document",
            path: document.item.path,
            url: githubFileUrl(input.owner, input.repo, input.branch, document.item.path),
            summary: document.summary,
            tags: document.tags,
            size: document.item.size
        });
        const folderPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["posix"].dirname(document.item.path);
        addEdge(edges, {
            source: folderPath === "." ? rootId : `folder:${folderPath}`,
            target: docId,
            type: "contains",
            label: "contiene"
        });
    }
    for (const document of input.documents){
        const docId = documentIdsByPath.get(document.item.path);
        if (!docId) {
            continue;
        }
        for (const tag of document.tags){
            const tagId = tagNodeId(tag);
            if (!nodes.has(tagId)) {
                nodes.set(tagId, {
                    id: tagId,
                    label: tag,
                    type: "tag",
                    summary: "Concetto ricorrente nel frontmatter della knowledge base."
                });
            }
            addEdge(edges, {
                source: docId,
                target: tagId,
                type: "tagged",
                label: "tema"
            });
        }
        for (const targetPath of extractMarkdownTargets(document.content, document.item.path)){
            const targetId = documentIdsByPath.get(targetPath);
            if (targetId && targetId !== docId) {
                addEdge(edges, {
                    source: docId,
                    target: targetId,
                    type: "references",
                    label: "rimanda a"
                });
            }
        }
    }
    const nodeList = [
        ...nodes.values()
    ];
    const edgeList = [
        ...edges.values()
    ];
    return {
        generatedAt: new Date().toISOString(),
        owner: input.owner,
        repo: input.repo,
        branch: input.branch,
        root: input.root,
        sourceUrl: input.sourceUrl,
        nodes: nodeList,
        edges: edgeList,
        stats: {
            folders: nodeList.filter((node)=>node.type === "folder").length,
            documents: nodeList.filter((node)=>node.type === "document").length,
            tags: nodeList.filter((node)=>node.type === "tag").length,
            references: edgeList.filter((edge)=>edge.type === "references").length
        }
    };
}
function ensureFolderChain(input) {
    const parts = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["posix"].dirname(input.filePath).split("/").filter(Boolean);
    let currentPath = "";
    let previousId = `root:${input.root}`;
    for (const part of parts){
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (currentPath === input.root) {
            previousId = `root:${input.root}`;
            continue;
        }
        const folderId = `folder:${currentPath}`;
        if (!input.nodes.has(folderId)) {
            input.nodes.set(folderId, {
                id: folderId,
                label: titleFromPath(currentPath),
                type: "folder",
                path: currentPath,
                summary: "Sezione della knowledge base."
            });
        }
        addEdge(input.edges, {
            source: previousId,
            target: folderId,
            type: "contains",
            label: "contiene"
        });
        previousId = folderId;
    }
}
function addEdge(edges, edge) {
    const id = `${edge.type}:${edge.source}->${edge.target}`;
    edges.set(id, {
        ...edge,
        id
    });
}
function extractFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
    if (!match) {
        return {
            tags: []
        };
    }
    const frontmatter = match[1] ?? "";
    const title = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim();
    const description = frontmatter.match(/^(?:description|summary):\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim();
    const tags = extractTags(frontmatter);
    return {
        title,
        description,
        tags
    };
}
function extractTags(frontmatter) {
    const inline = frontmatter.match(/^tags:\s*\[(.*?)\]\s*$/m)?.[1];
    if (inline) {
        return cleanTags(inline.split(","));
    }
    const block = frontmatter.match(/^tags:\s*\n((?:\s*-\s*.+\n?)+)/m)?.[1];
    if (block) {
        return cleanTags(block.split("\n").map((line)=>line.replace(/^\s*-\s*/, "")).filter(Boolean));
    }
    const single = frontmatter.match(/^tags:\s*(.+)$/m)?.[1];
    return single ? cleanTags(single.split(",")) : [];
}
function cleanTags(tags) {
    return [
        ...new Set(tags.map((tag)=>stripQuotes(tag.trim())).filter(Boolean))
    ];
}
function extractHeading(content) {
    const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
    return heading ? stripMarkdown(heading) : undefined;
}
function extractSummary(content) {
    const withoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*/, "");
    const paragraph = withoutFrontmatter.split(/\n{2,}/).map((part)=>part.trim()).find((part)=>part && !part.startsWith("#") && !part.startsWith("|"));
    return stripMarkdown(paragraph ?? "").slice(0, 220);
}
function extractMarkdownTargets(content, sourcePath) {
    const targets = new Set();
    const sourceDir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["posix"].dirname(sourcePath);
    const linkPattern = /\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g;
    let match;
    while((match = linkPattern.exec(content)) !== null){
        const href = match[1]?.trim();
        if (!href) {
            continue;
        }
        if (/^(?:https?:|mailto:|#)/i.test(href)) {
            continue;
        }
        const resolved = normalizePath(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["posix"].normalize(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["posix"].join(sourceDir, href)));
        if (/\.(md|mdx)$/i.test(resolved)) {
            targets.add(resolved);
        }
    }
    return [
        ...targets
    ];
}
function createGitHubHeaders(token) {
    return {
        accept: "application/vnd.github+json",
        ...token ? {
            authorization: `Bearer ${token}`
        } : {}
    };
}
function unique(values) {
    return [
        ...new Set(values.filter(Boolean))
    ];
}
function createErrorGraph(input) {
    return {
        generatedAt: new Date().toISOString(),
        owner: input.owner,
        repo: input.repo,
        branch: input.branch,
        root: input.root,
        sourceUrl: input.sourceUrl,
        nodes: [
            {
                id: `root:${input.root}`,
                label: input.root,
                type: "root",
                path: input.root,
                url: input.sourceUrl,
                summary: "La knowledge base GitHub non e' stata leggibile in questo momento."
            }
        ],
        edges: [],
        stats: {
            folders: 0,
            documents: 0,
            tags: 0,
            references: 0
        },
        error: input.error
    };
}
function githubFileUrl(owner, repo, branch, filePath) {
    return `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;
}
function githubTreeUrl(owner, repo, branch, root) {
    return `https://github.com/${owner}/${repo}/tree/${branch}/${root}`;
}
function tagNodeId(tag) {
    return `tag:${tag.toLowerCase().replace(/[^a-z0-9-]+/gi, "-")}`;
}
function titleFromPath(value) {
    const fileName = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["posix"].basename(value).replace(/\.(md|mdx)$/i, "");
    return fileName.split(/[-_]/).filter(Boolean).map((part)=>part.slice(0, 1).toUpperCase() + part.slice(1)).join(" ");
}
function stripMarkdown(value) {
    return value.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[>#*_]/g, "").trim();
}
function stripQuotes(value) {
    return value.replace(/^["']|["']$/g, "");
}
function normalizePath(value) {
    return value.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
}
}),
"[project]/apps/web/src/app/api/knowledge-graph/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$github$2d$knowledge$2d$graph$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/github-knowledge-graph.ts [app-route] (ecmascript)");
;
const revalidate = 900;
async function GET() {
    const graph = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$github$2d$knowledge$2d$graph$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadKnowledgeGraphFromGitHub"])();
    return Response.json(graph, {
        headers: {
            "cache-control": "public, s-maxage=900, stale-while-revalidate=3600"
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ledsto._.js.map