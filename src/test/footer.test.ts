import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #26: Footer", () => {
  it("Footer.astro exists and is imported by Layout after content", () => {
    const footer = read("src/components/Footer.astro");
    const layout = read("src/layouts/Layout.astro");
    expect(footer).toMatch(/<footer/);
    const posSlot = layout.indexOf("<slot");
    // Footer renders after the slot (the <Footer occurrence)
    const posRender = layout.indexOf("<Footer");
    expect(posRender).toBeGreaterThan(posSlot);
    expect(layout).toContain("Footer");
  });

  it("footer sticks to page bottom with short content (flex-1 wrapper on slot)", () => {
    const layout = read("src/layouts/Layout.astro");
    expect(layout).toContain("flex-1");
    expect(layout).toMatch(/flex flex-col/);
    // the growing wrapper around each page's slot
    expect(layout).toMatch(/flex-1[^>]*>\s*<slot/);
  });

  it("brand RENAN on the left pointing to /", () => {
    const footer = read("src/components/Footer.astro");
    expect(footer).toContain("RENAN");
    expect(footer).toMatch(/href="\/"/);
  });

  it("links: RSS placeholder, secure external GitHub, About placeholder", () => {
    const footer = read("src/components/Footer.astro");
    expect(footer).toContain('href="/rss.xml"');
    expect(footer).toContain('href="https://github.com/lmaoclost"');
    expect(footer).toContain('href="/about"');
    expect(footer.match(/target="_blank"/g)?.length).toBe(1);
    expect(footer).toContain('rel="noopener noreferrer"');
  });

  it("style: border-top, space-between, sans, text-xs, muted, max-w-6xl", () => {
    const footer = read("src/components/Footer.astro");
    expect(footer).toMatch(/border-t\b.*border-border|border-border.*border-t/);
    expect(footer).toMatch(/justify-between|space-between/);
    expect(footer).toContain("text-xs");
    expect(footer).toContain("text-muted-foreground");
    expect(footer).toContain("max-w-6xl");
  });

  it("no JavaScript", () => {
    const footer = read("src/components/Footer.astro");
    expect(footer).not.toMatch(/<script/);
    expect(footer).not.toContain("onclick");
  });
});
