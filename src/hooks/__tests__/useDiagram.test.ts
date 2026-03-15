import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDiagram } from "@/hooks/useDiagram";
import type { DiagramState } from "@/lib/types";

// Helper to get the initial state produced by the hook
function setup(initialState?: DiagramState) {
  return renderHook(() => useDiagram(initialState));
}

describe("useDiagram – initial state", () => {
  it("starts with empty actors and elements when no initial state is provided", () => {
    const { result } = setup();
    expect(result.current.state.actors).toEqual([]);
    expect(result.current.state.elements).toEqual([]);
  });

  it("starts with default title 'Title' when no initial state is provided", () => {
    const { result } = setup();
    expect(result.current.state.title).toBe("Title");
  });

  it("uses the provided initial state", () => {
    const initial: DiagramState = {
      actors: [{ id: "a1", name: "Alice", type: "participant" }],
      elements: [],
    };
    const { result } = setup(initial);
    expect(result.current.state).toEqual(initial);
  });
});

describe("useDiagram – setTitle", () => {
  it("updates the diagram title", () => {
    const { result } = setup();
    act(() => result.current.setTitle("My Sequence"));
    expect(result.current.state.title).toBe("My Sequence");
  });

  it("preserves actors and elements when setting title", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    act(() => result.current.setTitle("New Title"));
    expect(result.current.state.actors).toHaveLength(1);
    expect(result.current.state.title).toBe("New Title");
  });
});

describe("useDiagram – addActor", () => {
  it("adds a participant actor with a given name", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    expect(result.current.state.actors).toHaveLength(1);
    expect(result.current.state.actors[0].name).toBe("Alice");
    expect(result.current.state.actors[0].type).toBe("participant");
    expect(result.current.state.actors[0].id).toBeTruthy();
  });

  it("adds an actor with type 'actor'", () => {
    const { result } = setup();
    act(() => result.current.addActor("Bob", "actor"));
    expect(result.current.state.actors[0].type).toBe("actor");
  });

  it("assigns unique ids to each actor", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    const ids = result.current.state.actors.map((a) => a.id);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it("appends actors in order", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    expect(result.current.state.actors[0].name).toBe("Alice");
    expect(result.current.state.actors[1].name).toBe("Bob");
  });
});

describe("useDiagram – removeActor", () => {
  it("removes the actor with the specified id", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const id = result.current.state.actors[0].id;
    act(() => result.current.removeActor(id));
    expect(result.current.state.actors).toHaveLength(0);
  });

  it("removes messages that reference the removed actor as sender", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    const aliceId = result.current.state.actors[0].id;
    const bobId = result.current.state.actors[1].id;
    act(() =>
      result.current.addElement({
        kind: "message",
        from: aliceId,
        to: bobId,
        label: "Hi",
        arrowType: "->>",
      })
    );
    act(() => result.current.removeActor(aliceId));
    expect(result.current.state.elements).toHaveLength(0);
  });

  it("removes messages that reference the removed actor as receiver", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    const aliceId = result.current.state.actors[0].id;
    const bobId = result.current.state.actors[1].id;
    act(() =>
      result.current.addElement({
        kind: "message",
        from: aliceId,
        to: bobId,
        label: "Hi",
        arrowType: "->>",
      })
    );
    act(() => result.current.removeActor(bobId));
    expect(result.current.state.elements).toHaveLength(0);
  });

  it("removes activation elements that reference the removed actor", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const aliceId = result.current.state.actors[0].id;
    act(() =>
      result.current.addElement({
        kind: "activation",
        actorId: aliceId,
        type: "activate",
      })
    );
    act(() => result.current.removeActor(aliceId));
    expect(result.current.state.elements).toHaveLength(0);
  });

  it("removes note elements that reference the removed actor", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const aliceId = result.current.state.actors[0].id;
    act(() =>
      result.current.addElement({
        kind: "note",
        position: "left of",
        actorIds: [aliceId],
        text: "A note",
      })
    );
    act(() => result.current.removeActor(aliceId));
    expect(result.current.state.elements).toHaveLength(0);
  });

  it("does not remove unrelated elements when an actor is removed", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    const aliceId = result.current.state.actors[0].id;
    const bobId = result.current.state.actors[1].id;
    act(() =>
      result.current.addElement({
        kind: "message",
        from: bobId,
        to: bobId,
        label: "Self",
        arrowType: "->",
      })
    );
    act(() => result.current.removeActor(aliceId));
    expect(result.current.state.elements).toHaveLength(1);
  });
});

