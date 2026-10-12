import { describe, it, expect, beforeEach, vi } from "vitest";
import { getConsentState, saveConsentState } from "@/lib/consent";

const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: storageMock,
});

Object.defineProperty(global, "window", {
  value: {
    dispatchEvent: vi.fn(),
    location: { pathname: "/", search: "", origin: "https://www.algojua.top" },
  },
  writable: true,
});

describe("Consent Preferences Module", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default consent state when no preferences exist", () => {
    const state = getConsentState();
    expect(state.essential).toBe(true);
    expect(state.analytics).toBe(false);
    expect(state.advertising).toBe(false);
    expect(state.decided).toBe(false);
  });

  it("persists updated consent preferences in localStorage", () => {
    saveConsentState({
      analytics: true,
      advertising: true,
    });

    const updated = getConsentState();
    expect(updated.essential).toBe(true);
    expect(updated.analytics).toBe(true);
    expect(updated.advertising).toBe(true);
    expect(updated.decided).toBe(true);
  });

  it("handles rejecting optional consent correctly", () => {
    saveConsentState({
      analytics: false,
      advertising: false,
    });

    const updated = getConsentState();
    expect(updated.analytics).toBe(false);
    expect(updated.advertising).toBe(false);
    expect(updated.decided).toBe(true);
  });
});
