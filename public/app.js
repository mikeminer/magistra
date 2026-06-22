import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const DEFAULT_SOURCE = {
  repo: "Italian-Builders-Org/magistra",
  branch: "dev",
  path: "knowledge",
};

const GROUP_COLORS = new Map([
  ["architettura", "#69b7f5"],
  ["fonti", "#efc65a"],
  ["funzionalita", "#ee748a"],
  ["glossario", "#dedc76"],
  ["modello-dati", "#62d9a8"],
  ["requisiti", "#a994f2"],
  ["radice", "#f3f1ea"],
  ["tag", "#d980d2"],
  ["unresolved", "#858b92"],
]);

const canvas = document.querySelector("#graph-canvas");
const labelLayer = document.querySelector("#label-layer");
const sourceForm = document.querySelector("#sourceForm");
const repoInput = document.querySelector("#repoInput");
const branchInput = document.querySelector("#branchInput");
const pathInput = document.querySelector("#pathInput");
const sourceLabel = document.querySelector("#sourceLabel");
const githubLink = document.querySelector("#githubLink");
const searchInput = document.querySelector("#searchInput");
const groupFilter = document.querySelector("#groupFilter");
const showTags = document.querySelector("#showTags");
const showUnresolved = document.querySelector("#showUnresolved");
const linkStrength = document.querySelector("#linkStrength");
const statsPanel = document.querySelector("#statsPanel");
const detailPanel = document.querySelector("#detailPanel");
const statusBox = document.querySelector("#statusBox");
const tooltip = document.querySelector("#tooltip");
const resetCamera = document.querySelector("#resetCamera");
const settleLayout = document.querySelector("#settleLayout");
const focusSelected = document.querySelector("#focusSelected");

const state = {
  source: readSourceFromUrl(),
  graph: emptyGraph(),
  view: emptyGraph(),
  selectedId: null,
  localFocusId: null,
  hoveredId: null,
  search: "",
  group: "all",
  simulationSteps: 0,
  springLength: Number(linkStrength.value),
};

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 2200);
camera.position.set(0, 38, 178);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  preserveDrawingBuffer: true,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x0d0f10, 1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.45;
controls.zoomSpeed = 0.68;
controls.panSpeed = 0.55;

const graphRoot = new THREE.Group();
scene.add(graphRoot);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
keyLight.position.set(80, 120, 90);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x62d9a8, 1.7, 460);
rimLight.position.set(-110, -30, 90);
scene.add(rimLight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const nodeObjects = new Map();
const nodeLabels = new Map();
const nodeMaterials = new Map();
const velocities = new Map();
let lineSegments = null;
let linePositions = null;
let lineColors = null;
let animationFrame = 0;

init();

function init() {
  window.lucide?.createIcons();
  applySourceToInputs();
  resize();
  window.addEventListener("resize", resize);

  sourceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.source = {
      repo: repoInput.value.trim() || DEFAULT_SOURCE.repo,
      branch: branchInput.value.trim() || DEFAULT_SOURCE.branch,
      path: normalizeVaultInput(pathInput.value || DEFAULT_SOURCE.path),
    };
    writeSourceToUrl();
    loadVault();
  });

  searchInput.addEventListener("input", () => {
    state.search = searchInput.value.trim().toLowerCase();
    updateMaterials();
    updateStats();
  });

  groupFilter.addEventListener("change", () => {
    state.group = groupFilter.value;
    state.selectedId = null;
    state.localFocusId = null;
    refreshView();
  });

  showTags.addEventListener("change", refreshView);
  showUnresolved.addEventListener("change", refreshView);
  linkStrength.addEventListener("input", () => {
    state.springLength = Number(linkStrength.value);
    state.simulationSteps = 240;
  });

  resetCamera.addEventListener("click", resetCameraView);
  settleLayout.addEventListener("click", () => {
    state.simulationSteps = 480;
    setStatus("Layout in stabilizzazione");
  });
  focusSelected.addEventListener("click", () => {
    if (state.selectedId) {
      focusNode(state.selectedId);
    }
  });

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", () => setHovered(null));
  canvas.addEventListener("click", () => {
    if (state.hoveredId) {
      selectNode(state.hoveredId);
    }
  });

  updateDetail();
  loadVault();
  animate();
}

function emptyGraph() {
  return {
    nodes: [],
    links: [],
    groups: [],
    source: null,
    truncated: false,
    fetchedAt: null,
  };
}

function readSourceFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    repo: params.get("repo") || DEFAULT_SOURCE.repo,
    branch: params.get("branch") || DEFAULT_SOURCE.branch,
    path: normalizeVaultInput(params.get("path") || DEFAULT_SOURCE.path),
  };
}

