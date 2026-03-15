import { useCallback, useState } from "react";
import type {
  Actor,
  ActorType,
  DiagramElement,
  DiagramState,
} from "@/lib/types";

let nextId = 1;
function generateId(): string {
  return `id-${nextId++}-${Date.now()}`;
}

const DEFAULT_TITLE = "Title";
export { DEFAULT_TITLE };

const emptyState: DiagramState = {
  title: DEFAULT_TITLE,
  actors: [],
  elements: [],
};

export function useDiagram(initialState?: DiagramState) {
  const [state, setState] = useState<DiagramState>(initialState ?? emptyState);

  const addActor = useCallback(
    (name: string, type: ActorType = "participant") => {
      const actor: Actor = { id: generateId(), name, type };
      setState((prev) => ({ ...prev, actors: [...prev.actors, actor] }));
    },
    []
  );

  const removeActor = useCallback((actorId: string) => {
    setState((prev) => ({
      actors: prev.actors.filter((a) => a.id !== actorId),
      elements: prev.elements.filter((el) => {
        if (el.kind === "message") return el.from !== actorId && el.to !== actorId;
        if (el.kind === "activation") return el.actorId !== actorId;
        if (el.kind === "note") return !el.actorIds.includes(actorId);
        return true;
      }),
    }));
  }, []);

  const renameActor = useCallback(
    (actorId: string, name: string) => {
      setState((prev) => ({
        ...prev,
        actors: prev.actors.map((a) =>
          a.id === actorId ? { ...a, name } : a
        ),
      }));
    },
    []
  );

  const reorderActor = useCallback((actorId: string, newIndex: number) => {
    setState((prev) => {
      const actors = [...prev.actors];
      const currentIndex = actors.findIndex((a) => a.id === actorId);
      if (currentIndex === -1) return prev;
      const clamped = Math.max(0, Math.min(newIndex, actors.length - 1));
      const [actor] = actors.splice(currentIndex, 1);
      actors.splice(clamped, 0, actor);
      return { ...prev, actors };
    });
  }, []);

  const updateActorType = useCallback((actorId: string, type: ActorType) => {
    setState((prev) => ({
      ...prev,
      actors: prev.actors.map((a) =>
        a.id === actorId ? { ...a, type } : a
      ),
    }));
  }, []);

  const addElement = useCallback(
    (
      element:
        | Omit<DiagramElement & { kind: "message" }, "id">
        | Omit<DiagramElement & { kind: "activation" }, "id">
        | Omit<DiagramElement & { kind: "note" }, "id">
    ) => {
      const newElement = { ...element, id: generateId() } as DiagramElement;
      setState((prev) => ({
        ...prev,
        elements: [...prev.elements, newElement],
      }));
    },
    []
  );

  const removeElement = useCallback((elementId: string) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== elementId),
    }));
  }, []);

  const updateElement = useCallback(
    (updatedElement: DiagramElement) => {
      setState((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === updatedElement.id ? updatedElement : el
        ),
      }));
    },
    []
  );

  const reorderElement = useCallback((elementId: string, newIndex: number) => {
    setState((prev) => {
      const elements = [...prev.elements];
      const currentIndex = elements.findIndex((el) => el.id === elementId);
      if (currentIndex === -1) return prev;
      const clamped = Math.max(0, Math.min(newIndex, elements.length - 1));
      const [element] = elements.splice(currentIndex, 1);
      elements.splice(clamped, 0, element);
      return { ...prev, elements };
    });
  }, []);

  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title }));
  }, []);

  const resetDiagram = useCallback(() => {
    setState(emptyState);
  }, []);

  const loadState = useCallback((newState: DiagramState) => {
    setState(newState);
  }, []);

  return {
    state,
    addActor,
    removeActor,
    renameActor,
    reorderActor,
    updateActorType,
    addElement,
    removeElement,
    updateElement,
    reorderElement,
    setTitle,
    resetDiagram,
    loadState,
  };
}
