import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #41: integração de rotas, determinismo e audit", () => {
  it("scripts/validate-routes.mjs existe com contrato de rotas", () => {
    expect(existsSync(resolve(root, "scripts/validate-routes.mjs"))).toBe(true);
    const src = read("scripts/validate-routes.mjs");
    // rotas fixas da página (independente de posts)
    for (const rota of [
      "/",
      "/about/",
      "/projects/",
      "/design/",
      "/rss.xml",
      "/404.html",
      "/index.html",
    ]) {
      expect(src).toContain(rota);
    }
    // rotas derivadas dos posts (contrato da #24)
    expect(src).toContain("/blog/");
    expect(src).toContain("/tag/");
  });

  it("contrato de posts vem das collections (slugify(title)), não hardcoded", () => {
    const src = read("scripts/validate-routes.mjs");
    expect(src).toContain("slugify");
    expect(src).toContain("blog");
  });

  it("valida o RSS no dist: XML com items dos posts, links absolutos", () => {
    const src = read("scripts/validate-routes.mjs");
    expect(src).toContain("rss.xml");
    expect(src).toContain("<item>");
    expect(src).toContain("content:encoded");
  });

  it("valida a descoberta do feed (rel=alternate na home)", () => {
    const src = read("scripts/validate-routes.mjs");
    expect(src).toContain('rel="alternate"');
  });

  it("scripts/validate-repeatability.mjs: build 2x com diff de hash", () => {
    expect(
      existsSync(resolve(root, "scripts/validate-repeatability.mjs")),
    ).toBe(true);
    const src = read("scripts/validate-repeatability.mjs");
    expect(src).toContain("createHash");
    // duas execuções comparadas
    expect(src).toMatch(/( primeira|segunda|first|second)/i);
  });

  it("scripts/audit.mjs: npm audit + waivers caducáveis", () => {
    expect(existsSync(resolve(root, "scripts/audit.mjs"))).toBe(true);
    const src = read("scripts/audit.mjs");
    expect(src).toContain("npm audit");
    expect(src).toMatch(/waiver/i);
    expect(src).toMatch(/expires|expira/i);
    expect(src).toMatch(/high|critical/i);
  });

  it("docs/security/npm-audit-waivers.json existe (formato advisory/reason/expires)", () => {
    const waiversPath = resolve(root, "docs/security/npm-audit-waivers.json");
    expect(existsSync(waiversPath)).toBe(true);
    const waivers = JSON.parse(read("docs/security/npm-audit-waivers.json"));
    expect(typeof waivers.advisories).toBe("object");
    // cada waiver carrega reason + expires (caducável)
    for (const [id, waiver] of Object.entries(waivers.advisories)) {
      expect(waiver.reason).toBeDefined();
      expect(waiver.expires).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("package.json: scripts validate:routes, validate:repeat e audit", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.scripts["validate:routes"]).toBeDefined();
    expect(pkg.scripts["validate:repeat"]).toBeDefined();
    expect(pkg.scripts.audit).toBeDefined();
  });
});
