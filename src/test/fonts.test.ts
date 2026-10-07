import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

describe("issue #21: fonte serif self-hosted (#19)", () => {
  it("woff2 da Source Serif 4 existe em public/fonts (latin + latin-ext)", () => {
    const dir = resolve(root, "public/fonts");
    expect(existsSync(dir)).toBe(true);
    const files = readdirSync(dir).filter((f) => f.endsWith(".woff2"));
    expect(files).toContain("source-serif-4-latin.woff2");
    expect(files).toContain("source-serif-4-latin-ext.woff2");
    for (const f of files) {
      const size = statSync(resolve(dir, f)).size;
      expect(size).toBeGreaterThan(1000);
    }
  });

  it("@font-face declarado no global.css com font-display swap", () => {
    const css = readFileSync(resolve(root, "src/styles/global.css"), "utf-8");
    expect(css).toContain("@font-face");
    expect(css).toContain("font-display: swap");
    expect(css).toContain("/fonts/source-serif-4-latin.woff2");
  });

  it("index.astro precarrega o woff2 da fonte do corpo", () => {
    const page = readFileSync(resolve(root, "src/pages/index.astro"), "utf-8");
    expect(page).toContain('rel="preload"');
    expect(page).toContain("/fonts/source-serif-4-latin.woff2");
    expect(page).toContain("font/woff2");
  });

  it("font-serif da #19 usa Source Serif 4 + fallbacks", () => {
    const css = readFileSync(resolve(root, "src/styles/global.css"), "utf-8");
    expect(css).toContain('"Source Serif 4"');
    expect(css).toContain("charter");
  });
});
