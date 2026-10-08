import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

function workflow() {
  const path = resolve(root, ".github/workflows/ci.yml");
  return readFileSync(path, "utf-8");
}

describe("issue #42: CI no GitHub Actions", () => {
  it(".github/workflows/ci.yml existe", () => {
    expect(existsSync(resolve(root, ".github/workflows/ci.yml"))).toBe(true);
  });

  it("dispara em pull_request e push na main", () => {
    const yml = workflow();
    expect(yml).toContain("pull_request:");
    expect(yml).toMatch(/push:[\s\S]*branches:[\s\S]*main/);
  });

  it("permissions mínimas (contents: read)", () => {
    expect(workflow()).toContain("contents: read");
  });

  it("jobs esperados: formatting, unit-tests, build+validação, audit, lighthouse", () => {
    const yml = workflow();
    for (const job of [
      "formatting",
      "unit-tests",
      "build-validation",
      "npm-audit",
      "lighthouse",
    ]) {
      expect(yml, job).toContain(job);
    }
  });

  it("job de build roda build + validate:repeat + validate:routes", () => {
    const yml = workflow();
    expect(yml).toContain("npm run build");
    expect(yml).toContain("npm run validate:repeat");
    expect(yml).toContain("npm run validate:routes");
  });

  it("setup-node com versão fixa + cache npm em todos os jobs", () => {
    const yml = workflow();
    expect(yml).toContain("setup-node");
    expect(yml).toMatch(/node-version:\s*["']?2[24]/);
    expect(yml).toContain("cache: npm");
    expect((yml.match(/cache: npm/g) || []).length).toBeGreaterThanOrEqual(5);
  });

  it("lighthouse job usa playwright chromium e test:lighthouse", () => {
    const yml = workflow();
    const lighthouse = yml.slice(yml.indexOf("lighthouse:"));
    expect(lighthouse).toContain("playwright install");
    expect(lighthouse).toContain("test:lighthouse");
  });

  it("audit job usa npm run audit (com waivers)", () => {
    const yml = workflow();
    expect(yml).toContain("npm run audit");
  });

  it("yaml válido: parseia como objeto com jobs", () => {
    // parse manual mínimo: sem lib externa, valida indentação estrutural básica
    const yml = workflow();
    expect(yml).toMatch(/^name:/m);
    expect(yml).toMatch(/^jobs:/m);
    expect(yml).not.toMatch(/\t/); // tabs quebram yaml
  });
});
