import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #23: página sobre mim", () => {
  it("src/data/profile.ts existe e é tipado", () => {
    expect(existsSync(resolve(root, "src/data/profile.ts"))).toBe(true);
    const profile = read("src/data/profile.ts");
    expect(profile).toMatch(/interface|type\s/);
    expect(profile).toContain("nome");
    expect(profile).toContain("experiencia");
    expect(profile).toContain("projetos");
    expect(profile).toContain("hobbies");
    expect(profile).toContain("contato");
  });

  it("dados de contato: github/linkedin reais, email/cv opcionais (undefined agora)", () => {
    const profile = read("src/data/profile.ts");
    expect(profile).toContain("https://github.com/lmaoclost");
    expect(profile).toContain("https://www.linkedin.com/in/renansmoliveira/");
  });

  it("about.astro existe na rota /about e consome profile (sem hardcode de texto)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toContain("profile");
    // bio não pode estar colada no template
    expect(page).not.toContain("Comecei a programar");
  });

  it("intro: foto placeholder com iniciais + role + links sociais", () => {
    const page = read("src/pages/about.astro");
    expect(page).toMatch(/aria-label="Foto de/);
    expect(page).toMatch(/initials|iniciais/i);
    expect(page).toContain("profile.role");
  });

  it("labels de seção caps em mono (voz de metadado, decisão com usuário)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toMatch(/uppercase/);
    expect(page).toContain("font-mono");
  });

  it("email e cv condicionais (só renderizam quando profile define)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toMatch(/contato\.email\s*&&/);
    expect(page).toMatch(/contato\.cv\s*&&/);
  });

  it("projetos com link externo seguro (noopener)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toContain('rel="noopener noreferrer"');
  });

  it("hobbies: grid que colapsa pra 1 coluna em mobile", () => {
    const page = read("src/pages/about.astro");
    expect(page).toMatch(/lg:grid-cols-3|md:grid-cols-3/);
  });

  it("usa o Layout (navbar+footer grátis)", () => {
    const page = read("src/pages/about.astro");
    expect(page).toContain("Layout");
    expect(page).toContain('title="Sobre');
  });
});
