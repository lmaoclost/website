import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

describe("issue #21: resolução de tema + anti-FOUC", () => {
  it("ThemeScript tem o script inline de tema (anti-FOUC)", () => {
    const page = readFileSync(
      resolve(root, "src/components/ThemeScript.astro"),
      "utf-8",
    );
    expect(page).toContain("is:inline");
    expect(page).toContain("color-theme");
    expect(page).toContain("localStorage");
    expect(page).toContain("prefers-color-scheme");
  });

  it("script aplica classe dark no documentElement", () => {
    const page = readFileSync(
      resolve(root, "src/components/ThemeScript.astro"),
      "utf-8",
    );
    expect(page).toMatch(/classList\.(add|toggle)\(['"]dark['"]/);
  });

  it("importa global.css via Layout", () => {
    const page = readFileSync(
      resolve(root, "src/layouts/Layout.astro"),
      "utf-8",
    );
    expect(page).toContain("global.css");
  });
});
