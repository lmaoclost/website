import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const page = () =>
  readFileSync(resolve(root, "src/pages/design.astro"), "utf-8");

describe("issue #30: página /design", () => {
  it("exists at src/pages/design.astro", () => {
    expect(() => page()).not.toThrow();
  });

  it("color tokens section: swatch + oklch + hex from #18", () => {
    const src = page();
    expect(src).toContain("oklch(0.95 0.028 84)");
    expect(src).toContain("#f3eccf");
    expect(src).toContain("oklch(0.21 0.011 73)");
    expect(src).toContain("Contraste");
  });

  it("typography section: serif 18px/1.5 + system-ui + mono from #19", () => {
    const src = page();
    expect(src).toContain("font-serif");
    expect(src).toContain("18px");
    expect(src).toContain("font-mono");
    expect(src).toContain("system-ui");
  });

  it("rhythm section: 4px scale from #20", () => {
    const src = page();
    expect(src).toContain("4px");
    expect(src).toContain("24px");
    expect(src).toContain("32px");
  });

  it("real reading: centered 65ch measure", () => {
    const src = page();
    expect(src).toContain("max-width: 65ch");
    expect(src).toContain("margin-inline: auto");
  });

  it("paper/dark toggle: plain script with #18 precedence", () => {
    const layout = readFileSync(
      resolve(root, "src/layouts/Layout.astro"),
      "utf-8",
    );
    expect(layout).toContain('rel="preload"');
    // theme precedence lives in ThemeScript, the single theme script source
    const theme = readFileSync(
      resolve(root, "src/components/ThemeScript.astro"),
      "utf-8",
    );
    expect(theme).toContain("prefers-color-scheme");
    const src = page();
    // the live toggle lives in the global navbar (#25); the page demos themes
    const navbar = readFileSync(
      resolve(root, "src/components/Navbar.astro"),
      "utf-8",
    );
    expect(navbar).toContain("toggleTheme()");
    expect(navbar).toContain('aria-label="Alternar tema"');
  });

  it("linked from footer (home became the blog on #22)", () => {
    const footer = readFileSync(
      resolve(root, "src/components/Footer.astro"),
      "utf-8",
    );
    expect(footer).toContain('href="/design"');
  });
});
