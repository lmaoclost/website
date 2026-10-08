import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

describe("issue #21: tailwind v4 + tokens", () => {
  it("astro.config.mjs registra plugin @tailwindcss/vite", () => {
    const config = readFileSync(resolve(root, "astro.config.mjs"), "utf-8");
    expect(config).toContain("tailwindcss/vite");
    expect(config).toContain("tailwindcss()");
  });

  it("src/styles/global.css importa tailwindcss", () => {
    const css = readFileSync(resolve(root, "src/styles/global.css"), "utf-8");
    expect(css).toContain('@import "tailwindcss"');
  });

  it("global.css declara variante dark", () => {
    const css = readFileSync(resolve(root, "src/styles/global.css"), "utf-8");
    expect(css).toContain("@custom-variant dark");
  });

  it("paper: tokens oklch da issue #18 em :root", () => {
    const css = readFileSync(resolve(root, "src/styles/global.css"), "utf-8");
    expect(css).toContain("--background: oklch(0.95 0.028 84)");
    expect(css).toContain("--foreground: oklch(0.27 0.013 72)");
    expect(css).toContain("--primary: oklch(0.51 0.123 45)");
  });

  it("dark: tokens oklch da issue #18 em .dark", () => {
    const css = readFileSync(resolve(root, "src/styles/global.css"), "utf-8");
    expect(css).toContain("--background: oklch(0.21 0.011 73)");
    expect(css).toContain("--foreground: oklch(0.92 0.023 85)");
    expect(css).toContain("--primary: oklch(0.76 0.112 68)");
  });

  it("fontes da issue #19: serif no corpo, system-ui na UI", () => {
    const css = readFileSync(resolve(root, "src/styles/global.css"), "utf-8");
    expect(css).toContain("--font-serif");
    expect(css).toContain("--font-sans");
    expect(css).toContain("system-ui");
  });

  it("spacing da issue #20: escala base 4px", () => {
    const css = readFileSync(resolve(root, "src/styles/global.css"), "utf-8");
    expect(css).toContain("--spacing: 0.25rem");
  });
});
