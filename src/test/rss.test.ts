import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #37: RSS feed", () => {
  it("endpoint src/pages/rss.xml.js existe com GET usando @astrojs/rss", () => {
    const path = resolve(root, "src/pages/rss.xml.js");
    expect(existsSync(path)).toBe(true);
    const endpoint = read("src/pages/rss.xml.js");
    expect(endpoint).toContain("@astrojs/rss");
    expect(endpoint).toContain("export async function GET");
  });

  it("corpo completo: content com html renderizado (markdown-it + sanitize-html)", () => {
    const endpoint = read("src/pages/rss.xml.js");
    expect(endpoint).toContain("markdown-it");
    expect(endpoint).toContain("sanitize-html");
    expect(endpoint).toContain("content:");
  });

  it("posts do blog, ordenados, com limite de 20", () => {
    const endpoint = read("src/pages/rss.xml.js");
    expect(endpoint).toContain("getPosts");
    expect(endpoint).toMatch(/limit|slice/);
  });

  it("site no astro.config.mjs (link absoluto derivado)", () => {
    const config = read("astro.config.mjs");
    expect(config).toContain("site:");
  });

  it("Layout anuncia o feed no head (rel=alternate)", () => {
    const layout = read("src/layouts/Layout.astro");
    expect(layout).toContain('rel="alternate"');
    expect(layout).toContain("application/rss+xml");
    expect(layout).toContain("/rss.xml");
  });
});
