import { describe, it, expect, beforeEach } from "vitest";
import { serialize } from "@/lib/mermaid-serializer";
import { parse, resetParserIdCounter } from "@/lib/mermaid-parser";
import type { DiagramState } from "@/lib/types";

beforeEach(() => {
  resetParserIdCounter();
});

function stripIds(state: DiagramState): {
  actors: Omit<(typeof state.actors)[number], "id">[];
  elements: unknown[];
} {
  return {
    actors: state.actors.map(({ id: _, ...rest }) => rest),
    elements: state.elements.map((el) => {
      if (el.kind === "message") {
        const { id: _, from, to, ...rest } = el;
        // Resolve actor IDs to names for comparison
        const fromActor = state.actors.find((a) => a.id === from);
        const toActor = state.actors.find((a) => a.id === to);
        return { ...rest, fromName: fromActor?.name, toName: toActor?.name };
      }
      if (el.kind === "activation") {
        const { id: _, actorId, ...rest } = el;
        const actor = state.actors.find((a) => a.id === actorId);
        return { ...rest, actorName: actor?.name };
      }
      if (el.kind === "note") {
        const { id: _, actorIds, ...rest } = el;
        const actorNames = actorIds.map(
          (aid) => state.actors.find((a) => a.id === aid)?.name
        );
        return { ...rest, actorNames };
      }
      return el;
    }),
  };
}

describe("round-trip: serialize → parse", () => {
  it("round-trips an empty diagram", () => {
    const original: DiagramState = { actors: [], elements: [] };
    const mermaid = serialize(original);
    const parsed = parse(mermaid);
    expect(parsed.actors).toEqual([]);
    expect(parsed.elements).toEqual([]);
  });

  it("round-trips actors without aliases", () => {
    const original: DiagramState = {
      actors: [
        { id: "a1", name: "Alice", type: "participant" },
        { id: "a2", name: "Bob", type: "participant" },
      ],
      elements: [],
    };
    const mermaid = serialize(original);
    const parsed = parse(mermaid);
    const originalStripped = stripIds(original);
    const parsedStripped = stripIds(parsed);
    expect(parsedStripped.actors).toEqual(originalStripped.actors);
  });

  it("round-trips actors with aliases", () => {
    const original: DiagramState = {
      actors: [
        { id: "a1", name: "A", alias: "Alice", type: "participant" },
        { id: "a2", name: "B", alias: "Bob", type: "actor" },
      ],
      elements: [],
    };
    const mermaid = serialize(original);
    const parsed = parse(mermaid);
    const originalStripped = stripIds(original);
    const parsedStripped = stripIds(parsed);
    expect(parsedStripped.actors).toEqual(originalStripped.actors);
  });

  it("round-trips messages", () => {
    const original: DiagramState = {
      actors: [
        { id: "a1", name: "Alice", type: "participant" },
        { id: "a2", name: "Bob", type: "participant" },
      ],
      elements: [
        {
          kind: "message",
          id: "e1",
          from: "a1",
          to: "a2",
          label: "Hello",
          arrowType: "->>",
        },
        {
          kind: "message",
          id: "e2",
          from: "a2",
          to: "a1",
          label: "Hi back",
          arrowType: "-->>",
        },
      ],
    };
    const mermaid = serialize(original);
    const parsed = parse(mermaid);
    const originalStripped = stripIds(original);
    const parsedStripped = stripIds(parsed);
    expect(parsedStripped.elements).toEqual(originalStripped.elements);
  });

  it("round-trips a complete diagram", () => {
    const original: DiagramState = {
      actors: [
        { id: "a1", name: "A", alias: "Alice", type: "participant" },
        { id: "a2", name: "B", alias: "Bob", type: "actor" },
      ],
      elements: [
        {
          kind: "message",
          id: "e1",
          from: "a1",
          to: "a2",
          label: "Hello Bob",
          arrowType: "->>",
        },
        { kind: "activation", id: "e2", actorId: "a2", type: "activate" },
        {
          kind: "message",
          id: "e3",
          from: "a2",
          to: "a1",
          label: "Hi Alice",
          arrowType: "-->>",
        },
        { kind: "activation", id: "e4", actorId: "a2", type: "deactivate" },
        {
          kind: "note",
          id: "e5",
          position: "over",
          actorIds: ["a1"],
          text: "Thinking...",
        },
      ],
    };
    const mermaid = serialize(original);
    const parsed = parse(mermaid);
    const originalStripped = stripIds(original);
    const parsedStripped = stripIds(parsed);
    expect(parsedStripped.actors).toEqual(originalStripped.actors);
    expect(parsedStripped.elements).toEqual(originalStripped.elements);
  });

  it("round-trips all arrow types", () => {
    const arrowTypes = ["->>", "->", "-->>", "-->", "-x", "--x", "-)", "--)"] as const;
    for (const arrowType of arrowTypes) {
      const original: DiagramState = {
        actors: [
          { id: "a1", name: "Alice", type: "participant" },
          { id: "a2", name: "Bob", type: "participant" },
        ],
        elements: [
          {
            kind: "message",
            id: "e1",
            from: "a1",
            to: "a2",
            label: `Test ${arrowType}`,
            arrowType,
          },
        ],
      };
      resetParserIdCounter();
      const mermaid = serialize(original);
      const parsed = parse(mermaid);
      const msg = parsed.elements[0];
      expect(msg.kind).toBe("message");
      if (msg.kind === "message") {
        expect(msg.arrowType).toBe(arrowType);
      }
    }
  });
});

describe("round-trip: parse → serialize → parse", () => {
  it("produces identical structure when parsing the same Mermaid string twice via serialization", () => {
    const input = `sequenceDiagram
    participant A as Alice
    actor B as Bob
    A->>B: Hello Bob
    activate B
    B-->>A: Hi Alice
    deactivate B
    Note over A: Thinking...`;

    const parsed1 = parse(input);
    const serialized = serialize(parsed1);
    resetParserIdCounter();
    const parsed2 = parse(serialized);

    const stripped1 = stripIds(parsed1);
    const stripped2 = stripIds(parsed2);
    expect(stripped2.actors).toEqual(stripped1.actors);
    expect(stripped2.elements).toEqual(stripped1.elements);
  });
});
