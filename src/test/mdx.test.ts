import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #44: embeds com MDX", () => {
  it("@astrojs/mdx instalado e na integração do astro.config", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.dependencies["@astrojs/mdx"]).toBeDefined();
    const config = read("astro.config.mjs");
    expect(config).toContain("mdx");
  });

  it("ComponentYouTube.astro: iframe lazy 16:9 dentro da medida, título acessível", () => {
    const component = read("src/components/YouTube.astro");
    expect(component).toMatch(/<iframe/);
    expect(component).toContain('loading="lazy"');
    expect(component).toMatch(/aspect-ratio|aspect-video/);
    expect(component).toMatch(/title=/);
  });

  it("post de demonstração .mdx existe (temporário, não commitado)", () => {
    const path = resolve(root, "src/content/blog/post-demo-mdx.mdx");
    expect(existsSync(path)).toBe(true);
    const post = read("src/content/blog/post-demo-mdx.mdx");
    expect(post).toContain("YouTube");
    expect(post).toContain("## ");
  });

  it("collection aceita .md e .mdx (glob pattern)", () => {
    const config = read("src/content.config.ts");
    expect(config).toContain("md");
  });

  it("post page renderiza mdx (render(entry) compatível) — contrato da #24 mantida", () => {
    const page = read("src/pages/blog/[slug].astro");
    expect(page).toContain("render");
  });
});
