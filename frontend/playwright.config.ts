import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3003",
    trace: "retain-on-failure",
  },
  // No webServer block on purpose. Both halves are started by hand (native
  // `make dev-backend` / `make dev-frontend`, or the containers via `make
  // up`); letting Playwright boot Next while a dev server is already running
  // clobbers .next and makes every route hang.
});
