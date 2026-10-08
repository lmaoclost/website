import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #36: tag pages", () => {
  it("src/pages/tag/[slug].astro existe com getStaticPaths sobre as tags", () => {
    const path = resolve(root, "src/pages/tag/[slug].astro");
    expect(existsSync(path)).toBe(true);
    const page = read("src/pages/tag/[slug].astro");
    expect(page).toContain("getStaticPaths");
    expect(page).toContain("slugify");
  });

  it("getStaticPaths gera uma rota por tag distinta (dedupe) com posts da tag", () => {
    const page = read("src/pages/tag/[slug].astro");
    expect(page).toContain("Map");
    expect(page).toMatch(/posts.*tag|tag.*posts|filtered/);
  });

  it("página reusa PostItem e MonthNav com meses da tag", () => {
    const page = read("src/pages/tag/[slug].astro");
    expect(page).toContain("PostItem");
    expect(page).toContain("MonthNav");
    expect(page).toContain("groupPostsByMonth");
  });

  it("header do conteúdo: heading com o nome da tag + contador de posts", () => {
    const page = read("src/pages/tag/[slug].astro");
    expect(page).toMatch(/<h1/);
    expect(page).toMatch(/\.length/);
  });

  it("tags da lista viram links (PostItem): /tag/<slug> com hover", () => {
    const item = read("src/components/PostItem.astro");
    expect(item).toMatch(/href=\{`\/tag\//);
    expect(item).toMatch(/hover:text-primary|hover:text-foreground/);
  });

  it("usa o Layout com navbar+footer", () => {
    const page = read("src/pages/tag/[slug].astro");
    expect(page).toContain("Layout");
  });
});
