import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #35: página de projetos", () => {
  it("profile.ts estendido: Projeto ganha website? e mock?", () => {
    const profile = read("src/data/profile.ts");
    expect(profile).toContain("website?:");
    expect(profile).toContain("mock?");
  });

  it("mock: tipos válidos (editor/browser/table) e placeholder renderizando por tipo", () => {
    const mock = read("src/components/ProjectMock.astro");
    expect(mock).toContain("editor");
    expect(mock).toContain("browser");
    expect(mock).toContain("table");
    expect(mock).toMatch(/aria-hidden="true"/);
    expect(mock).toContain("SCREENSHOT");
  });

  it("src/pages/projects.astro existe e routa /projects", () => {
    expect(existsSync(resolve(root, "src/pages/projects.astro"))).toBe(true);
    const page = read("src/pages/projects.astro");
    expect(page).toContain("Layout");
    expect(page).toContain("projetos");
  });

  it("título: label mono caps espaçado (não heading grande)", () => {
    const page = read("src/pages/projects.astro");
    expect(page).toMatch(/font-mono.*uppercase.*tracking/);
  });

  it("item: imagem à esquerda (400px), info à direita, hr, tecnologias abaixo", () => {
    const page = read("src/pages/projects.astro");
    expect(page).toMatch(/grid-cols-\[400px/);
    expect(page).toMatch(/<hr/);
    expect(page).toContain("Tecnologias");
    expect(page).toContain("join");
  });

  it("links do projeto: GitHub → sempre; Website → condicional (só com deploy)", () => {
    const page = read("src/pages/projects.astro");
    expect(page).toContain("GitHub →");
    expect(page).toMatch(/pr\.website\s*&&/);
    expect(page).toContain('rel="noopener noreferrer"');
  });

  it("medida responsiva: colapsa pra 1 coluna em mobile, sem overflow", () => {
    const page = read("src/pages/projects.astro");
    expect(page).toMatch(/md:grid-cols-\[400px/);
    expect(page).toMatch(/max-width:\s*100%|min-w-0/);
  });
});