function writeSourceToUrl() {
  const params = new URLSearchParams();
  if (state.source.repo !== DEFAULT_SOURCE.repo) params.set("repo", state.source.repo);
  if (state.source.branch !== DEFAULT_SOURCE.branch) params.set("branch", state.source.branch);
  if (state.source.path !== DEFAULT_SOURCE.path) params.set("path", state.source.path);
  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

function applySourceToInputs() {
  repoInput.value = state.source.repo;
  branchInput.value = state.source.branch;
  pathInput.value = state.source.path;
  updateSourceLabels();
}

function updateSourceLabels() {
  sourceLabel.textContent = `${state.source.repo} · ${state.source.branch} · ${state.source.path}`;
  githubLink.href = `https://github.com/${state.source.repo}/tree/${encodeURIComponent(state.source.branch)}/${state.source.path}`;
}

function normalizeVaultInput(value) {
  return value.trim().replace(/^\/+|\/+$/g, "").replace(/\\/g, "/") || "knowledge";
}

async function loadVault() {
  try {
    state.selectedId = null;
    state.localFocusId = null;
    applySourceToInputs();
    setStatus("Caricamento vault...");

    const [owner, repoName] = parseRepo(state.source.repo);
    const vault = await loadVaultFiles(owner, repoName);
    state.graph = buildObsidianGraph(vault.files, {
      ...state.source,
      owner,
      repoName,
      truncated: vault.truncated,
    });

    populateGroupFilter(state.graph.groups);
    refreshView();
    setStatus(
      vault.truncated
        ? "Vault caricato; GitHub segnala tree troncato"
        : vault.mode === "bundled"
          ? `Vault caricato: ${state.graph.nodes.filter((node) => node.kind === "note").length} note (snapshot incluso)`
          : `Vault caricato: ${state.graph.nodes.filter((node) => node.kind === "note").length} note`,
      vault.truncated ? "warn" : "normal",
    );
  } catch (error) {
    console.error(error);
    setStatus(error instanceof Error ? error.message : "Errore durante il caricamento", "error");
    state.graph = emptyGraph();
    refreshView();
  }
}

async function loadVaultFiles(owner, repoName) {
  const bundled = await loadBundledVaultFiles();
  if (bundled) return bundled;

  return loadGithubVaultFiles(owner, repoName);
}

async function loadGithubVaultFiles(owner, repoName) {
  const branch = encodeURIComponent(state.source.branch);
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const branchResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/branches/${branch}`,
    { headers, cache: "no-store" },
  );
  assertOk(branchResponse, "Branch GitHub non leggibile");
  const branchJson = await branchResponse.json();
  const treeSha = branchJson?.commit?.commit?.tree?.sha;
  if (!treeSha) throw new Error("Tree SHA non trovato nella risposta GitHub");

  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/trees/${treeSha}?recursive=1`,
    { headers, cache: "no-store" },
  );
  assertOk(treeResponse, "Tree GitHub non leggibile");
  const treeJson = await treeResponse.json();
  const markdownFiles = markdownEntriesFromTree(treeJson.tree || []);

  setStatus(`Lettura di ${markdownFiles.length} note Markdown...`);
  return {
    files: await fetchMarkdownFiles(markdownFiles, owner, repoName, state.source.branch),
    mode: "github",
    truncated: Boolean(treeJson.truncated),
  };
}

async function loadBundledVaultFiles() {
  const response = await fetch("/vault-data.json", { cache: "no-store" });
  if (!response.ok) return null;

  const snapshot = await response.json();
  if (!snapshotMatchesSource(snapshot)) return null;
  const files = Array.isArray(snapshot.files) ? snapshot.files : [];
  if (files.length === 0) return null;
  setStatus(`Uso snapshot incluso del vault (${files.length} note)...`);

  return {
    files,
    mode: "bundled",
    truncated: Boolean(snapshot.truncated),
  };
}

function snapshotMatchesSource(snapshot) {
  const source = snapshot?.source || {};
  const aliases = Array.isArray(source.aliases) ? source.aliases : [];
  const repos = [source.repo, ...aliases].filter(Boolean).map((repo) => repo.toLowerCase());
  return (
    repos.includes(state.source.repo.toLowerCase())
    && source.branch === state.source.branch
    && normalizeVaultInput(source.path || "") === state.source.path
  );
}

function markdownEntriesFromTree(tree) {
  const vaultPath = state.source.path;
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

function parseRepo(repo) {
  const parts = repo.split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error("Formato repo atteso: owner/repository");
  }
  return parts.map(encodeURIComponent);
}

function assertOk(response, message) {
  if (!response.ok) {
    const rateLimited = response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
    throw new Error(rateLimited ? `${message}: limite GitHub API esaurito (403)` : `${message} (${response.status})`);
  }
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
        { cache: "no-store" },
      );
      assertOk(response, `File non leggibile: ${entry.path}`);
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

