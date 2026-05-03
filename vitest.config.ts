import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: [
        "src/App.tsx",
        "src/context/**/*.{ts,tsx}",
        "src/data/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
        "src/server/**/*.{ts,tsx}",
        "src/components/GoogleServicesCard.tsx",
      ],
      exclude: [
        "src/pages/**",
        "src/components/ui/**",
        "src/i18n/**",
        "src/lib/pdf.ts", // Complex PDF logic not currently tested
        "src/lib/utils.ts", // UI utils
        "src/hooks/use-mobile.tsx",
        "src/hooks/use-toast.ts",
        "src/hooks/useGeminiLive.ts",
        "src/hooks/useGoogleServiceStatus.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/index.ts",
        "**/*.d.ts",
        "src/test/**",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
