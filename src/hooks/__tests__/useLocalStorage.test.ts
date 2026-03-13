import { describe, it, expect, beforeEach } from "vitest";
import {
  loadDiagramFromStorage,
  saveDiagramToStorage,
  clearDiagramStorage,
  loadThemeFromStorage,
  saveThemeToStorage,
} from "@/hooks/useLocalStorage";
import type { DiagramState } from "@/lib/types";

const STORAGE_KEY = "sequencedefiner:diagram";
const THEME_KEY = "sequencedefiner:theme";

beforeEach(() => {
  localStorage.clear();
});

describe("saveDiagramToStorage / loadDiagramFromStorage", () => {
  it("returns null when storage is empty", () => {
    expect(loadDiagramFromStorage()).toBeNull();
  });

  it("saves and loads a diagram state", () => {
    const state: DiagramState = {
      actors: [{ id: "a1", name: "Alice", type: "participant" }],
      elements: [
        {
          kind: "message",
          id: "e1",
          from: "a1",
          to: "a1",
          label: "Hello",
          arrowType: "->>",
        },
      ],
    };
    saveDiagramToStorage(state);
    expect(loadDiagramFromStorage()).toEqual(state);
  });

  it("saves and loads an empty diagram state", () => {
    const state: DiagramState = { actors: [], elements: [] };
    saveDiagramToStorage(state);
    expect(loadDiagramFromStorage()).toEqual(state);
  });

  it("saves a state with all element types and loads it back correctly", () => {
    const state: DiagramState = {
      actors: [
        { id: "a1", name: "Alice", type: "participant" },
        { id: "a2", name: "Bob", type: "actor" },
      ],
      elements: [
        {
          kind: "message",
          id: "e1",
          from: "a1",
          to: "a2",
          label: "Hi",
          arrowType: "->>",
        },
        { kind: "activation", id: "e2", actorId: "a2", type: "activate" },
        {
          kind: "note",
          id: "e3",
          position: "over",
          actorIds: ["a1", "a2"],
          text: "A note",
        },
      ],
    };
    saveDiagramToStorage(state);
    expect(loadDiagramFromStorage()).toEqual(state);
  });

  it("returns null when stored JSON is invalid", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json{{");
    expect(loadDiagramFromStorage()).toBeNull();
  });

  it("returns null when stored value is missing required fields", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ actors: [] }));
    expect(loadDiagramFromStorage()).toBeNull();
  });

  it("overwrites previously saved state", () => {
    const first: DiagramState = {
      actors: [{ id: "a1", name: "Alice", type: "participant" }],
      elements: [],
    };
    const second: DiagramState = {
      actors: [{ id: "a2", name: "Bob", type: "actor" }],
      elements: [],
    };
    saveDiagramToStorage(first);
    saveDiagramToStorage(second);
    expect(loadDiagramFromStorage()).toEqual(second);
  });
});

describe("clearDiagramStorage", () => {
  it("removes the saved diagram so loadDiagramFromStorage returns null", () => {
    saveDiagramToStorage({ actors: [], elements: [] });
    clearDiagramStorage();
    expect(loadDiagramFromStorage()).toBeNull();
  });

  it("does not throw when called on an already-empty storage", () => {
    expect(() => clearDiagramStorage()).not.toThrow();
  });
});

describe("saveThemeToStorage / loadThemeFromStorage", () => {
  it("returns null when no theme is stored", () => {
    expect(loadThemeFromStorage()).toBeNull();
  });

  it("saves and loads the light theme", () => {
    saveThemeToStorage("light");
    expect(loadThemeFromStorage()).toBe("light");
  });

  it("saves and loads the dark theme", () => {
    saveThemeToStorage("dark");
    expect(loadThemeFromStorage()).toBe("dark");
  });

  it("returns null when the stored theme value is unrecognised", () => {
    localStorage.setItem(THEME_KEY, "solarized");
    expect(loadThemeFromStorage()).toBeNull();
  });

  it("overwrites a previously saved theme", () => {
    saveThemeToStorage("light");
    saveThemeToStorage("dark");
    expect(loadThemeFromStorage()).toBe("dark");
  });
});