function buildObsidianGraph(files, source) {
  const notes = files.map((file) => parseMarkdownNote(file, source.path));
  const resolver = createResolver(notes);
  const nodes = new Map(notes.map((note) => [note.id, note]));
  const links = new Map();
  const tagLinks = new Map();
  const tagNodes = new Map();

  for (const note of notes) {
    for (const link of note.outgoing) {
      const targetId = resolver.resolve(link.target, note.id, link.mode);
      if (!targetId) continue;

      if (!nodes.has(targetId)) {
        nodes.set(targetId, {
          id: targetId,
          title: cleanUnresolvedTitle(targetId),
          path: null,
          vaultPath: targetId.replace(/^unresolved:/, ""),
          group: "unresolved",
          kind: "unresolved",
          tags: [],
          type: "Collegamento non risolto",
          description: "",
          outgoing: [],
          degree: 0,
        });
      }

      const key = `${note.id}->${targetId}:${link.mode}`;
      if (note.id !== targetId && !links.has(key)) {
        links.set(key, {
          id: key,
          source: note.id,
          target: targetId,
          mode: link.mode,
        });
      }
    }

    for (const tag of note.tags) {
      const normalizedTag = tag.replace(/^#/, "").trim();
      if (!normalizedTag) continue;
      const tagId = `tag:${normalizedTag}`;
      if (!tagNodes.has(tagId)) {
        tagNodes.set(tagId, {
          id: tagId,
          title: `#${normalizedTag}`,
          path: null,
          vaultPath: `#${normalizedTag}`,
          group: "tag",
          kind: "tag",
          tags: [],
          type: "Tag Obsidian",
          description: "",
          outgoing: [],
          degree: 0,
        });
      }
      const key = `${note.id}->${tagId}:tag`;
      tagLinks.set(key, { id: key, source: note.id, target: tagId, mode: "tag" });
    }
  }

  const allNodes = [...nodes.values(), ...tagNodes.values()];
  const allLinks = [...links.values(), ...tagLinks.values()];
  computeDegree(allNodes, allLinks);

  return {
    nodes: allNodes,
    links: allLinks,
    groups: [...new Set(notes.map((note) => note.group))].sort((a, b) => a.localeCompare(b, "it")),
    source,
    truncated: source.truncated,
    fetchedAt: new Date().toISOString(),
  };
}

function parseMarkdownNote(file, vaultRoot) {
  const vaultPath = file.path.slice(vaultRoot.length + 1).replace(/\\/g, "/");
  const id = `/${vaultPath}`;
  const { frontmatter, body } = parseFrontmatter(file.text);
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const title = asText(frontmatter.title) || heading || titleFromPath(vaultPath);
  const group = vaultPath.includes("/") ? vaultPath.split("/")[0] : "radice";

  return {
    id,
    title,
    path: file.path,
    vaultPath,
    group,
    kind: "note",
    type: asText(frontmatter.type) || "Nota",
    description: asText(frontmatter.description) || "",
    resource: asText(frontmatter.resource) || "",
    version: asText(frontmatter.version) || "",
    tags: parseTags(frontmatter.tags),
    raw: file.text,
    body,
    outgoing: extractLinks(body),
    degree: 0,
    sha: file.sha,
  };
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) {
    return { frontmatter: {}, body: text };
  }

  const end = text.indexOf("\n---", 3);
  if (end === -1) {
    return { frontmatter: {}, body: text };
  }

  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4);
  const frontmatter = {};

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    frontmatter[key] = parseYamlValue(value);
  }

  return { frontmatter, body };
}

function parseYamlValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }
  return stripQuotes(trimmed);
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function asText(value) {
  if (Array.isArray(value)) return value.join(", ");
  return typeof value === "string" ? value : "";
}

function parseTags(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,\s]+/)
      .map((tag) => tag.replace(/^\[|\]$/g, "").trim())
      .filter(Boolean);
  }
  return [];
}

function extractLinks(markdown) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "");
  const links = [];
  const wikiPattern = /(!?)\[\[([^\]]+)\]\]/g;
  const markdownPattern = /(!?)\[[^\]]*]\(([^)]+)\)/g;
  let match;

  while ((match = wikiPattern.exec(text))) {
    const target = match[2].split("|")[0].split("#")[0].trim();
    if (target) {
      links.push({ target, mode: match[1] ? "embed" : "wiki" });
    }
  }

  while ((match = markdownPattern.exec(text))) {
    const target = match[2].split("#")[0].trim();
    if (!target || isExternalTarget(target)) continue;
    links.push({ target, mode: match[1] ? "embed" : "markdown" });
  }

  return links;
}

