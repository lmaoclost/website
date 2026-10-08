import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #23: about page", () => {
  it("src/data/profile.ts exists and is typed", () => {
    expect(existsSync(resolve(root, "src/data/profile.ts"))).toBe(true);
    const profile = read("src/data/profile.ts");
    expect(profile).toMatch(/interface|type\s/);
    expect(profile).toContain("nome");
    expect(profile).toContain("experiencia");
    expect(profile).toContain("projetos");
    expect(profile).toContain("hobbies");
    expect(profile).toContain("contato");
  });

  it("contact data: real github/linkedin, optional email/cv (undefined for now)", () => {
    const profile = read("src/data/profile.ts");
    expect(profile).toContain("https://github.com/lmaoclost");
    expect(profile).toContain("https://www.linkedin.com/in/renansmoliveira/");
  });

  it("about.astro exists on /about and consume profile (no hardcoded text)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toContain("profile");
    // bio must not be hardcoded in the template
    expect(page).not.toContain("Comecei a programar");
  });

  it("intro: photo placeholder with initials + role + social links", () => {
    const page = read("src/pages/about.astro");
    expect(page).toMatch(/aria-label="Foto de/);
    expect(page).toMatch(/initials|iniciais/i);
    expect(page).toContain("profile.role");
  });

  it("section labels mono caps (metadata voice, decided with user)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toMatch(/uppercase/);
    expect(page).toContain("font-mono");
  });

  it("email and cv conditional (render only when profile defines)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toMatch(/contato\.email\s*&&/);
    expect(page).toMatch(/contato\.cv\s*&&/);
  });

  it("projects with secure external links (noopener)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toContain('rel="noopener noreferrer"');
  });

  it("hobbies: grid collapses to 1 column on mobile", () => {
    const page = read("src/pages/about.astro");
    expect(page).toMatch(/lg:grid-cols-3|md:grid-cols-3/);
  });

  it("uses the Layout (navbar+footer comes free)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toContain("Layout");
    expect(page).toContain('title="Sobre');
  });
});
