import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync, existsSync, rmSync, mkdtempSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(__dirname, "../..");
const script = resolve(root, "scripts/new-post.mjs");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #39: script de novo post", () => {
  it("scripts/new-post.mjs e templates/post.md.tmpl existem", () => {
    expect(existsSync(script)).toBe(true);
    expect(existsSync(resolve(root, "templates/post.md.tmpl"))).toBe(true);
  });

  it("package.json tem o script new:post", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.scripts["new:post"]).toBeDefined();
    expect(pkg.scripts["new:post"]).toContain("new-post");
  });

  it("reusa o slugify do utils/slugify.ts e renderiza de templates/post.md.tmpl", () => {
    const src = read("scripts/new-post.mjs");
    expect(src).toMatch(/from ["'].*utils\/slugify/);
    expect(src).toContain("templates/post.md.tmpl");
    expect(src).toContain("renderTemplate");
  });

  it("valida round trip yaml do frontmatter gerado (title/pubDate)", () => {
    const src = read("scripts/new-post.mjs");
    expect(src).toContain("validateRoundTrip");
    expect(src).toContain("round trip");
  });

  it("rejeita colisão de rota com páginas fixas (about/projects/design/blog/tag)", async () => {
    const { main } = await import(script);
    await expect(main(["About"], "tmp")).rejects.toThrow(/reserved route/i);
    await expect(main(["Projects"], "tmp")).rejects.toThrow(/reserved route/i);
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
    // sem --tags: a linha é omitida do frontmatter (schema default = [])
    // (o guia em comentário menciona "tags:" de propósito — checar só o frontmatter)
    const fm = conteudo.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    expect(fm).not.toMatch(/^tags:/m);
    expect(conteudo).toContain("Optional schema fields");
    rmSync(dir, { recursive: true, force: true });
  });

  it("main com --tags renderiza a linha de tags", async () => {
    const dir = mkdtempSync(join(tmpdir(), "newpost-"));
    const { main } = await import(script);
    await main(["Post com tags", "--tags", "astro, web"], dir);
    const conteudo = readFileSync(
      join(dir, "src/content/blog", "post-com-tags.md"),
      "utf-8",
    );
    expect(conteudo).toContain("tags: [astro, web]");
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