function isExternalTarget(target) {
  return /^(https?:|mailto:|tel:|#)/i.test(target);
}

function createResolver(notes) {
  const exact = new Map();
  const withoutExt = new Map();
  const basename = new Map();

  for (const note of notes) {
    const key = note.id.toLowerCase();
    exact.set(key, note.id);
    withoutExt.set(key.replace(/\.md$/i, ""), note.id);

    const base = note.vaultPath.split("/").pop().replace(/\.md$/i, "").toLowerCase();
    if (!basename.has(base)) basename.set(base, []);
    basename.get(base).push(note.id);
  }

  function resolve(rawTarget, sourceId, mode) {
    const clean = cleanTarget(rawTarget);
    if (!clean) return null;
    if (isNonMarkdownAsset(clean)) return null;

    const candidates = candidatePaths(clean, sourceId, mode);
    for (const candidate of candidates) {
      const normalized = `/${normalizeVaultPath(candidate)}`.toLowerCase();
      if (exact.has(normalized)) return exact.get(normalized);
      if (withoutExt.has(normalized.replace(/\.md$/i, ""))) {
        return withoutExt.get(normalized.replace(/\.md$/i, ""));
      }
    }

    const base = clean.split("/").pop().replace(/\.md$/i, "").toLowerCase();
    const matches = basename.get(base);
    if (matches?.length === 1) {
      return matches[0];
    }

    return `unresolved:${clean.replace(/\.md$/i, "")}`;
  }

  return { resolve };
}

function cleanTarget(target) {
  try {
    return decodeURIComponent(target)
      .replace(/\\/g, "/")
      .replace(/^knowledge\//, "")
      .replace(/^\/+/, "")
      .trim();
  } catch {
    return target.replace(/\\/g, "/").replace(/^knowledge\//, "").replace(/^\/+/, "").trim();
  }
}

function isNonMarkdownAsset(target) {
  return /\.[A-Za-z0-9]+$/.test(target) && !/\.md$/i.test(target);
}

function candidatePaths(target, sourceId, mode) {
  const sourcePath = sourceId.replace(/^\//, "");
  const sourceDir = sourcePath.includes("/") ? sourcePath.split("/").slice(0, -1).join("/") : "";
  const candidates = [];

  if (target.startsWith("./") || target.startsWith("../")) {
    candidates.push(`${sourceDir}/${target}`);
  } else if (mode === "markdown" && !target.startsWith("/") && !target.includes("/")) {
    candidates.push(`${sourceDir}/${target}`);
    candidates.push(target);
  } else if (target.includes("/")) {
    candidates.push(target);
    candidates.push(`${sourceDir}/${target}`);
  } else {
    candidates.push(`${sourceDir}/${target}`);
    candidates.push(target);
  }

  return [...new Set(candidates.flatMap((candidate) => {
    const normalized = normalizeVaultPath(candidate);
    return /\.md$/i.test(normalized) ? [normalized] : [normalized, `${normalized}.md`];
  }))];
}

function normalizeVaultPath(value) {
  const parts = [];
  for (const part of value.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}

function titleFromPath(filePath) {
  return filePath
    .split("/")
    .pop()
    .replace(/\.md$/i, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cleanUnresolvedTitle(id) {
  return id.replace(/^unresolved:/, "").split("/").pop();
}

function computeDegree(nodes, links) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const node of nodes) node.degree = 0;
  for (const link of links) {
    byId.get(link.source) && (byId.get(link.source).degree += 1);
    byId.get(link.target) && (byId.get(link.target).degree += 1);
  }
}

function populateGroupFilter(groups) {
  const current = state.group;
  groupFilter.innerHTML = [
    `<option value="all">Tutte</option>`,
    ...groups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`),
  ].join("");
  groupFilter.value = groups.includes(current) ? current : "all";
  state.group = groupFilter.value;
}

function refreshView() {
  state.view = makeViewGraph();
  buildSceneGraph(state.view);
  updateStats();
  updateDetail();
  state.simulationSteps = 360;
}

function makeViewGraph() {
  const includeTags = showTags.checked;
  const includeUnresolved = showUnresolved.checked;
  const nodeById = new Map(state.graph.nodes.map((node) => [node.id, node]));

  if (state.localFocusId && nodeById.has(state.localFocusId)) {
    const localNodes = new Map();
    localNodes.set(state.localFocusId, nodeById.get(state.localFocusId));

    for (const link of state.graph.links) {
      if (link.source !== state.localFocusId && link.target !== state.localFocusId) continue;
      const otherId = link.source === state.localFocusId ? link.target : link.source;
      const other = nodeById.get(otherId);
      if (other && nodeAllowedInView(other, includeTags, includeUnresolved)) {
        localNodes.set(otherId, other);
      }
    }

    const localLinks = state.graph.links.filter((link) => (
      localNodes.has(link.source) && localNodes.has(link.target)
    ));

    return {
      nodes: [...localNodes.values()],
      links: localLinks,
      groups: state.graph.groups,
      source: state.graph.source,
      truncated: state.graph.truncated,
      fetchedAt: state.graph.fetchedAt,
    };
  }

  const visibleNotes = new Set();

  for (const node of state.graph.nodes) {
    if (node.kind !== "note") continue;
    if (state.group !== "all" && node.group !== state.group) continue;
    visibleNotes.add(node.id);
  }

  const visibleNodes = new Map();
  for (const id of visibleNotes) {
    visibleNodes.set(id, nodeById.get(id));
  }

  const visibleLinks = [];
  for (const link of state.graph.links) {
    const sourceVisible = visibleNotes.has(link.source);
    const target = nodeById.get(link.target);
    const targetIsNote = target?.kind === "note" && visibleNotes.has(link.target);
    const targetIsTag = target?.kind === "tag" && includeTags && sourceVisible;
    const targetIsUnresolved = target?.kind === "unresolved" && includeUnresolved && sourceVisible;

    if (sourceVisible && (targetIsNote || targetIsTag || targetIsUnresolved)) {
      visibleLinks.push(link);
      visibleNodes.set(link.source, nodeById.get(link.source));
      visibleNodes.set(link.target, target);
    }
  }

  return {
    nodes: [...visibleNodes.values()],
    links: visibleLinks,
    groups: state.graph.groups,
    source: state.graph.source,
    truncated: state.graph.truncated,
    fetchedAt: state.graph.fetchedAt,
  };
}

function nodeAllowedInView(node, includeTags, includeUnresolved) {
  if (node.kind === "tag") return includeTags;
  if (node.kind === "unresolved") return includeUnresolved;
  return true;
}

function buildSceneGraph(graph) {
  for (const object of graphRoot.children) {
    object.geometry?.dispose?.();
    object.material?.dispose?.();
  }
  graphRoot.clear();
  nodeObjects.clear();
  nodeLabels.clear();
  nodeMaterials.clear();
  labelLayer.replaceChildren();
  lineSegments = null;
  linePositions = null;
  lineColors = null;

  for (const node of graph.nodes) {
    ensurePosition(node);
    const geometry = new THREE.SphereGeometry(nodeRadius(node), 24, 18);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorForNode(node)),
      emissive: new THREE.Color(colorForNode(node)),
      emissiveIntensity: node.kind === "note" ? 0.18 : 0.08,
      roughness: 0.58,
      metalness: 0.18,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(node.x, node.y, node.z);
    mesh.userData.nodeId = node.id;
    graphRoot.add(mesh);
    nodeObjects.set(node.id, mesh);
    nodeMaterials.set(node.id, material);
    velocities.set(node.id, velocities.get(node.id) || { x: 0, y: 0, z: 0 });

    const label = document.createElement("span");
    label.className = "graph-label";
    label.textContent = node.title;
    label.dataset.kind = node.kind;
    labelLayer.append(label);
    nodeLabels.set(node.id, label);
  }

  createLines(graph);
  updateMaterials();
}

function ensurePosition(node) {
  if (Number.isFinite(node.x)) return;
  const index = hashCode(node.id);
  const radius = 70 + (Math.abs(index) % 36);
  const theta = (index % 360) * (Math.PI / 180);
  const phi = Math.acos(2 * ((Math.abs(index) % 997) / 997) - 1);
  node.x = radius * Math.sin(phi) * Math.cos(theta);
  node.y = radius * Math.sin(phi) * Math.sin(theta);
  node.z = radius * Math.cos(phi);
}

function nodeRadius(node) {
  if (node.kind === "tag") return 1.9;
  if (node.kind === "unresolved") return 1.6;
  return Math.min(5.8, 2.35 + Math.sqrt(Math.max(1, node.degree)) * 0.62);
}

function colorForNode(node) {
  return GROUP_COLORS.get(node.group) || GROUP_COLORS.get("radice");
}

function createLines(graph) {
  linePositions = new Float32Array(graph.links.length * 2 * 3);
  lineColors = new Float32Array(graph.links.length * 2 * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.42,
  });
  lineSegments = new THREE.LineSegments(geometry, material);
  lineSegments.userData.links = graph.links;
  graphRoot.add(lineSegments);
  updateLines();
}

function updateLines() {
  if (!lineSegments || !linePositions || !lineColors) return;
  const links = lineSegments.userData.links || [];
  const selectedId = state.selectedId;
  const matching = getMatchingNodeIds();
  const hasSearch = Boolean(state.search);
  lineSegments.material.opacity = hasSearch ? 0.54 : 0.42;
  let offset = 0;
  for (const link of links) {
    const source = nodeObjects.get(link.source);
    const target = nodeObjects.get(link.target);
    if (!source || !target) continue;

    linePositions[offset] = source.position.x;
    linePositions[offset + 1] = source.position.y;
    linePositions[offset + 2] = source.position.z;
    linePositions[offset + 3] = target.position.x;
    linePositions[offset + 4] = target.position.y;
    linePositions[offset + 5] = target.position.z;

    const touchesSelected = selectedId && (link.source === selectedId || link.target === selectedId);
    const touchesSearchMatch = hasSearch && (matching.has(link.source) || matching.has(link.target));
    const tone = colorForLink(link);
    if (touchesSearchMatch) {
      tone.lerp(new THREE.Color("#f3f1ea"), 0.24);
    }
    if (selectedId && !touchesSelected) {
      tone.lerp(new THREE.Color("#24272b"), 0.72);
    }
    if (hasSearch && !touchesSearchMatch) {
      tone.lerp(new THREE.Color("#151719"), 0.88);
    }
    lineColors[offset] = tone.r;
    lineColors[offset + 1] = tone.g;
    lineColors[offset + 2] = tone.b;
    lineColors[offset + 3] = tone.r;
    lineColors[offset + 4] = tone.g;
    lineColors[offset + 5] = tone.b;
    offset += 6;
  }
  lineSegments.geometry.attributes.position.needsUpdate = true;
  lineSegments.geometry.attributes.color.needsUpdate = true;
}

function colorForLink(link) {
  if (link.mode === "tag") return new THREE.Color("#d980d2");
  if (link.mode === "wiki") return new THREE.Color("#62d9a8");
  if (link.mode === "embed") return new THREE.Color("#efc65a");
  return new THREE.Color("#aeb7c2");
}

function animate() {
  animationFrame = requestAnimationFrame(animate);
  if (state.simulationSteps > 0) {
    simulateLayout();
    state.simulationSteps -= 1;
  }
  controls.update();
  updateLines();
  updateLabels();
  renderer.render(scene, camera);
}

function simulateLayout() {
  const nodes = state.view.nodes;
  const links = state.view.links;
  const objects = nodeObjects;
  const repulsion = 14;
  const spring = 0.0028;
  const centering = 0.0009;

  for (let i = 0; i < nodes.length; i += 1) {
    const a = objects.get(nodes[i].id);
    if (!a) continue;
    const va = velocities.get(nodes[i].id);

    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = objects.get(nodes[j].id);
      if (!b) continue;
      const vb = velocities.get(nodes[j].id);
      const dx = a.position.x - b.position.x;
      const dy = a.position.y - b.position.y;
      const dz = a.position.z - b.position.z;
      const distSq = Math.max(30, dx * dx + dy * dy + dz * dz);
      const force = repulsion / distSq;
      va.x += dx * force;
      va.y += dy * force;
      va.z += dz * force;
      vb.x -= dx * force;
      vb.y -= dy * force;
      vb.z -= dz * force;
    }
  }

  for (const link of links) {
    const source = objects.get(link.source);
    const target = objects.get(link.target);
    if (!source || !target) continue;
    const vs = velocities.get(link.source);
    const vt = velocities.get(link.target);
    const dx = target.position.x - source.position.x;
    const dy = target.position.y - source.position.y;
    const dz = target.position.z - source.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const desired = link.mode === "tag" ? state.springLength * 0.72 : state.springLength;
    const force = (distance - desired) * spring;
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;
    const fz = (dz / distance) * force;
    vs.x += fx;
    vs.y += fy;
    vs.z += fz;
    vt.x -= fx;
    vt.y -= fy;
    vt.z -= fz;
  }

  for (const node of nodes) {
    const object = objects.get(node.id);
    const velocity = velocities.get(node.id);
    if (!object || !velocity) continue;
    velocity.x += -object.position.x * centering;
    velocity.y += -object.position.y * centering;
    velocity.z += -object.position.z * centering;
    velocity.x *= 0.88;
    velocity.y *= 0.88;
    velocity.z *= 0.88;
    object.position.x += velocity.x;
    object.position.y += velocity.y;
    object.position.z += velocity.z;
    node.x = object.position.x;
    node.y = object.position.y;
    node.z = object.position.z;
  }
}

function updateMaterials() {
  const term = state.search;
  const matching = getMatchingNodeIds(term);
  const hasSearch = Boolean(term);
  const neighborhood = state.selectedId ? getNeighborhoodIds(state.selectedId, state.view) : new Set();

  for (const node of state.view.nodes) {
    const object = nodeObjects.get(node.id);
    const material = nodeMaterials.get(node.id);
    if (!object || !material) continue;
    const isSelected = node.id === state.selectedId;
    const isHovered = node.id === state.hoveredId;
    const isSearchMatch = hasSearch && matching.has(node.id);
    const isMatch = !hasSearch || isSearchMatch;
    const isConnected = !state.selectedId || neighborhood.has(node.id);
    const scale = isSelected ? 1.82 : isHovered ? 1.42 : isSearchMatch ? 1.58 : isConnected && isMatch ? 1 : 0.34;
    const visible = isMatch && isConnected;
    object.scale.setScalar(scale);
    material.opacity = visible ? 1 : hasSearch ? 0.08 : 0.22;
    material.transparent = !visible;
    material.emissiveIntensity = isSelected ? 0.62 : isHovered ? 0.42 : isSearchMatch ? 0.76 : node.kind === "note" ? 0.18 : 0.08;
  }
  updateLabels();
}

function updateLabels() {
  const rect = canvas.getBoundingClientRect();
  const term = state.search;
  const matching = getMatchingNodeIds(term);
  const neighborhood = state.selectedId ? getNeighborhoodIds(state.selectedId, state.view) : null;

  for (const node of state.view.nodes) {
    const object = nodeObjects.get(node.id);
    const label = nodeLabels.get(node.id);
    if (!object || !label) continue;

    const vector = object.position.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * rect.width;
    const y = (-vector.y * 0.5 + 0.5) * rect.height;
    const isVisible = vector.z >= -1 && vector.z <= 1 && x > -90 && x < rect.width + 90 && y > -28 && y < rect.height + 28;

    label.hidden = !isVisible;
    if (!isVisible) continue;

    label.style.transform = `translate(${Math.round(x + rect.left + 10)}px, ${Math.round(y + rect.top - 10)}px)`;
    label.dataset.selected = node.id === state.selectedId ? "true" : "false";
    label.dataset.connected = !neighborhood || neighborhood.has(node.id) ? "true" : "false";
    label.dataset.match = !term || matching.has(node.id) ? "true" : "false";
    label.dataset.searching = term ? "true" : "false";
  }
}

function getMatchingNodeIds(term = state.search, graph = state.view) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return new Set();
  const ids = new Set();
  for (const node of graph.nodes) {
    if (nodeMatches(node, normalized)) ids.add(node.id);
  }
  return ids;
}

function nodeMatches(node, term) {
  return [
    node.title,
    node.vaultPath,
    node.group,
    node.type,
    ...(node.tags || []),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(term));
}

function onPointerMove(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects([...nodeObjects.values()], false);
  const hit = intersections[0]?.object?.userData?.nodeId || null;
  setHovered(hit, event.clientX, event.clientY);
}

function setHovered(id, x = 0, y = 0) {
  if (state.hoveredId === id) {
    if (id) moveTooltip(x, y);
    return;
  }
  state.hoveredId = id;
  updateMaterials();

  if (!id) {
    tooltip.hidden = true;
    return;
  }

  const node = state.view.nodes.find((item) => item.id === id);
  tooltip.innerHTML = `<strong>${escapeHtml(node.title)}</strong><span class="muted">${escapeHtml(node.vaultPath)}</span>`;
  tooltip.hidden = false;
  moveTooltip(x, y);
}

function moveTooltip(x, y) {
  const pad = 16;
  tooltip.style.left = `${Math.min(window.innerWidth - 300, x + pad)}px`;
  tooltip.style.top = `${Math.min(window.innerHeight - 90, y + pad)}px`;
}

function selectNode(id, options = {}) {
  const { local = true, focus = false } = options;
  state.selectedId = id;
  state.localFocusId = local ? id : null;
  refreshView();
  detailPanel.scrollTop = 0;
  if (focus) {
    focusNode(id);
  }
}

function updateDetail() {
  const node = state.view.nodes.find((item) => item.id === state.selectedId);
  detailPanel.dataset.active = node ? "true" : "false";
  if (!node) {
    detailPanel.innerHTML = `
      <h2>Vault Obsidian</h2>
      <p>${escapeHtml(state.source.repo)} / ${escapeHtml(state.source.path)}</p>
      <div class="detail-meta">
        <span>Branch</span>
        <code>${escapeHtml(state.source.branch)}</code>
      </div>
    `;
    return;
  }

  const githubUrl = node.path
    ? `https://github.com/${state.source.repo}/blob/${encodeURIComponent(state.source.branch)}/${node.path}`
    : "";
  const connections = getNodeConnections(node.id);
  const connectionsList = connections.length
    ? `
      <section class="connections-panel" aria-label="Nodi collegati">
        <div class="section-title">
          <span>Collegamenti diretti</span>
          <code>${connections.length}</code>
        </div>
        <div class="connection-list">
          ${connections.map((connection) => `
            <button class="connection-item" type="button" data-node-id="${escapeHtml(connection.node.id)}">
              <span class="connection-dot" style="--dot-color: ${escapeHtml(colorForNode(connection.node))}"></span>
              <span class="connection-copy">
                <strong>${escapeHtml(connection.node.title)}</strong>
                <small>${escapeHtml(connection.node.vaultPath)}</small>
              </span>
              <em>${escapeHtml(connection.label)}</em>
            </button>
          `).join("")}
        </div>
      </section>
    `
    : `<p class="muted">Nessun collegamento diretto rilevato per questo nodo.</p>`;
  const fullFile = node.kind === "note" && node.raw
    ? `
      <section class="note-content" aria-label="File Markdown completo">
        <div class="note-content-header">
          <span>Contenuto Markdown</span>
          <code>${escapeHtml(node.vaultPath)}</code>
        </div>
        <div class="markdown-body">
          ${renderMarkdown(node.body || node.raw)}
        </div>
      </section>
    `
    : `<p class="muted">Questo nodo non corrisponde a un file Markdown del vault.</p>`;

  detailPanel.innerHTML = `
    <h2>${escapeHtml(node.title)}</h2>
    <p>${escapeHtml(node.description || node.type || "")}</p>
    <div class="detail-meta">
      <span>Tipo</span>
      <code>${escapeHtml(node.type || node.kind)}</code>
      <span>Percorso</span>
      <code>${escapeHtml(node.vaultPath)}</code>
      <span>Grado</span>
      <code>${node.degree}</code>
    </div>
    ${node.tags?.length ? `<div class="tag-list">${node.tags.map((tag) => `<span>#${escapeHtml(tag.replace(/^#/, ""))}</span>`).join("")}</div>` : ""}
    <div class="detail-actions">
      <button id="toggleNeighborhood" class="text-button" type="button">${state.localFocusId ? "Tutto il grafo" : "Solo collegati"}</button>
      ${githubUrl ? `<a class="text-button" href="${githubUrl}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
      ${node.resource ? `<a class="text-button" href="${escapeHtml(node.resource)}" target="_blank" rel="noreferrer">Risorsa</a>` : ""}
    </div>
    ${connectionsList}
    ${fullFile}
  `;
  bindDetailActions(node);
}

function bindDetailActions(node) {
  detailPanel.querySelector("#toggleNeighborhood")?.addEventListener("click", () => {
    state.localFocusId = state.localFocusId ? null : node.id;
    refreshView();
    setStatus(state.localFocusId ? `Vista locale: ${node.title}` : "Vista completa del grafo");
  });

  for (const button of detailPanel.querySelectorAll("[data-node-id]")) {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-node-id");
      if (id) {
        selectNode(id, { local: true, focus: true });
      }
    });
  }

  for (const link of detailPanel.querySelectorAll(".markdown-body a")) {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      const target = resolveMarkdownHref(href, node);
      if (target) {
        event.preventDefault();
        selectNode(target.id, { local: true, focus: true });
      } else if (isInternalMarkdownHref(href)) {
        event.preventDefault();
        setStatus(`Nodo non trovato: ${href}`, "error");
      }
    });
  }
}

function getNeighborhoodIds(nodeId, graph) {
  const ids = new Set([nodeId]);
  for (const link of graph.links) {
    if (link.source === nodeId) ids.add(link.target);
    if (link.target === nodeId) ids.add(link.source);
  }
  return ids;
}

function getNodeConnections(nodeId) {
  const nodeById = new Map(state.graph.nodes.map((node) => [node.id, node]));
  const connections = new Map();

  for (const link of state.graph.links) {
    if (link.source !== nodeId && link.target !== nodeId) continue;
    const otherId = link.source === nodeId ? link.target : link.source;
    const node = nodeById.get(otherId);
    if (!node) continue;

    const direction = link.source === nodeId ? "out" : "in";
    const key = `${otherId}:${direction}:${link.mode}`;
    connections.set(key, {
      node,
      direction,
      label: connectionLabel(direction, link.mode),
    });
  }

  return [...connections.values()].sort((a, b) => {
    if (a.direction !== b.direction) return a.direction === "out" ? -1 : 1;
    return a.node.title.localeCompare(b.node.title, "it");
  });
}

function connectionLabel(direction, mode) {
  if (mode === "tag") return "tag";
  if (direction === "out") return "link";
  return "backlink";
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const language = fence[1] || "";
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += index < lines.length ? 1 : 0;
      html.push(`<pre><code${language ? ` class="language-${escapeAttribute(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    if (isTableStart(lines, index)) {
      const table = [];
      table.push(parseTableRow(lines[index]));
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        table.push(parseTableRow(lines[index]));
        index += 1;
      }
      const [head, ...body] = table;
      html.push(`
        <table>
          <thead><tr>${head.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead>
          <tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      `);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${quote.map(renderInlineMarkdown).join("<br>")}</blockquote>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length
      && lines[index].trim()
      && !/^(#{1,4})\s+/.test(lines[index])
      && !/^```/.test(lines[index])
      && !/^\s*[-*]\s+/.test(lines[index])
      && !/^\s*\d+\.\s+/.test(lines[index])
      && !isTableStart(lines, index)
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return html.join("");
}

function renderInlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, href) => {
    const cleanHref = href.trim();
    const external = isExternalTarget(cleanHref);
    return `<a href="${escapeAttribute(cleanHref)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`;
  });
  output = output.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?]]/g, (_match, target, label) => {
    const href = target.trim();
    return `<a href="${escapeAttribute(href)}">${label || href}</a>`;
  });
  return output;
}

function isTableStart(lines, index) {
  return (
    index + 1 < lines.length
    && lines[index].includes("|")
    && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1])
  );
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function resolveMarkdownHref(href, sourceNode) {
  if (!href || !isInternalMarkdownHref(href)) return null;
  const clean = cleanTarget(href.split("#")[0]);
  if (!clean) return null;
  const candidates = candidatePaths(clean, sourceNode.id, "markdown");
  const normalizedIds = new Set(candidates.map((candidate) => `/${normalizeVaultPath(candidate)}`.replace(/\/+$/, "")));

  return state.graph.nodes.find((node) => (
    node.kind === "note"
    && (
      normalizedIds.has(node.id)
      || normalizedIds.has(node.id.replace(/\.md$/i, ""))
      || node.vaultPath === clean
      || node.vaultPath.replace(/\.md$/i, "") === clean.replace(/\.md$/i, "")
    )
  )) || null;
}

function isInternalMarkdownHref(href) {
  return Boolean(href) && !isExternalTarget(href) && !href.startsWith("#");
}

function updateStats() {
  const visibleNotes = state.view.nodes.filter((node) => node.kind === "note").length;
  const visibleTags = state.view.nodes.filter((node) => node.kind === "tag").length;
  const visibleUnresolved = state.view.nodes.filter((node) => node.kind === "unresolved").length;
  const matches = state.search
    ? state.view.nodes.filter((node) => nodeMatches(node, state.search)).length
    : state.view.nodes.length;

  statsPanel.innerHTML = [
    ["Note", visibleNotes],
    ["Link", state.view.links.length],
    ["Tag", visibleTags],
    ["Miss", visibleUnresolved],
  ]
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");

  if (state.search) {
    setStatus(`${matches} nodi corrispondono alla ricerca`);
  }
}

function focusNode(id) {
  const object = nodeObjects.get(id);
  if (!object) return;
  controls.target.copy(object.position);
  const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  camera.position.copy(object.position).add(direction.multiplyScalar(95));
  controls.update();
}

function resetCameraView() {
  controls.target.set(0, 0, 0);
  camera.position.set(0, 38, 178);
  controls.update();
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function setStatus(message, tone = "normal") {
  statusBox.textContent = message;
  statusBox.dataset.tone = tone === "error" ? "error" : "";
}

function hashCode(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
});
