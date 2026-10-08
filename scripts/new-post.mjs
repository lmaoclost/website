#!/usr/bin/env node
// new:post CLI — creates a blog post skeleton with correct frontmatter.
// Inspired by Chris Titus's new-post.mjs; reuses this site's slugify.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { slugify } from "../src/utils/slugify.ts";

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

// Optional fields (description/tldr) are OMITTED, not left empty: an empty
// `description:` is YAML null and fails the collection schema. The HTML
// comment below documents them for the writer instead.
export function renderTemplate({ title, date, tags }) {
  const tagsYaml = tags.length
    ? `\ntags: [${tags.join(", ")}]`
    : "\ntags: []";
  return `---
title: ${JSON.stringify(title)}
pubDate: ${date}${tagsYaml}
draft: true
---

<!--
Opcionais do schema (adicione quando quiser preencher):
description: resumo curto do post (lista, RSS e meta description)
tldr: resumo em uma frase, colapsável no topo do post
tags: as tags viram links pra /tag/<slug>
-->
`;
}

export async function main(argv = process.argv.slice(2), root = process.cwd()) {
  const input = parseArguments(argv);
  const data = {
    ...input,
    date: input.date ?? todayUtc(),
  };
  const slug = slugify(data.title);
  if (!slug) throw new Error("title does not produce a usable slug");
  const blogDir = join(root, "src/content/blog");
  const postPath = join(blogDir, `${slug}.md`);
  mkdirSync(blogDir, { recursive: true });
  if (existsSync(postPath)) {
    throw new Error(`post already exists: ${postPath}`);
  }
  writeFileSync(postPath, renderTemplate(data));
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