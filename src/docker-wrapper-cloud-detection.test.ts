/**
 * Smoke test for wrapper server cloud environment detection
 * This tests the isCloudEnvironment() function logic without running the full server
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("wrapper cloud environment detection", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.RAILWAY_ENVIRONMENT;
    delete process.env.RAILWAY_PROJECT_ID;
    delete process.env.FLY_APP_NAME;
    delete process.env.RENDER;
    delete process.env.RENDER_SERVICE_NAME;
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  function isCloudEnvironment() {
    return !!(
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.FLY_APP_NAME ||
      process.env.RENDER ||
      process.env.RENDER_SERVICE_NAME
    );
  }

  it("detects Railway environment via RAILWAY_ENVIRONMENT", () => {
    process.env.RAILWAY_ENVIRONMENT = "production";
    expect(isCloudEnvironment()).toBe(true);
  });

  it("detects Railway environment via RAILWAY_PROJECT_ID", () => {
    process.env.RAILWAY_PROJECT_ID = "abc123";
    expect(isCloudEnvironment()).toBe(true);
  });

  it("detects Fly.io environment", () => {
    process.env.FLY_APP_NAME = "my-app";
    expect(isCloudEnvironment()).toBe(true);
  });

  it("detects Render environment via RENDER", () => {
    process.env.RENDER = "true";
    expect(isCloudEnvironment()).toBe(true);
  });

  it("detects Render environment via RENDER_SERVICE_NAME", () => {
    process.env.RENDER_SERVICE_NAME = "my-service";
    expect(isCloudEnvironment()).toBe(true);
  });

  it("returns false for local environment", () => {
    expect(isCloudEnvironment()).toBe(false);
  });

  it("returns false when only PORT is set", () => {
    process.env.PORT = "3000";
    expect(isCloudEnvironment()).toBe(false);
  });

  it("returns expected gateway bind mode in cloud", () => {
    process.env.RAILWAY_ENVIRONMENT = "production";
    const GATEWAY_BIND = isCloudEnvironment() ? "lan" : "loopback";
    expect(GATEWAY_BIND).toBe("lan");
  });

  it("returns expected gateway bind mode locally", () => {
    const GATEWAY_BIND = isCloudEnvironment() ? "lan" : "loopback";
    expect(GATEWAY_BIND).toBe("loopback");
  });
});
