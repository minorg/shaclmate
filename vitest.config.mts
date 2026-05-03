import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
    },
    // include: ["**/__tests__/**/*.test.ts"],
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.mts"],
  },
});
