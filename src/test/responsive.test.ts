import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("responsividade da página de post (#24)", () => {
  it("measure is a ceiling, not a floor: max-width 65ch (shrinks on small screens)", () => {
    const page = read("pages/blog/[slug].astro");
    expect(page).toMatch(/max-width: 65ch/);
    expect(page).not.toMatch(/(?<!max-)width: 65ch/);
  });

  it("pre/table scroll inside their own box (overflow-x), never overflow the container", () => {
    const page = read("pages/blog/[slug].astro");
    expect(page).toMatch(/:global\(pre\)[^{]*\{[^}]*overflow-x:\s*auto/s);
    expect(page).toMatch(/overflow-x: auto/);
    expect(page).not.toMatch(
      /:global\(table\)[^{]*\{[^}]*border-collapse[^}]*\}[^{]*\{[^}]*width: min-content/s,
    );
    // table display block overflow-x auto
    expect(page).toMatch(/:where\(table\)\)?\s*\{[^}]*overflow-x:\s*auto/s);
  });

  it("reading column + TOC: TOC hides below lg, measure stays full", () => {
    const toc = read("components/Toc.astro");
    expect(toc).toContain("hidden lg:block");
    const page = read("pages/blog/[slug].astro");
    // the page flex container fixes no width: flex-1 min-w-0 on the article
    expect(page).toMatch(/flex-1 min-w-0/);
  });

  it("TL;DR and header fluid (no fixed width on header)", () => {
    const page = read("pages/blog/[slug].astro");
    // header inherits the measure from the wrapper; no width of its own
    expect(page).toMatch(/<header>\s*<h1/);
    expect(page).not.toMatch(/<header[^>]+style="[^"]*width/);
  });

  it("list item: day in real 56px column (title/meta aligned on 2nd column)", () => {
    const item = read("components/PostItem.astro");
    // comma in tailwind arbitrary value generates invalid CSS (grid collapses):
    expect(item).toContain("grid-cols-[56px_minmax(0,1fr)]");
    expect(item).not.toContain("56px,");
  });

  it("navbar: desktop search hides below md (magnifier covers)", () => {
    const navbar = read("components/Navbar.astro");
    expect(navbar).toMatch(/hidden md:block relative w-64/);
    expect(navbar).toMatch(/md:hidden rounded p-1\.5/);
  });
});
