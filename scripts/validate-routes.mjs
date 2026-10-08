#!/usr/bin/env node
// Validates the COMPILED output (dist/) against the route contract:
// what must exist, what must not, and the RSS/body invariants.
// Inspired by Chris Titus's validate-routes.mjs (scaled to this site).
import { readdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

import { slugify } from "../src/utils/slugify.ts";

const root = process.cwd();
const dist = join(root, "dist");

if (!existsSync(dist)) {
  console.error(`dist/ not found — run "npm run build" first`);
  process.exit(1);
}

// ---------- fixed routes (independent of posts) ----------
const FIXED_ROUTES = [
  "/index.html",
  "/about/index.html",
  "/projects/index.html",
  "/design/index.html",
  "/404.html",
  "/rss.xml",
];

// ---------- derived routes (blog contract) ----------
async function derivedRoutes() {
  // import the content collection via astro's static build data:
  // dist won't tell us the collection itself, so we read src/content/blog
  const blogDir = join(root, "src/content/blog");
  const rotas = new Set();
  const tags = new Set();

  if (existsSync(blogDir)) {
    for (const file of readdirSync(blogDir)) {
      if (!file.endsWith(".md")) continue;
      const source = readFileSync(join(blogDir, file), "utf8");
      const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fm) continue;
      const raw = fm[1];
      const title = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
      const draft = /^\s*draft:\s*true\s*$/m.test(raw);
      if (!title || draft) continue;
      const slug = slugify(title);
      rotas.add(`/blog/${slug}/index.html`);
      const tagBlock = raw.match(/^tags:\s*\[([^\]]*)\]/m)?.[1];
      if (tagBlock) {
        for (const tag of tagBlock
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)) {
          tags.add(`/tag/${slugify(tag)}/index.html`);
        }
      }
    }
  }
  return { rotas, tagRoutes: [...tags] };
}

// ---------- dist inventory ----------
function distRoutes() {
  const rotas = new Set();
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else {
        rotas.add(`/${relative(dist, full).split("\\").join("/")}`);
      }
    }
  }
  walk(dist);
  return rotas;
}

// ---------- RSS validation ----------
function validateRss(rotas) {
  const rssPath = join(dist, "rss.xml");
  if (!existsSync(rssPath)) return ["dist/rss.xml missing"];
  const xml = readFileSync(rssPath, "utf8");
  const errors = [];

  if (!xml.startsWith("<?xml")) errors.push("rss.xml: no xml declaration");

  const items = xml.match(/<item>/g)?.length ?? 0;
  const links = [
    ...xml.matchAll(/<link>([^<]+)<\/link>|(?:<link>([^<]+)<\/link>)/g),
  ].map((m) => m[1] || m[2]);
  const guid =
    xml.match(/<guid isPermaLink="true">([^<]+)<\/guid>/g)?.length ?? 0;

  // absolute links (site from config)
  const siteUrl = readFileSync(join(root, "astro.config.mjs"), "utf8").match(
    /site:\s*["']([^"']+)["']/,
  )?.[1];
  if (!siteUrl) errors.push("astro.config.mjs: no site configured");
  else {
    for (const link of links) {
      if (link.includes("/blog/") && !link.startsWith(siteUrl)) {
        errors.push(`rss.xml: non-absolute link ${link}`);
      }
    }
  }

  // full content present (only when there are items to encode)
  if (items > 0 && !xml.includes("content:encoded")) {
    errors.push(
      "rss.xml: items present but no content:encoded (full body expected)",
    );
  }

  // discovery on the home page
  const home = join(dist, "index.html");
  if (existsSync(home)) {
    const html = readFileSync(home, "utf8");
    if (
      !html.includes('rel="alternate"') ||
      !html.includes("application/rss+xml")
    ) {
      errors.push("index.html: feed discovery link (rel=alternate) missing");
    }
  }

  return errors;
}

// ---------- main ----------
const { rotas: rotaBlog, tagRoutes } = await derivedRoutes();
const esperadas = new Set([...FIXED_ROUTES, ...rotaBlog, ...tagRoutes]);
const atuais = distRoutes();

const erros = [];

for (const rota of esperadas) {
  if (!atuais.has(rota) && !rota.endsWith("rss.xml")) {
    erros.push(`missing: ${rota}`);
  } else if (rota === "/rss.xml" && !atuais.has(rota)) {
    erros.push("missing: /rss.xml");
  }
}
// unknown = built output that the contract doesn't expect
for (const rota of atuais) {
  if (
    rota.startsWith("/blog/") ||
    rota.startsWith("/tag/") ||
    rota.startsWith("/_astro/")
  )
    continue;
  if (rota.startsWith("/images/") || rota.startsWith("/fonts/")) continue;
  if (
    rota === "/favicon.svg" ||
    rota === "/favicon.ico" ||
    rota === "/favicon-16x16.png" ||
    rota === "/favicon-32x32.png" ||
    rota === "/apple-touch-icon.png" ||
    rota === "/site.webmanifest"
  )
    continue;
  const html = rota.endsWith(".html") && rota !== "/404.html";
  if (!html) continue;
  if (!esperadas.has(rota) && rota !== "/index.html") {
    erros.push(`unexpected route: ${rota}`);
  }
}
erros.push(...validateRoutesExtra(esperadas, atuais));
erros.push(...validateRss(atuais));

function validateRoutesExtra(_esperadas, _atuais) {
  return [];
}

if (erros.length > 0) {
  console.error(`route contract violated (${erros.length}):`);
  for (const erro of erros) console.error(`  - ${erro}`);
  process.exit(1);
}

console.log(
  `route contract OK: ${esperadas.size} expected routes, ${atuais.size} emitted, rss valid`,
);
