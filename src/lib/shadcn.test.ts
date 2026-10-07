import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

describe("issue #21: shadcn/ui init", () => {
  it("components.json existe com cssVariables", () => {
    const path = resolve(root, "components.json");
    expect(existsSync(path)).toBe(true);
    const cfg = JSON.parse(readFileSync(path, "utf-8"));
    expect(cfg.tailwind.cssVariables).toBe(true);
    expect(cfg.tailwind.css).toContain("global.css");
  });

  it("util cn existe em src/lib/utils", () => {
    const path = resolve(root, "src/lib/utils.ts");
    expect(existsSync(path)).toBe(true);
    const src = readFileSync(path, "utf-8");
    expect(src).toContain("clsx");
    expect(src).toContain("twMerge");
  });
});