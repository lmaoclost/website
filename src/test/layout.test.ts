import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #25: Layout componentizado", () => {
  it("src/layouts/Layout.astro existe", () => {
    expect(() => read("src/layouts/Layout.astro")).not.toThrow();
  });

  it("Layout declara head comum: charset, viewport, favicon, global.css", () => {
    const layout = read("src/layouts/Layout.astro");
    expect(layout).toContain('charset="utf-8"');
    expect(layout).toContain("viewport");
    expect(layout).toContain("favicon");
    expect(layout).toContain("global.css");
    expect(layout).toContain("<slot");
  });

  it("ThemeScript.astro existe e é fonte única do script de tema", () => {
    const theme = read("src/components/ThemeScript.astro");
    expect(theme).toContain("is:inline");
    expect(theme).toContain("color-theme");
    expect(theme).toContain("prefers-color-scheme");
    expect(theme).toContain("toggleTheme");
  });

  it("páginas migram pro Layout e não duplicam head/script de tema", () => {
    for (const page of [
      "src/pages/index.astro",
      "src/pages/design.astro",
      "src/pages/404.astro",
    ]) {
      const src = read(page);
      expect(src, page).toContain("Layout");
      // head não pode ficar duplicado na página (charset fica só no Layout)
      expect(src.match(/charset=/g)?.length ?? 0, page).toBeLessThanOrEqual(0);
      // script anti-FOUC não pode ficar duplicado inline na página
      expect(
        src.match(/prefers-color-scheme/g)?.length ?? 0,
        page,
      ).toBeLessThanOrEqual(0);
    }
  });
});
