#!/usr/bin/env node
// npm audit with documented waivers: a vulnerability can be accepted for a
// while, but the waiver expires and must be re-evaluated.
// Inspired by Chris Titus's audit.mjs + audit-policy.mjs.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const waiversPath = join(root, "docs/security/npm-audit-waivers.json");

let waivers = {};
if (existsSync(waiversPath)) {
  const parsed = JSON.parse(readFileSync(waiversPath, "utf8"));
  waivers = parsed.advisories ?? {};
}

const result = spawnSync("npm", ["audit", "--json"], { encoding: "utf8" });
let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  process.stderr.write(
    result.stderr || result.stdout || "npm audit did not return JSON\n",
  );
  process.exit(result.status || 1);
}

if (result.error || ![0, 1].includes(result.status)) {
  process.stderr.write(
    result.stderr || `npm audit exited with status ${result.status}\n`,
  );
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities ?? {};
const today = new Date().toISOString().slice(0, 10);
const severe = new Set(["high", "critical"]);
const errors = [];
const waived = [];

function advisoryIds(name, seen = new Set()) {
  if (seen.has(name)) return [];
  seen.add(name);
  const vulnerability = vulnerabilities[name];
  if (!vulnerability) return [];
  const ids = [];
  for (const via of vulnerability.via ?? []) {
    if (typeof via === "string") {
      ids.push(...advisoryIds(via, seen));
    } else if (via.url) {
      const id = via.url.match(/GHSA-[a-z0-9-]+/i)?.[0]?.toUpperCase();
      if (id) ids.push(id);
      else ids.push(via.title ?? "unknown");
    }
  }
  return ids;
}

for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
  if (!severe.has(vulnerability.severity)) continue;
  const ids = advisoryIds(name);
  const comWaiver = ids.filter((id) => {
    const waiver = waivers[id];
    return waiver && (!waiver.expires || waiver.expires >= today);
  });
  if (comWaiver.length > 0) {
    waived.push(
      `${name} (${ids.join(", ")}) waived until ${(comWaiver[0] && waivers[comWaiver[0]]?.expires) || "no expiry"}`,
    );
  } else {
    errors.push(
      `${name} (${vulnerability.severity}) — advisories: ${ids.join(", ") || "no id"}`,
    );
  }
}

// expired waivers worth reporting
for (const [id, waiver] of Object.entries(waivers)) {
  if (
    waiver.expires &&
    waiver.expires < today &&
    !waived.some((w) => w.includes(id))
  ) {
    console.warn(
      `waiver expired: ${id} (expires ${waiver.expires}) — re-evaluate`,
    );
  }
}

if (waived.length) console.log(`waivered: ${waived.join("; ")}`);
if (errors.length > 0) {
  console.error(
    `npm audit: ${errors.length} severe vulnerability(ies) without active waiver:`,
  );
  for (const erro of errors) console.error(`  - ${erro}`);
  process.exit(1);
}
console.log("audit OK (no severe vulnerabilities without active waiver)");
