import { getCollection } from "astro:content";

export interface PostListItem {
  title: string;
  day: string;
  pubDate: Date;
  tags: string[];
  href: string;
  minutos: number;
}

export interface MonthGroup {
  /** anchor slug: YYYY-MM */
  id: string;
  /** human label: "2026 - Outubro" */
  label: string;
  posts: PostListItem[];
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function monthLabel(ano: number, mes: number): string {
  return `${ano} - ${MESES[mes]}`;
}

export function monthSlug(ano: number, mes: number): string {
  return `${ano}-${String(mes + 1).padStart(2, "0")}`;
}

/** Groups by year+month preserving input order (newest first). */
export function groupPostsByMonth<
  T extends {
    pubDate: Date;
    title: string;
    tags: string[];
    minutos: number;
  },
>(posts: T[]): MonthGroup[] {
  const grupos = new Map<string, MonthGroup>();
  for (const post of posts) {
    const ano = post.pubDate.getUTCFullYear();
    const mes = post.pubDate.getUTCMonth();
    const id = monthSlug(ano, mes);
    if (!grupos.has(id)) {
      grupos.set(id, {
        id,
        label: monthLabel(ano, mes),
        posts: [],
      });
    }
    grupos.get(id)!.posts.push({
      title: post.title,
      day: String(post.pubDate.getUTCDate()).padStart(2, "0"),
      pubDate: post.pubDate,
      tags: post.tags,
      href: `/blog/${slugify(post.title)}`,
      minutos: post.minutos,
    });
  }
  return [...grupos.values()];
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Reading time estimate: 200 words per minute, minimum 1. */
export function readingTime(texto: string): number {
  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(palavras / 200));
}

export async function getPosts() {
  const todos = await getCollection("blog", ({ data }) => !data.draft);
  return todos.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getMonths(): Promise<MonthGroup[]> {
  return groupPostsByMonth(
    (await getPosts()).map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      tags: p.data.tags,
      minutos: readingTime(p.body ?? ""),
    })),
  );
}
