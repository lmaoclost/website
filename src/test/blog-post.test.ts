import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #24: página do post", () => {
  it("src/pages/blog/[slug].astro exists with getStaticPaths over getPosts", () => {
    const path = resolve(root, "src/pages/blog/[slug].astro");
    expect(existsSync(path)).toBe(true);
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("getStaticPaths");
    expect(page).toContain("getPosts");
  });

  it("contract: route slug is slugify(title) — same as list generates", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("slugify");
    expect(page).toContain("astro:content");
  });

  it("post header: h1 title, meta with readable date + minutes + plain tags", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toMatch(/<h1/);
    expect(page).toContain("readingTime");
    expect(page).toContain("toLocaleDateString");
    expect(page).toContain("tags.map");
  });

  it("body: serif 18px, line-height 1.5, centered 65ch measure", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("font-serif");
    expect(page).toContain("65ch");
    expect(page).toContain("line-height: 1.5");
  });

  it("Layout with preloadSerif and post title", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("preloadSerif");
    expect(page).toMatch(/title=\{?/);
  });
});

describe("TOC lateral do post (#24)", () => {
  const read = (p: string) =>
    readFileSync(resolve(__dirname, "..", p), "utf-8");

  it("Toc.astro exists and receives post headings", () => {
    const toc = read("components/Toc.astro");
    const page = read("pages/blog/[slug].astro");
    expect(toc).toContain("Nesta página");
    expect(toc).toContain("headings");
    expect(page).toContain("Toc");
    expect(page).toContain("headings");
  });

  it("TOC only h2/h3, sticky, hidden lg:block, #slug anchors", () => {
    const toc = read("components/Toc.astro");
    expect(toc).toContain("depth === 2");
    expect(toc).toContain("depth === 3");
    expect(toc).toMatch(/sticky\s+top-24/);
    expect(toc).toContain("hidden lg:block");
    expect(toc).toContain("href={`#${h.slug}`}");
  });

  it("scroll-spy follows scroll (active listener in the script)", () => {
    const toc = read("components/Toc.astro");
    expect(toc).toContain('addEventListener("scroll"');
    expect(toc).toContain("border-l-primary");
  });

  it("body has styles for img, iframe, table and hr", () => {
    const page = read("pages/blog/[slug].astro");
    for (const seletor of ["img", "iframe", "table", "th", "td", "hr"]) {
      expect(page).toMatch(new RegExp(`:global\\(${seletor}\\)`));
    }
  });
});

describe("ajustes pós-review do Renan", () => {
  const read = (p: string) =>
    readFileSync(resolve(__dirname, "..", p), "utf-8");

  it("sem nome de autor no header do post (óbvio: blog pessoal)", () => {
    const page = read("pages/blog/[slug].astro");
    expect(page.replace(/Renan/g, "")).not.toContain("Renan");
    expect(page).not.toMatch(/>Renan</);
  });

  it("TL;DR: schema opcional + callout no header quando presente", () => {
    const config = read("content.config.ts");
    expect(config).toContain("tldr");
    const page = read("pages/blog/[slug].astro");
    expect(page).toContain('aria-label="TL;DR"');
    expect(page).toContain("<details");
    expect(page).toContain("<summary");
    expect(page).toContain("tldr &&");
  });

  it("header e corpo compartilham da mesma medida (width 65ch fixa, sem 65ch dupla de fontes diferentes)", () => {
    const page = read("pages/blog/[slug].astro");
    // the measure lives in the shared wrapper, not the body alone
    expect(page).toMatch(/width: 65ch[^"]*"[^>]*>\s*<header>/s);
    // the inner body does not redefine the reading measure (65ch only in wrapper)
    const medidas5ch = (page.match(/65ch/g) || []).length;
    expect(
      medidas5ch,
      "65ch deve aparecer 1x (wrapper) — header e corpo herdam",
    ).toBe(1);
    // block children capped at 100% of the measure (pre/table never overflow)
    expect(page).toMatch(/max-width: 100%/);
  });

  it("scroll suave global respeitando reduced-motion", () => {
    const css = read("styles/global.css");
    expect(css).toContain("scroll-behavior: smooth");
    expect(css).toContain("prefers-reduced-motion");
  });

  it("headings do corpo com scroll-margin-top (âncora para no topo com folga da navbar)", () => {
    const page = read("pages/blog/[slug].astro");
    expect(page).toContain("scroll-margin-top: 5.5rem");
  });
});
