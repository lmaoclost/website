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
  });

  it("GitHub e LinkedIn com ícones, link externo seguro, à esquerda do ⌘K", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toContain('href="https://github.com/lmaoclost"');
    expect(navbar).toContain(
      'href="https://www.linkedin.com/in/renansmoliveira/"',
    );
    expect(navbar).toContain('aria-label="GitHub"');
    expect(navbar).toContain('aria-label="LinkedIn"');
    expect(navbar.match(/target="_blank"/g)?.length).toBe(2);
    expect(navbar.match(/rel="noopener noreferrer"/g)?.length).toBe(2);
    expect(navbar).toContain("GithubIcon");
    expect(navbar).toContain("LinkedinIcon");
  });

  it("toggle de tema usa sol/lua com visibilidade controlada por classe dark", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toContain("SunIcon");
    expect(navbar).toContain("MoonIcon");
    expect(navbar).toContain("dark:hidden");
    expect(navbar).toContain("hidden dark:flex");
    expect(navbar).not.toContain("◐");
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

  it("busca: form com submit pro Google usando site: da pr\u00f3pria hostname (#32)", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toMatch(/<form[^>]*role="search"/);
    expect(navbar).toContain('type="search"');
    expect(navbar).toContain("google.com/search");
    expect(navbar).toContain("site:");
    expect(navbar).toContain("window.location.hostname");
    expect(navbar).toContain("Buscar");
    expect(navbar).toContain('aria-label="Buscar no site"');
  });

  it("busca: atalho \u2318K/Ctrl+K foca o input", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toMatch(/metaKey|ctrlKey/);
    expect(navbar).toMatch(/key === "k"/);
    expect(navbar).toMatch(/\.focus\(/);
  });

  it("busca: botao \u2318K disabled saiu da navbar", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).not.toMatch(/cursor-not-allowed/);
    expect(navbar).not.toContain("em breve");
  });

  it("busca: botao de lupa no mobile revela barra", () => {
    const navbar = read("src/components/Navbar.astro");
    expect(navbar).toContain("SearchIcon");
    expect(navbar).toMatch(/md:hidden/);
    expect(navbar).toContain("mobile-search");
  });
});
