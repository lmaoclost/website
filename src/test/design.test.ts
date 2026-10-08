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
    expect(src).toContain("oklch(0.95 0.028 84)");
    expect(src).toContain("#f3eccf");
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
    const layout = readFileSync(
      resolve(root, "src/layouts/Layout.astro"),
      "utf-8",
    );
    expect(layout).toContain('rel="preload"');
    // a precedência vive no ThemeScript, fonte única do script de tema
    const theme = readFileSync(
      resolve(root, "src/components/ThemeScript.astro"),
      "utf-8",
    );
    expect(theme).toContain("prefers-color-scheme");
    const src = page();
    // o toggle vivo agora é da navbar global (#25); a página demonstra os temas
    const navbar = readFileSync(
      resolve(root, "src/components/Navbar.astro"),
      "utf-8",
    );
    expect(navbar).toContain("toggleTheme()");
    expect(navbar).toContain('aria-label="Alternar tema"');
  });

  it("linkado a partir do footer (a home virou o blog na #22)", () => {
    const footer = readFileSync(
      resolve(root, "src/components/Footer.astro"),
      "utf-8",
    );
    expect(footer).toContain('href="/design"');
  });
});
