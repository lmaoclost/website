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

  it("remoção da #45: util cn e componentes stub saem; tokens e components.json ficam", () => {
    expect(existsSync(resolve(root, "src/lib/utils.ts"))).toBe(false);
    expect(existsSync(resolve(root, "src/components/ui"))).toBe(false);
    expect(existsSync(resolve(root, "components.json"))).toBe(true);
  });
});
