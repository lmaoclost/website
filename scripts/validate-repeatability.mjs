#!/usr/bin/env node
// Verifies the build is deterministic: two consecutive builds must produce
// identical hashes. Catches Date.now()/random data leaking into the output.
// Inspired by Chris Titus's validate-repeatability.mjs.
import { createHash } from "node:crypto";
import {
  readdirSync,
  statSync,
  readFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();

function hashDist() {
  const dist = join(root, "dist");
  if (!existsSync(dist)) return null;
  const files = [];
  (function walk(dir) {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else files.push(full);
    }
  })(dist);
  const hasher = createHash("sha256");
  // paths sorted + contents hashed: path order is stable because readdirSync sorted
  for (const file of files.sort()) {
    hasher.update(relative(dist, file));
    hasher.update(readFileSync(file));
  }
  return hasher.digest("hex");
}

function build(number) {
  rmSync(join(root, "dist"), { recursive: true, force: true });
  const result = spawnSync("npx", ["astro", "build"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`first build failed (number ${number})`);
  }
  return hashDist();
}

console.log("build 1/2...");
const first = build(1);
console.log("build 2/2...");
const second = build(2);

if (first !== second) {
  console.error(
    `build is not deterministic:\n  first:  ${first}\n  second: ${second}`,
  );
  process.exit(1);
}

console.log(`deterministic build OK (${first.slice(0, 16)}...)`);