describe("useDiagram – renameActor", () => {
  it("renames the actor with the given id", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const id = result.current.state.actors[0].id;
    act(() => result.current.renameActor(id, "Alicia"));
    expect(result.current.state.actors[0].name).toBe("Alicia");
  });

  it("does not affect other actors", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    const aliceId = result.current.state.actors[0].id;
    act(() => result.current.renameActor(aliceId, "Alicia"));
    expect(result.current.state.actors[1].name).toBe("Bob");
  });
});

describe("useDiagram – updateActorType", () => {
  it("changes a participant to an actor", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice", "participant"));
    const id = result.current.state.actors[0].id;
    act(() => result.current.updateActorType(id, "actor"));
    expect(result.current.state.actors[0].type).toBe("actor");
  });

  it("changes an actor to a participant", () => {
    const { result } = setup();
    act(() => result.current.addActor("Bob", "actor"));
    const id = result.current.state.actors[0].id;
    act(() => result.current.updateActorType(id, "participant"));
    expect(result.current.state.actors[0].type).toBe("participant");
  });
});

describe("useDiagram – reorderActor", () => {
  it("moves an actor to a new position", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("A");
      result.current.addActor("B");
      result.current.addActor("C");
    });
    const firstId = result.current.state.actors[0].id;
    act(() => result.current.reorderActor(firstId, 2));
    const names = result.current.state.actors.map((a) => a.name);
    expect(names).toEqual(["B", "C", "A"]);
  });

  it("clamps the new index to the list bounds (above max)", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("A");
      result.current.addActor("B");
    });
    const firstId = result.current.state.actors[0].id;
    act(() => result.current.reorderActor(firstId, 100));
    const names = result.current.state.actors.map((a) => a.name);
    expect(names).toEqual(["B", "A"]);
  });

  it("clamps the new index to the list bounds (below min)", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("A");
      result.current.addActor("B");
    });
    const lastId = result.current.state.actors[1].id;
    act(() => result.current.reorderActor(lastId, -5));
    const names = result.current.state.actors.map((a) => a.name);
    expect(names).toEqual(["B", "A"]);
  });

  it("does nothing when the actor id is not found", () => {
    const { result } = setup();
    act(() => result.current.addActor("A"));
    const before = result.current.state.actors;
    act(() => result.current.reorderActor("non-existent-id", 0));
    expect(result.current.state.actors).toEqual(before);
  });
});

describe("useDiagram – addElement", () => {
  it("adds a message element and assigns a unique id", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    const [aliceId, bobId] = result.current.state.actors.map((a) => a.id);
    act(() =>
      result.current.addElement({
        kind: "message",
        from: aliceId,
        to: bobId,
        label: "Ping",
        arrowType: "->>",
      })
    );
    expect(result.current.state.elements).toHaveLength(1);
    expect(result.current.state.elements[0].id).toBeTruthy();
    expect(result.current.state.elements[0].kind).toBe("message");
  });

  it("adds an activation element", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const aliceId = result.current.state.actors[0].id;
    act(() =>
      result.current.addElement({
        kind: "activation",
        actorId: aliceId,
        type: "activate",
      })
    );
    expect(result.current.state.elements[0].kind).toBe("activation");
  });

  it("adds a note element", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const aliceId = result.current.state.actors[0].id;
    act(() =>
      result.current.addElement({
        kind: "note",
        position: "right of",
        actorIds: [aliceId],
        text: "Remember this",
      })
    );
    expect(result.current.state.elements[0].kind).toBe("note");
  });
});

