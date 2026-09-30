/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    // Vitest configuration options/// <reference types="vitest" />
    environment: "node",
  },
});
