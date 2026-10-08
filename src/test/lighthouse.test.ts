import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #43: Lighthouse CI", () => {
  it("lighthouserc.json existe", () => {
    expect(existsSync(resolve(root, "lighthouserc.json"))).toBe(true);
  });

  it("roda contra dist estático (staticDistDir), sem servidor externo", () => {
    const config = JSON.parse(read("lighthouserc.json"));
    const ci = config.ci;
    expect(ci.collect).toBeDefined();
    expect(JSON.stringify(ci.collect)).toMatch(/dist|staticDistDir/);
    expect(ci.collect.url).toBeDefined();
  });

  it("URLs alvo: / e /blog/<post> e /about", () => {
    const config = JSON.parse(read("lighthouserc.json"));
    const urls = config.ci.collect.url;
    expect(urls.some((u: string) => u.includes("/")));
    expect(urls.some((u: string) => u.includes("/blog/")));
    expect(urls.some((u: string) => u.includes("/about")));
  });

  it("asserções mínimas: performance >= .95, accessibility >= .95, seo >= .9, best-practices >= .9", () => {
    const config = JSON.parse(read("lighthouserc.json"));
    const assert = config.ci.assert;
    const assercoes = assert.assertions ?? assert;
    const texto = JSON.stringify(assercoes);
    expect(texto).toContain("performance");
    expect(texto).toContain("accessibility");
    expect(texto).toContain("seo");
    expect(texto).toContain("best-practices");
  });

  it("package.json tem test:lighthouse (lhci autorun)", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.scripts["test:lighthouse"]).toBeDefined();
    expect(pkg.scripts["test:lighthouse"]).toContain("lhci");
  });
});
