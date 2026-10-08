// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // placeholder: trocar pelo domínio real quando existir
  // (RSS/links absolutos derivam daqui)
  site: "https://lmaoclost.dev",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
