const DEFAULT_SOURCE = {
  repo: "Italian-Builders-Org/magistra",
  branch: "dev",
  path: "knowledge",
};

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "magistra-vault-graph",
};

export default async function handler(request, response) {
  try {
    const url = new URL(request.url || "/api/vault", "http://localhost");
    const source = {
      repo: url.searchParams.get("repo") || DEFAULT_SOURCE.repo,
      branch: url.searchParams.get("branch") || DEFAULT_SOURCE.branch,
      path: normalizeVaultInput(url.searchParams.get("path") || DEFAULT_SOURCE.path),
    };
    const [owner, repoName] = parseRepo(source.repo);
    const treeJson = await fetchGithubTree(owner, repoName, source.branch);
    const markdownFiles = markdownEntriesFromTree(treeJson.tree || [], source.path);
    const files = await fetchMarkdownFiles(markdownFiles, owner, repoName, source.branch);

    sendJson(response, 200, {
      source: {
        ...source,
        owner,
        repoName,
      },
      mode: "github-live",
      truncated: Boolean(treeJson.truncated),
      fetchedAt: new Date().toISOString(),
      files,
    });
  } catch (error) {
    sendJson(response, statusForError(error), {
      error: error instanceof Error ? error.message : "Errore durante il caricamento del vault",
    });
  }
}

async function fetchGithubTree(owner, repoName, branch) {
  const encodedBranch = encodeURIComponent(branch);
  const treeResponse = await githubFetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/trees/${encodedBranch}?recursive=1`,
  );

  if (treeResponse.ok) {
    return treeResponse.json();
  }

  if (treeResponse.status !== 404) {
    await assertOk(treeResponse, "Tree GitHub non leggibile");
  }

  const branchResponse = await githubFetch(
    `https://api.github.com/repos/${owner}/${repoName}/branches/${encodedBranch}`,
  );
  await assertOk(branchResponse, "Branch GitHub non leggibile");
  const branchJson = await branchResponse.json();
  const treeSha = branchJson?.commit?.commit?.tree?.sha;
  if (!treeSha) throw new Error("Tree SHA non trovato nella risposta GitHub");

  const shaTreeResponse = await githubFetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/trees/${treeSha}?recursive=1`,
  );
  await assertOk(shaTreeResponse, "Tree GitHub non leggibile");
  return shaTreeResponse.json();
}

function markdownEntriesFromTree(tree, vaultPath) {
  const markdownFiles = tree
    .filter((entry) => entry.type === "blob")
    .filter((entry) => entry.path.startsWith(`${vaultPath}/`))
    .filter((entry) => entry.path.endsWith(".md"))
    .filter((entry) => !entry.path.includes("/.obsidian/"))
    .sort((a, b) => a.path.localeCompare(b.path, "it"));

  if (markdownFiles.length === 0) {
    throw new Error(`Nessun file Markdown trovato in ${vaultPath}`);
  }

  return markdownFiles;
}

async function fetchMarkdownFiles(entries, owner, repoName, branch) {
  const queue = [...entries];
  const results = [];
  const workers = Array.from({ length: Math.min(8, entries.length) }, async () => {
    while (queue.length > 0) {
      const entry = queue.shift();
      const path = entry.path
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repoName}/${encodeURIComponent(branch)}/${path}`,
        { headers: { "User-Agent": "magistra-vault-graph" }, cache: "no-store" },
      );
      await assertOk(response, `File non leggibile: ${entry.path}`);
      results.push({
        path: entry.path,
        sha: entry.sha,
        text: await response.text(),
      });
    }
  });

  await Promise.all(workers);
  return results.sort((a, b) => a.path.localeCompare(b.path, "it"));
}

function githubFetch(url) {
  const headers = { ...GITHUB_HEADERS };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return fetch(url, { headers, cache: "no-store" });
}

async function assertOk(response, message) {
  if (response.ok) return;
  const rateLimited = response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
  const detail = await response.json().then((body) => body?.message).catch(() => "");
  if (rateLimited) {
    throw Object.assign(new Error(`${message}: limite GitHub API esaurito (403)`), { statusCode: 503 });
  }
  throw Object.assign(new Error(detail ? `${message}: ${detail} (${response.status})` : `${message} (${response.status})`), {
    statusCode: response.status,
  });
}

function parseRepo(repo) {
  const parts = repo.split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw Object.assign(new Error("Formato repo atteso: owner/repository"), { statusCode: 400 });
  }
  return parts.map(encodeURIComponent);
}

function normalizeVaultInput(value) {
  return value.trim().replace(/^\/+|\/+$/g, "").replace(/\\/g, "/") || "knowledge";
}

function statusForError(error) {
  if (Number.isInteger(error?.statusCode)) return error.statusCode;
  return 500;
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(payload));
}
