#!/usr/bin/env node
// new:post CLI — creates a blog post skeleton from templates/post.md.tmpl.
// Template lives in a file (editable without touching code); the rendered
// output is validated with a YAML round trip before writing.
// Inspired by Chris Titus's new-post.mjs; reuses this site's slugify.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { parse as parseYaml } from "yaml";

import { slugify } from "../src/utils/slugify.ts";

const RESERVED_ROUTES = new Set([
  "about",
  "projects",
  "design",
  "blog",
  "tag",
  "rss.xml",
  "404",
]);

export function parseArguments(argv) {
  const [title, ...rest] = argv;
  if (!title || title.startsWith("--")) {
    throw new Error(
      'usage: npm run new:post -- "<title>" [--date YYYY-MM-DD] [--tags "a, b"]',
    );
  }
  let date;
  let tags = [];
  for (let i = 0; i < rest.length; i += 1) {
    const flag = rest[i];
    const value = rest[i + 1];
    if (flag === "--date" && value) {
      date = value;
      i += 1;
      continue;
    }
    if (flag === "--tags" && value) {
      tags = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }
    throw new Error(`unknown or incomplete option: ${flag}`);
  }
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("--date must be in YYYY-MM-DD form");
    }
    const parsed = new Date(`${date}T00:00:00Z`);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    ) {
      throw new Error("--date must be a real calendar date");
    }
  }
  return { title, date, tags };
}

export function todayUtc(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/** Route collision check: a post slug that would shadow a fixed page fails at generation (not at build). */
function assertSlugAvailable(slug) {
  if (RESERVED_ROUTES.has(slug)) {
    throw new Error(
      `slug "${slug}" collides with a reserved route — pick a different title`,
    );
  }
}

/** Renders the template file with token replacement. */
export function renderTemplate(template, { title, date, tags }, slug) {
  const tagsYaml = tags.length ? `\ntags: [${tags.join(", ")}]` : "";
  return template
    .replaceAll("{{TITLE}}", () => JSON.stringify(title))
    .replaceAll("{{DATE}}", date)
    .replaceAll("{{SLUG}}", slug)
    .replaceAll("{{TAGS}}", tagsYaml);
}

/** YAML round trip: the generated frontmatter must parse back to the exact input. */
function validateRoundTrip(output, { title, date, tags }) {
  const match = output.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error("generated template has no frontmatter block");
  const parsed = parseYaml(match[1]);
  if (parsed.title !== title) {
    throw new Error("generated title failed exact YAML round trip");
  }
  if (parsed.pubDate !== date) {
    throw new Error("generated pubDate failed exact YAML round trip");
  }
}

export async function main(argv = process.argv.slice(2), root = process.cwd()) {
  const input = parseArguments(argv);
  const data = {
    ...input,
    date: input.date ?? todayUtc(),
  };
  const slug = slugify(data.title);
  if (!slug) throw new Error("title does not produce a usable slug");
  assertSlugAvailable(slug);

  // template always comes from the real repo (main root), not root arg:
  // tests pass a tmp dir for the OUTPUT, the template stays versioned
  const templatePath = join(import.meta.dirname, "../templates/post.md.tmpl");
  if (!existsSync(templatePath)) {
    throw new Error(`template not found: ${templatePath}`);
  }
  const template = readFileSync(templatePath, "utf8");

  const output = renderTemplate(template, data, slug);
  validateRoundTrip(output, data);

  const blogDir = join(root, "src/content/blog");
  const postPath = join(blogDir, `${slug}.md`);
  mkdirSync(blogDir, { recursive: true });
  if (existsSync(postPath)) {
    throw new Error(`post already exists: ${postPath}`);
  }

  mkdirSync(dirname(postPath), { recursive: true });
  writeFileSync(postPath, output, { flag: "wx" });
  return { slug, postPath };
}

// run only when invoked directly (npm run new:post / node scripts/new-post.mjs)
const invokedDirectly =
  process.argv[1] &&
  (process.argv[1].endsWith("new-post.mjs") ||
    process.argv[1].endsWith("new-post"));

if (invokedDirectly) {
  main()
    .then(({ postPath }) => {
      console.log(`created: ${postPath}`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
