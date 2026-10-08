import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #25: Navbar", () => {
  it("src/components/Navbar.astro existe e é importado pelo Layout", () => {
    const navbar = read("src/components/Navbar.astro");
    const layout = read("src/layouts/Layout.astro");
    expect(navbar).toContain("<nav");
    expect(layout).toContain("Navbar");
  });

  it("sticky translúcida: sticky + bg translúcido + backdrop-blur + borda inferior", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toMatch(/sticky\s+top-0/);
    expect(navbar).toContain("backdrop-blur");
    expect(navbar).toMatch(/bg-background\/\d+/);
    expect(navbar).toMatch(/border-b\b.*border-border|border-border.*border-b/);
  });

  it("brand + itens de nav Blog/Projects/About com rota atual oculta", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toContain("RENAN");
    expect(navbar).toContain('"/projects"');
    expect(navbar).toContain('"/about"');
    expect(navbar).not.toContain('"/blog"');
    expect(navbar).toContain("it.href");
    expect(navbar).toContain("it.nome");
    // lógica de ocultar item atual: compara pathname
    expect(navbar).toContain("Astro.url.pathname");
  });

  it("direita: placeholder de busca com aria + toggle de tema", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toContain('aria-label="Buscar"');
    expect(navbar).toContain("toggleTheme()");
  });

  it("mobile: hamburger com aria-expanded e dropdown com links + toggle", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toContain("aria-expanded");
    expect(navbar).toContain('aria-label="Menu"');
    expect(navbar).toMatch(/hover:bg-accent|bg-accent/);
  });

  it("acessibilidade: nav tem aria-label, botão de tema tem aria-label", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toMatch(/<nav[^>]+aria-label/);
    expect(navbar).toContain('aria-label="Alternar tema"');
  });
});
