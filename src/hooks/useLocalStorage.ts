import { useEffect, useRef } from "react";
import type { DiagramState } from "@/lib/types";

const STORAGE_KEY = "sequencedefiner:diagram";
const THEME_KEY = "sequencedefiner:theme";

export function loadDiagramFromStorage(): DiagramState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiagramState;
    if (
      Array.isArray(parsed.actors) &&
      Array.isArray(parsed.elements)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveDiagramToStorage(state: DiagramState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function clearDiagramStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function useAutoSaveDiagram(state: DiagramState): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip saving the initial empty state on first render —
    // it would overwrite any persisted diagram before loadState runs.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveDiagramToStorage(state);
  }, [state]);
}

export function loadThemeFromStorage(): "light" | "dark" | null {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === "light" || raw === "dark") return raw;
    return null;
  } catch {
    return null;
  }
}

export function saveThemeToStorage(theme: "light" | "dark"): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Silently ignore
  }
}
