import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let devPlugin = undefined;

  if (mode === "development") {
    try {
      const mod = await import("lovable-tagger");
      if (mod && typeof mod.componentTagger === "function") {
        devPlugin = mod.componentTagger();
      }
    } catch (err) {
      // If the package isn't installed (e.g., in CI), continue without the plugin.
      // This prevents build failures when the dev-only dependency is absent.
      // eslint-disable-next-line no-console
      console.warn("lovable-tagger not found — skipping development plugin.", err?.message || err);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), devPlugin].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
