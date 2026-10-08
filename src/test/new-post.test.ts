import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync, existsSync, rmSync, mkdtempSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(__dirname, "../..");
const script = resolve(root, "scripts/new-post.mjs");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #39: script de novo post", () => {
  it("scripts/new-post.mjs existe", () => {
    expect(existsSync(script)).toBe(true);
  });

  it("package.json tem o script new:post", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.scripts["new:post"]).toBeDefined();
    expect(pkg.scripts["new:post"]).toContain("new-post");
  });

  it("reusa o slugify do utils/slugify.ts (fonte única, sem duplicar)", () => {
    const src = read("scripts/new-post.mjs");
    expect(src).toMatch(/from ["'].*utils\/slugify/);
    expect(src).toContain("slugify");
  });

  it("parseArguments: título obrigatório, flags opcionais", async () => {
    const { parseArguments } = await import(script);
    const r = parseArguments([
      "Meu post",
      "--date",
      "2026-10-08",
      "--tags",
      "astro, web",
    ]);
    expect(r.title).toBe("Meu post");
    expect(r.date).toBe("2026-10-08");
    expect(r.tags).toEqual(["astro", "web"]);
  });

  it("parseArguments rejeita: sem título, data inválida, flag desconhecida", async () => {
    const { parseArguments } = await import(script);
    expect(() => parseArguments([])).toThrow();
    expect(() => parseArguments(["X", "--date", "2026-13-01"])).toThrow();
    expect(() => parseArguments(["X", "--foo", "bar"])).toThrow();
  });

  it("main cria o arquivo com frontmatter completo no content/blog", async () => {
    const dir = mkdtempSync(join(tmpdir(), "newpost-"));
    const { main } = await import(script);
    const criado = await main(["Post de teste automatizado"], dir);
    const arquivo = join(dir, "src/content/blog", `${criado.slug}.md`);
    expect(existsSync(arquivo)).toBe(true);
    const conteudo = readFileSync(arquivo, "utf-8");
    expect(conteudo).toContain('title: "Post de teste automatizado"');
    expect(conteudo).toMatch(/pubDate: \d{4}-\d{2}-\d{2}/);
    // campos opcionais OMITIDOS (description: vazio é YAML null e quebra o schema)
    expect(conteudo).not.toMatch(/^description:\s*$/m);
    expect(conteudo).not.toMatch(/^tldr:\s*$/m);
    expect(conteudo).toContain("tags: []");
    expect(conteudo).toContain("Opcionais do schema");
    rmSync(dir, { recursive: true, force: true });
  });

  it("main nunca sobrescreve post existente", async () => {
    const dir = mkdtempSync(join(tmpdir(), "newpost-"));
    const { main, slugify } = await import(script);
    const slug = await main(["Duplicado"], dir);
    await expect(main(["Duplicado"], dir)).rejects.toThrow(/existe|exists/i);
    rmSync(dir, { recursive: true, force: true });
  });
});
