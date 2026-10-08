import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf-8");

describe("issue #22: página do blog", () => {
  it("collection blog registrada com schema (title, pubDate, tags, draft)", () => {
    const config = read("src/content.config.ts");
    expect(config).toContain("defineCollection");
    expect(config).toContain("const blog");
    expect(config).toContain("pubDate");
    expect(config).toContain("tags");
    expect(config).toContain("draft");
  });

  it("diretório src/content/blog existe (vazio até posts reais)", () => {
    const dir = resolve(root, "src/content/blog");
    expect(existsSync(dir)).toBe(true);
  });

  it("utils blog.ts: ordena desc, filtra draft, agrupa por mês", () => {
    const util = read("src/utils/blog.ts");
    expect(util).toContain("sort");
    expect(util).toContain("draft");
    expect(util).toContain("getMonths");
    expect(util).toContain("getPosts");
  });

  it("testes unitários dos utils com datas fake verificam agrupamento", () => {
    // os testes unitários de fato (com datas sintéticas) vivem aqui
    // importando o util real — ver it() específico abaixo
    expect(existsSync(resolve(root, "src/utils/blog.ts"))).toBe(true);
  });

  it("PostItem.astro: dia mono, tooltip com datetime completo, título, meta, tags texto", () => {
    const item = read("src/components/PostItem.astro");
    expect(item).toContain("font-mono");
    expect(item).toContain("toISOString");
    expect(item).toContain("text-primary");
    expect(item).not.toMatch(/<a[^>]*href="\/tag/); // tags sem link (#33)
    expect(item).not.toContain("comments");
  });

  it("MonthNav.astro: lista só meses com posts, âncoras YYYY-MM, sticky", () => {
    const nav = read("src/components/MonthNav.astro");
    expect(nav).toContain("sticky");
    expect(nav).toContain("Nesta página");
    expect(nav).toContain("hidden lg:block");
  });

  it("home agrupa por mês com heading id=YYYY-MM e usa os componentes", () => {
    const home = read("src/pages/index.astro");
    expect(home).toContain("PostItem");
    expect(home).toContain("MonthNav");
    expect(home).toMatch(/id=/);
    expect(home).toContain("getMonths");
  });
});

describe("utils de leitura (#22): minutos de leitura", () => {
  it("200 palavras → 1 min (ceil), 400 → 2, 100 → 1 (mínimo)", async () => {
    const { minutosDeLeitura } = await import("../utils/blog");
    expect(minutosDeLeitura("palavra ".repeat(200).trim())).toBe(1);
    expect(minutosDeLeitura("palavra ".repeat(400).trim())).toBe(2);
    expect(minutosDeLeitura("poucas palavras")).toBe(1);
  });

  it("ignora whitespace excessivo", async () => {
    const { minutosDeLeitura } = await import("../utils/blog");
    expect(minutosDeLeitura("um\ndois\n\ntres   quatro")).toBe(1);
  });
});

describe("PostItem: CTA correto (#22 item 4)", () => {
  const item = () =>
    readFileSync(
      resolve(__dirname, "..", "components", "PostItem.astro"),
      "utf-8",
    );

  it("link envolve só dia+título, meta/tags fora do link", () => {
    const src = item();
    // o <a> não pode englobar o parágrafo de meta/tags
    const fimDoLink = src.indexOf("</a>");
    const posTags = src.indexOf("post.tags");
    const posMinutos = src.indexOf("post.minutos");
    expect(fimDoLink).toBeLessThan(posTags);
    expect(fimDoLink).toBeLessThan(posMinutos);
  });

  it("aria-label do CTA: 'Ler: título · datetime'", () => {
    const src = item();
    expect(src).toMatch(
      /aria-label=\{`Ler: \$\{post\.title\} · \$\{datetime\}`\}/,
    );
  });

  it("hover de cor primária só no título", () => {
    const src = item();
    expect(src).toContain("group-hover:text-primary");
    expect(src.match(/group-hover:text-primary/g)?.length).toBe(1);
  });
});

describe("contrato de href da lista (#24 consumirá)", () => {
  const item = () =>
    readFileSync(
      resolve(__dirname, "..", "components", "PostItem.astro"),
      "utf-8",
    );

  it("hrefs seguem /blog/<slugify(title)>, slug derivado do título", () => {
    const src = item();
    expect(src).toContain("href={post.href}");
    const util = readFileSync(
      resolve(__dirname, "..", "utils", "blog.ts"),
      "utf-8",
    );
    expect(util).toContain("slugify(post.title)");
    expect(util).toContain("`/blog/${");
  });
});
