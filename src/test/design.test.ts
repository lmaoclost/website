import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const page = () =>
  readFileSync(resolve(root, "src/pages/design.astro"), "utf-8");

describe("issue #30: página /design", () => {
  it("existe em src/pages/design.astro", () => {
    expect(() => page()).not.toThrow();
  });

  it("seção de tokens de cor: swatch + oklch + hex da #18", () => {
    const src = page();
    expect(src).toContain("oklch(0.96 0.014 85)");
    expect(src).toContain("#f6f1e7");
    expect(src).toContain("oklch(0.21 0.011 73)");
    expect(src).toContain("Contraste");
  });

  it("seção tipografia: serif 18px/1.5 + system-ui + mono da #19", () => {
    const src = page();
    expect(src).toContain("font-serif");
    expect(src).toContain("18px");
    expect(src).toContain("font-mono");
    expect(src).toContain("system-ui");
  });

  it("seção ritmo: escala 4px da #20", () => {
    const src = page();
    expect(src).toContain("4px");
    expect(src).toContain("24px");
    expect(src).toContain("32px");
  });

  it("leitura real: measure 65ch centrada", () => {
    const src = page();
    expect(src).toContain("max-width: 65ch");
    expect(src).toContain("margin-inline: auto");
  });

  it("toggle paper/dark: script puro com precedência da #18", () => {
    const src = page();
    expect(src).toContain('rel="preload"');
    expect(src).toContain("color-theme");
    expect(src).toContain("localStorage");
    expect(src).toContain("prefers-color-scheme");
    expect(src).toMatch(/classList\.toggle\(['"]dark['"]/);
  });

  it("linkado a partir da home", () => {
    const index = readFileSync(resolve(root, "src/pages/index.astro"), "utf-8");
    expect(index).toContain('href="/design"');
  });
});