describe("useDiagram – removeElement", () => {
  it("removes the element with the specified id", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const aliceId = result.current.state.actors[0].id;
    act(() =>
      result.current.addElement({
        kind: "activation",
        actorId: aliceId,
        type: "activate",
      })
    );
    const elementId = result.current.state.elements[0].id;
    act(() => result.current.removeElement(elementId));
    expect(result.current.state.elements).toHaveLength(0);
  });

  it("does not affect other elements", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const aliceId = result.current.state.actors[0].id;
    act(() => {
      result.current.addElement({
        kind: "activation",
        actorId: aliceId,
        type: "activate",
      });
      result.current.addElement({
        kind: "activation",
        actorId: aliceId,
        type: "deactivate",
      });
    });
    const firstId = result.current.state.elements[0].id;
    act(() => result.current.removeElement(firstId));
    expect(result.current.state.elements).toHaveLength(1);
    if (result.current.state.elements[0].kind === "activation") {
      expect(result.current.state.elements[0].type).toBe("deactivate");
    }
  });
});

describe("useDiagram – updateElement", () => {
  it("replaces the element with the matching id", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    const [aliceId, bobId] = result.current.state.actors.map((a) => a.id);
    act(() =>
      result.current.addElement({
        kind: "message",
        from: aliceId,
        to: bobId,
        label: "Old label",
        arrowType: "->>",
      })
    );
    const elementId = result.current.state.elements[0].id;
    act(() =>
      result.current.updateElement({
        kind: "message",
        id: elementId,
        from: aliceId,
        to: bobId,
        label: "New label",
        arrowType: "-->",
      })
    );
    const el = result.current.state.elements[0];
    if (el.kind === "message") {
      expect(el.label).toBe("New label");
      expect(el.arrowType).toBe("-->");
    }
  });
});

describe("useDiagram – reorderElement", () => {
  it("moves an element to a new position", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const aliceId = result.current.state.actors[0].id;
    act(() => {
      result.current.addElement({
        kind: "activation",
        actorId: aliceId,
        type: "activate",
      });
      result.current.addElement({
        kind: "activation",
        actorId: aliceId,
        type: "deactivate",
      });
    });
    const firstId = result.current.state.elements[0].id;
    act(() => result.current.reorderElement(firstId, 1));
    const el = result.current.state.elements[1];
    if (el.kind === "activation") {
      expect(el.type).toBe("activate");
    }
  });

  it("does nothing when the element id is not found", () => {
    const { result } = setup();
    act(() => result.current.addActor("Alice"));
    const aliceId = result.current.state.actors[0].id;
    act(() =>
      result.current.addElement({
        kind: "activation",
        actorId: aliceId,
        type: "activate",
      })
    );
    const before = result.current.state.elements;
    act(() => result.current.reorderElement("unknown-id", 0));
    expect(result.current.state.elements).toEqual(before);
  });
});

describe("useDiagram – resetDiagram", () => {
  it("clears all actors and elements", () => {
    const { result } = setup();
    act(() => {
      result.current.addActor("Alice");
      result.current.addActor("Bob");
    });
    act(() => result.current.resetDiagram());
    expect(result.current.state.actors).toEqual([]);
    expect(result.current.state.elements).toEqual([]);
  });
});

describe("useDiagram – loadState", () => {
  it("replaces the entire state with the given DiagramState", () => {
    const { result } = setup();
    act(() => result.current.addActor("Old Actor"));
    const newState: DiagramState = {
      actors: [{ id: "x1", name: "New Actor", type: "participant" }],
      elements: [],
    };
    act(() => result.current.loadState(newState));
    expect(result.current.state).toEqual(newState);
  });
});
