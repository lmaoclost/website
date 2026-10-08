import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #24: página do post", () => {
  it("src/pages/blog/[slug].astro existe com getStaticPaths sobre getPosts", () => {
    const path = resolve(root, "src/pages/blog/[slug].astro");
    expect(existsSync(path)).toBe(true);
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("getStaticPaths");
    expect(page).toContain("getPosts");
  });

  it("contrato: slug da rota é slugify(title) — o mesmo que a lista gera", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("slugify");
    expect(page).toContain("astro:content");
  });

  it("header do post: título h1, meta com data legível + minutos + tags texto", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toMatch(/<h1/);
    expect(page).toContain("minutosDeLeitura");
    expect(page).toContain("toLocaleDateString");
    expect(page).toContain("tags.map");
  });

  it("corpo: serif 18px, line-height 1.5, measure 65ch centrada", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("font-serif");
    expect(page).toContain("65ch");
    expect(page).toContain("line-height: 1.5");
  });

  it("Layout com preloadSerif e título do post", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("preloadSerif");
    expect(page).toMatch(/title=\{?/);
  });
});

describe("TOC lateral do post (#24)", () => {
  const read = (p: string) =>
    readFileSync(resolve(__dirname, "..", p), "utf-8");

  it("Toc.astro existe e recebe headings do post", () => {
    const toc = read("components/Toc.astro");
    const page = read("pages/blog/[slug].astro");
    expect(toc).toContain("Nesta página");
    expect(toc).toContain("headings");
    expect(page).toContain("Toc");
    expect(page).toContain("headings");
  });

  it("TOC só h2/h3, sticky, hidden lg:block, âncoras #slug", () => {
    const toc = read("components/Toc.astro");
    expect(toc).toContain("depth === 2");
    expect(toc).toContain("depth === 3");
    expect(toc).toMatch(/sticky\s+top-24/);
    expect(toc).toContain("hidden lg:block");
    expect(toc).toContain("href={`#${h.slug}`}");
  });

  it("scroll-spy acompanha o scroll (listener ativo no script)", () => {
    const toc = read("components/Toc.astro");
    expect(toc).toContain('addEventListener("scroll"');
    expect(toc).toContain("border-l-primary");
  });

  it("corpo tem estilos pra img, iframe, table e hr", () => {
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
    // a medida vive no wrapper comum, não no corpo sozinho
    expect(page).toMatch(/width: 65ch[^"]*"[^>]*>\s*<header>/s);
    // o corpo interno não REDEFINE a medida de leitura (65ch só no wrapper comum)
    const medidas5ch = (page.match(/65ch/g) || []).length;
    expect(
      medidas5ch,
      "65ch deve aparecer 1x (wrapper) — header e corpo herdam",
    ).toBe(1);
    // filhos de bloqueio limitados ao 100% da medida (pre/table não estouram)
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
