import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("responsividade da página de post (#24)", () => {
  it("measure é teto, não piso: max-width 65ch (encolhe em telas pequenas)", () => {
    const page = read("pages/blog/[slug].astro");
    expect(page).toMatch(/max-width: 65ch/);
    expect(page).not.toMatch(/(?<!max-)width: 65ch/);
  });

  it("pre/table rolam dentro da própria caixa (overflow-x), sem estourar o container", () => {
    const page = read("pages/blog/[slug].astro");
    expect(page).toMatch(/:global\(pre\)[^{]*\{[^}]*overflow-x:\s*auto/s);
    expect(page).toMatch(/overflow-x: auto/);
    expect(page).not.toMatch(
      /:global\(table\)[^{]*\{[^}]*border-collapse[^}]*\}[^{]*\{[^}]*width: min-content/s,
    );
    // table display block overflow-x auto
    expect(page).toMatch(/:where\(table\)\)?\s*\{[^}]*overflow-x:\s*auto/s);
  });

  it("coluna de leitura + TOC: TOC some abaixo de lg, measure fica integral", () => {
    const toc = read("components/Toc.astro");
    expect(toc).toContain("hidden lg:block");
    const page = read("pages/blog/[slug].astro");
    // o container flex da página não fixa largura: flex-1 min-w-0 no artigo
    expect(page).toMatch(/flex-1 min-w-0/);
  });

  it("TL;DR e header fluidos (nada de width fixa no header)", () => {
    const page = read("pages/blog/[slug].astro");
    // o header herda a medida do wrapper; não tem width próprio
    expect(page).toMatch(/<header>\s*<h1/);
    expect(page).not.toMatch(/<header[^>]+style="[^"]*width/);
  });

  it("item da lista: dia em coluna 56px real (title/meta alinhados na 2ª coluna)", () => {
    const item = read("components/PostItem.astro");
    // vírgula em arbitrary value do tailwind gera CSS inválido (grid colapsa):
    expect(item).toContain("grid-cols-[56px_minmax(0,1fr)]");
    expect(item).not.toContain("56px,");
  });

  it("navbar: busca desktop some abaixo de md (lupa cobre)", () => {
    const navbar = read("components/Navbar.astro");
    expect(navbar).toMatch(/hidden md:block relative w-64/);
    expect(navbar).toMatch(/md:hidden rounded p-1\.5/);
  });
});
